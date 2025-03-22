// Add functionality to the back button
const backButton = document.getElementById('back-button');

if (backButton) {  // Ensure the button exists before attaching the event listener
    backButton.addEventListener('click', () => {
        window.history.back(); // Simply navigate back in the browser's history
    });
}
