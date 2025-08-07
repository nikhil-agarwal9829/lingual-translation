import React, { useState, useEffect } from 'react';
import { serviceManager } from '../services/serviceManager';

export const GeminiTest: React.FC = () => {
  const [status, setStatus] = useState<any>(null);
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Get initial status
    const initialStatus = serviceManager.getServiceStatus();
    setStatus(initialStatus);
  }, []);

  const runTest = async () => {
    setLoading(true);
    setTestResult('Running test...');
    
    try {
      const result = await serviceManager.generateMedicalResponse(
        "What are the early symptoms of breast cancer?",
        { language: 'en', translateResponse: false, speakResponse: false }
      );
      
      setTestResult(`✅ Test successful!\n\nResponse: ${result.response}`);
    } catch (error) {
      setTestResult(`❌ Test failed: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🧪 Gemini API Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Service Status</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(status, null, 2)}
          </pre>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          <button
            onClick={runTest}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 mb-4"
          >
            {loading ? 'Running Test...' : 'Run Gemini Test'}
          </button>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto whitespace-pre-wrap">
            {testResult}
          </pre>
        </div>
      </div>
      
      <div className="mt-6 bg-yellow-100 p-4 rounded">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Check the Service Status to see if Gemini API is configured</li>
          <li>Click "Run Gemini Test" to test the medical response generation</li>
          <li>Open browser console and run <code>testGeminiServices()</code> for detailed testing</li>
          <li>Visit <code>/test-gemini</code> for the full Gemini example component</li>
        </ul>
      </div>
    </div>
  );
};
