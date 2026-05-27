'use client';

import { useEffect } from "react";
import { Button } from "@/components/reusable/ui/button";
import Link from 'next/link'
import { InfoLayout } from "@/components/reusable/auth/InfoLayout";
import { Shield, Zap, Sparkles } from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

  const EmailVerified = () => {
    useEffect(() => {
      const role = localStorage.getItem('role')
      console.log('the role of the user: ', role)

      if (role === 'user') {
        setApi((value) => value + 1)
        router.push('/')
      } else {
        setApi((value) => value + 1)
        router.push('/doctor/onboarding')
      }
    }, []) 

  const { setApi } = useAuth()
  const router = useRouter()
  const features = [
    {
      icon: Shield,
      title: "Secure Process",
      description: "Advanced verification protects your account",
    },
    {
      icon: Zap,
      title: "Quick Verification",
      description: "One-time process to secure your account",
    },
    {
      icon: Sparkles,
      title: "Ready to Go",
      description: "Access all features after verification",
    },
  ];

  const iconBadge = (
    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
      <CheckCircle2 className="w-8 h-8 text-primary-foreground" />
    </div>
  );

  return (
    <InfoLayout
      title="Account Verification"
      subtitle="Securing your account with email verification"
      features={features}
      iconBadge={iconBadge}
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Email Verified!</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Your email has been successfully verified. You can now access all features.
          </p>
        </div>

        <div className="bg-muted border border-border rounded-lg p-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Verification Successful</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your account is now fully activated and ready to use.
            </p>
          </div>
        </div>

        <Link href="/">
          <Button className="w-full">
            Continue to Dashboard
          </Button>
        </Link>

        <p className="text-center text-xs text-muted-foreground">
          Need help?{" "}
          <Link href="/support" className="text-primary hover:underline font-medium">
            Contact Support
          </Link>
        </p>
      </div>
    </InfoLayout>
  );
};

export default EmailVerified;
