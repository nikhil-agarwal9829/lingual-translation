// Speech Service - handles speech-to-text and text-to-speech
/// <reference path="../types/speech.d.ts" />

export class SpeechService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis;
  private isListening = false;

  constructor() {
    this.synthesis = window.speechSynthesis;
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

  // Check if speech recognition is supported
  isSpeechRecognitionSupported(): boolean {
    return this.recognition !== null;
  }

  // Check if text-to-speech is supported
  isTextToSpeechSupported(): boolean {
    return 'speechSynthesis' in window;
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
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  // Text to speech
  speak(text: string, language: string = 'en-US'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isTextToSpeechSupported()) {
        reject(new Error('Text-to-speech not supported'));
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.getLanguageCode(language);
      utterance.rate = 0.9;
      utterance.volume = 1;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));

      this.synthesis.speak(utterance);
    });
  }

  // Stop speaking
  stopSpeaking() {
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
}

// Export singleton instance
export const speechService = new SpeechService();