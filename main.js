// Add functionality to the back button
const backButton = document.getElementById('back-button');

if (backButton) {  // Ensure the button exists before attaching the event listener
    backButton.addEventListener('click', () => {
        window.history.back(); // Simply navigate back in the browser's history
    });
}

// Register Service Worker for offline functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered with scope: ', registration.scope);
            })
            .catch((error) => {
                console.error('Service Worker registration failed: ', error);
            });
    });
}
