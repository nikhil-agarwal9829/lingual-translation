// Service initialization module
import { translationService } from '@/services/translationService';
import { serviceManager } from '@/services/serviceManager';

/**
 * Initialize all application services that require environment variables
 * This should be called early in the application lifecycle
 */
export function initializeServices() {
  // Initialize translation service with Google Cloud Translation API credentials
  translationService.configure({
    googleApiKey: import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY || '',
    projectId: import.meta.env.VITE_GOOGLE_TRANSLATE_PROJECT_ID || ''
  });

  // Initialize Gemini services
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  console.log('Gemini API Key loaded:', geminiApiKey ? 'Yes' : 'No');
  
  serviceManager.configure({
    gemini: {
      apiKey: geminiApiKey,
      apiUrl: import.meta.env.VITE_GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
    },
    translation: {
      useGemini: true,
      fallbackToGoogle: true,
      googleApiKey: import.meta.env.VITE_GOOGLE_TRANSLATE_API_KEY || ''
    },
    speech: {
      useGemini: true
    }
  });

  // Log service initialization status
  if (translationService.isConfigured()) {
    console.log('Translation service initialized with Google Cloud API');
  } else {
    console.log('Translation service using mock translations (API key not configured)');
  }

  const status = serviceManager.getServiceStatus();
  console.log('Service Manager Status:', status);
}