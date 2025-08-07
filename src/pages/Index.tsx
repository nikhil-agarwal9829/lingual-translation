import { useState } from "react";
import SessionHome from "@/components/SessionHome";
import ChatInterface from "@/components/ChatInterface";

type AppState = 'home' | 'chat';
type UserRole = 'doctor' | 'patient';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('home');
  const [userRole, setUserRole] = useState<UserRole>('doctor');
  const [sessionId, setSessionId] = useState<string>('');

  const handleStartSession = (role: UserRole, sessionCode?: string) => {
    setUserRole(role);
    setSessionId(sessionCode || '');
    setAppState('chat');
  };

  const handleEndSession = () => {
    setAppState('home');
    setSessionId('');
  };

  if (appState === 'chat') {
    return (
      <ChatInterface
        role={userRole}
        sessionId={sessionId}
        onEndSession={handleEndSession}
      />
    );
  }

  return <SessionHome onStartSession={handleStartSession} />;
};

export default Index;
