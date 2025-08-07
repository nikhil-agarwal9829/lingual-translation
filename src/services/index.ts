// Export all services for easy importing

// Core Gemini API service
export { geminiService, GeminiAPI, type GeminiConfig } from './geminiService';

// Enhanced services
export { enhancedTranslationService, type TranslationConfig, type TranslationResult } from './enhancedTranslationService';
export { enhancedSpeechService, type SpeechConfig } from './enhancedSpeechService';

// Service manager (unified interface)
export { serviceManager, type ServiceManagerConfig, type MedicalResponseOptions } from './serviceManager';
export { signLanguageService } from './signLanguageService';

// Legacy services (for backward compatibility)
export { translationService, supportedLanguages as legacySupportedLanguages } from './translationService';
export { speechService } from './speechService';

// Re-export supported languages from enhanced service
export { supportedLanguages } from './enhancedTranslationService';
