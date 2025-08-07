import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import { useToast } from "@/hooks/use-toast";

const Doctor = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSessionValid, setIsSessionValid] = useState(false);

  useEffect(() => {
    if (sessionId) {
      // In a real app, validate session exists in database
      setIsSessionValid(true);
      toast({
        title: "Doctor session active",
        description: `Session ID: ${sessionId}`,
      });
    } else {
      navigate('/');
    }
  }, [sessionId, navigate, toast]);

  const handleEndSession = () => {
    toast({
      title: "Session ended",
      description: "You can close this window",
    });
    navigate('/');
  };

  if (!isSessionValid || !sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading session...</h2>
        </div>
      </div>
    );
  }

  return (
    <ChatInterface
      role="doctor"
      sessionId={sessionId}
      onEndSession={handleEndSession}
    />
  );
};

export default Doctor;