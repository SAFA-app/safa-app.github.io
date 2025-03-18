import { getValidPages } from '../page-utils.js'; // Import utility function to fetch valid pages

async function fetchValidPages() {
    const validPages = await getValidPages();
    console.log(validPages); // Log to check what data you are getting from getValidPages
    const tableBody = document.getElementById('pagesTable').getElementsByTagName('tbody')[0];
    const tableHeader = document.getElementById('pagesTable').getElementsByTagName('thead')[0].getElementsByTagName('tr')[0];

    // Dynamically create table headers based on the keys of the first valid page object
    const keys = Object.keys(validPages[0]);
    keys.forEach(key => {
        if (key !== 'id') { // You can exclude columns like 'id' if you don't want them shown
            const headerCell = document.createElement('th');
            headerCell.textContent = key.charAt(0).toUpperCase() + key.slice(1); // Capitalize the header text
            tableHeader.appendChild(headerCell);
        }
    });

    // Add a 'Select' column
    const selectHeader = document.createElement('th');
    selectHeader.textContent = 'Select';
    tableHeader.insertBefore(selectHeader, tableHeader.firstChild);

    // Loop through each valid page to create table rows
    validPages.forEach(page => {
        const row = tableBody.insertRow();
        
        // Create a 'Select' checkbox
        const selectCell = row.insertCell(0);
        const selectCheckbox = document.createElement('input');
        selectCheckbox.type = 'checkbox';
        selectCheckbox.dataset.id = page.id;
        selectCell.appendChild(selectCheckbox);

        // Populate the row with dynamic data based on the page object
        keys.forEach(key => {
            if (key !== 'id') { // Skip 'id' if not needed
                const cell = row.insertCell();
                cell.textContent = page[key]; // Fill the cell with the value from the valid page
            }
        });
    });
}

export async function deletePage() {
    const formId = document.getElementById('deletionFormId').value.trim();
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
