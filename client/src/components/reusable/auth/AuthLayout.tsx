import { ReactNode } from "react";
// import logo from "@/assets/rooval-logo.png";
import authIllustration from "@/assets/auth-illustration.png";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center gap-2">
            {/* <img src={logo.src} alt="Rooval" className="h-8 w-auto" /> */}
            <h1 className="text-xl font-bold text-primary">rooval</h1>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:flex flex-1 bg-primary/5 items-center justify-center p-12">
        <img
          src={authIllustration.src}
          alt="Healthcare illustration"
          className="max-w-md w-full h-auto object-contain"
        />
      </div>
    </div>
  );
};
