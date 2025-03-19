// Add click event listener to the image
document.addEventListener('DOMContentLoaded', function() {
    const homeLogo = document.getElementById('home-logo');
    
    if (homeLogo) {
        homeLogo.addEventListener('click', function() {
            // Redirect to the desired page
            window.location.href = 'pages/items.html';
        });
    }
});
