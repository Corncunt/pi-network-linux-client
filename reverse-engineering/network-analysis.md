# Network Traffic Analysis for Pi Network macOS App

This document provides instructions on how to capture and analyze network traffic from the Pi Network macOS application to understand its API endpoints, authentication mechanisms, and data formats.

## Prerequisites

- Pi Network macOS application installed
- macOS computer or virtual machine
- Administrative privileges

## Tools for Network Analysis

### 1. Charles Proxy

[Charles Proxy](https://www.charlesproxy.com/) is an HTTP debugging proxy that allows you to view all HTTP and HTTPS traffic between your machine and the Internet.

#### Setup Instructions:

1. Download and install Charles Proxy from [charlesproxy.com](https://www.charlesproxy.com/download/)
2. Configure Charles to intercept HTTPS traffic:
   - Go to "Help" > "SSL Proxying" > "Install Charles Root Certificate"
   - In Keychain Access, find the Charles certificate and set it to "Always Trust"
3. Enable SSL Proxying:
   - Go to "Proxy" > "SSL Proxying Settings"
   - Check "Enable SSL Proxying"
   - Add "*" to the list of locations to enable proxying for all domains

### 2. Wireshark

[Wireshark](https://www.wireshark.org/) is a deeper network protocol analyzer that captures and inspects data on a network.

#### Setup Instructions:

1. Download and install Wireshark from [wireshark.org](https://www.wireshark.org/download.html)
2. Launch Wireshark with administrative privileges
3. Select the appropriate network interface 
4. Apply a display filter like `http || https` to focus on web traffic

### 3. mitmproxy

[mitmproxy](https://mitmproxy.org/) is a free and open-source interactive HTTPS proxy.

#### Setup Instructions:

1. Install with Homebrew: `brew install mitmproxy`
2. Run `mitmproxy` in terminal
3. Configure your system to use the proxy (localhost:8080)
4. Install and trust the mitmproxy CA certificate

## Capturing Network Traffic

1. Start your chosen proxy tool
2. Launch the Pi Network application
3. Perform various actions in the app:
   - Login
   - Check balance
   - View transaction history
   - Mining/checking in
   - Any other key functionalities

4. Save the captured traffic for analysis

## Analyzing the Traffic

When reviewing captured traffic, pay particular attention to:

1. **API Endpoints**: Note all the URLs that the app communicates with
2. **Authentication Mechanisms**:
   - Look for tokens in headers (e.g., Bearer tokens)
   - Cookie-based authentication
   - OAuth flows
   
3. **Request/Response Patterns**:
   - Data formats (JSON, XML, etc.)
   - Required parameters for various operations
   - Error handling patterns
   
4. **WebSocket Communications**:
   - Check if the app uses WebSockets for real-time updates
   - Document message formats and events

5. **Third-party Services**:
   - Analytics
   - Crash reporting
   - External APIs

## Documentation Process

For each significant API endpoint discovered:

1. URL
2. HTTP Method (GET, POST, etc.)
3. Required Headers
4. Request Body Format
5. Response Format
6. Authentication Requirements
7. Purpose/Function

## Security Notes

- Be careful not to share or expose any session tokens or personal data
- Remember that reverse engineering may violate terms of service
- This analysis is for educational purposes only

## Next Steps

After capturing and analyzing the network traffic:
- Document findings in the main research document
- Map out the API structure
- Identify authentication flow
- Determine which endpoints will be critical for the Linux implementation

