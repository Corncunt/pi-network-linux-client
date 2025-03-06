# Pi Network for Linux

## Project Overview

This project aims to create an unofficial Linux client for Pi Network, enabling Linux users to interact with the Pi Network ecosystem. Pi Network is a cryptocurrency project that allows users to earn Pi coins by validating transactions on a mobile app.

Since Pi Network doesn't officially support Linux, this project reverse engineers the existing macOS/Windows applications to create a compatible Linux version using Electron, providing similar functionality while respecting Pi Network's terms of service.

### Key Features (Planned)

- User authentication and account management
- Wallet functionality and transaction history
- Mining/earning mechanism
- Invites and team building features
- Profile management
- Notifications and updates

## Setup Instructions

### Prerequisites

- Linux-based operating system (Debian/Ubuntu, Fedora/RHEL, or other major distributions)
- Internet connection for downloading dependencies

### Quick Setup

1. Clone this repository:
```bash
git clone https://github.com/yourusername/pi-network-linux.git
cd pi-network-linux
```

2. Run the setup script:
```bash
./setup.sh
```

This script will:
- Check for and install required dependencies (Node.js, npm)
- Set up the development environment
- Install project dependencies
- Provide instructions for running the application

### Manual Setup

If you prefer to set up manually or the setup script doesn't work for your distribution:

1. Ensure Node.js and npm are installed:
```bash
# For Debian/Ubuntu
sudo apt update && sudo apt install -y nodejs npm

# For Fedora/RHEL
sudo dnf install -y nodejs npm
```

2. Install project dependencies:
```bash
npm install
```

3. Start the application:
```bash
npm start
```

## Development Guidelines

### Code Style

- Follow JavaScript Standard Style guidelines
- Use meaningful variable and function names
- Include JSDoc comments for functions and complex code blocks
- Write clean, modular code with appropriate error handling

### Branch Strategy

- `main`: Stable release version
- `dev`: Active development branch
- Feature branches: Use format `feature/feature-name`
- Bug fix branches: Use format `fix/bug-description`

### Commit Messages

Use conventional commit format:
- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding or modifying tests
- `chore:` for maintenance tasks

## Project Structure

```
pi-network-linux/
├── main.js                 # Main Electron process
├── preload.js              # Preload script for secure context bridge
├── renderer.js             # Renderer process script
├── index.html              # Main UI entry point
├── package.json            # Project configuration and dependencies
├── research.md             # Documentation of Pi Network research findings
├── development-plan.md     # Project development plan and roadmap
├── setup.sh                # Environment setup script
├── reverse-engineering/    # Reverse engineering documentation and tools
│   └── network-analysis.md # Guide for analyzing network traffic
└── assets/                 # Images, icons, and other static assets
```

## Contribution Guidelines

We welcome contributions from the community! Here's how you can help:

1. **Report Issues**: Create GitHub issues for bugs or feature requests
2. **Submit Pull Requests**: Contribute code improvements or new features
3. **Documentation**: Help improve or translate documentation
4. **Testing**: Test the application on different Linux distributions

### Pull Request Process

1. Fork the repository and create your branch from `dev`
2. Update documentation as needed for changes
3. Ensure all tests pass
4. Submit a pull request with a clear description of changes

## Testing Instructions

### Running Tests

```bash
npm test
```

### Manual Testing

1. Start the application using `npm start`
2. Test all user flows and interactions
3. Check for console errors or unexpected behavior
4. Test on different Linux distributions if possible

## License

This project is licensed under the MIT License - see below for details:

```
MIT License

Copyright (c) 2023 Pi Network Linux Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Disclaimer

**IMPORTANT: This is an UNOFFICIAL project and is NOT affiliated with, endorsed by, or connected to Pi Network, Pi Core Team, or any of their affiliates or subsidiaries.**

This project is created by community members for educational purposes and to provide Linux compatibility. The developers of this project make no claims to Pi Network intellectual property and are not responsible for any issues that may arise from using this software.

Use at your own risk. This project does not guarantee:
- Compatibility with future Pi Network updates
- The security of your Pi Network account or assets
- Compliance with all Pi Network terms of service

**All Pi Network logos, trademarks, and assets are the property of their respective owners.**

