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
    
    // Check if the user is authenticated
    await checkAuthStatus();
    
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

/**
 * Checks the authentication status and updates the UI accordingly
 */
async function checkAuthStatus() {
  try {
    const authStatus = await window.piAuth.checkAuthStatus();
    
    if (authStatus.isAuthenticated) {
      // User is authenticated, show user info
      showUserInfo(authStatus.user);
      showAuthenticatedUI();
    } else {
      // User is not authenticated, show login UI
      showUnauthenticatedUI();
    }
  } catch (error) {
    console.error('Error checking authentication status:', error);
    showUnauthenticatedUI();
  }
}

/**
 * Display the user information in the UI
 */
function showUserInfo(user) {
  const userInfoContainer = document.getElementById('user-info-container');
  
  // Update user info fields
  document.getElementById('user-username').textContent = user.username;
  document.getElementById('user-balance').textContent = user.balance || '0.0';
  document.getElementById('user-type').textContent = user.accountType || 'Standard';
  document.getElementById('user-member-since').textContent = user.memberSince || 'Unknown';
  
  // Make sure logout button has event listener
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    // Remove any existing listeners to avoid duplicates
    const newLogoutButton = logoutButton.cloneNode(true);
    logoutButton.parentNode.replaceChild(newLogoutButton, logoutButton);
    newLogoutButton.addEventListener('click', handleLogout);
  }
}

/**
 * Show UI elements that should only appear when authenticated
 */
function showAuthenticatedUI() {
  // Hide login prompt
  const loginPrompt = document.getElementById('login-prompt');
  if (loginPrompt) {
    loginPrompt.style.display = 'none';
  }
  
  // Show user info container
  const userInfoContainer = document.getElementById('user-info-container');
  if (userInfoContainer) {
    userInfoContainer.style.display = 'block';
  }
  
  // Show authenticated content
  const authenticatedContent = document.querySelectorAll('.authenticated-only');
  authenticatedContent.forEach(element => {
    element.style.display = 'block';
  });
  
  // Update connection status with authentication information
  const statusElement = document.getElementById('connection-status');
  if (statusElement) {
    statusElement.textContent = 'Connected and authenticated to Pi Network.';
    statusElement.style.color = 'green';
  }
}

/**
 * Show UI elements for unauthenticated users
 */
function showUnauthenticatedUI() {
  // Hide user info container
  const userInfoContainer = document.getElementById('user-info-container');
  if (userInfoContainer) {
    userInfoContainer.style.display = 'none';
  }
  
  // Show login prompt
  const loginPrompt = document.getElementById('login-prompt');
  if (loginPrompt) {
    loginPrompt.style.display = 'block';
    
    // Make sure login button has event listener
    const loginButton = document.getElementById('login-button');
    if (loginButton) {
      // Remove any existing listeners to avoid duplicates
      const newLoginButton = loginButton.cloneNode(true);
      loginButton.parentNode.replaceChild(newLoginButton, loginButton);
      newLoginButton.addEventListener('click', () => {
        // Redirect to login page
        window.location.href = 'login.html';
      });
    }
  }
  
  // Hide authenticated content
  const authenticatedContent = document.querySelectorAll('.authenticated-only');
  authenticatedContent.forEach(element => {
    element.style.display = 'none';
  });
}

/**
 * Handle user logout
 */
async function handleLogout() {
  try {
    await window.piAuth.logout();
    showUnauthenticatedUI();
    
    // Update connection status
    const statusElement = document.getElementById('connection-status');
    if (statusElement) {
      statusElement.textContent = 'Logged out from Pi Network.';
      statusElement.style.color = 'orange';
    }
  } catch (error) {
    console.error('Error during logout:', error);
  }
}

