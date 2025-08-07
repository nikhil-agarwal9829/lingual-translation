import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  addDoc, 
  query, 
  orderBy, 
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Message {
  id: string;
  sender: 'doctor' | 'patient';
  originalText: string;
  translations: Record<string, string>;
  timestamp: any;
  type: 'text' | 'voice';
}

export interface SessionData {
  doctorId: string;
  patientId: string;
  doctorLanguage: string;
  patientLanguage: string;
  status: 'active' | 'closed';
  createdAt: any;
}

export const useFirebaseSession = (sessionId: string, role: 'doctor' | 'patient') => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create a new session (doctor only)
  const createSession = async (doctorLanguage: string = 'en') => {
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      const newSession: SessionData = {
        doctorId: `doctor_${Date.now()}`,
        patientId: '',
        doctorLanguage,
        patientLanguage: '',
        status: 'active',
        createdAt: serverTimestamp()
      };
      
      await setDoc(sessionRef, newSession);
      setSessionData(newSession);
      return true;
    } catch (err) {
      setError('Failed to create session');
      console.error('Error creating session:', err);
      return false;
    }
  };

  // Join session (patient only)
  const joinSession = async (patientLanguage: string = 'ta') => {
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      const sessionSnap = await getDoc(sessionRef);
      
      if (!sessionSnap.exists()) {
        throw new Error('Session not found');
      }

      await updateDoc(sessionRef, {
        patientId: `patient_${Date.now()}`,
        patientLanguage
      });
      
      return true;
    } catch (err) {
      setError('Failed to join session');
      console.error('Error joining session:', err);
      return false;
    }
  };

  // Send message
  const sendMessage = async (text: string, translations: Record<string, string>, type: 'text' | 'voice' = 'text') => {
    try {
      const messagesRef = collection(db, 'sessions', sessionId, 'messages');
      await addDoc(messagesRef, {
        sender: role,
        originalText: text,
        translations,
        timestamp: serverTimestamp(),
        type
      });
      return true;
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
      return false;
    }
  };

  // Update language preference
  const updateLanguage = async (language: string) => {
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      const fieldName = role === 'doctor' ? 'doctorLanguage' : 'patientLanguage';
      await updateDoc(sessionRef, {
        [fieldName]: language
      });
      return true;
    } catch (err) {
      setError('Failed to update language');
      console.error('Error updating language:', err);
      return false;
    }
  };

  // End session
  const endSession = async () => {
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      await updateDoc(sessionRef, {
        status: 'closed'
      });
      return true;
    } catch (err) {
      setError('Failed to end session');
      console.error('Error ending session:', err);
      return false;
    }
  };

  // Listen to session data changes
  useEffect(() => {
    let unsubscribeSession: () => void;
    
    try {
      const sessionRef = doc(db, 'sessions', sessionId);
      unsubscribeSession = onSnapshot(sessionRef, (doc) => {
        if (doc.exists()) {
          setSessionData(doc.data() as SessionData);
        } else {
          setError('Session not found');
        }
        setIsLoading(false);
      }, (err) => {
        setError('Failed to load session');
        console.error('Error loading session:', err);
        setIsLoading(false);
      });
    } catch (err) {
      console.error('Error setting up session listener:', err);
      setError('Failed to connect to database');
      setIsLoading(false);
      return () => {};
    }

    return () => {
      try {
        unsubscribeSession();
      } catch (err) {
        console.error('Error unsubscribing from session:', err);
      }
    };
  }, [sessionId]);

  // Listen to messages
  useEffect(() => {
    let unsubscribeMessages: () => void;
    
    try {
      const messagesRef = collection(db, 'sessions', sessionId, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc'));
      
      unsubscribeMessages = onSnapshot(q, (snapshot) => {
        const messageList: Message[] = [];
        snapshot.forEach((doc) => {
          messageList.push({
            id: doc.id,
            ...doc.data()
          } as Message);
        });
        setMessages(messageList);
      }, (err) => {
        console.error('Error loading messages:', err);
        setError('Failed to load messages');
      });
    } catch (err) {
      console.error('Error setting up messages listener:', err);
      setError('Failed to connect to message database');
      return () => {};
    }

    return () => {
      try {
        unsubscribeMessages();
      } catch (err) {
        console.error('Error unsubscribing from messages:', err);
      }
    };
  }, [sessionId]);

  return {
    messages,
    sessionData,
    isLoading,
    error,
    createSession,
    joinSession,
    sendMessage,
    updateLanguage,
    endSession
  };
};