"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/reusable/ui/button";
import { Input } from "@/components/reusable/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/reusable/ui/form";
import Link from "next/link";
import { AuthLayout } from "@/components/reusable/auth/AuthLayout";
import { GoogleButton } from "@/components/reusable/auth/GoogleButton";
import { PasswordField } from "@/components/reusable/auth/PasswordField";
import { authServiceApi } from "@/services/authApiService";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/reusable/ui/spinner";
import { useGoogleLogin } from "@/lib/google-login";

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(100, "Full name is too long"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

const Signup = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    if (loading) return;

    const role = localStorage.getItem("role") as string
    if (!role) {
      toast.error('can you please select the role!')
      router.push('/role-selection')
      return;
    }

    setLoading(true);

    const userData = {
      input: {
        fullName: data.fullName,
        email: data.email,
        role: role,
        password: data.password,
      },
    };

    localStorage.setItem('userData', JSON.stringify(userData))

    try {
      const response = await authServiceApi.signup(userData);

      if (response.errors) {
        toast.error(response.errors[0].message || "something went wrong!");
        setLoading(false);
        return;
      }

      toast.success(
        `Success!`
      );

      router.push("/check-email");
    } catch (err) {
      toast.error("Something went wrong!");
      setLoading(false);
    }
  };

  const { login, isReady, payload } = useGoogleLogin();

  useEffect(() => {
    const submitGoogleAuth = async () => {
      if (!payload) return; 

      const role = localStorage.getItem('role');
      if (!role) {
        toast.error('role is not selected yet!');
        router.push('/role-selection')
        return;
      }

      try {
        console.log("Google payload: ", payload);

        const login = await authServiceApi.googleAuth({
          input: {
            fullName: payload.name,
            email: payload.email,
            googleId: payload.sub,
            role: role
          }
        });

        if (login?.errors) {
          toast.error('Google Auth failed!')
          return;
        }

        toast.success('successful!')
        if (role == 'doctor') {
          router.push('/doctor/onboarding')
          return;
        }
        router.push('/')
      } catch (err) {
        toast.error("Google authentication failed");
      }
    };

    submitGoogleAuth();
  }, [payload]);


  const handleGoogleLogin = () => {
    if (!isReady) {
      toast.error("Google Login is not ready yet!");
      return;
    }

    login();
    console.log("Google login clicked!");
  };

  return (
    <AuthLayout title="Create Account" subtitle="Join Rooval today">

      {/* Global centered full page Loader Overlay */}
      {loading && (
        <div className="absolute inset-0 flex justify-center items-center z-50 bg-white/20">
          <Spinner size="lg" />
        </div>
      )}


      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Full Name</FormLabel>
                <FormControl>
                  <Input disabled={loading} placeholder="Enter your full name" {...field} className="text-sm" />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Email</FormLabel>
                <FormControl>
                  <Input disabled={loading} type="email" placeholder="Enter your email" {...field} className="text-sm" />
                </FormControl>
              </FormItem>
            )}
          />

          <PasswordField
            control={form.control}
            name="password"
            label="Password"
            placeholder="Create a password"
          />

          <PasswordField
            control={form.control}
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Confirm your password"
          />

          <Button disabled={loading} type="submit" className="w-full">
            Sign Up
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <GoogleButton onClick={handleGoogleLogin} text="Continue with Google" />
        </form>
      </Form>

      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </p>
      <div id="google-signin-button"></div>
    </AuthLayout>
  );
};

export default Signup;
