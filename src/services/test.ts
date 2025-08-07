// Test file for Gemini API services
// This file can be run to test the services independently

import { serviceManager } from './serviceManager';

async function testServices() {
  console.log('🧪 Testing Gemini API Services...\n');

  try {
    // Test 1: Check service status
    console.log('1. Checking service status...');
    const status = serviceManager.getServiceStatus();
    console.log('Service Status:', status);

    // Test 2: Health check
    console.log('\n2. Running health check...');
    const health = await serviceManager.healthCheck();
    console.log('Health Check:', health);

    // Test 3: Generate medical response
    console.log('\n3. Testing medical response generation...');
    const testMessage = "What are the early symptoms of breast cancer?";
    const result = await serviceManager.generateMedicalResponse(testMessage, {
      language: 'en',
      translateResponse: false,
      speakResponse: false
    });
    console.log('Medical Response:', result.response);

    // Test 4: Translation test
    console.log('\n4. Testing translation...');
    const translationResult = await serviceManager.translateText(
      "Hello, how are you feeling today?",
      "en",
      "es"
    );
    console.log('Translation Result:', translationResult);

    // Test 5: Supported languages
    console.log('\n5. Checking supported languages...');
    const languages = serviceManager.getSupportedLanguages();
    console.log('Supported Languages:', languages.map(l => `${l.flag} ${l.name} (${l.code})`));

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  (window as any).testGeminiServices = testServices;
  console.log('🧪 Test function available as window.testGeminiServices()');
  console.log('🌐 Open browser console and run: testGeminiServices()');
} else {
  // Node.js environment
  testServices();
}

export { testServices };
