#!/bin/bash

echo "Starting Firebase emulators..."
echo "This will start Firestore and Authentication emulators for local development."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "Firebase CLI not found. Please install it using: npm install -g firebase-tools" >&2
    exit 1
fi

# Start the emulators
echo "Starting Firebase emulators..."
firebase emulators:start