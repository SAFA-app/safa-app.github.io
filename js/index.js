import { updateLocalStorageWithFreshData, getValidPages } from './page-utils.js';

document.addEventListener('DOMContentLoaded', function() {
    const homeLogo = document.getElementById('home-logo');
    const updateButton = document.getElementById('updateButton');
    const goButton = document.getElementById('goButton');  // Get the goButton element
    const notification = document.getElementById('notification'); // Get the notification div

    // Disable goButton and homeLogo initially
    if (goButton) {
        goButton.disabled = true;
    }
    // Call getValidPages() and wait for it to finish
    getValidPages(true).then(() => {
        // Enable goButton after getValidPages is complete
        if (goButton) {
            goButton.disabled = false;
        }
    });

    if (updateButton) {
        updateButton.addEventListener('click', async function() {
            // Show loading message while the update is in progress
            updateNotification("Aggiornamento in corso...");

            // Update localStorage with fresh data
            await updateLocalStorageWithFreshData();

            // Trigger a service worker cache update
            if (navigator.serviceWorker) {
                navigator.serviceWorker.ready.then(registration => {
                    // Send a message to the service worker to trigger cache update
                    registration.active.postMessage({ action: 'update-cache' });
                });
            }
        });
    }

    if (goButton) {  // Add event listener for goButton
        goButton.addEventListener('click', function() {
            window.location.href = '/pages/items.html';  // Navigate to items.html
        });
    }

    // Function to update notification text
    function updateNotification(message) {
        notification.textContent = message;
    }
});
