const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', 
  {
    // Get application version from the main process
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    
    // Example: Pi Network specific methods would be added here
    // For instance:
    // checkPiNetworkConnection: () => ipcRenderer.invoke('check-pi-network-connection'),
    // getPiBalance: () => ipcRenderer.invoke('get-pi-balance'),
    // sendPi: (recipient, amount) => ipcRenderer.invoke('send-pi', recipient, amount),
    
    // Add an event listener to receive messages from the main process
    on: (channel, callback) => {
      // Whitelist of valid channels
      const validChannels = ['pi-network-status', 'transaction-update'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => callback(...args));
      }
    },
    
    // Remove an event listener
    removeListener: (channel, callback) => {
      const validChannels = ['pi-network-status', 'transaction-update'];
      if (validChannels.includes(channel)) {
        ipcRenderer.removeListener(channel, callback);
      }
    }
  }
);

// Add any additional context bridge exposures or preload functionality here

