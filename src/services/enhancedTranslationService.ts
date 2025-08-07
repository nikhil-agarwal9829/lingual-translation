// Enhanced Translation Service - integrates Gemini API with translation
import { geminiService } from './geminiService';

export interface TranslationConfig {
  useGemini?: boolean;
  googleApiKey?: string;
  projectId?: string;
  fallbackToGoogle?: boolean;
}

export interface TranslationResult {
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence?: number;
  method: 'gemini' | 'google' | 'mock';
}

class EnhancedTranslationService {
  private useGemini: boolean;
  private googleApiKey: string | null = null;
  private projectId: string | null = null;
  private fallbackToGoogle: boolean;

  constructor(config?: TranslationConfig) {
    this.useGemini = config?.useGemini ?? true;
    this.googleApiKey = config?.googleApiKey || null;
    this.projectId = config?.projectId || null;
    this.fallbackToGoogle = config?.fallbackToGoogle ?? true;
  }

  // Configure the service
  configure(config: TranslationConfig): void {
    this.useGemini = config.useGemini ?? this.useGemini;
    this.googleApiKey = config.googleApiKey || this.googleApiKey;
    this.projectId = config.projectId || this.projectId;
    this.fallbackToGoogle = config.fallbackToGoogle ?? this.fallbackToGoogle;
  }

  // Main translate method with multiple fallback options
  async translate(
    text: string, 
    sourceLang: string, 
    targetLang: string
  ): Promise<TranslationResult> {
    if (sourceLang === targetLang) {
      return {
        translatedText: text,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        method: 'gemini'
      };
    }

    // Try Gemini API first if enabled
    if (this.useGemini && geminiService.isConfigured()) {
      try {
        const translatedText = await geminiService.translateText(text, sourceLang, targetLang);
        return {
          translatedText,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
          method: 'gemini'
        };
      } catch (error) {
        console.warn('Gemini translation failed, trying fallback:', error);
      }
    }

    // Try Google Translate as fallback
    if (this.fallbackToGoogle && this.googleApiKey) {
      try {
        const translatedText = await this.translateWithGoogle(text, sourceLang, targetLang);
        return {
          translatedText,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
          method: 'google'
        };
      } catch (error) {
        console.warn('Google translation failed, using mock:', error);
      }
    }

    // Use mock translation as final fallback
    const translatedText = this.mockTranslate(text, targetLang);
    return {
      translatedText,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
      method: 'mock'
    };
  }

  // Google Cloud Translation
  private async translateWithGoogle(text: string, sourceLang: string, targetLang: string): Promise<string> {
    if (!this.googleApiKey) {
      throw new Error('Google Cloud Translation API key not configured');
    }

    try {
      const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${this.googleApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: sourceLang,
          target: targetLang,
        }),
      });

      if (!response.ok) {
        throw new Error(`Translation API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data.translations[0].translatedText;
    } catch (error) {
      console.error('Google Translate error:', error);
      throw error;
    }
  }

  // Mock translation for development/demo
  private mockTranslate(text: string, targetLang: string): string {
    const mockTranslations: Record<string, Record<string, string>> = {
      'Hello, how are you feeling today?': {
        'es': 'Hola, ¿cómo te sientes hoy?',
        'ta': 'வணக்கம், இன்று எப்படி உணர்கிறீர்கள்?',
        'fr': 'Bonjour, comment vous sentez-vous aujourd\'hui?',
        'de': 'Hallo, wie fühlen Sie sich heute?',
        'zh': '你好，你今天感觉怎么样？',
        'ja': 'こんにちは、今日の気分はいかがですか？',
        'ar': 'مرحبا، كيف تشعر اليوم؟',
        'hi': 'नमस्ते, आज आप कैसा महसूस कर रहे हैं?',
        'pt': 'Olá, como você está se sentindo hoje?',
        'ru': 'Здравствуйте, как вы себя чувствуете сегодня?'
      },
      'I have a headache': {
        'en': 'I have a headache',
        'es': 'Tengo dolor de cabeza',
        'ta': 'எனக்கு தலைவலி உள்ளது',
        'fr': 'J\'ai mal à la tête',
        'de': 'Ich habe Kopfschmerzen',
        'zh': '我头痛',
        'ja': '頭痛がします',
        'ar': 'أعاني من صداع',
        'hi': 'मेरे सिर में दर्द है',
        'pt': 'Estou com dor de cabeça',
        'ru': 'У меня болит голова'
      },
      'Can you describe the pain?': {
        'en': 'Can you describe the pain?',
        'es': '¿Puedes describir el dolor?',
        'ta': 'வலியை விவரிக்க முடியுமா?',
        'fr': 'Pouvez-vous décrire la douleur?',
        'de': 'Können Sie den Schmerz beschreiben?',
        'zh': '你能描述一下疼痛吗？',
        'ja': '痛みを説明していただけますか？',
        'ar': 'هل يمكنك وصف الألم؟',
        'hi': 'क्या आप दर्द का वर्णन कर सकते हैं?',
        'pt': 'Você pode descrever a dor?',
        'ru': 'Можете ли вы описать боль?'
      },
      'When did this start?': {
        'en': 'When did this start?',
        'es': '¿Cuándo empezó esto?',
        'ta': 'இது எப்போது தொடங்கியது?',
        'fr': 'Quand cela a-t-il commencé?',
        'de': 'Wann hat das angefangen?',
        'zh': '这是什么时候开始的？',
        'ja': 'いつから始まりましたか？',
        'ar': 'متى بدأ هذا؟',
        'hi': 'यह कब शुरू हुआ?',
        'pt': 'Quando isso começou?',
        'ru': 'Когда это началось?'
      },
      'Thank you, doctor': {
        'en': 'Thank you, doctor',
        'es': 'Gracias, doctor',
        'ta': 'நன்றி, டாக்டர்',
        'fr': 'Merci, docteur',
        'de': 'Danke, Doktor',
        'zh': '谢谢医生',
        'ja': 'ありがとう、先生',
        'ar': 'شكرا لك دكتور',
        'hi': 'धन्यवाद, डॉक्टर',
        'pt': 'Obrigado, doutor',
        'ru': 'Спасибо, доктор'
      }
    };

    // Try exact match first
    if (mockTranslations[text] && mockTranslations[text][targetLang]) {
      return mockTranslations[text][targetLang];
    }

    // Fallback: simple prefixed translation
    return `[${targetLang.toUpperCase()}] ${text}`;
  }

  // Translate to multiple languages at once
  async translateMultiple(
    text: string, 
    sourceLang: string, 
    targetLangs: string[]
  ): Promise<Record<string, TranslationResult>> {
    const translations: Record<string, TranslationResult> = {};
    
    // Include source language
    translations[sourceLang] = {
      translatedText: text,
      sourceLanguage: sourceLang,
      targetLanguage: sourceLang,
      method: 'gemini'
    };

    // Translate to target languages
    for (const targetLang of targetLangs) {
      if (targetLang !== sourceLang) {
        try {
          translations[targetLang] = await this.translate(text, sourceLang, targetLang);
        } catch (error) {
          console.error(`Failed to translate to ${targetLang}:`, error);
          translations[targetLang] = {
            translatedText: `[Translation failed] ${text}`,
            sourceLanguage: sourceLang,
            targetLanguage: targetLang,
            method: 'mock'
          };
        }
      }
    }

    return translations;
  }

  // Translate medical responses
  async translateMedicalResponse(
    userMessage: string, 
    targetLang: string
  ): Promise<TranslationResult> {
    try {
      if (this.useGemini && geminiService.isConfigured()) {
        const translatedResponse = await geminiService.generateMedicalResponseInLanguage(userMessage, targetLang);
        return {
          translatedText: translatedResponse,
          sourceLanguage: 'en',
          targetLanguage: targetLang,
          method: 'gemini'
        };
      } else {
        // Fallback to regular translation
        return await this.translate(userMessage, 'en', targetLang);
      }
    } catch (error) {
      console.error('Medical response translation failed:', error);
      throw error;
    }
  }

  // Check if service is configured
  isConfigured(): boolean {
    return this.useGemini || this.googleApiKey !== null;
  }

  // Get current configuration
  getConfig(): TranslationConfig {
    return {
      useGemini: this.useGemini,
      googleApiKey: this.googleApiKey,
      projectId: this.projectId,
      fallbackToGoogle: this.fallbackToGoogle
    };
  }
}

// Export singleton instance
export const enhancedTranslationService = new EnhancedTranslationService();

// Export languages list
export const supportedLanguages = [
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
