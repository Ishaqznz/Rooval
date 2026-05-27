'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/reusable/ui/button";
import { Form } from "@/components/reusable/ui/form";
import { InfoLayout } from "@/components/reusable/auth/InfoLayout";
import { PasswordField } from "@/components/reusable/auth/PasswordField";
import { KeyRound, Lock, ShieldCheck } from "lucide-react";
import { authServiceApi } from "@/services/authApiService";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const router = useRouter()
  const { setApi } = useAuth()

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      const response = await authServiceApi.resetPassword({
        input: { password: data.password }
      });
      if (response?.errors) {
        const errorMessage =
          response?.errors?.[0]?.message || 'Something went wrong!';
        toast.error(errorMessage);
        return;
      }

      toast.success('Password reset successfully!');
      setApi((value) => value + 1);
      localStorage.removeItem('req');
      router.push('/');

    } catch (error: any) {
      toast.error(error?.message || 'Something went wrong. Please try again.');
    }
  };

  const features = [
    {
      icon: KeyRound,
      title: "Strong Characters",
      description: "Use mix of letters, numbers & symbols",
    },
    {
      icon: Lock,
      title: "Minimum Length",
      description: "At least 8 characters for security",
    },
    {
      icon: ShieldCheck,
      title: "Unique Password",
      description: "Don't reuse passwords from other sites",
    },
  ];

  return (
    <InfoLayout
      title="Secure Your Account"
      subtitle="Create a strong password to keep your healthcare data safe"
      features={features}
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Create New Password</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Your new password must be different from your previous password
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <PasswordField
              control={form.control}
              name="password"
              label="New Password"
              placeholder="Enter your new password"
            />

            <PasswordField
              control={form.control}
              name="confirmPassword"
              label="Confirm New Password"
              placeholder="Confirm your new password"
            />

            <p className="text-xs text-muted-foreground">
              Must be at least 8 characters long
            </p>

            <Button type="submit" className="w-full">
              Update Password
            </Button>
          </form>
        </Form>
      </div>
    </InfoLayout>
  );
};

export default ResetPassword;
