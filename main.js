const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const Store = require('electron-store');
const axios = require('axios');

// API endpoints
const PI_API_BASE_URL = 'https://api.minepi.com';
const PI_AUTH_ENDPOINTS = {
  login: `${PI_API_BASE_URL}/auth/login`,
  logout: `${PI_API_BASE_URL}/auth/logout`,
  refresh: `${PI_API_BASE_URL}/auth/refresh`,
  status: `${PI_API_BASE_URL}/auth/status`
};

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
    refreshToken: {
      type: 'string'
    },
    tokenExpiry: {
      type: 'number'
    },
    user: {
      type: 'object'
    }
  }
});

// Authentication state
let isAuthenticated = false;

// Helper function to check if token is expired
const isTokenExpired = () => {
  const expiryTime = store.get('tokenExpiry');
  if (!expiryTime) return true;
  
  // Consider token expired 5 minutes before actual expiry to be safe
  return Date.now() >= (expiryTime - 5 * 60 * 1000);
};

// Helper function to refresh the token
const refreshToken = async () => {
  try {
    const refreshToken = store.get('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');
    
    const response = await axios.post(PI_AUTH_ENDPOINTS.refresh, {
      refreshToken
    });
    
    const { token, refreshToken: newRefreshToken, expiresIn } = response.data;
    
    // Update tokens in store
    store.set('authToken', token);
    store.set('refreshToken', newRefreshToken);
    store.set('tokenExpiry', Date.now() + (expiresIn * 1000));
    
    return token;
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Force logout on refresh failure
    store.delete('authToken');
    store.delete('refreshToken');
    store.delete('tokenExpiry');
    store.delete('user');
    isAuthenticated = false;
    throw error;
  }
};

// Helper function to get a valid token, refreshing if necessary
const getValidToken = async () => {
  if (isTokenExpired()) {
    return await refreshToken();
  }
  return store.get('authToken');
};

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
    
    // Make a real API call to Pi Network's authentication service
    if (username && password) {
      try {
        // Call the Pi Network authentication API
        const response = await axios.post(PI_AUTH_ENDPOINTS.login, {
          username,
          password
        });
        
        // Extract authentication token and user data from response
        const { token, refreshToken, expiresIn, user } = response.data;
        
        // Store the auth token, refresh token, expiry time and user data securely
        store.set('authToken', token);
        store.set('refreshToken', refreshToken);
        store.set('tokenExpiry', Date.now() + (expiresIn * 1000));
        store.set('user', user);
        
        // Update authentication state
        isAuthenticated = true;
        
        return {
          success: true,
          user: user
        };
      } catch (error) {
        console.error('Pi Network API login error:', error.response?.data || error.message);
        
        // Handle API error responses
        const errorMessage = error.response?.data?.error || 'Authentication failed';
        return {
          success: false,
          error: errorMessage
        };
      }
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
ipcMain.handle('auth-logout', async () => {
  try {
    const authToken = store.get('authToken');
    
    if (authToken) {
      try {
        // Call Pi Network's logout endpoint
        await axios.post(PI_AUTH_ENDPOINTS.logout, {}, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
      } catch (apiError) {
        console.warn('Error calling logout API:', apiError.message);
        // Continue with local logout even if API call fails
      }
    }
    
    // Clear stored credentials
    store.delete('authToken');
    store.delete('refreshToken');
    store.delete('tokenExpiry');
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
ipcMain.handle('auth-check-status', async () => {
  try {
    const authToken = store.get('authToken');
    const user = store.get('user');
    
    // If no token exists, user is not authenticated
    if (!authToken) {
      isAuthenticated = false;
      return {
        isAuthenticated,
        user: null
      };
    }
    
    try {
      // Check if token is expired and needs refresh
      const token = await getValidToken();
      
      // Verify token with the server
      const response = await axios.get(PI_AUTH_ENDPOINTS.status, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // If we get here, token is valid
      isAuthenticated = true;
      
      // Update user info if returned from status check
      if (response.data && response.data.user) {
        store.set('user', response.data.user);
        return {
          isAuthenticated,
          user: response.data.user
        };
      }
      
      return {
        isAuthenticated,
        user
      };
    } catch (apiError) {
      console.error('Token validation error:', apiError);
      
      // If token refresh failed or token is invalid
      // Clear auth data and return not authenticated
      store.delete('authToken');
      store.delete('refreshToken');
      store.delete('tokenExpiry');
      store.delete('user');
      isAuthenticated = false;
      
      return {
        isAuthenticated: false,
        user: null,
        error: 'Session expired'
      };
    }
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


