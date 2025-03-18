// main.js
import config from '../config.js';  // Import configuration file
import { getValidPages } from '../page-utils.js';  // Import utility function to fetch valid pages

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
        
        const formId = document.getElementById(config.creationFormId).value.trim();
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

// Populate the parent dropdown with filtered pages
async function populateDropdown() {
    const validPages = await getValidPages();

    const parentSelect = document.getElementById("parent");
    parentSelect.innerHTML = '<option value="">Select Parent</option>';

    validPages.forEach(page => {
        const option = document.createElement("option");
        option.value = page.id;
        option.textContent = page.title;
        parentSelect.appendChild(option);
    });
}

// Main function to initialize everything
document.addEventListener("DOMContentLoaded", function () {
    initTinyMCE();
    document.getElementById('id').value = generateId();
    handleFormSubmission();
    handleCustomPageSelection();
    populateDropdown();  // Initialize the dropdown after the page loads
});
