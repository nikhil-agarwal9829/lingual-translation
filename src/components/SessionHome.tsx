import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, Users, Globe, Shield, ArrowRight } from "lucide-react";

interface SessionHomeProps {
  onStartSession: (role: 'doctor' | 'patient', sessionId?: string) => void;
}

export default function SessionHome({ onStartSession }: SessionHomeProps) {
  const [sessionId, setSessionId] = useState("");

  const handleStartNewSession = () => {
    const newSessionId = Math.random().toString(36).substring(2, 8).toUpperCase();
    // Open doctor interface in new tab
    window.open(`/doctor/${newSessionId}`, '_blank');
  };

  const handleJoinSession = () => {
    if (sessionId.trim()) {
      // Open patient interface in new tab
      window.open(`/patient/${sessionId.trim().toUpperCase()}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-primary-light/30">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 bg-primary/10 rounded-full">
              <Stethoscope className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            MedTranslate
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Breaking language barriers in healthcare through real-time translation
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <Badge variant="secondary" className="px-3 py-1">
              <Globe className="h-3 w-3 mr-1" />
              50+ Languages
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Shield className="h-3 w-3 mr-1" />
              HIPAA Compliant
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Users className="h-3 w-3 mr-1" />
              Real-time
            </Badge>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Doctor Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-primary/20 hover:border-primary/40">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto p-4 bg-primary/10 rounded-full w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                <Stethoscope className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Healthcare Provider</CardTitle>
              <CardDescription className="text-base">
                Start a new secure translation session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  You'll receive a session code to share with your patient
                </p>
              </div>
              <Button 
                onClick={handleStartNewSession}
                className="w-full bg-primary hover:bg-primary-dark transition-colors group-hover:scale-105 transform duration-200"
                size="lg"
              >
                Start New Session
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Patient Card */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-primary/20 hover:border-primary/40">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto p-4 bg-info/10 rounded-full w-fit mb-4 group-hover:bg-info/20 transition-colors">
                <Users className="h-8 w-8 text-info" />
              </div>
              <CardTitle className="text-2xl">Patient</CardTitle>
              <CardDescription className="text-base">
                Join an existing session with your doctor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Enter session code from your healthcare provider
                </label>
                <Input
                  placeholder="e.g., ABC123"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value.toUpperCase())}
                  className="text-center text-lg font-mono tracking-wider"
                  maxLength={6}
                />
              </div>
              <Button 
                onClick={handleJoinSession}
                disabled={!sessionId.trim()}
                className="w-full bg-info hover:bg-info/90 transition-colors group-hover:scale-105 transform duration-200"
                size="lg"
              >
                Join Session
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold mb-8 text-foreground">
            Comprehensive Translation Support
          </h3>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="p-6 rounded-lg bg-card border border-border/50">
              <h4 className="font-semibold text-lg mb-2">Text Translation</h4>
              <p className="text-muted-foreground">Real-time text messaging with instant translation</p>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border/50">
              <h4 className="font-semibold text-lg mb-2">Voice Translation</h4>
              <p className="text-muted-foreground">Speech-to-text with voice playback support</p>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border/50">
              <h4 className="font-semibold text-lg mb-2">Sign Language</h4>
              <p className="text-muted-foreground">Visual sign language interpretation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}