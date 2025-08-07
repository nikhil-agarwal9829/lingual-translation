# PowerShell script to start Firebase emulators

Write-Host "Starting Firebase emulators..."
Write-Host "This will start Firestore and Authentication emulators for local development."

# Check if Firebase CLI is installed
$firebaseInstalled = $null
try {
    $firebaseInstalled = Get-Command firebase -ErrorAction SilentlyContinue
} catch {
    # Command not found
}

if ($null -eq $firebaseInstalled) {
    Write-Host "Firebase CLI not found. Please install it using: npm install -g firebase-tools" -ForegroundColor Red
    exit 1
}

# Start the emulators
Write-Host "Starting Firebase emulators..." -ForegroundColor Green
firebase emulators:start