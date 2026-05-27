'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/reusable/ui/button";
import Link from "next/link";
import { InfoLayout } from "@/components/reusable/auth/InfoLayout";
import { Zap, Shield, Sparkles } from "lucide-react";
import { Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/reusable/ui/alert";
import { authServiceApi } from "@/services/authApiService";
import { toast } from "sonner";

const CheckEmail = () => {
  const [countdown, setCountdown] = useState(120);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResend = async () => {
    try {
      console.log("Resending email");

      const stored = localStorage.getItem('userData');
      const userData = JSON.parse(stored as string)?.input;

      console.log('the user data in the local storage:', userData);

      if (!userData) {
        toast.error('User is missing! Please sign up again.');
        return;
      }

      // Call signup again to resend verification email
      const response = await authServiceApi.signup({
        input: {
          fullName: userData?.fullName,
          email: userData?.email,
          password: userData?.password,
          role: userData?.role
        }
      });

      if (response?.data?.createUser) {
        toast.success('Success!');
      } else {
        toast.error('Failed... try again!');
        return;
      }

      setCountdown(180);
      setCanResend(false);

    } catch (error: any) {
      console.error("Resend email error:", error);

      toast.error(error?.message || 'Something went wrong. Please try again.');
    }
  };

  const features = [
    {
      icon: Zap,
      title: "Instant Access",
      description: "One-click sign-in with secure magic links",
    },
    {
      icon: Shield,
      title: "Military-Grade Security",
      description: "Advanced encryption protects your data",
    },
    {
      icon: Sparkles,
      title: "Seamless Experience",
      description: "No complex passwords to remember",
    },
  ];

  const iconBadge = (
    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
      <Mail className="w-8 h-8 text-primary-foreground" />
    </div>
  );

  return (
    <InfoLayout
      title="Secure Email Verification"
      subtitle="Your account security is our top priority"
      features={features}
      iconBadge={iconBadge}
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Check your inbox!</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            We've sent a secure sign-in link to your email address
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          Click the link in the email to continue to your dashboard.
        </p>

        <Alert className="bg-muted border-0">
          <Shield className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            <strong className="font-semibold text-foreground">Secure Authentication</strong>
            <p className="text-muted-foreground mt-1">
              For your security, this link is valid for 2 minutes and can only be used once. If you don't see the email, check your spam folder.
            </p>
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <Button
            variant="secondary"
            className="w-full"
            onClick={handleResend}
            disabled={!canResend}
          >
            {canResend ? "Resend Email" : `Resend in ${formatTime(countdown)}`}
          </Button>

          <Link href="/signup">
            <Button variant="outline" className="w-full">
              Use a different email address →
            </Button>
          </Link>
        </div>
      </div>
    </InfoLayout>
  );
};

export default CheckEmail;
