import { downloadValidPagesCSV } from './page-utils.js';  // Import the function

// Add event listener to the download link
document.getElementById('downloadLink').addEventListener('click', downloadValidPagesCSV);
