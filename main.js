const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const Store = require('electron-store');

// Linux build doesn't need Windows-specific startup handling
// if (require('electron-squirrel-startup')) {
//   app.quit();
// }

// Create a secure store for user credentials
const store = new Store({
  name: 'pi-network-auth',
  encryptionKey: 'pi-network-secure-key', // In production, generate this dynamically
  schema: {
    authToken: {
      type: 'string'
    },
    user: {
      type: 'object'
    }
  }
});

// Authentication state
let isAuthenticated = false;

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, // Security: Disable Node.js integration in renderer
      contextIsolation: true, // Security: Enable context isolation
      enableRemoteModule: false // Security: Disable remote module
    },
  });

  // Check authentication and load the appropriate file
  isAuthenticated = !!store.get('authToken');
  
  if (isAuthenticated) {
    // Load the main app if authenticated
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
  } else {
    // Load the login page if not authenticated
    mainWindow.loadFile(path.join(__dirname, 'login.html'));
  }

  // Open the DevTools in development mode only
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for communication with renderer process
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// Authentication IPC handlers

// Handle login requests
ipcMain.handle('auth-login', async (event, username, password) => {
  try {
    // In a real app, you would make an API call to Pi Network backend here
    // For demonstration, we'll simulate a successful login with mock data
    
    // Simple validation (replace with actual API call to Pi Network)
    if (username && password) {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful authentication response
      const mockToken = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
      const mockUser = {
        id: '12345',
        username: username,
        displayName: username.split('@')[0],
        balance: '123.45', // Mock Pi balance
      };
      
      // Store the auth token and user data securely
      store.set('authToken', mockToken);
      store.set('user', mockUser);
      
      // Update authentication state
      isAuthenticated = true;
      
      return {
        success: true,
        user: mockUser
      };
    }
    
    return {
      success: false,
      error: 'Invalid credentials'
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'Authentication failed'
    };
  }
});

// Handle logout requests
ipcMain.handle('auth-logout', () => {
  try {
    // Clear stored credentials
    store.delete('authToken');
    store.delete('user');
    
    // Update authentication state
    isAuthenticated = false;
    
    // Get the current window and load the login page
    const currentWindow = BrowserWindow.getFocusedWindow();
    if (currentWindow) {
      currentWindow.loadFile(path.join(__dirname, 'login.html'));
    }
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: 'Logout failed'
    };
  }
});

// Handle auth status check requests
ipcMain.handle('auth-check-status', () => {
  try {
    const authToken = store.get('authToken');
    const user = store.get('user');
    
    isAuthenticated = !!authToken;
    
    return {
      isAuthenticated,
      user: isAuthenticated ? user : null
    };
  } catch (error) {
    console.error('Auth check error:', error);
    return {
      isAuthenticated: false,
      error: 'Failed to check authentication status'
    };
  }
});

// External link handler for "forgot password" etc.
ipcMain.handle('open-external-link', (event, url) => {
  if (url.startsWith('https://')) {
    shell.openExternal(url);
    return true;
  }
  return false;
});

// You would add more IPC handlers for Pi Network specific functionality here


