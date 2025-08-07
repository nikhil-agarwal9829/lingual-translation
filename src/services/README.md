can you# Gemini API Integration Services

This directory contains enhanced services that integrate the Gemini API for text translation and text-to-speech functionality in your medical application.

## Services Overview

### 1. GeminiService (`geminiService.ts`)
Core service that handles communication with the Gemini API for:
- Medical response generation
- Text translation
- Speech instruction generation

### 2. EnhancedTranslationService (`enhancedTranslationService.ts`)
Advanced translation service with multiple fallback options:
- Gemini API translation (primary)
- Google Cloud Translation (fallback)
- Mock translations (development)

### 3. EnhancedSpeechService (`enhancedSpeechService.ts`)
Enhanced speech synthesis with Gemini integration:
- Text-to-speech with Gemini instructions
- Speech recognition
- Medical response processing

### 4. ServiceManager (`serviceManager.ts`)
Unified interface that combines all services for easy integration.

## Quick Start

### Basic Usage

```typescript
import { serviceManager } from './services/serviceManager';

// Configure services
serviceManager.configure({
  gemini: {
    apiKey: 'your-gemini-api-key'
  },
  translation: {
    useGemini: true,
    fallbackToGoogle: true
  },
  speech: {
    useGemini: true,
    defaultLanguage: 'en'
  }
});

// Generate medical response with translation and speech
const result = await serviceManager.generateMedicalResponse(
  "What are the symptoms of breast cancer?",
  {
    language: 'es',
    translateResponse: true,
    speakResponse: true
  }
);

console.log('Response:', result.response);
console.log('Translated:', result.translatedResponse);
console.log('Speech Instructions:', result.speechInstructions);
```

### Individual Service Usage

#### Gemini Service
```typescript
import { geminiService } from './services/geminiService';

// Generate medical response
const response = await geminiService.generateMedicalResponse(
  "What are the early signs of breast cancer?"
);

// Translate text
const translated = await geminiService.translateText(
  "Hello, how are you feeling?",
  "en",
  "es"
);

// Generate speech instructions
const instructions = await geminiService.generateSpeechInstructions(
  "This is important medical information.",
  "en"
);
```

#### Translation Service
```typescript
import { enhancedTranslationService } from './services/enhancedTranslationService';

// Translate with fallback options
const result = await enhancedTranslationService.translate(
  "I have a headache",
  "en",
  "es"
);

console.log('Translated:', result.translatedText);
console.log('Method used:', result.method);
```

#### Speech Service
```typescript
import { enhancedSpeechService } from './services/enhancedSpeechService';

// Speak text with enhanced processing
await enhancedSpeechService.speak(
  "This is important medical information.",
  "en"
);

// Speak medical response
await enhancedSpeechService.speakMedicalResponse(
  "Based on your symptoms, I recommend...",
  "en"
);

// Start speech recognition
const transcript = await enhancedSpeechService.startListening('en');
```

## Configuration Options

### Gemini Configuration
```typescript
interface GeminiConfig {
  apiKey?: string;
  apiUrl?: string;
}
```

### Translation Configuration
```typescript
interface TranslationConfig {
  useGemini?: boolean;
  googleApiKey?: string;
  projectId?: string;
  fallbackToGoogle?: boolean;
}
```

### Speech Configuration
```typescript
interface SpeechConfig {
  useGemini?: boolean;
  defaultLanguage?: string;
  voiceRate?: number;
  voiceVolume?: number;
}
```

## Features

### Medical Response Generation
- Specialized prompts for breast cancer information
- Evidence-based responses
- Empathetic and supportive tone
- Structured formatting with bullet points

### Translation Features
- Multi-language support (12+ languages)
- Fallback mechanisms for reliability
- Medical terminology handling
- Context-aware translation

### Speech Features
- Enhanced text-to-speech processing
- Medical response optimization
- Speech instruction generation
- Cross-language speech synthesis

## Error Handling

All services include comprehensive error handling:

```typescript
try {
  const result = await serviceManager.generateMedicalResponse(message);
} catch (error) {
  console.error('Service error:', error.message);
  // Handle specific error types
  if (error.message.includes('quota')) {
    // Handle API quota exceeded
  } else if (error.message.includes('invalid')) {
    // Handle invalid request
  }
}
```

## Health Check

Monitor service status:

```typescript
const health = await serviceManager.healthCheck();
console.log('Service Status:', health);
// {
//   gemini: true,
//   translation: true,
//   speech: true,
//   errors: []
// }
```

## Supported Languages

- English (en) 🇺🇸
- Spanish (es) 🇪🇸
- French (fr) 🇫🇷
- German (de) 🇩🇪
- Chinese (zh) 🇨🇳
- Japanese (ja) 🇯🇵
- Korean (ko) 🇰🇷
- Arabic (ar) 🇸🇦
- Hindi (hi) 🇮🇳
- Tamil (ta) 🇮🇳
- Portuguese (pt) 🇧🇷
- Russian (ru) 🇷🇺

## Integration with Existing Components

The services are designed to work seamlessly with your existing components. You can gradually migrate from the old services to the new enhanced ones:

```typescript
// Old way
import { translationService } from './services/translationService';
import { speechService } from './services/speechService';

// New way
import { serviceManager } from './services/serviceManager';
```

## Performance Considerations

- Caching is implemented for Gemini API responses
- Fallback mechanisms ensure reliability
- Error handling prevents service failures
- Health checks monitor service status

## Security

- API keys are configurable and not hardcoded
- Error messages don't expose sensitive information
- Secure API communication with proper headers
