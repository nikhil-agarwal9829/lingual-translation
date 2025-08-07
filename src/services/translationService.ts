// Translation Service - integrates with Google Cloud Translation API

export interface TranslationConfig {
  googleApiKey?: string;
  projectId?: string;
}

class TranslationService {
  private apiKey: string | null = null;
  private projectId: string | null = null;

  constructor(config?: TranslationConfig) {
    this.apiKey = config?.googleApiKey || null;
    this.projectId = config?.projectId || null;
  }

  // Configure API credentials
  configure(config: TranslationConfig) {
    this.apiKey = config.googleApiKey || null;
    this.projectId = config.projectId || null;
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

    // Fallback: simple translation without prefix
    return text;
  }

  // Real Google Cloud Translation
  async translateWithGoogle(text: string, sourceLang: string, targetLang: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Google Cloud Translation API key not configured');
    }

    try {
      const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${this.apiKey}`, {
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

  // Main translate method - uses Google if available, otherwise mock
  async translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
    if (sourceLang === targetLang) {
      return text;
    }

    try {
      if (this.apiKey) {
        return await this.translateWithGoogle(text, sourceLang, targetLang);
      } else {
        // Use mock translation for demo
        return this.mockTranslate(text, targetLang);
      }
    } catch (error) {
      console.error('Translation failed, using fallback:', error);
      return this.mockTranslate(text, targetLang);
    }
  }

  // Translate to multiple languages at once
  async translateMultiple(
    text: string, 
    sourceLang: string, 
    targetLangs: string[]
  ): Promise<Record<string, string>> {
    const translations: Record<string, string> = {};
    
    // Include source language
    translations[sourceLang] = text;

    // Translate to target languages
    for (const targetLang of targetLangs) {
      if (targetLang !== sourceLang) {
        try {
          translations[targetLang] = await this.translate(text, sourceLang, targetLang);
        } catch (error) {
          console.error(`Failed to translate to ${targetLang}:`, error);
          translations[targetLang] = `[Translation failed] ${text}`;
        }
      }
    }

    return translations;
  }

  // Check if service is configured
  isConfigured(): boolean {
    return this.apiKey !== null;
  }
}

// Export singleton instance
export const translationService = new TranslationService();

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