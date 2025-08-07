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
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirebaseSession } from "@/hooks/useFirebaseSession";
import { translationService, supportedLanguages } from "@/services/translationService";
import { speechService } from "@/services/speechService";

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
        await createSession(selectedLanguage);
      } else {
        await joinSession(selectedLanguage);
      }
    };

    if (!isLoading && !sessionData) {
      initSession();
    }
  }, [role, sessionId, selectedLanguage, isLoading, sessionData]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    setIsTranslating(true);
    try {
      const otherLanguage = sessionData?.doctorLanguage === selectedLanguage 
        ? sessionData?.patientLanguage || 'ta'
        : sessionData?.doctorLanguage || 'en';

      const translations = await translationService.translateMultiple(
        inputText.trim(),
        selectedLanguage,
        [selectedLanguage, otherLanguage]
      );

      await sendMessage(inputText.trim(), translations);
      setInputText("");
    } catch (error) {
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
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
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
                      <p className="text-sm">{message.originalText}</p>
                    </div>
                    
                    {message.sender !== role && (
                      <div className="bg-accent/50 p-2 rounded border-l-2 border-accent">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-accent-foreground">
                            {message.translations[selectedLanguage] || message.originalText}
                          </p>
                          <Button variant="ghost" size="sm">
                            <Volume2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </CardContent>
        </Card>

        {/* Input Area */}
        <div className="p-4 space-y-3">
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
          </div>
          
          <div className="flex justify-center">
            <Button variant="secondary" size="lg" className="px-8">
              <Mic className="h-4 w-4 mr-2" />
              Hold to Speak
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}