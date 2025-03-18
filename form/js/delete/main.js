// main.js
import config from '../config.js';  // Import configuration file
import { getValidPages } from '../page-utils.js';  // Import utility function to fetch valid pages

async function fetchValidPages() {
    const validPages = await getValidPages();
    const tableBody = document.getElementById('pagesTable').getElementsByTagName('tbody')[0];

    validPages.forEach(page => {
        const row = tableBody.insertRow();
        const selectCell = row.insertCell(0);
        const idCell = row.insertCell(1);
        const titleCell = row.insertCell(2);
        const timestampCell = row.insertCell(3);

        const selectCheckbox = document.createElement('input');
        selectCheckbox.type = 'checkbox';
        selectCheckbox.dataset.id = page.id;
        selectCell.appendChild(selectCheckbox);

        idCell.textContent = page.id;
        titleCell.textContent = page.title;
        timestampCell.textContent = page.timestamp;
    });
}

export async function deletePage() {
    const formId = document.getElementById('formId').value.trim();
    if (!formId) {
        alert('Please enter a Google Form ID');
        return;
    }

    const selectedRow = document.querySelector('input[type="checkbox"]:checked');
    if (!selectedRow) {
        alert('Please select a page to delete');
        return;
    }

    const selectedId = selectedRow.dataset.id;

    // Construct the POST request to the Google Form
    const formUrl = `https://docs.google.com/forms/d/e/${formId}/formResponse`;
    const formData = new FormData();
    formData.append('entry.1372900842', selectedId);  // Field ID for entry identifier

    try {
        const response = await fetch(formUrl, {
            method: 'POST',
            body: formData,
            mode: 'no-cors'  // Google Forms doesn't respond to CORS requests, we need 'no-cors'
        });

        if (response.ok) {
            alert(`Page with ID ${selectedId} deleted successfully!`);
            // Optionally, remove the row from the table
            selectedRow.closest('tr').remove();
        } else {
            alert('Error deleting page');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('Error deleting page');
    }
}

// Initialize the page
fetchValidPages();
