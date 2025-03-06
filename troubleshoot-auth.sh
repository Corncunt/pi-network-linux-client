#!/bin/bash

# ============================
# Pi Network Authentication Troubleshooting Script
# ============================
# This script automates the process of diagnosing authentication issues
# with the Pi Network Linux client.

# Set text colors for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Global variables
REPORT_FILE="pi-auth-troubleshoot-report-$(date +%Y%m%d-%H%M%S).txt"
LOG_FILE="pi-auth-debug-$(date +%Y%m%d-%H%M%S).log"
URL_ISSUES=false
DEP_ISSUES=false
NET_ISSUES=false
CONFIG_ISSUES=false
DEBUG_TOOL="debug-auth.js"
VERBOSE=false

# ============================
# Utility Functions
# ============================

print_header() {
    echo -e "\n${BLUE}==== $1 ====${NC}\n"
    echo "==== $1 ====" >> "$REPORT_FILE"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    echo "✓ $1" >> "$REPORT_FILE"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
    echo "⚠ $1" >> "$REPORT_FILE"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    echo "✗ $1" >> "$REPORT_FILE"
}

print_info() {
    echo -e "$1"
    echo "$1" >> "$REPORT_FILE"
}

log_debug() {
    if [ "$VERBOSE" = true ]; then
        echo "[DEBUG] $1"
    fi
    echo "[DEBUG] $1" >> "$LOG_FILE"
}

show_help() {
    echo "Usage: ./troubleshoot-auth.sh [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help       Show this help message"
    echo "  -v, --verbose    Enable verbose output"
    echo "  -s, --save       Save credentials if login successful"
    echo ""
    echo "This script automates the process of troubleshooting Pi Network"
    echo "authentication issues in the Pi Linux client."
}

# ============================
# Diagnostic Functions
# ============================

check_dependencies() {
    print_header "Checking Dependencies"
    
    # Check for Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        print_success "Node.js is installed (${NODE_VERSION})"
        
        # Check Node.js version
        NODE_VERSION_NUM=$(echo "${NODE_VERSION}" | cut -c 2- | cut -d. -f1)
        if [ "$NODE_VERSION_NUM" -lt 14 ]; then
            print_warning "Node.js version is below recommended v14. Consider upgrading."
            DEP_ISSUES=true
        fi
    else
        print_error "Node.js is not installed. Please install Node.js v14 or newer."
        DEP_ISSUES=true
    fi
    
    # Check for npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm -v)
        print_success "npm is installed (v${NPM_VERSION})"
    else
        print_error "npm is not installed. Please install npm."
        DEP_ISSUES=true
    fi
    
    # Check for curl (used for network tests)
    if command -v curl &> /dev/null; then
        print_success "curl is installed"
    else
        print_warning "curl is not installed. Network tests will be limited."
    fi

    # Check for required npm packages
    print_info "\nChecking required npm packages:"
    
    # Check for axios
    if npm list axios &> /dev/null; then
        print_success "axios is installed"
    else
        print_warning "axios is not installed. Installing..."
        npm install axios
    fi
    
    # Check for prompt-sync
    if npm list prompt-sync &> /dev/null; then
        print_success "prompt-sync is installed"
    else
        print_warning "prompt-sync is not installed. Installing..."
        npm install prompt-sync
    fi
    
    # Check for commander
    if npm list commander &> /dev/null; then
        print_success "commander is installed"
    else
        print_warning "commander is not installed. Installing..."
        npm install commander
    fi
}

check_network_connectivity() {
    print_header "Checking Network Connectivity"
    
    # Test connection to Pi Network API domains
    echo "Testing connection to Pi Network API domains:"
    
    # Test main API domain
    if ping -c 1 api.minepi.com &> /dev/null; then
        print_success "Can reach api.minepi.com"
    else
        print_error "Cannot reach api.minepi.com. Network issues detected."
        NET_ISSUES=true
    fi
    
    # Test HTTPS connection
    if command -v curl &> /dev/null; then
        echo "Testing HTTPS connectivity to Pi Network API:"
        
        # Test v2 endpoint
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.minepi.com/v2/health 2>/dev/null)
        if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "404" ]; then
            print_success "HTTPS connection to api.minepi.com/v2 successful (HTTP ${HTTP_STATUS})"
        else
            print_warning "Unusual response from api.minepi.com/v2 (HTTP ${HTTP_STATUS})"
            NET_ISSUES=true
        fi
        
        # Test base endpoint
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.minepi.com/health 2>/dev/null)
        if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "404" ]; then
            print_success "HTTPS connection to api.minepi.com successful (HTTP ${HTTP_STATUS})"
        else
            print_warning "Unusual response from api.minepi.com (HTTP ${HTTP_STATUS})"
            NET_ISSUES=true
        fi
    else
        print_warning "curl is not installed. Skipping HTTPS connectivity tests."
    fi
    
    # Test DNS resolution
    echo "Testing DNS resolution for Pi Network domains:"
    if host api.minepi.com &> /dev/null; then
        print_success "DNS resolution for api.minepi.com successful"
    else
        print_error "DNS resolution for api.minepi.com failed"
        NET_ISSUES=true
    fi
}

check_api_url_consistency() {
    print_header "Checking API URL Consistency"
    
    URL_INCONSISTENCIES=0
    
    # Check auth.js
    if [ -f "src/api/auth.js" ]; then
        AUTH_BASE_URL=$(grep -o "BASE_API_URL.*" src/api/auth.js | head -1)
        print_info "In src/api/auth.js: ${AUTH_BASE_URL}"
        
        if [[ "$AUTH_BASE_URL" != *"api.minepi.com/v2"* ]]; then
            print_warning "auth.js may not be using the correct API base URL"
            URL_INCONSISTENCIES=$((URL_INCONSISTENCIES + 1))
        fi
    else
        print_warning "src/api/auth.js not found"
    fi
    
    # Check main.js
    if [ -f "main.js" ]; then
        MAIN_BASE_URL=$(grep -o "PI_API_BASE_URL.*" main.js | head -1)
        print_info "In main.js: ${MAIN_BASE_URL}"
        
        if [[ "$MAIN_BASE_URL" != *"api.minepi.com/v2"* ]]; then
            print_warning "main.js may not be using the correct API base URL"
            URL_INCONSISTENCIES=$((URL_INCONSISTENCIES + 1))
        fi
    else
        print_warning "main.js not found"
    fi
    
    # Check for other API URL references
    OTHER_URLS=$(grep -r "api.minepi.com" --include="*.js" . | grep -v "src/api/auth.js" | grep -v "main.js" | grep -v "test-auth.js" | grep -v "debug-auth.js")
    
    if [ -n "$OTHER_URLS" ]; then
        print_info "\nOther API URL references found:"
        echo "$OTHER_URLS" | head -5
        if [ $(echo "$OTHER_URLS" | wc -l) -gt 5 ]; then
            print_info "...and $(echo "$OTHER_URLS" | wc -l) more references"
        fi
        
        if [[ "$OTHER_URLS" == *"api.minepi.com"* ]] && [[ "$OTHER_URLS" != *"api.minepi.com/v2"* ]]; then
            print_warning "Inconsistent API URL formats detected in other files"
            URL_INCONSISTENCIES=$((URL_INCONSISTENCIES + 1))
        fi
    fi
    
    if [ $URL_INCONSISTENCIES -gt 0 ]; then
        print_error "Found $URL_INCONSISTENCIES potential API URL inconsistencies"
        URL_ISSUES=true
    else
        print_success "API URLs appear to be consistent"
    fi
}

check_config_files() {
    print_header "Checking Configuration Files"
    
    # Check package.json
    if [ -f "package.json" ]; then
        print_success "Found package.json"
        
        # Check for required dependencies
        if grep -q "\"axios\":" package.json; then
            print_success "axios dependency found in package.json"
        else
            print_warning "axios dependency not found in package.json"
            CONFIG_ISSUES=true
        fi
        
        # Check for dev script
        if grep -q "\"dev\":" package.json; then
            print_success "dev script found in package.json"
        else
            print_warning "dev script not found in package.json"
            CONFIG_ISSUES=true
        fi
    else
        print_error "package.json not found"
        CONFIG_ISSUES=true
    fi
    
    # Check for local config
    if [ -f "config.json" ]; then
        print_info "Found config.json file"
        
        # Check for API URL in config
        if grep -q "apiUrl" config.json; then
            API_URL=$(grep -o "\"apiUrl\".*" config.json)
            print_info "API URL in config.json: ${API_URL}"
            
            if [[ "$API_URL" != *"api.minepi.com/v2"* ]]; then
                print_warning "config.json may not have the correct API URL"
                CONFIG_ISSUES=true
            fi
        fi
    fi
    
    # Check for electron-store files
    ELECTRON_STORE_DIR="$HOME/.config/pi-linux-client"
    if [ -d "$ELECTRON_STORE_DIR" ]; then
        print_info "Found electron-store config directory"
        
        # Check for token storage
        if grep -q "token" "$ELECTRON_STORE_DIR"/* 2>/dev/null; then
            print_info "Token storage found in electron-store"
        else
            print_info "No tokens found in electron-store"
        fi
    fi
}

run_debug_tools() {
    print_header "Running Authentication Debug Tools"
    
    # Check for debug-auth.js tool
    if [ -f "$DEBUG_TOOL" ]; then
        print_success "Found $DEBUG_TOOL debug tool"
        
        # Build command with options
        DEBUG_CMD="node $DEBUG_TOOL"
        if [ "$VERBOSE" = true ]; then
            DEBUG_CMD="$DEBUG_CMD --verbose"
        fi
        if [ "$SAVE_CREDS" = true ]; then
            DEBUG_CMD="$DEBUG_CMD --save"
        fi
        
        print_info "\nRunning authentication debug tool..."
        print_info "Command: $DEBUG_CMD"
        print_info "Note: You will be prompted for your Pi Network credentials"
        print_info "This information is only used for testing and is not stored unless you use --save"
        
        echo -e "\n${YELLOW}Press Enter to continue or Ctrl+C to abort${NC}"
        read
        
        # Run the debug tool
        eval "$DEBUG_CMD"
        DEBUG_EXIT_CODE=$?
        
        if [ $DEBUG_EXIT_CODE -eq 0 ]; then
            print_success "Debug tool completed successfully"
        else
            print_error "Debug tool encountered issues (exit code: $DEBUG_EXIT_CODE)"
        fi
    else
        print_error "$DEBUG_TOOL not found. Skipping authentication debugging."
        print_info "You can manually run: node debug-auth.js"
    fi
}

generate_report() {
    print_header "Generating Troubleshooting Report"
    
    echo "Timestamp: $(date)" >> "$REPORT_FILE"
    echo "Node.js Version: $(node -v)" >> "$REPORT_FILE"
    echo "npm Version: $(npm -v)" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    
    # Summarize issues
    print_info "Summary of detected issues:"
    
    ISSUES_FOUND=0
    
    if [ "$DEP_ISSUES" = true ]; then
        print_error "Dependency issues detected"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    else
        print_success "All dependencies are installed correctly"
    fi
    
    if [ "$NET_ISSUES" = true ]; then
        print_error "Network connectivity issues detected"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    else
        print_success "Network connectivity appears normal"
    fi
    
    if [ "$URL_ISSUES" = true ]; then
        print_error "API URL inconsistencies detected"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    else
        print_success "API URLs appear consistent"
    fi
    
    if [ "$CONFIG_ISSUES" = true ]; then
        print_error "Configuration issues detected"
        ISSUES_FOUND=$((ISSUES_FOUND + 1))
    else
        print_success "Configuration appears normal"
    fi
    
    echo "" >> "$REPORT_FILE"
    echo "Total issues found: $ISSUES_FOUND" >> "$REPORT_FILE"
    
    # Add recommendations
    print_header "Recommendations"
    
    if [ $ISSUES_FOUND -eq 0 ]; then
        print_success "No major issues detected. If authentication is still failing:"
        print_info "1. Verify your Pi Network credentials are correct"
        print_info "2. Check if your Pi Network account has 2FA enabled"
        print_info "3. Try logging in on the Pi Network mobile app to verify account status"
    else
        if [ "$DEP_ISSUES" = true ]; then
            print_info "1. Fix dependency issues by running: npm install"
            print

#!/bin/bash

# ===================================================
# Pi Network Authentication Troubleshooting Script
# ===================================================
# This script automates the authentication debugging process 
# by checking dependencies, network connectivity, configuration
# inconsistencies, and running diagnostic tools.
# ===================================================

# Text formatting
BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
NC="\033[0m" # No Color

# File paths
MAIN_JS="./main.js"
AUTH_JS="./src/api/auth.js"
REPORT_FILE="pi-auth-troubleshooting-$(date +%Y%m%d-%H%M%S).txt"

# Function to print section headers
print_header() {
    echo -e "\n${BOLD}${BLUE}======= $1 =======${NC}\n"
}

# Function to print success messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print warning messages
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Function to print error messages
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Start report
start_report() {
    echo "Pi Network Authentication Troubleshooting Report" > "$REPORT_FILE"
    echo "Generated on $(date)" >> "$REPORT_FILE"
    echo "=======================================" >> "$REPORT_FILE"
}

# Add to report
add_to_report() {
    echo -e "$1" >> "$REPORT_FILE"
}

# Check if a command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# 1. Check for required dependencies
check_dependencies() {
    print_header "Checking Dependencies"
    add_to_report "\n## Dependencies Check\n"
    
    # Check Node.js
    if command_exists node; then
        NODE_VERSION=$(node -v)
        print_success "Node.js is installed: $NODE_VERSION"
        add_to_report "- Node.js: $NODE_VERSION"
        
        # Check Node.js version (require v14 or newer)
        NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d. -f1 | tr -d 'v')
        if [ "$NODE_MAJOR_VERSION" -lt 14 ]; then
            print_warning "Node.js version is older than v14. Upgrading is recommended."
            add_to_report "  - WARNING: Node.js version is older than recommended v14+"
        else
            add_to_report "  - Node.js version requirement met (v14+)"
        fi
    else
        print_error "Node.js is not installed!"
        add_to_report "- ERROR: Node.js is not installed"
        exit 1
    fi
    
    # Check npm
    if command_exists npm; then
        NPM_VERSION=$(npm -v)
        print_success "npm is installed: $NPM_VERSION"
        add_to_report "- npm: $NPM_VERSION"
    else
        print_error "npm is not installed!"
        add_to_report "- ERROR: npm is not installed"
        exit 1
    fi
    
    # Check if required Node packages are installed
    print_header "Checking Required Node Packages"
    add_to_report "\n## Required Node Packages\n"
    
    # Check if package.json exists
    if [ -f "package.json" ]; then
        REQUIRED_PACKAGES=("axios" "electron" "electron-store" "prompt-sync")
        
        for package in "${REQUIRED_PACKAGES[@]}"; do
            if npm list | grep -q "$package"; then
                print_success "$package is installed"
                add_to_report "- $package: Installed"
            else
                print_warning "$package is not installed. Installing now..."
                add_to_report "- $package: Not found, attempting to install"
                npm install "$package"
                
                # Check if installation was successful
                if npm list | grep -q "$package"; then
                    print_success "$package installed successfully"
                    add_to_report "  - Successfully installed $package"
                else
                    print_error "Failed to install $package"
                    add_to_report "  - ERROR: Failed to install $package"
                fi
            fi
        done
    else
        print_error "package.json not found in the current directory!"
        add_to_report "- ERROR: package.json not found"
    fi
}

# 2. Verify network connectivity to api.minepi.com
check_network_connectivity() {
    print_header "Checking Network Connectivity"
    add_to_report "\n## Network Connectivity\n"
    
    API_ENDPOINTS=("api.minepi.com" "api.minepi.com/v2/auth/health" "api.minepi.com/auth/health")
    
    for endpoint in "${API_ENDPOINTS[@]}"; do
        echo "Testing connectivity to $endpoint..."
        add_to_report "- Testing: $endpoint"
        
        # Use curl to check connectivity (with a 5-second timeout)
        if curl -s --head --request GET "https://$endpoint" --connect-timeout 5 | grep "HTTP/" > /dev/null; then
            HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$endpoint" --connect-timeout 5)
            if [ "$HTTP_STATUS" -ge 200 ] && [ "$HTTP_STATUS" -lt 300 ]; then
                print_success "Connection to https://$endpoint successful (HTTP $HTTP_STATUS)"
                add_to_report "  - SUCCESS: Connection successful (HTTP $HTTP_STATUS)"
            else
                print_warning "Connection to https://$endpoint returned HTTP $HTTP_STATUS"
                add_to_report "  - WARNING: Connection returned HTTP $HTTP_STATUS"
            fi
        else
            print_error "Failed to connect to https://$endpoint"
            add_to_report "  - ERROR: Connection failed"
        fi
    done
    
    # Check DNS resolution
    echo "Testing DNS resolution for api.minepi.com..."
    add_to_report "- Testing DNS resolution:"
    if command_exists dig; then
        DIG_RESULT=$(dig +short api.minepi.com)
        if [ -n "$DIG_RESULT" ]; then
            print_success "DNS resolution successful: $DIG_RESULT"
            add_to_report "  - SUCCESS: DNS resolves to $DIG_RESULT"
        else
            print_error "DNS resolution failed"
            add_to_report "  - ERROR: DNS resolution failed"
        fi
    elif command_exists nslookup; then
        NSLOOKUP_RESULT=$(nslookup api.minepi.com | grep Address | tail -n+2 | awk '{print $2}')
        if [ -n "$NSLOOKUP_RESULT" ]; then
            print_success "DNS resolution successful: $NSLOOKUP_RESULT"
            add_to_report "  - SUCCESS: DNS resolves to $NSLOOKUP_RESULT"
        else
            print_error "DNS resolution failed"
            add_to_report "  - ERROR: DNS resolution failed"
        fi
    else
        print_warning "DNS lookup tools (dig, nslookup) not available"
        add_to_report "  - WARNING: DNS lookup tools not available"
    fi
}

# 3. Examine configuration files for API URL inconsistencies
check_api_inconsistencies() {
    print_header "Checking API URL Configurations"
    add_to_report "\n## API URL Configuration Check\n"
    
    # Check main.js for API URL
    if [ -f "$MAIN_JS" ]; then
        MAIN_API_URL=$(grep -o "https://api.minepi.com[^\"']*" "$MAIN_JS" | sort | uniq)
        echo "API URLs in main.js:"
        add_to_report "- API URLs in main.js:"
        
        if [ -n "$MAIN_API_URL" ]; then
            echo "$MAIN_API_URL"
            add_to_report "  $MAIN_API_URL"
        else
            print_warning "No API URLs found in main.js"
            add_to_report "  - WARNING: No API URLs found"
        fi
    else
        print_error "main.js not found!"
        add_to_report "- ERROR: main.js not found"
    fi
    
    # Check auth.js for API URL
    if [ -f "$AUTH_JS" ]; then
        AUTH_API_URL=$(grep -o "https://api.minepi.com[^\"']*" "$AUTH_JS" | sort | uniq)
        echo "API URLs in auth.js:"
        add_to_report "- API URLs in auth.js:"
        
        if [ -n "$AUTH_API_URL" ]; then
            echo "$AUTH_API_URL"
            add_to_report "  $AUTH_API_URL"
        else
            print_warning "No API URLs found in auth.js"
            add_to_report "  - WARNING: No API URLs found"
        fi
    else
        print_error "auth.js not found at $AUTH_JS!"
        add_to_report "- ERROR: auth.js not found"
    fi
    
    # Check for URL inconsistencies
    if [ -f "$MAIN_JS" ] && [ -f "$AUTH_JS" ]; then
        if [ "$MAIN_API_URL" == "$AUTH_API_URL" ]; then
            print_success "API URLs are consistent across files"
            add_to_report "- SUCCESS: API URLs are consistent across files"
        else
            print_error "API URL inconsistency detected!"
            add_to_report "- ERROR: API URL inconsistency detected!"
            add_to_report "  - main.js uses: $MAIN_API_URL"
            add_to_report "  - auth.js uses: $AUTH_API_URL"
            
            # Count different patterns to recommend the correct URL
            MAIN_V2_COUNT=$(grep -c "api.minepi.com/v2" "$MAIN_JS")
            MAIN_NO_V2_COUNT=$(grep -c "api.minepi.com/" "$MAIN_JS" | grep -v "v2")
            AUTH_V2_COUNT=$(grep -c "api.minepi.com/v2" "$AUTH_JS")
            AUTH_NO_V2_COUNT=$(grep -c "api.minepi.com/" "$AUTH_JS" | grep -v "v2")
            
            TOTAL_V2=$(($MAIN_V2_COUNT + $AUTH_V2_COUNT))
            TOTAL_NO_V2=$(($MAIN_NO_V2_COUNT + $AUTH_NO_V2_COUNT))
            
            if [ "$TOTAL_V2" -gt "$TOTAL_NO_V2" ]; then
                print_warning "Recommendation: Standardize on 'https://api.minepi.com/v2' across all files"
                add_to_report "  - RECOMMENDATION: Standardize on 'https://api.minepi.com/v2'"
            else
                print_warning "Recommendation: Standardize on 'https://api.minepi.com' (without /v2) across all files"
                add_to_report "  - RECOMMENDATION: Standardize on 'https://api.minepi.com' (without /v2)"
            fi
        fi
    fi
}

# 4. Run the debug-auth.js script with appropriate options
run_debug_script() {
    print_header "Running Authentication Debug Script"
    add_to_report "\n## Authentication Debug Results\n"
    
    if [ -f "debug-auth.js" ]; then
        echo "Running debug-auth.js in check-only mode..."
        add_to_report "- Running debug-auth.js in check-only mode"
        
        # Run the script with the --check-only flag to only verify the endpoints without asking for credentials
        NODE_DEBUG_OUTPUT=$(node debug-auth.js --check-only 2>&1)
        echo "$NODE_DEBUG_OUTPUT"
        add_to_report "  Output:"
        add_to_report "  ```"
        add_to_report "$NODE_DEBUG_OUTPUT"
        add_to_report "  ```"
        
        # Check for specific error messages in the output
        if echo "$NODE_DEBUG_OUTPUT" | grep -q "Connection successful"; then
            print_success "Connection to API endpoints successful"
            add_to_report "- SUCCESS: Connection to API endpoints successful"
        elif echo "$NODE_DEBUG_OUTPUT" | grep -q "Network error"; then
            print_error "Network error detected"
            add_to_report "- ERROR: Network error detected"
        elif echo "$NODE_DEBUG_OUTPUT" | grep -q "404"; then
            print_error "404 Not Found error detected - wrong API endpoint"
            add_to_report "- ERROR: 404 Not Found - wrong API endpoint"
        fi
        
        # Provide instructions for running the full debug script
        echo -e "\n${BOLD}For interactive debugging with credentials, run:${NC}"
        echo "  node debug-auth.js --verbose"
        add_to_report "\n- For interactive debugging with credentials, run:"
        add_to_report "  node debug-auth.js --verbose"
    else
        print_error "debug-auth.js not found!"
        add_to_report "- ERROR: debug-auth.js not found"
        
        # Attempt to create a simple connection test if debug-auth.js is missing
        print_warning "Creating simple connection test..."
        add_to_report "- Creating simple connection test"
        
        echo "const axios = require('axios');" > "temp-connection-test.js"
        echo "const testEndpoints = async () => {" >> "temp-connection-test.js"
        echo "  try {" >> "temp-connection-test.js"
        echo "    console.log('Testing connection to https://api.minepi.com/v2...');" >> "temp-connection-test.js"
        echo "    const response1 = await axios.get('https://api.minepi.com/v2');" >> "temp-connection-test.js"
        echo "    console.log('Status:', response1.status);" >> "temp-connection-test.js"
        echo "  } catch (error) {" >> "temp-connection-test.js"
        echo "    console.log('Error testing /v2:', error.message);" >> "temp-connection-test.js"
        echo "  }" >> "temp-connection-test.js"
        echo "  try {" >> "temp-connection-test.js"
        echo "    console.log('Testing connection to https://api.minepi.com...');" >> "temp-connection-test.js"
        echo "    const response2 = await axios.get('https://api.minepi.com');" >> "temp-connection-test.js"
        echo "    console.log('Status:', response2.status);" >> "temp-connection-test.js"
        echo "  } catch (error) {" >> "temp-connection-test.js"
        echo "    console.log('Error testing base URL:', error.message);" >> "temp-connection-test.js"
        echo "  }" >> "temp-connection-test.js"
        echo \"};\" >> \"temp-connection-test.js\"\n315|        echo \"testEndpoints();\" >> \"temp-connection-test.js\"\n316|        \n317|        # Run the simple connection test\n318|        node temp-connection-test.js\n319|        \n320|        # Clean up\n321|        rm temp-connection-test.js\n322|    fi\n323|}\n324|\n325|# 5. Generate a troubleshooting report with findings and recommendations\n326|generate_summary() {\n327|    print_header \"Generating Troubleshooting Summary\"\n328|    add_to_report \"\\n## Summary and Recommendations\\n\"\n329|    \n330|    # Count issues by severity\n331|    ERROR_COUNT=$(grep -c \"ERROR:\" \"$REPORT_FILE\")\n332|    WARNING_COUNT=$(grep -c \"WARNING:\" \"$REPORT_FILE\")\n333|    SUCCESS_COUNT=$(grep -c \"SUCCESS:\" \"$REPORT_FILE\")\n334|    \n335|    echo -e \"\\n${BOLD}Troubleshooting Summary:${NC}\"\n336|    echo \"✓ $SUCCESS_COUNT successful checks\"\n337|    echo \"⚠ $WARNING_COUNT warnings\"\n338|    echo \"✗ $ERROR_COUNT errors\"\n339|    \n340|    add_to_report \"- Found $SUCCESS_COUNT successful checks, $WARNING_COUNT warnings, and $ERROR_COUNT errors\"\n341|    \n342|    # General recommendations\n343|    echo -e \"\\n${BOLD}Recommendations:${NC}\"\n344|    add_to_report \"\\n### Key Recommendations\\n\"\n345|    \n346|    # Check for API URL inconsistencies\n347|    if grep -q \"API URL inconsistency detected\" \"$REPORT_FILE\"; then\n348|        echo \"1. Fix API URL inconsistency by standardizing the endpoint across all files.\"\n349|        echo \"   Check the report for the recommended URL to use.\"\n350|        add_to_report \"1. Fix API URL inconsistency by standardizing the endpoint across all files\"\n351|        \n352|        # Extract recommended URL from report\n353|        RECOMMENDED_URL=$(grep \"RECOMMENDATION: Standardize on\" \"$REPORT_FILE\" | head -n1 | sed 's/.*Standardize on //')\n354|        if [ -n \"$RECOMMENDED_URL\" ]; then\n355|            add_to_report \"   - Recommended URL: $RECOMMENDED_URL\"\n356|        fi\n357|    fi\n358|    \n359|    # Check for network connectivity issues\n360|    if grep -q \"Connection failed\" \"$REPORT_FILE\"; then\n361|        echo \"2. Resolve network connectivity issues:\"\n362|        echo \"   - Check your internet connection\"\n363|        echo \"   - Verify firewall settings\"\n364|        echo \"   - Try using a different network\"\n365|        add_to_report \"2. Resolve network connectivity issues:\"\n366|        add_to_report \"   - Check your internet connection\"\n367|        add_to_report \"   - Verify firewall settings\"\n368|        add_to_report \"   - Try using a different network\"\n369|    fi\n370|    \n371|    # Check for 404 errors\n372|    if grep -q \"404 Not Found\" \"$REPORT_FILE\"; then\n373|        echo \"3. Wrong API endpoint detected (404 Not Found).\"\n374|        echo \"   Try switching between '/v2/auth/login' and '/auth/login' endpoints.\"\n375|        add_to_report \"3. Wrong API endpoint detected (404 Not Found)\"\n376|        add_to_report \"   - Try switching between '/v2/auth/login' and '/auth/login' endpoints\"\n377|    fi\n378|    \n379|    # General advice for authentication issues\n380|    echo -e \"\\n${BOLD}Next Steps:${NC}\"\n381|    echo \"1. Run 'node debug-auth.js --verbose' for interactive debugging\"\n382|    echo \"2. Check your Pi Network credentials\"\n383|    echo \"3. Verify if your Pi Network account has two-factor authentication enabled\"\n384|    echo \"4. Check for rate limiting or temporary service outages\"\n385|    \n386|    add_to_report \"\\n### Next Steps\\n\"\n387|    add_to_report \"1. Run 'node debug-auth.js --verbose' for interactive debugging\"\n388|    add_to_report \"2. Check your Pi Network credentials\"\n389|    add_to_report \"3. Verify if your Pi Network account has two-factor authentication enabled\"\n390|    add_to_report \"4. Check for rate limiting or temporary service outages\"\n391|    \n392|    # Print report location\n393|    echo -e \"\\n${BOLD}Detailed troubleshooting report saved to:${NC} $REPORT_FILE\"\n394|}\n395|\n396|# Main function to orchestrate the troubleshooting process\n397|main() {\n398|    echo -e \"${BOLD}${BLUE}====================================================${NC}\"\n399|    echo -e \"${BOLD}${BLUE}    Pi Network Authentication Troubleshooter    ${NC}\"\n400|    echo -e \"${BOLD}${BLUE}====================================================${NC}\"\n401|    echo -e \"This script will diagnose Pi Network authentication issues\"\n402|    echo -e \"and provide recommendations for fixing them.\\n\"\n403|    \n404|    # Start the report\n405|    start_report\n406|    \n407|    # Run each check\n408|    check_dependencies\n409|    check_network_connectivity\n410|    check_api_inconsistencies\n411|    run_debug_script\n412|    \n413|    # Generate summary and recommendations\n414|    generate_summary\n415|    \n416|    echo -e \"\\n${BOLD}${BLUE}====================================================${NC}\"\n417|    echo -e \"${BOLD}${BLUE}    Troubleshooting Complete    ${NC}\"\n418|    echo -e \"${BOLD}${BLUE}====================================================${NC}\"\n419|    echo -e \"Follow the recommendations in the report to resolve\"\n420|    echo -e \"authentication issues. For additional help, contact support.\"\n421|}\n422|\n423|# Execute the main function\n424|main
        echo "

