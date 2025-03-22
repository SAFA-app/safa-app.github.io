import config from './config.js';
import { getValidPages } from './page-utils.js';

async function fetchValidPages() {
    const validPages = await getValidPages(true);
    console.log(validPages);
    const tableBody = document.getElementById('pagesTable').getElementsByTagName('tbody')[0];
    const tableHeader = document.getElementById('pagesTable').getElementsByTagName('thead')[0].getElementsByTagName('tr')[0];

    const keys = Object.keys(validPages[0]);
    keys.forEach(key => {
        if (key !== 'id') {
            const headerCell = document.createElement('th');
            headerCell.textContent = key.charAt(0).toUpperCase() + key.slice(1);
            tableHeader.appendChild(headerCell);
        }
    });

    const selectHeader = document.createElement('th');
    selectHeader.textContent = 'Select';
    tableHeader.insertBefore(selectHeader, tableHeader.firstChild);

    validPages.forEach(page => {
        const row = tableBody.insertRow();

        // Create a 'Select' radio button
        const selectCell = row.insertCell(0);
        const selectRadio = document.createElement('input');
        selectRadio.type = 'radio';
        selectRadio.name = 'selectPage';
        selectRadio.dataset.id = page.id;
        selectCell.appendChild(selectRadio);

        keys.forEach(key => {
            if (key !== 'id') {
                const cell = row.insertCell();
                const cellText = String(page[key]);


                // Truncate text if it's too long
                if (cellText.length > 40) {
                    cell.textContent = cellText.slice(0, 40) + '...';
                } else {
                    cell.textContent = cellText;
                }
            }
        });
    });
}


export async function deletePage() {
    const formId = document.getElementById('deletionFormId').value.trim();
    console.log('Form ID:', formId);

    if (!formId) {
        alert('Please enter a Google Form ID');
        return;
    }

    const selectedRadio = document.querySelector('input[type="radio"]:checked');
    if (!selectedRadio) {
        alert('Please select a page to delete');
        return;
    }

    const selectedId = selectedRadio.dataset.id;
    console.log('Selected Page ID:', selectedId);

    const formUrl = `https://docs.google.com/forms/d/e/${formId}/formResponse`;
    const formData = new FormData();
    formData.append(config.deletionEntryId, selectedId);

    try {
        const response = await fetch(formUrl, {
            method: 'POST',
            body: formData,
            mode: 'no-cors'
        });

        alert(`Page with ID ${selectedId} deleted successfully!`);
        selectedRadio.closest('tr').remove();
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('Error deleting page: ' + error.message);
    }
}

function editPage() {
    const selectedRadio = document.querySelector('input[type="radio"]:checked');
    
    if (!selectedRadio) {
        alert('Please select a page to edit');
        return;
    }

    const selectedId = selectedRadio.dataset.id;
    window.open(`./create-page.html?id=${selectedId}`, '_self');
}

// Initialize the page
fetchValidPages();

// Add event listeners
document.querySelector('#deleteBtn').addEventListener('click', deletePage);
document.querySelector('#editBtn').addEventListener('click', editPage);