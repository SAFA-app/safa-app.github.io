// Configuration object for form entries
const config = {
    formIdField: "formId",
    idField: "entry.1896761587",
    titleField: "entry.1425210652",
    subtitleField: "entry.1123697200",
    contentField: "entry.421337030",
    imageField: "entry.377306596",
    colourField: "entry.235505769",
    externalLinkField: "entry.457303743",
    customPageField: "entry.2143033031",
    parentField: "entry.53127251",
    categoryField: "entry.1718811362",
    pagesTable: "https://docs.google.com/spreadsheets/d/1ZuUVyBmIU_Ax5V7Iq-yCUQvN-tmF8RZEh1uhkT6HVFA/gviz/tq?tqx=out:json",
    deletedTable: "https://docs.google.com/spreadsheets/d/1FVN90zGMNJbKOiBJWCVdVH7UFI74yny4G-3vJBzwrEo/gviz/tq?tqx=out:json"
};

// Initialize TinyMCE editor function
function initTinyMCE() {
    tinymce.init({
        selector: '#content',
        plugins: 'advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table help',
        toolbar: 'undo redo | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media table | code preview',
        height: 400,
        branding: false
    });
}

// Generate unique ID
function generateId() {
    return 'ID-' + crypto.randomUUID();
}

// Handle form submission
function handleFormSubmission() {
    document.getElementById('googleForm').addEventListener('submit', function (event) {
        event.preventDefault();
        
        const formId = document.getElementById(config.formIdField).value.trim();
        if (!formId) {
            alert("Please provide a valid Google Form ID.");
            return;
        }
        
        const formUrl = `https://docs.google.com/forms/d/e/${formId}/formResponse`;
        const formData = new FormData();
        
        formData.append(config.idField, document.getElementById('id').value);
        formData.append(config.titleField, document.getElementById('title').value);
        formData.append(config.subtitleField, document.getElementById('subtitle').value);
        formData.append(config.contentField, tinymce.get('content').getContent().trim());
        formData.append(config.imageField, document.getElementById('image').value);
        formData.append(config.colourField, document.getElementById('colour').value);
        formData.append(config.externalLinkField, document.getElementById('externalLink').value);
        formData.append(config.customPageField, document.getElementById('customPage').value);
        formData.append(config.parentField, document.getElementById('parent').value);
        formData.append(config.categoryField, document.getElementById('category').value);
        
        fetch(formUrl, { method: "POST", body: formData, mode: "no-cors" })
            .then(() => {
                alert("Form submitted successfully!");
                document.getElementById('googleForm').reset();
                tinymce.get('content').setContent('');
                document.getElementById('id').value = generateId();
            })
            .catch(error => {
                alert("Error submitting form: " + error);
            });
    });
}

// Handle the custom page selection
function handleCustomPageSelection() {
    document.getElementById("customPage").addEventListener("change", function () {
        const isCustomPage = this.value === "true";
        const fieldsToDisable = [
            "subtitle",
            "content",
            "image",
            "colour",
            "externalLink"
        ];

        fieldsToDisable.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                if (isCustomPage) {
                    field.value = "";
                    field.setAttribute("disabled", "disabled");
                } else {
                    field.removeAttribute("disabled");
                }
            }
        });

        const editor = tinymce.get("content");
        if (editor) {
            editor.setContent("");
            editor.mode.set(isCustomPage ? "readonly" : "design");
        }
    });

    document.getElementById("customPage").dispatchEvent(new Event("change"));
}

// Fetch and process data from Google Sheets
async function fetchData(url) {
    try {
        const response = await fetch(url);
        const text = await response.text();
        const jsonText = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/)[1];
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error fetching Google Sheets data:", error);
        return null;
    }
}

// Filter out the most recent version of each webpage based on 'Informazioni cronologiche'
function filterMostRecentPages(data) {
    if (!data || !data.table || !data.table.cols) {
        console.error("Invalid data format:", data);
        return [];
    }

    const columns = data.table.cols.map(col => col.label); // Extract column labels
    const idIndex = columns.indexOf("ID");
    const titleIndex = columns.indexOf("title");
    const timestampIndex = columns.indexOf("Informazioni cronologiche");

    if (idIndex === -1 || titleIndex === -1 || timestampIndex === -1) {
        console.error("Required columns (ID, title, Informazioni cronologiche) not found.");
        return [];
    }

    const idMap = new Map();

    data.table.rows.forEach(row => {
        const cells = row.c;
        const id = cells[idIndex]?.v;
        const title = cells[titleIndex]?.v;
        const timestamp = cells[timestampIndex]?.f;

        if (!id || !title || !timestamp) return;

        // If a page with this ID exists, keep the most recent version
        if (!idMap.has(id) || isNewer(timestamp, idMap.get(id).timestamp)) {
            idMap.set(id, { title, id, timestamp });
        }
    });

    return Array.from(idMap.values());
}


// Filter out pages that are in the deletedTable
function filterDeletedPages(pages, deletedTable) {
    const deletedIds = new Set(deletedTable.map(row => row.ID)); // Create a Set of deleted IDs

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

// Populate the parent dropdown with filtered pages
function populateDropdown(pages) {
    const parentSelect = document.getElementById("parent");
    parentSelect.innerHTML = '<option value="">Select Parent</option>';

    pages.forEach(page => {
        const option = document.createElement("option");
        option.value = page.id;
        option.textContent = page.title;
        parentSelect.appendChild(option);
    });
}

// Main function to initialize the dropdown with pages data
async function initializeDropdown() {
    // Fetch pages and deleted pages data
    const pagesData = await fetchData(config.pagesTable);
    const deletedData = await fetchData(config.deletedTable);

    if (!pagesData || !deletedData) {
        console.error("Failed to fetch data.");
        return;
    }

    // Filter pages to get only the most recent version of each page
    const recentPages = filterMostRecentPages(pagesData);

    // Filter out deleted pages
    const validPages = filterDeletedPages(recentPages, deletedData.table.rows);

    // Populate the dropdown with the valid pages
    populateDropdown(validPages);
}

// Initialize all functions
document.addEventListener("DOMContentLoaded", function () {
    initTinyMCE();
    document.getElementById('id').value = generateId();
    handleFormSubmission();
    handleCustomPageSelection();
    initializeDropdown();  // Initialize the dropdown after the page loads
});
