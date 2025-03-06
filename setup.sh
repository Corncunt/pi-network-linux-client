#!/bin/bash

# ========================================================
# Pi Network Linux Client - Development Environment Setup
# ========================================================
# This script automates the setup of the development environment
# for the Pi Network Linux client project. It will:
# 1. Check for and install required dependencies (Node.js, npm)
# 2. Set up the development environment
# 3. Install project dependencies
# 4. Provide instructions for running the application
# ========================================================

# Text formatting
BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
RESET="\033[0m"

# Print header
echo -e "${BOLD}========================================================${RESET}"
echo -e "${BOLD}      Pi Network Linux Client - Environment Setup      ${RESET}"
echo -e "${BOLD}========================================================${RESET}"
echo ""

# Function to print status messages
print_status() {
    echo -e "${YELLOW}[*] $1${RESET}"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}[✓] $1${RESET}"
}

# Function to print error messages
print_error() {
    echo -e "${RED}[✗] $1${RESET}"
}

# Detect package manager
print_status "Detecting package manager..."
if command -v apt-get &> /dev/null; then
    PKG_MANAGER="apt"
    INSTALL_CMD="apt-get install -y"
    UPDATE_CMD="apt-get update"
    print_success "Detected apt-based distribution (Debian/Ubuntu)"
elif command -v dnf &> /dev/null; then
    PKG_MANAGER="dnf"
    INSTALL_CMD="dnf install -y"
    UPDATE_CMD="dnf check-update"
    print_success "Detected dnf-based distribution (Fedora/RHEL)"
elif command -v yum &> /dev/null; then
    PKG_MANAGER="yum"
    INSTALL_CMD="yum install -y"
    UPDATE_CMD="yum check-update"
    print_success "Detected yum-based distribution (CentOS/RHEL)"
else
    print_error "Unsupported package manager. This script supports apt, dnf, and yum."
    exit 1
fi

# Check if script is run with sudo/root privileges
if [ "$EUID" -ne 0 ]; then
    print_error "This script requires root privileges to install packages."
    echo "Please run with sudo: sudo $0"
    exit 1
fi

# Update package repositories
print_status "Updating package repositories..."
$UPDATE_CMD
print_success "Package repositories updated"

# Check for Node.js and install if missing
print_status "Checking for Node.js..."
if ! command -v node &> /dev/null; then
    print_status "Node.js not found. Installing..."
    
    if [ "$PKG_MANAGER" == "apt" ]; then
        # For Debian/Ubuntu - Add NodeSource repository for more recent Node.js version
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        $INSTALL_CMD nodejs
    elif [ "$PKG_MANAGER" == "dnf" ] || [ "$PKG_MANAGER" == "yum" ]; then
        # For Fedora/RHEL/CentOS - Add NodeSource repository
        curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
        $INSTALL_CMD nodejs
    fi
    
    if ! command -v node &> /dev/null; then
        print_error "Failed to install Node.js. Please install it manually."
        exit 1
    else
        print_success "Node.js installed successfully: $(node -v)"
    fi
else
    print_success "Node.js is already installed: $(node -v)"
fi

# Check for npm and install if missing
print_status "Checking for npm..."
if ! command -v npm &> /dev/null; then
    print_status "npm not found. Installing..."
    $INSTALL_CMD npm
    
    if ! command -v npm &> /dev/null; then
        print_error "Failed to install npm. Please install it manually."
        exit 1
    else
        print_success "npm installed successfully: $(npm -v)"
    fi
else
    print_success "npm is already installed: $(npm -v)"
fi

# Install development tools
print_status "Installing development tools..."
if [ "$PKG_MANAGER" == "apt" ]; then
    $INSTALL_CMD build-essential git
elif [ "$PKG_MANAGER" == "dnf" ] || [ "$PKG_MANAGER" == "yum" ]; then
    $INSTALL_CMD gcc gcc-c++ make git
fi
print_success "Development tools installed"

# Navigate to project directory and install dependencies
print_status "Installing project dependencies..."
cd "$(dirname "$0")" || exit 1
npm install
if [ $? -eq 0 ]; then
    print_success "Project dependencies installed successfully"
else
    print_error "Failed to install project dependencies"
    exit 1
fi

# Setup complete
echo ""
echo -e "${BOLD}========================================================${RESET}"
echo -e "${BOLD}             Setup completed successfully!              ${RESET}"
echo -e "${BOLD}========================================================${RESET}"
echo ""
echo -e "To run the application, use the following command:"
echo -e "${BOLD}    npm start${RESET}"
echo ""
echo -e "To build the application for distribution:"
echo -e "${BOLD}    npm run build${RESET}"
echo ""
echo -e "For more information, see the README.md file."
echo ""

# Make the script executable
chmod +x setup.sh

exit 0

