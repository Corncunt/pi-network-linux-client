# Pi Network Research Documentation

This document tracks our findings and research about the Pi Network application as we work on creating a Linux client.

## 1. Overview of Pi Network

Pi Network is a digital cryptocurrency project that aims to make crypto mining accessible to everyday users through a mobile app. Unlike traditional cryptocurrencies that require significant computational resources, Pi can be "mined" or earned using a smartphone without draining battery or requiring specialized hardware.

### History and Background

- Founded in 2018 by Stanford graduates Dr. Nicolas Kokkalis, Dr. Chengdiao Fan, and Vincent McPhillip
- Launched on Pi Day (March 14, 2019) as a beta version
- The project was created to address the increasing centralization of first-generation cryptocurrencies like Bitcoin
- The founders aimed to create a more inclusive and environmentally friendly alternative to existing cryptocurrencies

### Core Features and Functionality

- **Mobile Mining**: Users can earn Pi by simply opening the app and clicking a button once every 24 hours
- **Security Circles**: A trust graph mechanism where users vouch for each other's authenticity to secure the network
- **Contributor Roles**: Users can take on roles such as Pioneer (basic user), Contributor (brings in other trusted users), Ambassador (spreads the word), and Node (supports the network infrastructure)
- **Pi Wallet**: Storage for earned Pi tokens
- **Pi Browser**: An integrated browser for accessing Pi apps and services
- **KYC Verification**: Process to verify user identity, crucial for the transition to mainnet

### Current Status and Platform Support

- **Development Phase**: The project is currently in its Phase 3 (Mainnet) with limited functionality
- **Valuation**: Pi tokens don't have an official market value yet as trading is not fully enabled
- **User Base**: Reported to have over 35 million engaged Pioneers (users) worldwide
- **Platforms**: Available primarily as a mobile app for Android and iOS, with desktop companions for macOS and Windows
- **Mainnet Migration**: In progress, with early users beginning to transition their tokens from the test network to the mainnet

### Roadmap and Future Plans

- Complete the migration to mainnet for all verified users
- Develop a comprehensive ecosystem of applications and services using Pi
- Establish broader utility and merchant acceptance of Pi as a payment method
- Implement full decentralization of the blockchain network

## 2. API Endpoints

**Description**: This section will document the API endpoints used by the Pi Network application to interact with its backend services.

**To gather**:
- Base URL(s) for the API
- Authentication endpoints
- User account endpoints
- Wallet/cryptocurrency transaction endpoints
- Mining/earning mechanisms
- Social features endpoints
- Request/response formats and examples
- Rate limiting and other API constraints

## 3. Authentication Mechanism

**Description**: This section will detail how the Pi Network application handles user authentication.

**To gather**:
- Authentication flow (OAuth, custom token, etc.)
- Token management (storage, refresh, expiration)
- Login/logout process
- Session handling
- Multi-factor authentication if applicable
- Security measures implemented
- Permission model and scopes

## 4. Application Architecture

**Description**: This section will describe the overall architecture of the Pi Network application.

**To gather**:
- Main application components
- Technology stack used (confirmed Electron for desktop)
- Data flow between components
- Local storage mechanisms
- Background processes and services
- Third-party dependencies and libraries
- Platform-specific implementations

## 5. Reverse Engineering Findings

**Description**: This section will document our technical findings from reverse engineering the macOS application.

**To gather**:
- Electron framework analysis
- Binary analysis results
- Network traffic patterns
- Resource file contents
- Security mechanisms found
- Packaging and distribution approach
- Performance characteristics
- Undocumented features or behaviors

## 6. Linux Implementation Notes

**Description**: This section will track our progress in implementing the Linux version.

**To gather**:
- Compatibility challenges
- Platform-specific adaptations needed
- Testing results across different Linux distributions
- Performance benchmarks
- User feedback on the Linux implementation
- Known issues and limitations
- Future improvement areas

