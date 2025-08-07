# PowerShell script for deploying to Firebase Hosting

Write-Host "Starting Firebase deployment process..." -ForegroundColor Green

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

# Check if user is logged in to Firebase
Write-Host "Checking Firebase login status..." -ForegroundColor Yellow
$loginStatus = firebase login:list
if ($LASTEXITCODE -ne 0) {
    Write-Host "You need to log in to Firebase first. Running 'firebase login'..." -ForegroundColor Yellow
    firebase login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to log in to Firebase. Exiting." -ForegroundColor Red
        exit 1
    }
}

# Build the application for production
Write-Host "Building application for production..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed. Please fix the errors and try again." -ForegroundColor Red
    exit 1
}

# Check if firebase.json exists
if (-not (Test-Path -Path "firebase.json")) {
    Write-Host "firebase.json not found. Initializing Firebase Hosting..." -ForegroundColor Yellow
    firebase init hosting
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to initialize Firebase Hosting. Exiting." -ForegroundColor Red
        exit 1
    }
}

# Deploy to Firebase Hosting
Write-Host "Deploying to Firebase Hosting..." -ForegroundColor Yellow
firebase deploy --only hosting
if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment failed. Please check the errors and try again." -ForegroundColor Red
    exit 1
} else {
    Write-Host "Deployment successful!" -ForegroundColor Green
    Write-Host "Your application is now live and can be accessed by multiple devices." -ForegroundColor Green
    Write-Host "Share the URL with patients to connect to doctor sessions." -ForegroundColor Green
}