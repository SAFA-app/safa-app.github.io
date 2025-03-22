import { updateLocalStorageWithFreshData } from './page-utils.js';

document.addEventListener('DOMContentLoaded', function() {
    const homeLogo = document.getElementById('home-logo');
    const updateButton = document.getElementById('updateButton');
    const notification = document.getElementById('notification'); // Get the notification div

    if (homeLogo) {
        homeLogo.addEventListener('click', function() {
            window.location.href = 'pages/items.html';
        });
    }
    
    if (updateButton) {
        updateButton.addEventListener('click', async function() {
            // Show loading message while the update is in progress
            updateNotification("Update in progress...");

            await updateLocalStorageWithFreshData();
        });
    }

    // Function to update notification text
    function updateNotification(message) {
        notification.textContent = message;
    }
});
