import React, { useState, useEffect } from 'react';
import { serviceManager } from '../services/serviceManager';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface MedicalResponse {
  response: string;
  translatedResponse?: string;
  speechInstructions?: string;
}

export const GeminiExample: React.FC = () => {
  const [userMessage, setUserMessage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [result, setResult] = useState<MedicalResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [serviceStatus, setServiceStatus] = useState({
    gemini: false,
    translation: false,
    speech: false
  });

  useEffect(() => {
    // Check service status on component mount
    checkServiceStatus();
  }, []);

  const checkServiceStatus = () => {
    const status = serviceManager.getServiceStatus();
    setServiceStatus(status);
  };

  const handleGenerateResponse = async () => {
    if (!userMessage.trim()) {
      setError('Please enter a message');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await serviceManager.generateMedicalResponse(userMessage, {
        language: selectedLanguage,
        translateResponse: selectedLanguage !== 'en',
        speakResponse: true
      });

      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = async (text: string) => {
    setIsSpeaking(true);
    try {
      await serviceManager.speakMedicalResponse(text, selectedLanguage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to speak');
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleStopSpeaking = () => {
    serviceManager.stopSpeaking();
    setIsSpeaking(false);
  };

  const handleStartListening = async () => {
    setIsListening(true);
    setError(null);
    try {
      const transcript = await serviceManager.startListening(selectedLanguage);
      setUserMessage(transcript);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to listen');
    } finally {
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    serviceManager.stopListening();
    setIsListening(false);
  };

  const supportedLanguages = serviceManager.getSupportedLanguages();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gemini API Medical Assistant</CardTitle>
          <CardDescription>
            Ask questions about breast cancer and get responses with translation and speech support
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Service Status */}
          <div className="flex gap-2">
            <Badge variant={serviceStatus.gemini ? "default" : "secondary"}>
              Gemini {serviceStatus.gemini ? "✓" : "✗"}
            </Badge>
            <Badge variant={serviceStatus.translation ? "default" : "secondary"}>
              Translation {serviceStatus.translation ? "✓" : "✗"}
            </Badge>
            <Badge variant={serviceStatus.speech ? "default" : "secondary"}>
              Speech {serviceStatus.speech ? "✓" : "✗"}
            </Badge>
          </div>

          {/* Language Selection */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Language:</label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Input Area */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Question:</label>
            <div className="flex gap-2">
              <Textarea
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder="Ask about breast cancer symptoms, treatment, or prevention..."
                className="flex-1"
                rows={3}
              />
              <div className="flex flex-col gap-2">
                <Button
                  onClick={isListening ? handleStopListening : handleStartListening}
                  variant="outline"
                  size="icon"
                  disabled={isLoading}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                {isListening && (
                  <div className="text-xs text-muted-foreground text-center">
                    Listening...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateResponse}
            disabled={isLoading || !userMessage.trim()}
            className="w-full"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Medical Response
          </Button>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Medical Response
                    <Button
                      onClick={() => handleSpeak(result.response)}
                      variant="outline"
                      size="sm"
                      disabled={isSpeaking}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="mr-2 h-4 w-4" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Volume2 className="mr-2 h-4 w-4" />
                          Speak
                        </>
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap">{result.response}</div>
                </CardContent>
              </Card>

              {result.translatedResponse && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Translated Response ({selectedLanguage})
                      <Button
                        onClick={() => handleSpeak(result.translatedResponse!)}
                        variant="outline"
                        size="sm"
                        disabled={isSpeaking}
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX className="mr-2 h-4 w-4" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Volume2 className="mr-2 h-4 w-4" />
                            Speak
                          </>
                        )}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="whitespace-pre-wrap">{result.translatedResponse}</div>
                  </CardContent>
                </Card>
              )}

              {result.speechInstructions && (
                <Card>
                  <CardHeader>
                    <CardTitle>Speech Instructions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {result.speechInstructions}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
