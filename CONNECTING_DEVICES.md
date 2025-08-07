# Connecting Doctor and Patient Devices

This guide explains how to connect doctor and patient devices using the deployed application.

## Prerequisites

- The application must be deployed to a hosting service (see `DEPLOYMENT_GUIDE.md`)
- Both devices must have internet access
- Both devices must have a web browser

## Connection Process

### For the Doctor

1. **Access the Application**
   - Open the deployed application URL in a web browser
   - For example: `https://your-app-name.web.app` or your custom domain

2. **Start a New Session**
   - The application will automatically create a new session with a unique ID
   - The session ID will be visible in the URL (e.g., `/doctor/ABC123`)

3. **Share the Session Link**
   - Copy the full URL from your browser
   - Replace `/doctor/` with `/patient/` in the URL
   - Share this modified URL with the patient via email, text message, or any other method
   - For example, if your URL is `https://your-app-name.web.app/doctor/ABC123`, share `https://your-app-name.web.app/patient/ABC123`

### For the Patient

1. **Access the Shared Link**
   - Open the URL shared by the doctor in a web browser
   - This will automatically connect to the doctor's session

2. **Alternative: Manual Connection**
   - If the patient cannot use the direct link, they can:
     - Open the main application URL
     - Enter the session ID manually (if the application provides this option)

## Testing the Connection

To verify that the connection is working properly:

1. The doctor should send a test message
2. The patient should be able to see the message and respond
3. Both parties should see messages in real-time

## Troubleshooting Connection Issues

If devices cannot connect:

1. **Check Internet Connection**
   - Ensure both devices have stable internet access

2. **Verify Session ID**
   - Confirm that the session ID in the URL is correct
   - Session IDs are case-sensitive

3. **Browser Compatibility**
   - Try using a different browser (Chrome, Firefox, Safari, Edge)
   - Ensure browsers are updated to the latest version

4. **Firewall or Network Restrictions**
   - Some networks (especially corporate or hospital networks) may block Firebase connections
   - Try connecting using a different network or using mobile data

5. **Clear Browser Cache**
   - Clear browser cache and cookies, then try again

6. **Check Firebase Status**
   - Verify that Firebase services are operational by checking the [Firebase Status Dashboard](https://status.firebase.google.com/)

## Security Considerations

- Session IDs should be treated as sensitive information
- Do not share session links on public platforms
- The application uses Firestore security rules to prevent unauthorized access to sessions

## Session Limitations

- Sessions remain active until explicitly ended or until the Firebase document expires
- Multiple patients can join the same session if they have the session ID

For more detailed information about Firebase configuration and troubleshooting, refer to the `FIREBASE_TROUBLESHOOTING.md` document.