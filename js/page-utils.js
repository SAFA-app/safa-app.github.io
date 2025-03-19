import config from '/js/config.js';  // Import config for URLs

// Function to fetch CSV data and parse it
export async function fetchCSVData(url) {
    try {
        // Fetch the data from the network
        const response = await fetch(url);
        const csvText = await response.text();

        // Parse the CSV data
        return Papa.parse(csvText, { header: true, skipEmptyLines: true }).data;
    } catch (error) {
        console.error("Error fetching CSV data:", error);
        return [];
    }
}


// Helper function to fetch and cache new data in the background
async function fetchAndCacheNewData(url) {
    try {
        const response = await fetch(url);
        const csvText = await response.text();

        const cache = await caches.open('pwa-cache-v1');
        cache.put(url, new Response(csvText));  // Store the fresh data
    } catch (error) {
        console.error("Error fetching and caching new data:", error);
    }
}



// Filter out the most recent version of each webpage based on 'Informazioni cronologiche'
export function filterMostRecentPages(data) {
    const idMap = new Map();

    data.forEach(row => {
        const id = row.ID;
        const title = row.title;
        const timestamp = row["Informazioni cronologiche"];

        if (!id || !title || !timestamp) return;

        // If a page with this ID exists, keep the most recent version
        if (!idMap.has(id) || isNewer(timestamp, idMap.get(id).timestamp)) {
            // Store the entire row, not just specific fields
            idMap.set(id, { ...row, title, id, timestamp });
        }
    });

    return Array.from(idMap.values());
}

// Filter out pages that are in the deletedTable
export function filterDeletedPages(pages, deletedData) {
    const deletedIds = new Set(deletedData.map(row => row.ID)); // Create a Set of deleted IDs

    return pages.filter(page => !deletedIds.has(page.id));
}

// Check if a new timestamp is newer than an existing one
function isNewer(newTimestamp, oldTimestamp) {
    return parseTimestamp(newTimestamp) > parseTimestamp(oldTimestamp);
}

// Parse a timestamp string to a Date object
function parseTimestamp(timestamp) {
    const [date, time] = timestamp.split(" ");
    const [day, month, year] = date.split("/").map(Number);
    const [hours, minutes, seconds] = time.split(".").map(Number);
    return new Date(year, month - 1, day, hours, minutes, seconds).getTime();
}

// Main function to fetch valid pages (valid = most recent and not deleted)
export async function getValidPages() {
    const pagesData = await fetchCSVData(config.pagesTable);
    const deletedData = await fetchCSVData(config.deletedTable);

    if (!pagesData || !deletedData) {
        console.error("Failed to fetch data.");
        return [];
    }

    // Filter pages to get only the most recent version of each page
    const recentPages = filterMostRecentPages(pagesData);

    // Filter out deleted pages
    const validPages = filterDeletedPages(recentPages, deletedData);

    // Log the valid pages table with all original fields to the console
    console.log("Valid Pages Table with Original Fields:", validPages);

    return validPages;
}
