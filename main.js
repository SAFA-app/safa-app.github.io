import { fetchCSVData } from './js/page-utils.js';

document.getElementById('updateCSVButton').addEventListener('click', () => {
    const pagesTableUrl = "https://docs.google.com/spreadsheets/d/1ZuUVyBmIU_Ax5V7Iq-yCUQvN-tmF8RZEh1uhkT6HVFA/export?format=csv";
    const deletedTableUrl = "https://docs.google.com/spreadsheets/d/1FVN90zGMNJbKOiBJWCVdVH7UFI74yny4G-3vJBzwrEo/export?format=csv";

    // Fetch and update both CSV tables in localStorage
    fetchCSVData(pagesTableUrl, false);  // Passing false to force fetching from the network
    fetchCSVData(deletedTableUrl, false);
});
