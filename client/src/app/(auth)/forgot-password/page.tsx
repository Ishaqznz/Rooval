'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/reusable/ui/button";
import { Input } from "@/components/reusable/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/reusable/ui/form";
import Link from 'next/link'
import { InfoLayout } from "@/components/reusable/auth/InfoLayout";
import { Zap, Shield, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { authServiceApi } from "@/services/authApiService";
import { toast } from "sonner";
import { da } from "zod/v4/locales";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword = () => {
  const router = useRouter()
  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const response = await authServiceApi.forgotPassword({
        input: { email: data.email }
      });

      if (response?.errors || response?.data?.forgotPassword === false) {
        const errorMessage =
          response?.errors?.[0]?.message || 'Something went wrong!';
        toast.error(errorMessage);
        return;
      }

      localStorage.setItem(
        'req',
        JSON.stringify({ value: true, email: data.email })
      );

      toast.success('Verification sent to your email!');
      router.push('/check-email');

    } catch (error: any) {
      toast.error(error?.message || 'Something went wrong. Please try again.');
    }
  };


  const features = [
    {
      icon: Zap,
      title: "Quick & Easy",
      description: "Reset link delivered in seconds",
    },
    {
      icon: Shield,
      title: "Secure Process",
      description: "Encrypted links with time limits",
    },
    {
      icon: Smartphone,
      title: "Mobile Friendly",
      description: "Reset from any device, anywhere",
    },
  ];

  return (
    <InfoLayout
      title="Secure Reset Process"
      subtitle="We'll send you a secure link to reset your password safely"
      features={features}
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reset Password</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your email address" {...field} className="text-sm" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Send Reset Link
            </Button>
          </form>
        </Form>

        <p className="text-center text-xs text-muted-foreground">
          Remember your password?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Back to Sign In
          </Link>
        </p>
      </div>
    </InfoLayout>
  );
};

export default ForgotPassword;
