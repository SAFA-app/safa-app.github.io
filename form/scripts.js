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
    deletedField: "entry.1153953166",
    customPageField: "entry.2143033031",
    parentField: "entry.53127251",
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
        formData.append(config.deletedField, ""); // Empty "deleted" field
        formData.append(config.customPageField, document.getElementById('customPage').value);
        formData.append(config.parentField, document.getElementById('parent').value);
        
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

// Fetch and process data from Google Sheets
async function fetchData() {
    const googleSheetsUrl = "https://docs.google.com/spreadsheets/d/1XL-g0mTwrsdM1oTYs4rHNklgjrbSlB_fAJ7YgFGDJxg/gviz/tq?tqx=out:json";
    
    try {
        const response = await fetch(googleSheetsUrl);
        const text = await response.text();
        const jsonText = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/)[1];
        const jsonData = JSON.parse(jsonText);
        processParentOptions(jsonData);
    } catch (error) {
        console.error("Error fetching Google Sheets data:", error);
    }
}

// Process parent options from the fetched data
function processParentOptions(data) {
    const columns = data.table.cols.map(col => col.label);
    const idIndex = columns.indexOf("ID");
    const titleIndex = columns.indexOf("title");
    const deletedIndex = columns.indexOf("deleted");
    const timestampIndex = columns.indexOf("Informazioni cronologiche");
    const idMap = new Map();

    data.table.rows.forEach(row => {
        const cells = row.c;
        const id = cells[idIndex]?.v;
        const title = cells[titleIndex]?.v;
        const deleted = cells[deletedIndex]?.v === "true";
        const timestamp = cells[timestampIndex]?.f;

        if (!id || !title || deleted) return;

        if (!idMap.has(id) || isNewer(timestamp, idMap.get(id).timestamp)) {
            idMap.set(id, { title, timestamp });
        }
    });

    populateDropdown([...idMap.entries()]);
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

// Populate the parent dropdown
function populateDropdown(idList) {
    const parentSelect = document.getElementById("parent");
    parentSelect.innerHTML = '<option value="">Select Parent</option>';

    idList.forEach(([id, { title }]) => {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = title;
        parentSelect.appendChild(option);
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

// Initialize all functions
document.addEventListener("DOMContentLoaded", function () {
    initTinyMCE();
    document.getElementById('id').value = generateId();
    handleFormSubmission();
    fetchData();
    handleCustomPageSelection();
});
