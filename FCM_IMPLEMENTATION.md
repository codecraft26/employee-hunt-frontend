# FCM (Firebase Cloud Messaging) Implementation

This document describes the FCM token generation feature implemented for the employee hunt frontend application.

## Overview

The FCM implementation allows the application to generate push notification tokens during user login, enabling the backend to send push notifications to users' devices.

## Files Added/Modified

### 1. FCM Utilities (`src/utils/fcmUtils.ts`)
A comprehensive utility class that handles:
- Notification permission requests
- Service worker registration
- FCM token generation
- Token storage in localStorage
- Browser compatibility checks

### 2. FCM Hook (`src/hooks/useFCM.ts`)
A React hook that provides:
- Token state management
- Automatic token generation
- Error handling
- Loading states
- Server synchronization

### 3. FCM Manager Component (`src/components/FCMManager.tsx`)
A UI component for:
- Displaying notification status
- Manual token generation
- User guidance for enabling notifications
- Development token display

### 4. Updated Auth Slice (`src/store/authSlice.ts`)
Modified to include:
- Device token in login payloads
- OTP verification with device tokens

### 5. Updated Login Page (`src/app/login/page.tsx`)
Enhanced to:
- Generate FCM tokens during login
- Include tokens in authentication requests

### 6. Test Page (`src/app/test-fcm/page.tsx`)
A development page for:
- Testing FCM functionality
- Debugging token generation
- Checking browser compatibility

## Usage

### Basic Usage in Login
The FCM token is automatically generated when users log in:

```typescript
// In login page, the token is automatically generated and included
const deviceToken = await generateToken();
const loginDataWithToken = {
  ...formData,
  ...(deviceToken && { deviceToken })
};
await dispatch(loginUser(loginDataWithToken));
```

### Using the Hook
```typescript
import { useFCM } from '../hooks/useFCM';

const MyComponent = () => {
  const { fcmToken, isLoading, error, generateToken } = useFCM();
  
  // Token is automatically available in fcmToken
  // Or manually generate: await generateToken()
};
```

### Using the Utility Directly
```typescript
import FCMUtils from '../utils/fcmUtils';

// Generate a token
const token = await FCMUtils.generateFCMToken();

// Check if notifications are supported
const isSupported = FCMUtils.isNotificationSupported();

// Get stored token
const storedToken = FCMUtils.getStoredFCMToken();
```

## Environment Variables Required

```env
NEXT_PUBLIC_VAPID_KEY=your_vapid_key_here
```

## Browser Requirements

- Modern browsers with Service Worker support
- Notification API support
- HTTPS (for production)

## Firebase Configuration

The application uses the existing Firebase configuration in `src/lib/firebase-config.ts` with:
- Firebase project credentials
- Messaging service initialization
- Service worker registration

## Service Worker

The application uses `/firebase-messaging-sw.js` for:
- Background message handling
- Notification display
- Token management

## Testing

### Development Testing
1. Visit `/test-fcm` page (only available in development)
2. Check notification permissions
3. Test token generation
4. Verify browser compatibility

### Integration Testing
1. Go to login page
2. Login with credentials
3. Check browser console for FCM token logs
4. Verify token is sent to backend

## Backend Integration

The device token is sent to the backend during login with the following payload structure:

```json
{
  "email": "user@example.com",
  "password": "password",
  "deviceToken": "fcm_token_here"
}
```

For OTP verification:
```json
{
  "email": "user@example.com", 
  "otp": "123456",
  "deviceToken": "fcm_token_here"
}
```

## Error Handling

The implementation includes comprehensive error handling for:
- Browser compatibility issues
- Permission denied scenarios
- Network failures
- Invalid VAPID keys
- Service worker registration failures

## Security Considerations

- Tokens are stored in localStorage (consider moving to secure storage for production)
- VAPID key is exposed in environment variables (ensure proper key rotation)
- Tokens are transmitted over HTTPS
- Service worker validates origin

## Troubleshooting

### Common Issues

1. **"Notifications not supported"**
   - Check browser compatibility
   - Ensure HTTPS in production
   
2. **"Permission denied"**
   - User needs to manually enable notifications in browser
   - Check browser notification settings

3. **"VAPID key not found"**
   - Verify environment variable is set
   - Check if key is correctly formatted

4. **"Service worker registration failed"**
   - Ensure `/firebase-messaging-sw.js` exists
   - Check service worker console for errors

### Debug Steps

1. Open browser developer tools
2. Check console for FCM logs
3. Verify service worker registration in Application tab
4. Check notification permissions in browser settings
5. Use the test page (`/test-fcm`) for systematic debugging

## Production Deployment

Before deploying to production:

1. Set up proper VAPID keys
2. Configure Firebase project for production
3. Ensure HTTPS is enabled
4. Test notification delivery end-to-end
5. Consider implementing token refresh logic
6. Set up monitoring for failed token generations

## Future Enhancements

- Token refresh mechanism
- Silent notification handling
- Custom notification actions
- Notification click handling
- Analytics integration
- Batch token updates
