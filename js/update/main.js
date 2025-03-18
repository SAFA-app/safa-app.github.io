// Import the getValidPages function from page-utils.js
import { getValidPages } from '../page-utils.js';

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);
    }).catch((error) => {
      console.log('Service Worker registration failed:', error);
    });
  }
  

// Function to get the ID from the URL
function getURLParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Function to fill the form with the data
function fillForm(data) {
    document.getElementById('id').value = data.ID;  // Auto-fill the ID (readonly)
    document.getElementById('title').value = data.title;
    document.getElementById('subtitle').value = data.subtitle || '';  // Handle optional subtitle
    tinymce.get('content').setContent(data.content || '');  // If you're using TinyMCE
    document.getElementById('image').value = data.image_address || ''; 
    document.getElementById('externalLink').value = data.external_link || '';
    document.getElementById('colour').value = data.colour || '#ffffff';  // Default to white if no color
    document.getElementById('customPage').value = data.custom_page || 'false';
    document.getElementById('parent').value = data.parent || '';  // Can be an empty string or specific parent ID
    document.getElementById('category').value = data.category || 'category1';  // Default to category 1
}

// Function to update the form based on the ID
async function updateForm() {
    const id = getURLParameter('id');  // Get the ID from the URL
    if (!id) {
        console.error('No ID parameter found in the URL.');
        return;
    }

    try {
        const validPages = await getValidPages();  // Assuming getValidPages is an async function that returns a promise
        const pageData = validPages.find(page => page.ID === id);

        if (pageData) {
            fillForm(pageData);  // Fill the form with the data from the matching page
        } else {
            console.error('No page found with the given ID.');
        }
    } catch (error) {
        console.error('Error fetching valid pages:', error);
    }
}

// Call the updateForm function when the page loads
document.addEventListener('DOMContentLoaded', updateForm);
