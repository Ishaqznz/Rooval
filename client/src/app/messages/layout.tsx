import MessageGuard from "@/guards/messageGuard";

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MessageGuard>
      {children}
    </MessageGuard>
  );
}