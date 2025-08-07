// Enhanced Speech Service - integrates Gemini API with speech synthesis
/// <reference path="../types/speech.d.ts" />

import { geminiService } from './geminiService';

export interface SpeechConfig {
  useGemini?: boolean;
  defaultLanguage?: string;
  voiceRate?: number;
  voiceVolume?: number;
}

export class EnhancedSpeechService {
  private synthesis: SpeechSynthesis;
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private useGemini: boolean;
  private defaultLanguage: string;
  private voiceRate: number;
  private voiceVolume: number;

  constructor(config?: SpeechConfig) {
    this.synthesis = window.speechSynthesis;
    this.useGemini = config?.useGemini ?? true;
    this.defaultLanguage = config?.defaultLanguage ?? 'en';
    this.voiceRate = config?.voiceRate ?? 0.9;
    this.voiceVolume = config?.voiceVolume ?? 1;
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;
    }
  }

  // Configure the service
  configure(config: SpeechConfig): void {
    this.useGemini = config.useGemini ?? this.useGemini;
    this.defaultLanguage = config.defaultLanguage ?? this.defaultLanguage;
    this.voiceRate = config.voiceRate ?? this.voiceRate;
    this.voiceVolume = config.voiceVolume ?? this.voiceVolume;
  }

  // Check if speech recognition is supported
  isSpeechRecognitionSupported(): boolean {
    return this.recognition !== null;
  }

  // Check if text-to-speech is supported
  isTextToSpeechSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  // Check if the service is configured and ready
  isConfigured(): boolean {
    return this.isTextToSpeechSupported() || this.isSpeechRecognitionSupported();
  }

  // Enhanced text-to-speech with Gemini integration
  async speak(text: string, language: string = 'en-US'): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!this.isTextToSpeechSupported()) {
        reject(new Error('Text-to-speech not supported'));
        return;
      }

      try {
        // Cancel any ongoing speech
        this.synthesis.cancel();

        let processedText = text;
        let speechInstructions = '';

        // Use Gemini API to enhance speech if enabled
        if (this.useGemini && geminiService.isConfigured()) {
          try {
            // Get speech instructions from Gemini
            speechInstructions = await geminiService.generateSpeechInstructions(text, language);
            console.log('Gemini speech instructions:', speechInstructions);
          } catch (error) {
            console.warn('Failed to get Gemini speech instructions, using original text:', error);
          }
        }

        const utterance = new SpeechSynthesisUtterance(processedText);
        utterance.lang = this.getLanguageCode(language);
        utterance.rate = this.voiceRate;
        utterance.volume = this.voiceVolume;

        // Apply speech instructions if available
        if (speechInstructions) {
          // You can extend this to apply specific instructions
          // For now, we'll just log them for reference
          console.log('Applying speech instructions:', speechInstructions);
        }

        utterance.onend = () => resolve();
        utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));

        this.synthesis.speak(utterance);
      } catch (error) {
        reject(error);
      }
    });
  }

  // Speak medical responses with enhanced processing
  async speakMedicalResponse(response: string, language: string = 'en-US'): Promise<void> {
    try {
      // Process the response for better speech synthesis
      const processedResponse = this.processMedicalResponseForSpeech(response);
      await this.speak(processedResponse, language);
    } catch (error) {
      console.error('Failed to speak medical response:', error);
      throw error;
    }
  }

  // Process medical response text for better speech synthesis
  private processMedicalResponseForSpeech(text: string): string {
    // Remove markdown formatting that might interfere with speech
    let processed = text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
      .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove markdown links
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\n\s*\n/g, '. ') // Replace double line breaks with periods
      .replace(/\n/g, ' ') // Replace single line breaks with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    return processed;
  }

  // Start speech recognition
  async startListening(language: string = 'en-US'): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      if (this.isListening) {
        reject(new Error('Already listening'));
        return;
      }

      this.recognition.lang = this.getLanguageCode(language);
      this.isListening = true;

      this.recognition.onresult = (event) => {
        const result = event.results[0][0].transcript;
        this.isListening = false;
        resolve(result);
      };

      this.recognition.onerror = (event) => {
        this.isListening = false;
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };

      try {
        this.recognition.start();
      } catch (error) {
        this.isListening = false;
        reject(error);
      }
    });
  }

  // Stop listening
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  // Stop speaking
  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  // Get the correct language code for speech APIs
  private getLanguageCode(language: string): string {
    const languageMap: Record<string, string> = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'zh': 'zh-CN',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'ar': 'ar-SA',
      'hi': 'hi-IN',
      'ta': 'ta-IN',
      'pt': 'pt-BR',
      'ru': 'ru-RU'
    };

    return languageMap[language] || language;
  }

  // Get available voices for a language
  getVoicesForLanguage(language: string): SpeechSynthesisVoice[] {
    const langCode = this.getLanguageCode(language);
    return this.synthesis.getVoices().filter(voice => 
      voice.lang.startsWith(langCode.split('-')[0])
    );
  }

  // Check if currently listening
  getIsListening(): boolean {
    return this.isListening;
  }

  // Get current configuration
  getConfig(): SpeechConfig {
    return {
      useGemini: this.useGemini,
      defaultLanguage: this.defaultLanguage,
      voiceRate: this.voiceRate,
      voiceVolume: this.voiceVolume
    };
  }
}

// Export singleton instance
export const enhancedSpeechService = new EnhancedSpeechService();
