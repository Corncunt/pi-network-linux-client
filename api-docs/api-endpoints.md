# Pi Network API Documentation

## Base URLs
Based on our analysis, Pi Network likely uses the following base URLs:
- `https://api.minepi.com` - Main API server
- `https://socialchain.app` - Possibly for social features

## Authentication Endpoints

### Login
```
Endpoint: /auth/login
Method: POST
Description: Authenticates a user and returns a session token

Request Body:
{
  "username": "user's email or username",
  "password": "user's password"
}

Response:
{
  "success": true,
  "token": "jwt-token-string",
  "user": {
    "id": "user-id",
    "username": "username",
    "displayName": "User's Display Name"
  }
}
```

### Logout
```
Endpoint: /auth/logout
Method: POST
Description: Invalidates the current session token

Headers:
- Authorization: Bearer {token}

Response:
{
  "success": true
}
```

## Wallet Endpoints

### Get Balance
```
Endpoint: /wallet/balance
Method: GET
Description: Retrieves the user's Pi balance

Headers:
- Authorization: Bearer {token}

Response:
{
  "balance": "123.45",
  "pending": "0.5",
  "totalEarned": "150.0"
}
```

### Transaction History
```
Endpoint: /wallet/transactions
Method: GET
Description: Gets the user's transaction history

Headers:
- Authorization: Bearer {token}

Query Parameters:
- page: Page number (default: 1)
- limit: Number of transactions per page (default: 20)
- sort: Sort order ('asc' or 'desc', default: 'desc')

Response:
{
  "transactions": [
    {
      "id": "transaction-id",
      "type": "mining_reward",
      "amount": "0.25",
      "timestamp": "2023-03-15T12:34:56Z",
      "status": "completed"
    },
    // More transactions...
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "pages": 3
  }
}
```

## Mining Endpoints

### Start Mining Session
```
Endpoint: /mining/start
Method: POST
Description: Starts a mining session for the user

Headers:
- Authorization: Bearer {token}

Request Body:
{
  "duration": 3600,  // Session duration in seconds
  "enableNotifications": true
}

Response:
{
  "sessionId": "session-id",
  "rate": "0.25",  // Pi per hour
  "startTime": "2023-03-15T12:34:56Z",
  "endTime": "2023-03-15T13:34:56Z"
}
```

### Check Mining Status
```
Endpoint: /mining/status
Method: GET
Description: Checks the current mining status

Headers:
- Authorization: Bearer {token}

Response:
{
  "active": true,
  "sessionId": "session-id",
  "rate": "0.25",
  "startTime": "2023-03-15T12:34:56Z",
  "endTime": "2023-03-15T13:34:56Z",
  "earned": "0.125"  // In current session
}
```

## Social Features

### Security Circle
```
Endpoint: /social/security-circle
Method: GET
Description: Gets the user's security circle members

Headers:
- Authorization: Bearer {token}

Response:
{
  "members": [
    {
      "id": "user-id",
      "username": "username",
      "displayName": "Display Name",
      "status": "active"
    },
    // More members...
  ]
}
```

### Send Invitation
```
Endpoint: /social/invite
Method: POST
Description: Sends an invitation to join Pi Network

Headers:
- Authorization: Bearer {token}

Request Body:
{
  "phoneNumber": "+1234567890",
  "email": "user@example.com",  // Optional
  "message": "Join Pi Network!" // Optional
}

Response:
{
  "success": true,
  "invitationId": "invitation-id"
}
```

## Important Notes

- This documentation is based on reverse engineering analysis and represents a best-effort approximation of the Pi Network API.
- The actual endpoints, parameters, and response formats may differ.
- Authentication is likely token-based using JWT.
- The API may employ rate limiting and other security measures.
- Certificate pinning is implemented in the app to prevent interception.

## Next Steps

1. Implement these endpoints in the Linux client
2. Test each endpoint to confirm functionality
3. Adjust parameters and formats based on actual responses
4. Document any additional endpoints discovered during testing
