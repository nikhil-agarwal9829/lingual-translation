// Gemini API Service - handles text translation and text-to-speech using Gemini API

export interface GeminiConfig {
  apiKey?: string;
  apiUrl?: string;
}

class GeminiAPI {
  private API_KEY: string;
  private API_URL: string;
  private cache: Map<string, string>;

  constructor(config?: GeminiConfig) {
    this.API_KEY = config?.apiKey || 'AIzaSyBOB9mCAfLCJhQBEEacBeSQrZjO9JXq494';
    this.API_URL = config?.apiUrl || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    this.cache = new Map();
  }

  async generateResponse(userMessage: string, systemPrompt?: string): Promise<string> {
    try {
      // Check cache first
      const cacheKey = `${userMessage}-${systemPrompt || 'default'}`;
      const cachedResponse = this.cache.get(cacheKey);
      if (cachedResponse) {
        return cachedResponse;
      }

      // Prepare the request
      const response = await fetch(`${this.API_URL}?key=${this.API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: systemPrompt ? `${systemPrompt}\n\nUser: ${userMessage}` : this.createPrompt(userMessage)
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      // Parse the response
      const data = await response.json();
      
      // Log for debugging
      console.log('API Response:', data);

      // Check for API errors
      if (!response.ok) {
        const errorMessage = data.error?.message || 'Unknown API error';
        console.error('API Error:', data.error);
        throw new Error(errorMessage);
      }

      // Validate response structure
      if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error('Invalid Response Structure:', data);
        throw new Error('Invalid response format from API');
      }

      // Get the response text
      const responseText = data.candidates[0].content.parts[0].text;

      // Cache the response
      this.cache.set(cacheKey, responseText);

      return responseText;

    } catch (error) {
      console.error('Gemini API Error:', error);
      
      // Check for specific error types
      if (error instanceof Error) {
        if (error.message.includes('quota')) {
          throw new Error('API quota exceeded. Please try again later.');
        } else if (error.message.includes('invalid')) {
          throw new Error('Invalid request. Please try rephrasing your question.');
        } else if (error.message.includes('blocked')) {
          throw new Error('This content cannot be processed. Please try a different question.');
        }
      }
      
      throw error;
    }
  }

  private createPrompt(userMessage: string): string {
    return `You are a medical assistant specializing in breast cancer information and support.
    Respond to this question about breast cancer: "${userMessage}"

    Format your response with:
    - Clear bullet points or numbered lists
    - Important information in *bold* using asterisks
    - Medical terms explained in simple language
    - Actionable advice when appropriate

    Keep the response:
    - Accurate and evidence-based
    - Easy to understand
    - Empathetic and supportive
    - Structured and well-organized

    Include:
    - Relevant medical information
    - When to seek professional help
    - Additional resources if applicable
    - Important disclaimers when needed`;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export class GeminiService {
  private geminiAPI: GeminiAPI;
  private supportedLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { code: 'ta', name: 'Tamil', flag: '🇮🇳' },
    { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  ];

  constructor(config?: GeminiConfig) {
    this.geminiAPI = new GeminiAPI(config);
  }

  // Configure the service
  configure(config: GeminiConfig): void {
    this.geminiAPI = new GeminiAPI(config);
  }

  // Translate text using Gemini API
  async translateText(text: string, sourceLang: string, targetLang: string): Promise<string> {
    if (sourceLang === targetLang) {
      return text;
    }

    const translationPrompt = `You are a professional translator. Translate the following text from ${this.getLanguageName(sourceLang)} to ${this.getLanguageName(targetLang)}.

Text to translate: "${text}"

Please provide only the translated text without any additional explanations or formatting.`;

    try {
      const translatedText = await this.geminiAPI.generateResponse(text, translationPrompt);
      return translatedText.trim();
    } catch (error) {
      console.error('Translation failed:', error);
      throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generate speech synthesis instructions using Gemini API
  async generateSpeechInstructions(text: string, language: string): Promise<string> {
    const speechPrompt = `You are a text-to-speech assistant. Given the following text in ${this.getLanguageName(language)}, provide clear instructions for how this text should be spoken.

Text: "${text}"

Provide instructions for:
- Pronunciation of difficult words
- Emphasis and stress patterns
- Pacing and rhythm
- Tone and emotion
- Any special considerations for ${this.getLanguageName(language)}

Format your response as clear, actionable instructions.`;

    try {
      const instructions = await this.geminiAPI.generateResponse(text, speechPrompt);
      return instructions.trim();
    } catch (error) {
      console.error('Speech instruction generation failed:', error);
      throw new Error(`Speech instruction generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generate medical responses using Gemini API
  async generateMedicalResponse(userMessage: string): Promise<string> {
    try {
      return await this.geminiAPI.generateResponse(userMessage);
    } catch (error) {
      console.error('Medical response generation failed:', error);
      throw new Error(`Medical response generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Translate medical responses to different languages
  async generateMedicalResponseInLanguage(userMessage: string, targetLang: string): Promise<string> {
    try {
      // First generate the medical response in English
      const englishResponse = await this.generateMedicalResponse(userMessage);
      
      // Then translate it to the target language
      return await this.translateText(englishResponse, 'en', targetLang);
    } catch (error) {
      console.error('Medical response translation failed:', error);
      throw new Error(`Medical response translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get language name from code
  private getLanguageName(langCode: string): string {
    const language = this.supportedLanguages.find(lang => lang.code === langCode);
    return language ? language.name : langCode;
  }

  // Get supported languages
  getSupportedLanguages(): Array<{ code: string; name: string; flag: string }> {
    return this.supportedLanguages;
  }

  // Check if language is supported
  isLanguageSupported(langCode: string): boolean {
    return this.supportedLanguages.some(lang => lang.code === langCode);
  }

  // Clear cache
  clearCache(): void {
    this.geminiAPI.clearCache();
  }

  // Check if service is configured
  isConfigured(): boolean {
    return this.geminiAPI !== null;
  }
}

// Export singleton instance
export const geminiService = new GeminiService();

// Export the GeminiAPI class for direct use if needed
export { GeminiAPI };
