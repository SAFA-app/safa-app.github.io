import { getValidPages } from '../page-utils.js'; // Import utility function to fetch valid pages

async function fetchValidPages() {
    const validPages = await getValidPages();
    console.log(validPages); // Log to check what data you are getting from getValidPages
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
    console.log('Form ID:', formId); // Log the form ID to ensure it is being retrieved correctly
    
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
    console.log('Selected Page ID:', selectedId); // Log the selected page ID

    // Construct the POST request to the Google Form
    const formUrl = `https://docs.google.com/forms/d/e/${formId}/formResponse`;
    const formData = new FormData();
    formData.append('entry.1372900842', selectedId); // Field ID for entry identifier

    try {
        const response = await fetch(formUrl, {
            method: 'POST',
            body: formData,
            mode: 'no-cors' // Google Forms doesn't respond to CORS requests, we need 'no-cors'
        });

        // Since no-cors mode doesn't allow you to inspect the response, we cannot check response.ok.
        // We'll rely on form submission behavior.
        alert(`Page with ID ${selectedId} deleted successfully!`);
        selectedRow.closest('tr').remove(); // Optionally remove the row from the table
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('Error deleting page: ' + error.message); // Show the error message in the alert
    }
}

// Initialize the page
fetchValidPages();

// Add event listener for the delete button
const deleteButton = document.querySelector('button');
deleteButton.addEventListener('click', deletePage);
