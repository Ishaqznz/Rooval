import { Suspense } from "react";
import MessageGuard from "@/guards/messageGuard";

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
      </div>
    }>
      <MessageGuard>
        {children}
      </MessageGuard>
    </Suspense>
  );
}