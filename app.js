// Cache name for offline data
const CACHE_NAME = 'pwa-cache-v1';
const DATA_URL = 'https://raw.githubusercontent.com/mwaskom/seaborn-data/master/penguins.csv'; // Replace with your CSV file URL
const CONFIG_URL = 'config.json'; // Replace with your configuration file URL

// Fetch data from the CSV and display
async function fetchData() {
  try {
    const response = await fetch(DATA_URL);
    const text = await response.text();
    const rows = text.split('\n').map(row => row.split(','));
    const dataDiv = document.getElementById('data');
    dataDiv.innerHTML = ''; // Clear previous data
    rows.forEach(row => {
      const div = document.createElement('div');
      div.innerText = row.join(' - '); // Show each row of the CSV
      dataDiv.appendChild(div);
    });
    // Cache the fetched data
    const cache = await caches.open(CACHE_NAME);
    cache.put(DATA_URL, new Response(text));
  } catch (error) {
    console.error('Failed to fetch data:', error);
    loadFromCache();
  }
}

// Cache data and use service worker for offline usage
async function loadFromCache() {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(DATA_URL);
  if (cachedResponse) {
    const text = await cachedResponse.text();
    const rows = text.split('\n').map(row => row.split(','));
    const dataDiv = document.getElementById('data');
    dataDiv.innerHTML = ''; // Clear previous data
    rows.forEach(row => {
      const div = document.createElement('div');
      div.innerText = row.join(' - '); // Show each row of the CSV
      dataDiv.appendChild(div);
    });
  } else {
    console.warn('No cached data found');
    const dataDiv = document.getElementById('data');
    dataDiv.innerHTML = '<p>No data available offline. Please go online to fetch data.</p>';
  }
}

// Handle configuration fetch
async function fetchConfig() {
  try {
    const response = await fetch(CONFIG_URL);
    const config = await response.json();
    
    // Use the configuration to update the UI
    const title = document.querySelector('h1');
    title.innerText = config.welcomeMessage || 'Fetched Data:';
    
    // Update other UI elements based on config
    console.log('Config loaded:', config);
    
    // Optional: Change theme based on config (light/dark)
    if (config.theme === 'dark') {
      document.body.style.backgroundColor = '#333';
      document.body.style.color = '#fff';
    }
  } catch (error) {
    console.error('Failed to fetch config:', error);
  }
}

// Check if the app is online, if so fetch fresh data
if (navigator.onLine) {
  fetchData();
  fetchConfig();
} else {
  loadFromCache();
}

// Service Worker setup
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').then(registration => {
    console.log('Service Worker registered', registration);
  }).catch(error => {
    console.error('Service Worker registration failed:', error);
  });
}