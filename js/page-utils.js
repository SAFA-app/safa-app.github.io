import config from '/js/config.js';  // Import config for URLs

const LOCAL_STORAGE_KEY = 'validPages'; // Centralize local storage key

// Function to fetch CSV data and parse it
export async function fetchCSVData(url) {
    try {
        const response = await fetch(url);
        const csvText = await response.text();
        return Papa.parse(csvText, { header: true, skipEmptyLines: true }).data;
    } catch (error) {
        console.error("Error fetching CSV data:", error);
        return [];
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
        if (!idMap.has(id) || isNewer(timestamp, idMap.get(id).timestamp)) {
            idMap.set(id, { ...row, title, id, timestamp });
        }
    });
    return Array.from(idMap.values());
}

// Filter out pages that are in the deletedTable
export function filterDeletedPages(pages, deletedData) {
    const deletedIds = new Set(deletedData.map(row => row.ID));
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
// Accepts an argument `forceFresh` to force fetching fresh data (if true), else it defaults to local storage.
export async function getValidPages(forceFresh = false) {
    try {
        if (!forceFresh) {
            const cachedPages = getPagesFromLocalStorage();
            if (cachedPages) {
                console.log("Pages fetched from local storage.");
                return cachedPages;
            }
        }

        const pagesData = await fetchCSVData(config.pagesTable);
        const deletedData = await fetchCSVData(config.deletedTable);
        if (!pagesData || !deletedData) {
            console.error("Failed to fetch data.");
            return [];
        }

        const recentPages = filterMostRecentPages(pagesData);
        const validPages = filterDeletedPages(recentPages, deletedData);

        savePagesToLocalStorage(validPages);
        console.log("Valid Pages Table with Original Fields:", validPages);

        return validPages;
    } catch (error) {
        console.error("Error in getValidPages:", error);
        return [];
    }
}

// Save valid pages to localStorage
function savePagesToLocalStorage(pages) {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(pages));
        console.log("Valid pages saved to local storage.");
    } catch (error) {
        console.error("Error saving valid pages to local storage:", error);
    }
}

// Retrieve valid pages from localStorage
function getPagesFromLocalStorage() {
    try {
        const pages = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (pages) {
            return JSON.parse(pages);
        }
        return null;
    } catch (error) {
        console.error("Error retrieving valid pages from local storage:", error);
        return null;
    }
}

// Function to update the local storage with fresh data
export async function updateLocalStorageWithFreshData() {
    console.log("Updating local storage with fresh data...");

    // Make sure `updateNotification` function is accessible (you can pass it as an argument if needed)
    const notification = document.getElementById('notification'); // Get the notification div

    try {
        const freshData = await getValidPages(true); // Assuming this function is fetching fresh data

        if (freshData.length > 0) {
            console.log("Local storage updated successfully!");
            notification.textContent = "Update completed successfully!"; // Success message
        } else {
            console.error("Failed to update local storage. No valid data found.");
            notification.textContent = "Failed to update local storage. No valid data found."; // Failure message
        }
    } catch (error) {
        console.error("Error while updating local storage:", error);
        notification.textContent = "An error occurred while updating the data."; // Error message
    }
}


