import { updateLocalStorageWithFreshData } from '/js/page-utils.js';

document.addEventListener('DOMContentLoaded', function() {
    const homeLogo = document.getElementById('home-logo');
    const updateButton = document.getElementById('updateButton');
    
    if (homeLogo) {
        homeLogo.addEventListener('click', function() {
            window.location.href = 'pages/items.html';
        });
    }
    
    if (updateButton) {
        updateButton.addEventListener('click', async function() {
            await updateLocalStorageWithFreshData();
        });
    }
});
