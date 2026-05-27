'use client';

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/reusable/ui/button";
import { Input } from "@/components/reusable/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/reusable/ui/form";
import Link from 'next/link'
import { AuthLayout } from "@/components/reusable/auth/AuthLayout";
import { GoogleButton } from "@/components/reusable/auth/GoogleButton";
import { PasswordField } from "@/components/reusable/auth/PasswordField";
import { authServiceApi } from "@/services/authApiService";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useGoogleLogin } from "@/lib/google-login";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const { setApi } = useAuth();
  const router = useRouter()
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const userData = {
        email: data.email,
        password: data.password
      };

      const response = await authServiceApi.login({
        input: userData
      });

      if (response?.errors) {
        const errorMessage =
          response?.errors?.[0]?.message || 'Something went wrong!';
        toast.error(errorMessage);
        return;
      }

      setApi((value) => value + 1);
      toast.success('Thanks for signing in!');
      router.push('/');

    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error?.message || 'Something went wrong. Please try again.');
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

        setApi((value) => value + 1)
        toast.success('successful!')
        if (role == 'doctor') {
          router.push('/doctor/onboarding')
          return;
        }
        setTimeout(() => {
          router.push('/');
        }, 100);
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
    <AuthLayout title="Welcome Back" subtitle="Sign in to your account">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter your email" {...field} className="text-sm" />
                </FormControl>
              </FormItem>
            )}
          />

          <PasswordField
            control={form.control}
            name="password"
            label="Password"
            placeholder="Enter your password"
          />

          <div className="flex items-center justify-end">
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full">
            Sign In
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
        Don't have an account?{" "}
        <Link href="/signup" className="text-primary hover:underline font-medium">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
