import { ReactNode } from "react";
// import logo from "@/assets/rooval-logo.png";
import { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface InfoLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  features: Feature[];
  iconBadge?: ReactNode;
}

export const InfoLayout = ({ children, title, subtitle, features, iconBadge }: InfoLayoutProps) => {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Content */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center gap-2">
            {/* <img src={logo} alt="Rooval" className="h-8 w-auto" /> */}
            <h1 className="text-xl font-bold text-primary">rooval</h1>
          </div>

          {children}
        </div>
      </div>

      {/* Right side - Features */}
      <div className="hidden lg:flex flex-1 bg-muted items-center justify-center p-12">
        <div className="w-full max-w-md space-y-8">
          {iconBadge && (
            <div className="flex justify-end mb-8">
              {iconBadge}
            </div>
          )}
          
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground">{title}</h2>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>

          <div className="space-y-6 mt-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
