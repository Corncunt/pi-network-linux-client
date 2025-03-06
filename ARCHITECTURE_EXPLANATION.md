# API Architecture Explanation

## The Problem

The original architecture had separate axios client instances for each API module, which caused several issues:

1. **Token Inconsistency**: Each module had to separately handle auth tokens
2. **Duplicate Interceptors**: The token refresh logic was duplicated or inconsistent
3. **State Management Challenges**: Multiple client instances made state hard to synchronize

## The Solution: Shared Authentication Client

We've refactored the codebase to use a single shared axios client instance (`authClient`) created in the auth.js module and used across all API modules.

### Key Architecture Components

```
┌─────────────────┐
│                 │
│    index.js     │  ◄─── Entry point, binds all API modules
│                 │
└────────┬────────┘
         │
         │ uses
         ▼
┌─────────────────┐
│                 │
│    auth.js      │  ◄─── Creates and configures shared authClient
│   (authClient)  │       Manages tokens and authentication
│                 │
└────────┬────────┘
         │
         │ shared across
         ▼
┌─────────────────────────────────────┐
│                                     │
│  Module 1     Module 2    Module 3  │  ◄─── All API modules use the shared client
│  (wallet)     (mining)    (social)  │
│                                     │
└─────────────────────────────────────┘
```

### How It Works

1. **authClient Creation**: A single axios instance is created in auth.js with proper interceptors
2. **Token Management**: All token storage and refresh logic is centralized in auth.js
3. **PiNetworkAPI Class**: The class in index.js uses the shared authClient instead of creating a new one
4. **Method Binding**: API methods are properly bound to use the shared client

### Benefits of the New Architecture

1. **Single Source of Truth**: Only one auth token state exists in the system
2. **Consistent Token Refresh**: All requests benefit from the same token refresh logic
3. **Simplified Error Handling**: Authentication errors are handled consistently
4. **Reduced Complexity**: No need to pass tokens between modules or sync state
5. **Better Testability**: Easier to mock a single client for testing

## Authentication Flow

The authentication flow now works as follows:

1. User logs in via `api.auth.login()`
2. auth.js stores the token centrally
3. All subsequent API calls use the shared authClient, which automatically:
   - Adds the auth token to requests via interceptor
   - Handles 401 errors by attempting token refresh
   - Clears tokens if refresh fails
4. No manual token management is needed by application code

## Implementation Details

The key implementation changes were:

1. Added a shared `authClient` in auth.js
2. Configured request/response interceptors on this shared client
3. Updated index.js to use this client instead of creating its own
4. Simplified the PiNetworkAPI constructor to use the shared client
5. Updated the _bindMethods function to handle the special case of refreshTokens

These changes have resulted in a more maintainable, robust API client architecture.
