# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/c6903214-63fe-485e-9746-5fa5546f6fd5

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c6903214-63fe-485e-9746-5fa5546f6fd5) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Firebase (Firestore, Authentication)
- React Router v6

## Firebase Setup

### Environment Variables

This project uses Firebase for real-time database and authentication, and Google Cloud Translation API for language translation. To set up the environment:

1. Copy the `.env.example` file to `.env`:
   ```sh
   cp .env.example .env
   ```

2. Fill in your Firebase configuration values in the `.env` file.

3. For translation functionality, add your Google Cloud Translation API credentials:
   - `VITE_GOOGLE_TRANSLATE_API_KEY`: Your Google Cloud API key with Translation API enabled
   - `VITE_GOOGLE_TRANSLATE_PROJECT_ID`: Your Google Cloud project ID

   If these values are not provided, the application will fall back to mock translations.

### Firebase Emulators (for local development)

The project is configured to use Firebase emulators when running locally. To set up emulators:

1. Install the Firebase CLI:
   ```sh
   npm install -g firebase-tools
   ```

2. Initialize Firebase in your project:
   ```sh
   firebase init
   ```
   - Select Firestore and Authentication emulators
   - Choose port 8080 for Firestore and 9099 for Authentication

3. Start the emulators:
   ```sh
   firebase emulators:start
   ```

4. Run your development server in another terminal:
   ```sh
   npm run dev
   ```

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c6903214-63fe-485e-9746-5fa5546f6fd5) and click on Share -> Publish.

### Deployment for Production Use

Before deploying to production for connecting multiple devices:

1. **Update Configuration**:
   - Create a `.env.production` file with your production credentials
   - Include both Firebase and Google Cloud Translation API credentials
   - Ensure your Firebase project has Firestore and Authentication enabled in the Firebase Console
   - Make sure your Google Cloud project has the Translation API enabled

2. **Review Firestore Security Rules**:
   - The `firestore.rules` file has been updated with more secure rules for production
   - These rules allow session creation and message sending while preventing unauthorized modifications

3. **Build for Production**:
   ```sh
   npm run build
   ```

4. **Deploy the Application**:
   - Use Lovable's deployment feature (Share -> Publish)
   - Alternatively, you can deploy to Firebase Hosting, Vercel, or Netlify

## Connecting Devices (Doctor and Patient)

Once deployed, you can connect devices across different locations:

1. **Doctor's Device**:
   - Open the deployed application URL
   - The doctor will be assigned a unique session ID
   - Share this session ID or the full URL with the patient

2. **Patient's Device**:
   - Open the shared URL or navigate to the application and enter the session ID
   - Both devices will connect to the same Firebase session
   - Communication will happen in real-time through Firestore

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
