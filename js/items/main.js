import { getValidPages } from '../page-utils.js'; // Import utility function to fetch valid pages

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const parentId = urlParams.get('parent'); // Retrieve the parent URL parameter
    
    const validPages = await getValidPages();
    
    // Filter pages based on the parentId or show rows with empty parent field
    const filteredPages = validPages.filter(page => {
        if (parentId) {
            // If parentId is provided, show only rows where the 'id' matches the parent
            return page.id === parentId;
        } else {
            // If no parentId, show rows where 'parent' field is empty
            return page.parent === "";
        }
    });
    
    // Populate the list with filtered pages
    const itemsListContainer = document.getElementById('items-list-container');
    itemsListContainer.innerHTML = ''; // Clear any existing content

    filteredPages.forEach(page => {
        const itemElement = createListItem(page);
        itemsListContainer.appendChild(itemElement);
    });
});

// Function to create the list item element
function createListItem(page) {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('list-item');
    itemDiv.style.cursor = 'pointer';

    // Circle element
    const circle = document.createElement('div');
    circle.classList.add('circle');
    circle.style.backgroundColor = page.colour; // Set circle color based on the 'colour' field

    // Title
    const title = document.createElement('span');
    title.classList.add('item-title');
    title.textContent = page.title;

    // Append the circle and title to the list item
    itemDiv.appendChild(circle);
    itemDiv.appendChild(title);

    // Add click event listener to the item
    itemDiv.addEventListener('click', () => {
        // Check if the clicked item has children by looking for other rows with this 'id' as the parent
        const hasChildren = isParentForOtherRows(page.id);
        if (hasChildren) {
            // If there are child items, reload the same page with 'parent' set to this item's 'id'
            window.location.href = `items.html?parent=${page.id}`;
        } else {
            // Otherwise, redirect to the 'single-item.html' page with 'id' as a URL parameter
            window.location.href = `single-item.html?id=${page.id}`;
        }
    });

    return itemDiv;
}

// Function to check if the page has children (rows with this 'id' in the 'parent' field)
function isParentForOtherRows(parentId) {
    return validPages.some(page => page.parent === parentId);
}
