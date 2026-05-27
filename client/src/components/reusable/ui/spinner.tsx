import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

export function Spinner({ size = "lg", className }: SpinnerProps) {
  return (
    <Loader2 
      className={cn(
        "animate-spin text-primary", 
        sizeMap[size], 
        className
      )} 
    />
  );
}

// Full page spinner component
export function FullPageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner size="xl" />
    </div>
  );
}

// Centered spinner for sections
export function CenteredSpinner({ size = "lg" }: { size?: "sm" | "md" | "lg" | "xl" }) {
  return (
    <div className="flex items-center justify-center p-8">
      <Spinner size={size} />
    </div>
  );
}
