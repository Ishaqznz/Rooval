'use client'

import { Button } from "@/components/reusable/ui/button";
import Link from 'next/link'
import { InfoLayout } from "@/components/reusable/auth/InfoLayout";
import { Shield, Zap, Sparkles } from "lucide-react";
import { XCircle, ShieldAlert } from "lucide-react";
import { authServiceApi } from "@/services/authApiService";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const VerificationFailed = () => {

  const router = useRouter()

  const handleGetNewLink = async () => {
    try {
      const storedData = localStorage.getItem('userData');
      const userData = JSON.parse(storedData as string)?.input;

      const response = await authServiceApi.signup({
        input: {
          fullName: userData?.fullName,
          email: userData?.email,
          password: userData?.password,
          role: userData?.role
        }
      });

      if (response?.data?.createUser) {
        router.push('/check-email');
        toast.success('Success!');
      } else {
        toast.error('Failed! Try again.');
      }

    } catch (error: any) {
      console.error("Get new link error:", error);

      toast.error(error?.message || 'Something went wrong. Please try again.');
    }
  };

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
    <div className="w-16 h-16 rounded-2xl bg-destructive flex items-center justify-center">
      <ShieldAlert className="w-8 h-8 text-destructive-foreground" />
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
          <h2 className="text-2xl font-bold text-foreground">Verification failed</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Invalid verification link. Please check your email and try again.
          </p>
        </div>

        <div className="bg-muted border border-border rounded-lg p-6 space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-destructive" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-foreground">Verification unsuccessful</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Don't worry, we can help you get back on track.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <Button onClick={handleGetNewLink} variant="outline" className="w-full">
            Get new verification link
          </Button>
        </div>

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

export default VerificationFailed;
