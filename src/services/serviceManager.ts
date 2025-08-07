// Service Manager - combines all services into a unified interface
import { geminiService, GeminiConfig } from './geminiService';
import { enhancedTranslationService, TranslationConfig, TranslationResult } from './enhancedTranslationService';
import { enhancedSpeechService, SpeechConfig } from './enhancedSpeechService';
import { signLanguageService } from './signLanguageService';

export interface ServiceManagerConfig {
  gemini?: GeminiConfig;
  translation?: TranslationConfig;
  speech?: SpeechConfig;
}

export interface MedicalResponseOptions {
  language?: string;
  speakResponse?: boolean;
  translateResponse?: boolean;
}

export class ServiceManager {
  private geminiService = geminiService;
  private translationService = enhancedTranslationService;
  private speechService = enhancedSpeechService;
  private signService = signLanguageService;

  constructor(config?: ServiceManagerConfig) {
    this.configure(config);
  }

  // Configure all services
  configure(config?: ServiceManagerConfig): void {
    if (config?.gemini) {
      this.geminiService.configure(config.gemini);
    }
    if (config?.translation) {
      this.translationService.configure(config.translation);
    }
    if (config?.speech) {
      this.speechService.configure(config.speech);
    }
  }

  // Generate medical response with optional translation and speech
  async generateMedicalResponse(
    userMessage: string, 
    options: MedicalResponseOptions = {}
  ): Promise<{
    response: string;
    translatedResponse?: string;
    speechInstructions?: string;
  }> {
    try {
      // Generate medical response
      const response = await this.geminiService.generateMedicalResponse(userMessage);

      let translatedResponse: string | undefined;
      let speechInstructions: string | undefined;

      // Translate response if requested
      if (options.translateResponse && options.language && options.language !== 'en') {
        try {
          const translationResult = await this.translationService.translateMedicalResponse(
            userMessage, 
            options.language
          );
          translatedResponse = translationResult.translatedText;
        } catch (error) {
          console.error('Translation failed:', error);
        }
      }

      // Generate speech instructions if speech is requested
      if (options.speakResponse && options.language) {
        try {
          const textToProcess = translatedResponse || response;
          speechInstructions = await this.geminiService.generateSpeechInstructions(
            textToProcess, 
            options.language
          );
        } catch (error) {
          console.error('Speech instruction generation failed:', error);
        }
      }

      return {
        response,
        translatedResponse,
        speechInstructions
      };
    } catch (error) {
      console.error('Medical response generation failed:', error);
      throw error;
    }
  }

  // Speak medical response with enhanced processing
  async speakMedicalResponse(
    response: string, 
    language: string = 'en'
  ): Promise<void> {
    try {
      await this.speechService.speakMedicalResponse(response, language);
    } catch (error) {
      console.error('Failed to speak medical response:', error);
      throw error;
    }
  }

  // Translate text with multiple fallback options
  async translateText(
    text: string, 
    sourceLang: string, 
    targetLang: string
  ): Promise<string> {
    const result = await this.translationService.translate(text, sourceLang, targetLang);
    return result.translatedText;
  }

  // Start speech recognition
  async startListening(language: string = 'en'): Promise<string> {
    return await this.speechService.startListening(language);
  }

  // Stop speech recognition
  stopListening(): void {
    this.speechService.stopListening();
  }

  // Stop speaking
  stopSpeaking(): void {
    this.speechService.stopSpeaking();
  }

  // Check if services are configured
  isConfigured(): boolean {
    return this.geminiService.isConfigured() || 
           this.translationService.isConfigured() || 
           this.speechService.isConfigured();
  }

  // Get service status
  getServiceStatus(): {
    gemini: boolean;
    translation: boolean;
    speech: boolean;
    sign: boolean;
  } {
    return {
      gemini: this.geminiService.isConfigured(),
      translation: this.translationService.isConfigured(),
      speech: this.speechService.isConfigured(),
      sign: this.signService.isSupported()
    };
  }

  // Get supported languages
  getSupportedLanguages(): Array<{ code: string; name: string; flag: string }> {
    return this.geminiService.getSupportedLanguages();
  }

  // Check if language is supported
  isLanguageSupported(langCode: string): boolean {
    return this.geminiService.isLanguageSupported(langCode);
  }

  // Clear all caches
  clearCaches(): void {
    this.geminiService.clearCache();
    // Note: Translation and Speech services don't have caches to clear
  }

  // Get current configuration
  getConfig(): ServiceManagerConfig {
    return {
      gemini: this.geminiService.getConfig ? this.geminiService.getConfig() : undefined,
      translation: this.translationService.getConfig(),
      speech: this.speechService.getConfig()
    };
  }

  // Health check for all services
  async healthCheck(): Promise<{
    gemini: boolean;
    translation: boolean;
    speech: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    const results = {
      gemini: false,
      translation: false,
      speech: false,
      errors
    };

    // Test Gemini service
    try {
      if (this.geminiService.isConfigured()) {
        await this.geminiService.generateResponse('test');
        results.gemini = true;
      }
    } catch (error) {
      errors.push(`Gemini service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test Translation service
    try {
      if (this.translationService.isConfigured()) {
        await this.translationService.translate('test', 'en', 'es');
        results.translation = true;
      }
    } catch (error) {
      errors.push(`Translation service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test Speech service
    try {
      if (this.speechService.isTextToSpeechSupported()) {
        results.speech = true;
      }
    } catch (error) {
      errors.push(`Speech service error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return results;
  }
}

// Export singleton instance
export const serviceManager = new ServiceManager();

// Export individual services for direct access if needed
export { geminiService, enhancedTranslationService, enhancedSpeechService };
