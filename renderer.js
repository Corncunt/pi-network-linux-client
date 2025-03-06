// This file contains renderer process code

// When document has loaded, initialize
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  try {
    // Display app version
    const version = await window.api.getAppVersion();
    document.getElementById('app-version').textContent = `v${version}`;
    
    // Set up event listeners for Pi Network status updates
    window.api.on('pi-network-status', (status) => {
      updateConnectionStatus(status);
    });
    
    // Future functionality would be initialized here
    console.log('Pi Network Linux client initialized');
  } catch (error) {
    console.error('Error initializing app:', error);
  }
}

function updateConnectionStatus(status) {
  const statusElement = document.getElementById('connection-status');
  if (status && status.connected) {
    statusElement.textContent = `Connected to Pi Network. Server: ${status.server}`;
    statusElement.style.color = 'green';
  } else {
    statusElement.textContent = 'Not connected to Pi Network services.';
    statusElement.style.color = 'red';
  }
}

// Add more renderer functions as needed for Pi Network functionality

