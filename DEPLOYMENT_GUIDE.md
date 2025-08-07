# Deployment Guide

This guide provides instructions for deploying your application to make it accessible from multiple devices across different locations.

## Option 1: Deploy with Lovable (Recommended)

1. Open [Lovable](https://lovable.dev/projects/c6903214-63fe-485e-9746-5fa5546f6fd5)
2. Click on Share -> Publish
3. Follow the prompts to complete the deployment

## Option 2: Deploy to Firebase Hosting

Firebase Hosting provides fast and secure hosting for your web app, static and dynamic content, and microservices.

### Prerequisites

- Firebase CLI installed: `npm install -g firebase-tools`
- A Firebase project created in the [Firebase Console](https://console.firebase.google.com/)

### Deployment Steps

1. **Login to Firebase**

   ```sh
   firebase login
   ```

2. **Initialize Firebase Hosting**

   ```sh
   firebase init hosting
   ```

   - Select your Firebase project
   - Specify `dist` as your public directory (the build output directory for Vite)
   - Configure as a single-page app: Yes
   - Set up automatic builds and deploys with GitHub: Optional

3. **Build your application**

   ```sh
   npm run build
   ```

4. **Deploy to Firebase Hosting**

   ```sh
   firebase deploy --only hosting
   ```

5. **Access your deployed application**

   After deployment, Firebase will provide a URL where your application is hosted (typically `https://your-project-id.web.app`).

## Option 3: Deploy to Vercel

Vercel is a cloud platform for static sites and Serverless Functions.

### Deployment Steps

1. **Install Vercel CLI**

   ```sh
   npm install -g vercel
   ```

2. **Deploy to Vercel**

   ```sh
   vercel
   ```

   Follow the prompts to complete the deployment.

## Option 4: Deploy to Netlify

Netlify is a web developer platform that multiplies productivity.

### Deployment Steps

1. **Install Netlify CLI**

   ```sh
   npm install -g netlify-cli
   ```

2. **Deploy to Netlify**

   ```sh
   netlify deploy
   ```

   Follow the prompts to complete the deployment.

## Environment Variables for Production

Before deploying, ensure your production environment variables are properly set:

1. **For Lovable**: Set environment variables in the Lovable dashboard

2. **For Firebase/Vercel/Netlify**: Set environment variables in their respective dashboards

   Alternatively, create a `.env.production` file with your production values before building:

   ```
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_production_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_production_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_production_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_production_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_production_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_production_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_production_measurement_id
   ```

## Testing Your Deployment

After deploying, test the connection between devices:

1. Open the application on the doctor's device
2. Create a new session
3. Share the session URL with the patient
4. Have the patient open the URL on their device
5. Verify that both devices can communicate in real-time

## Troubleshooting

If you encounter issues with your deployment:

1. **Firebase Connection Issues**:
   - Check that your production Firebase project is properly configured
   - Verify that Firestore and Authentication services are enabled
   - Ensure your environment variables are correctly set

2. **Routing Issues**:
   - Make sure your hosting provider is configured for a single-page application
   - For Firebase, Vercel, and Netlify, this is typically handled automatically

3. **CORS Issues**:
   - If using custom domains, ensure CORS is properly configured in your Firebase project

Refer to the `FIREBASE_TROUBLESHOOTING.md` file for more detailed Firebase-specific troubleshooting steps.