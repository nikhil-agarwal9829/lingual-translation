#!/bin/bash

echo "Starting Firebase deployment process..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "Firebase CLI not found. Please install it using: npm install -g firebase-tools" >&2
    exit 1
fi

# Check if user is logged in to Firebase
echo "Checking Firebase login status..."
firebase login:list &> /dev/null
if [ $? -ne 0 ]; then
    echo "You need to log in to Firebase first. Running 'firebase login'..."
    firebase login
    if [ $? -ne 0 ]; then
        echo "Failed to log in to Firebase. Exiting."
        exit 1
    fi
fi

# Build the application for production
echo "Building application for production..."
npm run build
if [ $? -ne 0 ]; then
    echo "Build failed. Please fix the errors and try again."
    exit 1
fi

# Check if firebase.json exists
if [ ! -f "firebase.json" ]; then
    echo "firebase.json not found. Initializing Firebase Hosting..."
    firebase init hosting
    if [ $? -ne 0 ]; then
        echo "Failed to initialize Firebase Hosting. Exiting."
        exit 1
    fi
fi

# Deploy to Firebase Hosting
echo "Deploying to Firebase Hosting..."
firebase deploy --only hosting
if [ $? -ne 0 ]; then
    echo "Deployment failed. Please check the errors and try again."
    exit 1
else
    echo "Deployment successful!"
    echo "Your application is now live and can be accessed by multiple devices."
    echo "Share the URL with patients to connect to doctor sessions."
fi