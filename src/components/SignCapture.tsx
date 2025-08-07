import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { signLanguageService } from '@/services/signLanguageService';

interface SignCaptureProps {
  onConfirm: (text: string) => void;
  onClose?: () => void;
}

export const SignCapture: React.FC<SignCaptureProps> = ({ onConfirm, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [buffer, setBuffer] = useState('');
  const [running, setRunning] = useState(false);

  useEffect(() => {
    return () => {
      // cleanup
      signLanguageService.stop();
    };
  }, []);

  const start = async () => {
    if (!videoRef.current) return;
    if (!signLanguageService.isSupported()) {
      alert('Sign capture is not supported in this browser.');
      return;
    }
    await signLanguageService.init();
    await signLanguageService.start(videoRef.current, (text, debug) => {
      setBuffer(text);
      // draw landmarks if provided
      const { landmarks } = debug || {};
      if (canvasRef.current && videoRef.current && landmarks) {
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.clearRect(0,0,canvasRef.current.width, canvasRef.current.height);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        landmarks.forEach((p: any) => {
          ctx.beginPath();
          ctx.arc(p.x * canvasRef.current!.width, p.y * canvasRef.current!.height, 3, 0, Math.PI*2);
          ctx.stroke();
        });
      }
    });
    setRunning(true);
  };

  const stop = () => {
    signLanguageService.stop();
    setRunning(false);
  };

  const clear = () => {
    signLanguageService.reset();
    setBuffer('');
  };

  const confirm = () => {
    if (buffer.trim()) onConfirm(buffer.trim());
    clear();
  };

  return (
    <Card className="mt-3">
      <CardHeader>
        <CardTitle>Sign Language Capture (MVP)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 flex-wrap items-start">
          <div className="relative">
            <video ref={videoRef} className="rounded border w-64 h-48 bg-black" muted playsInline />
            <canvas ref={canvasRef} className="absolute left-0 top-0 w-64 h-48 pointer-events-none" />
          </div>
          <div className="flex-1 space-y-2 min-w-[280px]">
            <div className="text-sm text-muted-foreground">Live buffer</div>
            <div className="p-2 rounded border bg-accent/30 min-h-[64px] whitespace-pre-wrap">
              {buffer || '—'}
            </div>
            <div className="flex gap-2">
              {!running ? (
                <Button onClick={start}>Start</Button>
              ) : (
                <Button variant="secondary" onClick={stop}>Stop</Button>
              )}
              <Button variant="outline" onClick={clear}>Clear</Button>
              <Button onClick={confirm} disabled={!buffer.trim()}>Send</Button>
              {onClose && (
                <Button variant="ghost" onClick={onClose}>Close</Button>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              Tip: This MVP recognizes a tiny subset (e.g., I / B heuristic) and inserts space when the hand
              disappears. Replace with a trained TFJS model for better accuracy.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SignCapture;


