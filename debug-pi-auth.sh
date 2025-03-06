#!/bin/bash

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_message() {
  echo -e "${BLUE}[DEBUG-PI-AUTH]${NC} $1"
}

print_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check if debug-auth.js exists
check_script_exists() {
  if [ ! -f "./debug-auth.js" ]; then
    print_error "debug-auth.js script not found in the current directory!"
    print_message "Make sure you're running this script from the project root directory."
    exit 1
  else
    print_success "Found debug-auth.js script."
  fi
}

# Check if Node.js and npm are installed
check_node_npm() {
  if ! command_exists node; then
    print_error "Node.js is not installed!"
    print_message "Please install Node.js (v14 or newer) from https://nodejs.org/"
    exit 1
  else
    NODE_VERSION=$(node -v)
    print_success "Node.js is installed: $NODE_VERSION"
  fi

  if ! command_exists npm; then
    print_error "npm is not installed!"
    print_message "npm usually comes with Node.js. Please reinstall Node.js from https://nodejs.org/"
    exit 1
  else
    NPM_VERSION=$(npm -v)
    print_success "npm is installed: $NPM_VERSION"
  fi
}

# Install required dependencies
install_dependencies() {
  print_message "Checking for required dependencies..."
  
  # Create a temporary package.json if it doesn't exist
  if [ ! -f "./package.json" ]; then
    print_warning "No package.json found. Creating a temporary one for dependency installation."
    echo '{
      "name": "pi-auth-debug",
      "version": "1.0.0",
      "description": "Temporary package for installing dependencies",
      "private": true
    }' > temp-package.json
    TEMP_PACKAGE=true
  else
    TEMP_PACKAGE=false
  fi
  
  # Check and install prompt-sync
  if ! npm list prompt-sync >/dev/null 2>&1; then
    print_message "Installing prompt-sync package..."
    npm install prompt-sync --no-fund
    if [ $? -ne 0 ]; then
      print_error "Failed to install prompt-sync."
      exit 1
    fi
  else
    print_success "prompt-sync is already installed."
  fi
  
  # Check and install commander
  if ! npm list commander >/dev/null 2>&1; then
    print_message "Installing commander package..."
    npm install commander --no-fund
    if [ $? -ne 0 ]; then
      print_error "Failed to install commander."
      exit 1
    fi
  else
    print_success "commander is already installed."
  fi
  
  # Check and install axios
  if ! npm list axios >/dev/null 2>&1; then
    print_message "Installing axios package..."
    npm install axios --no-fund
    if [ $? -ne 0 ]; then
      print_error "Failed to install axios."
      exit 1
    fi
  else
    print_success "axios is already installed."
  fi
  
  # Clean up temporary package.json if we created one
  if [ "$TEMP_PACKAGE" = true ]; then
    rm temp-package.json
    print_message "Removed temporary package.json"
  fi
  
  print_success "All required dependencies are installed."
}

# Run the debug-auth.js script
run_debug_script() {
  print_message "Running Pi Network authentication debug script..."
  echo ""
  
  # Check for any command line arguments passed to this script
  if [ $# -gt 0 ]; then
    node debug-auth.js "$@"
  else
    # Run with default options if none provided
    node debug-auth.js --verbose
  fi
  
  RESULT=$?
  if [ $RESULT -eq 0 ]; then
    echo ""
    print_success "Debug script completed successfully."
  else
    echo ""
    print_warning "Debug script exited with code $RESULT."
  fi
}

# Display instructions
show_instructions() {
  echo ""
  echo -e "${BLUE}===========================================${NC}"
  echo -e "${BLUE}    PI NETWORK AUTHENTICATION DEBUGGER    ${NC}"
  echo -e "${BLUE}===========================================${NC}"
  echo ""
  echo "This script helps diagnose authentication issues with the Pi Network API."
  echo ""
  echo "Command line options:"
  echo "  --verbose       Show detailed logs of API requests and responses"
  echo "  --save          Save working credentials to a local config file"
  echo "  --help          Show the help information"
  echo ""
  echo "Examples:"
  echo "  ./debug-pi-auth.sh                # Run with default options"
  echo "  ./debug-pi-auth.sh --verbose      # Run with detailed logging"
  echo "  ./debug-pi-auth.sh --save         # Save working credentials"
  echo ""
  echo "The script will prompt you for your Pi Network username and password."
  echo "This information is only used for testing and not stored unless you"
  echo "specifically request it with the --save option."
  echo ""
  echo -e "${YELLOW}Troubleshooting Tips:${NC}"
  echo "1. If you receive 401 errors, verify your credentials are correct"
  echo "2. If you receive 404 errors, the API endpoint may have changed"
  echo "3. Check your network connection if you receive timeout errors"
  echo "4. Review debug logs for detailed error information"
  echo ""
  echo -e "${BLUE}===========================================${NC}"
}

# Main function
main() {
  # Show instructions first
  show_instructions
  
  # Perform checks
  check_script_exists
  check_node_npm
  install_dependencies
  
  # Run the debug script with any arguments passed to this script
  run_debug_script "$@"
  
  echo ""
  print_message "Debug session complete. If you continue to experience issues,"
  print_message "please check the AUTH-DEBUG.md file for more information."
}

# Execute main function with all script arguments
main "$@"

