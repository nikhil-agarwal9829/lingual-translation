import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  Copy, 
  LogOut, 
  Languages,
  User,
  Stethoscope,
  Loader2,
  Hand
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseSession } from "@/hooks/useFirebaseSession";
import { translationService, supportedLanguages } from "@/services/translationService";
import { speechService } from "@/services/speechService";
import { serviceManager } from "@/services/serviceManager";
import SignCapture from '@/components/SignCapture';

interface ChatInterfaceProps {
  role: 'doctor' | 'patient';
  sessionId: string;
  onEndSession: () => void;
}

export default function ChatInterface({ role, sessionId, onEndSession }: ChatInterfaceProps) {
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(role === 'doctor' ? 'en' : 'ta');
  const [isSignLanguageVisible, setIsSignLanguageVisible] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [signMode, setSignMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Firebase session hook
  const {
    messages,
    sessionData,
    isLoading,
    error,
    createSession,
    joinSession,
    sendMessage,
    updateLanguage,
    endSession
  } = useFirebaseSession(sessionId, role);

  // Initialize session on mount
  useEffect(() => {
    const initSession = async () => {
      if (role === 'doctor') {
        await createSession('en'); // Doctor always uses English
      } else {
        await joinSession(selectedLanguage); // Patient uses their selected language
      }
    };

    if (!isLoading && !sessionData) {
      initSession();
    }
  }, [role, sessionId, isLoading, sessionData]);

  // Update session when language changes (for patient)
  useEffect(() => {
    if (role === 'patient' && sessionData && selectedLanguage !== sessionData.patientLanguage) {
      updateLanguage(selectedLanguage);
    }
  }, [selectedLanguage, role, sessionData]);

    const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    setIsTranslating(true);
    try {
      // Get the other person's language from session data
      const otherLanguage = role === 'doctor' 
        ? (sessionData?.patientLanguage || 'ta')
        : (sessionData?.doctorLanguage || 'en');

      console.log(`Translating from ${selectedLanguage} to ${otherLanguage}`);
      console.log('Service status:', serviceManager.getServiceStatus());

      // Create translations for both languages
      let translations: Record<string, string> = {};
      
      // Always include the original language
      translations[selectedLanguage] = inputText.trim();

      // Translate to the other person's language
      try {
        const translatedText = await serviceManager.translateText(
          inputText.trim(),
          selectedLanguage,
          otherLanguage
        );
        
        translations[otherLanguage] = translatedText;
        console.log(`Translation result: ${translatedText}`);
      } catch (error) {
        console.warn('Translation failed, using fallback:', error);
        // Fallback: just use original text for other language
        translations[otherLanguage] = inputText.trim();
      }

      console.log('Sending message with translations:', translations);
      await sendMessage(inputText.trim(), translations);
      setInputText("");
    } catch (error) {
      console.error('Message sending failed:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const copySessionId = () => {
    navigator.clipboard.writeText(sessionId);
    toast({
      title: "Session ID copied",
      description: role === 'doctor' ? "Share this with your patient" : "Session ID copied",
    });
  };

  // Voice functions
  const handleStartListening = async () => {
    try {
      setIsRecording(true);
      const result = await speechService.startListening(selectedLanguage);
      setInputText(result);
      setIsRecording(false);
    } catch (error) {
      setIsRecording(false);
      toast({
        title: "Error",
        description: "Failed to start voice recording",
        variant: "destructive"
      });
    }
  };

  const handleStopListening = () => {
    speechService.stopListening();
    setIsRecording(false);
  };

  const handleSpeak = async (text: string) => {
    try {
      setIsSpeaking(true);
      await speechService.speak(text, selectedLanguage);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to play voice",
        variant: "destructive"
      });
    } finally {
      setIsSpeaking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Loading session...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary-light/20">
      <div className="container mx-auto h-screen flex flex-col max-w-6xl">
        {/* Header */}
        <div className="bg-card border-b border-border shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                {role === 'doctor' ? (
                  <Stethoscope className="h-5 w-5 text-primary" />
                ) : (
                  <User className="h-5 w-5 text-info" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-semibold capitalize">{role} Interface</h1>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Session:</span>
                  <Badge variant="outline" className="font-mono cursor-pointer" onClick={copySessionId}>
                    {sessionId}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={copySessionId}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Select 
                value={selectedLanguage} 
                onValueChange={setSelectedLanguage}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {supportedLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        {lang.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={onEndSession}>
                <LogOut className="h-4 w-4 mr-2" />
                End Session
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <Card className="flex-1 m-4">
          <CardContent className="flex-1 overflow-y-auto space-y-4 p-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Languages className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start the conversation - messages will be translated in real-time</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === role ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-sm space-y-2">
                    <div
                      className={`p-3 rounded-lg ${
                        message.sender === role
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs opacity-70 capitalize">{message.sender}</span>
                        {message.type === 'voice' && (
                          <Badge variant="secondary" className="text-xs">Voice</Badge>
                        )}
                      </div>
                      <p className="text-sm">
                        {message.sender === role 
                          ? message.originalText 
                          : (message.translations[selectedLanguage] || message.originalText)
                        }
                      </p>
                      {/* Show language info */}
                      <div className="text-xs opacity-50 mt-1">
                        {message.sender !== role && message.translations[selectedLanguage] && 
                         message.translations[selectedLanguage] !== message.originalText && (
                          <span>Translated to {selectedLanguage}</span>
                        )}
                      </div>
                      {/* Debug info - remove this later */}
                      {process.env.NODE_ENV === 'development' && (
                        <div className="text-xs opacity-50 mt-1">
                          Debug: {JSON.stringify(message.translations)}
                        </div>
                      )}
                    </div>
                    
                    {/* Show original text for received messages if different from translation */}
                    {message.sender !== role && 
                     message.translations[selectedLanguage] && 
                     message.translations[selectedLanguage] !== message.originalText && (
                      <div className="bg-accent/50 p-2 rounded border-l-2 border-accent">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-accent-foreground opacity-70">
                            Original: {message.originalText}
                          </p>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleSpeak(message.originalText)}
                            disabled={isSpeaking}
                          >
                            <Volume2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Voice button for main message */}
                    <div className="flex justify-end mt-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleSpeak(
                          message.sender === role 
                            ? message.originalText 
                            : (message.translations[selectedLanguage] || message.originalText)
                        )}
                        disabled={isSpeaking}
                      >
                        <Volume2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </CardContent>
        </Card>

        {/* Input Area */}
        <div className="p-4 space-y-3">
          {signMode && (
            <SignCapture
              onConfirm={(text) => setInputText((prev) => (prev ? prev + ' ' + text : text))}
              onClose={() => setSignMode(false)}
            />
          )}
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isTranslating && handleSendMessage()}
              disabled={isTranslating}
            />
            <Button onClick={handleSendMessage} disabled={!inputText.trim() || isTranslating}>
              {isTranslating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
            <Button variant={signMode ? 'secondary' : 'outline'} onClick={() => setSignMode((v) => !v)} title="Sign language mode">
              <Hand className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex justify-center">
            <Button 
              variant="secondary" 
              size="lg" 
              className="px-8"
              onMouseDown={handleStartListening}
              onMouseUp={handleStopListening}
              onTouchStart={handleStartListening}
              onTouchEnd={handleStopListening}
              disabled={isRecording}
            >
              {isRecording ? (
                <>
                  <MicOff className="h-4 w-4 mr-2" />
                  Recording...
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Hold to Speak
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}