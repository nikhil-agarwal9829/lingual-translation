# Firebase Troubleshooting Guide

## Common Issues and Solutions

### React Router Warnings

If you see warnings related to React Router future flags:

```
React Router Future Flag Warning: React Router will begin wrapping state updates in `React.startTransition` in v7.
React Router Future Flag Warning: Relative route resolution within Splat routes is changing in v7.
```

**Solution:** These warnings have been addressed by adding future flags to the `BrowserRouter` component in `src/App.tsx`:

```jsx
<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
```

### Firebase Connection Errors

If you encounter errors like:

```
Failed to load resource: the server responded with a status of 400 ()
WebChannelConnection RPC 'Listen' stream transport errored
```

**Possible Solutions:**

1. **Check Environment Variables**
   - Ensure your `.env` file contains the correct Firebase configuration values
   - Verify that the Firebase project exists and is properly configured

2. **Use Firebase Emulators for Local Development**
   - Run `npm install -g firebase-tools` to install Firebase CLI
   - Run `firebase init emulators` to set up emulators (select Firestore and Authentication)
   - Start emulators using the provided scripts:
     - Windows: `./start-emulators.ps1`
     - macOS/Linux: `./start-emulators.sh`

3. **Check Firebase Rules**
   - Verify that your Firestore security rules allow the operations you're trying to perform
   - The default rules in `firestore.rules` allow read/write access to sessions and messages

4. **Network Issues**
   - Check if your network blocks Firebase connections
   - Try using a different network or VPN

5. **Firebase Console**
   - Check the Firebase console for any project-level issues or service disruptions

## Using Firebase Emulators

For local development, Firebase emulators provide a local version of Firebase services without connecting to the cloud.

1. **Install Firebase CLI**
   ```
   npm install -g firebase-tools
   ```

2. **Initialize Firebase with Emulators**
   ```
   firebase login
   firebase init emulators
   ```
   Select Firestore and Authentication emulators when prompted.

3. **Start Emulators**
   ```
   firebase emulators:start
   ```
   Or use the provided scripts: `start-emulators.ps1` (Windows) or `start-emulators.sh` (macOS/Linux)

4. **Access Emulator UI**
   Open http://localhost:4000 to access the Emulator UI

## Debugging Firebase in the Application

To enable detailed Firebase logging:

```javascript
// Add this to your firebase.ts file before initializing Firebase
import { setLogLevel } from 'firebase/app';
setLogLevel('debug');
```

This will output detailed logs to the browser console, which can help identify specific issues.