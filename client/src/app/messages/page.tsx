'use client';

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/reusable/ui/button";
import { Input } from "@/components/reusable/ui/input";
import {
  Send, Search, Phone, Video, MoreVertical, Paperclip,
  Smile, ChevronLeft, Check, CheckCheck, Circle, ImageIcon,
  X, LogOut, Trash2,
  MessageSquare, FileText, Download, ZoomIn, Loader2,
  AlertCircle, RefreshCw, UploadCloud,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { connectSocket, disconnectSocket, getSocket } from "@/sockets/socket";
import { sendMessage as emitMessage, onReceiveMessage } from "@/sockets/chat.socket";
import { doctorServiceApi } from "@/services/doctorApiService";
import { useRouter, useSearchParams } from "next/navigation";
import { conversationApiService } from "@/services/conversationApiService";
import { messageApiService } from "@/services/messageApiService";
import { userServiceApi } from "@/services/userApiService";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; 

const MY_ROLE = "USER";

const EMOJI_LIST = [
  "😀", "😂", "😊", "😍", "🥰", "😎", "🤔", "😢", "😭", "😡",
  "👍", "👎", "👏", "🙏", "❤️", "🔥", "✅", "⚠️", "💊", "🏥",
  "🩺", "💉", "🩻", "🧬", "🫀", "🫁", "🧠", "👁️", "🦷", "🦴",
];

// ─── Types ────────────────────────────────────────────────────────────────────

type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed" | "SENT" | "DELIVERED" | "READ";
type MessageType = "text" | "document" | "emoji" | "image";

interface ApiMessage {
  id: string;
  conversationId: string;
  sender: { userId: string; role: "USER" | "DOCTOR" };
  content: string;
  type: string;
  fileUrl: string | null;
  fileName: string | null;
  mimeType: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderRole: "USER" | "DOCTOR";
  timestamp: Date;
  status: MessageStatus;
  type: MessageType;
  fileName?: string;
  fileUrl?: string;
  mimeType?: string;
  _objectUrl?: string;
  _retryPayload?: {
    receiverId: string;
    message: string;
    type: MessageType;
    fileName?: string;
    fileUrl?: string;
    mimeType?: string;
  };
}

interface ApiConversation {
  id: string;
  participants: { userId: string; role: "USER" | "DOCTOR" }[];
  lastMessage: string;
  lastMessageType: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

interface DoctorInfo {
  id: string;
  fullName: string;
  email: string;
  profilePhoto?: string;
  profile?: { personal?: { specializations?: string[] } };
}

interface Conversation {
  id: string;
  doctorId: string;
  doctor: DoctorInfo | null;
  lastMessage: string;
  lastMessageType: string;
  lastMessageAt: string;
  unread: number;
  messages: Message[];
  messagesLoaded: boolean;
}

interface GhostConversation {
  doctorId: string;
  doctor: DoctorInfo;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (date: Date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const formatDate = (date: Date) => {
  const now = new Date();
  const days = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return date.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
};

const formatLastTime = (isoString: string) => {
  const date = new Date(isoString);
  const now = new Date();
  const days = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (days === 0) return formatTime(date);
  if (days === 1) return "Yesterday";
  if (days < 7) return date.toLocaleDateString([], { weekday: "short" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

const groupMessagesByDate = (messages: Message[]) => {
  const groups: { date: string; messages: Message[] }[] = [];
  let currentDate = "";
  for (const msg of messages) {
    const d = formatDate(msg.timestamp);
    if (d !== currentDate) {
      groups.push({ date: d, messages: [] });
      currentDate = d;
    }
    groups[groups.length - 1].messages.push(msg);
  }
  return groups;
};

const getInitials = (name: string) => {
  if (!name) return "??";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
};

const mapApiMessageToMessage = (apiMsg: ApiMessage, myUserId: string): Message => ({
  id: apiMsg.id,
  content: apiMsg.content,
  senderId: apiMsg.sender.userId,
  senderRole: apiMsg.sender.userId === myUserId ? "USER" : "DOCTOR",
  timestamp: new Date(apiMsg.createdAt),
  status: apiMsg.status as MessageStatus,
  type: (apiMsg.type?.toLowerCase() as MessageType) ?? "text",
  fileUrl: apiMsg.fileUrl ?? undefined,
  fileName: apiMsg.fileName ?? undefined,
  mimeType: apiMsg.mimeType ?? undefined,
});

const uploadFile = async (file: File): Promise<string> => {
  console.log('the file for sending into the database: ', file)
  const response = await messageApiService.uploadFile({ input: { file } })
  if (response?.errors) throw new Error('Server errror! Please try again.')
  const url = response?.data?.uploadMessageFile;
  if (!url) throw new Error("Upload response did not include a URL.");
  return url;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const Avatar = ({
  initials, photoUrl, online, size = "md",
}: {
  initials: string; photoUrl?: string; online?: boolean; size?: "sm" | "md" | "lg";
}) => {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base" };
  return (
    <div className="relative flex-shrink-0">
      {photoUrl ? (
        <img src={photoUrl} alt={initials} className={cn("rounded-full object-cover", sizes[size])} />
      ) : (
        <div className={cn("rounded-full bg-primary flex items-center justify-center font-semibold text-primary-foreground", sizes[size])}>
          {initials}
        </div>
      )}
      {online !== undefined && (
        <span className={cn("absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-background", online ? "bg-green-500" : "bg-muted-foreground")} />
      )}
    </div>
  );
};

const StatusIcon = ({ status }: { status: MessageStatus }) => {
  const s = String(status).toLowerCase();
  if (s === "sending") return <Circle className="w-3 h-3 text-muted-foreground animate-pulse" />;
  if (s === "sent") return <Check className="w-3 h-3 text-muted-foreground" />;
  if (s === "delivered") return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
  if (s === "read") return <CheckCheck className="w-3 h-3 text-primary" />;
  if (s === "failed") return <AlertCircle className="w-3 h-3 text-destructive" />;
  return <Check className="w-3 h-3 text-muted-foreground" />;
};

const ConversationItem = ({
  conv, active, onClick,
}: {
  conv: Conversation; active: boolean; onClick: () => void;
}) => {
  const name = conv.doctor?.fullName ?? "Loading…";
  const initials = getInitials(name);
  const photoUrl = conv.doctor?.profilePhoto;
  const lastMsgPreview =
    conv.lastMessageType === "image" ? "📷 Image"
      : conv.lastMessageType === "document" ? "📎 Document"
        : conv.lastMessage;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 text-left",
        active ? "bg-primary/10 shadow-sm" : "hover:bg-accent/50"
      )}
    >
      <Avatar initials={initials} photoUrl={photoUrl} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={cn("font-medium text-sm truncate", active ? "text-primary" : "text-foreground")}>{name}</span>
          <span className="text-[11px] text-muted-foreground flex-shrink-0">{formatLastTime(conv.lastMessageAt)}</span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground truncate">{lastMsgPreview}</span>
          {conv.unread > 0 && (
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {conv.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

const ImageModal = ({ src, onClose }: { src: string; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
    <div className="relative max-w-3xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
      <button onClick={onClose} className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors">
        <X className="w-6 h-6" />
      </button>
      <img src={src} alt="Preview" className="w-full h-full object-contain rounded-lg" />
    </div>
  </div>
);


// const MessageBubble = ({
//   msg, isMe, onImageClick, onRetry,
// }: {
//   msg: Message; isMe: boolean; onImageClick: (url: string) => void; onRetry?: (msg: Message) => void;
// }) => {
//   const isImage = msg.type === "image";
//   const isDocument = msg.type === "document";
//   const isFailed = String(msg.status).toLowerCase() === "failed";

//   return (
//     <div className={cn("flex flex-col gap-1", isMe ? "items-end" : "items-start")}>
//       <div className={cn("flex items-end gap-2 group", isMe ? "flex-row-reverse" : "flex-row")}>
//         <div
//           className={cn(
//             "max-w-[70%] rounded-2xl text-sm leading-relaxed shadow-sm overflow-hidden",
//             isMe
//               ? isFailed
//                 ? "bg-destructive/10 text-foreground border border-destructive/30 rounded-br-sm"
//                 : "bg-primary text-primary-foreground rounded-br-sm"
//               : "bg-card text-card-foreground border border-border rounded-bl-sm",
//             isImage ? "p-1" : "px-4 py-2.5"
//           )}
//         >
//           {isImage && msg.fileUrl ? (
//             <div className="relative group/img">
//               <img
//                 src={msg.fileUrl}
//                 alt={msg.fileName || "Image"}
//                 className="rounded-xl max-w-[260px] max-h-[200px] object-cover cursor-pointer"
//                 onClick={() => onImageClick(msg.fileUrl!)}
//               />
//               <button
//                 onClick={() => onImageClick(msg.fileUrl!)}
//                 className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 flex items-center justify-center transition-all rounded-xl"
//               >
//                 <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
//               </button>
//               <div className={cn("flex items-center gap-1 px-2 pb-1 mt-1", isMe ? "justify-end" : "justify-start")}>
//                 <span className={cn("text-[10px]", isMe ? "text-primary-foreground/70" : "text-muted-foreground")}>
//                   {formatTime(msg.timestamp)}
//                 </span>
//                 {isMe && <StatusIcon status={msg.status} />}
//               </div>
//             </div>
//           ) : isDocument ? (
//             <div>
//               <div className={cn(
//                 "flex items-center gap-3 p-3 rounded-xl border",
//                 isMe ? (isFailed ? "border-destructive/30" : "border-primary-foreground/20") : "border-border"
//               )}>
//                 <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
//                   isMe ? (isFailed ? "bg-destructive/10" : "bg-primary-foreground/20") : "bg-primary/10"
//                 )}>
//                   <FileText className={cn("w-5 h-5", isMe ? (isFailed ? "text-destructive" : "text-primary-foreground") : "text-primary")} />
//                 </div>
//                 <div className="min-w-0 flex-1">
//                   <p className={cn("text-xs font-medium truncate", isMe ? (isFailed ? "text-foreground" : "text-primary-foreground") : "text-foreground")}>
//                     {msg.fileName || "Document"}
//                   </p>
//                   <p className={cn("text-[10px]", isMe ? (isFailed ? "text-muted-foreground" : "text-primary-foreground/60") : "text-muted-foreground")}>
//                     {msg.fileUrl ? "Tap to download" : "Uploading…"}
//                   </p>
//                 </div>
//                 {msg.fileUrl && (
//                   <a
//                     href={msg.fileUrl}
//                     download={msg.fileName || "document"}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     onClick={(e) => e.stopPropagation()}
//                     aria-label="Download document"
//                   >
//                     <Download className={cn("w-4 h-4 flex-shrink-0 cursor-pointer", isMe ? (isFailed ? "text-muted-foreground" : "text-primary-foreground/70") : "text-muted-foreground")} />
//                   </a>
//                 )}
//               </div>
//               <div className={cn("flex items-center gap-1 mt-1", isMe ? "justify-end" : "justify-start")}>
//                 <span className={cn("text-[10px]", isMe ? (isFailed ? "text-muted-foreground" : "text-primary-foreground/70") : "text-muted-foreground")}>
//                   {formatTime(msg.timestamp)}
//                 </span>
//                 {isMe && <StatusIcon status={msg.status} />}
//               </div>
//             </div>
//           ) : (
//             <div>
//               <p className={msg.type === "emoji" ? "text-3xl" : ""}>{msg.content}</p>
//               <div className={cn("flex items-center gap-1 mt-1", isMe ? "justify-end" : "justify-start")}>
//                 <span className={cn("text-[10px]", isMe ? (isFailed ? "text-muted-foreground" : "text-primary-foreground/70") : "text-muted-foreground")}>
//                   {formatTime(msg.timestamp)}
//                 </span>
//                 {isMe && <StatusIcon status={msg.status} />}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//       {isMe && isFailed && onRetry && (
//         <button
//           onClick={() => onRetry(msg)}
//           className="flex items-center gap-1 text-[11px] text-destructive hover:text-destructive/80 transition-colors mr-1"
//         >
//           <RefreshCw className="w-3 h-3" />
//           Failed · Tap to retry
//         </button>
//       )}
//     </div>
//   );
// };

const MessageBubble = ({
  msg, isMe, onImageClick, onRetry,
}: {
  msg: Message; isMe: boolean; onImageClick: (url: string) => void; onRetry?: (msg: Message) => void;
}) => {
  const isImage = msg.type === "image";
  const isDocument = msg.type === "document";
  const isFailed = String(msg.status).toLowerCase() === "failed";
  const [downloading, setDownloading] = useState(false);

  const handleDocumentDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!msg.fileUrl || downloading) return;

    // Supabase supports ?download= query param to force download
    const url = new URL(msg.fileUrl);
    url.searchParams.set('download', msg.fileName || 'document');

    const anchor = document.createElement('a');
    anchor.href = url.toString();
    anchor.download = msg.fileName || 'document';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  return (
    <div className={cn("flex flex-col gap-1", isMe ? "items-end" : "items-start")}>
      <div className={cn("flex items-end gap-2 group", isMe ? "flex-row-reverse" : "flex-row")}>
        <div
          className={cn(
            "max-w-[70%] rounded-2xl text-sm leading-relaxed shadow-sm overflow-hidden",
            isMe
              ? isFailed
                ? "bg-destructive/10 text-foreground border border-destructive/30 rounded-br-sm"
                : "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-card text-card-foreground border border-border rounded-bl-sm",
            isImage ? "p-1" : "px-4 py-2.5"
          )}
        >
          {isImage && msg.fileUrl ? (
            <div className="relative group/img">
              <img
                src={msg.fileUrl}
                alt={msg.fileName || "Image"}
                className="rounded-xl max-w-[260px] max-h-[200px] object-cover cursor-pointer"
                onClick={() => onImageClick(msg.fileUrl!)}
              />
              <button
                onClick={() => onImageClick(msg.fileUrl!)}
                className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 flex items-center justify-center transition-all rounded-xl"
              >
                <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover/img:opacity-100 transition-opacity" />
              </button>
              <div className={cn("flex items-center gap-1 px-2 pb-1 mt-1", isMe ? "justify-end" : "justify-start")}>
                <span className={cn("text-[10px]", isMe ? "text-primary-foreground/70" : "text-muted-foreground")}>
                  {formatTime(msg.timestamp)}
                </span>
                {isMe && <StatusIcon status={msg.status} />}
              </div>
            </div>
          ) : isDocument ? (
            <div>
              <div className={cn(
                "flex items-center gap-3 p-3 rounded-xl border",
                isMe ? (isFailed ? "border-destructive/30" : "border-primary-foreground/20") : "border-border"
              )}>
                <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                  isMe ? (isFailed ? "bg-destructive/10" : "bg-primary-foreground/20") : "bg-primary/10"
                )}>
                  <FileText className={cn("w-5 h-5", isMe ? (isFailed ? "text-destructive" : "text-primary-foreground") : "text-primary")} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-xs font-medium truncate", isMe ? (isFailed ? "text-foreground" : "text-primary-foreground") : "text-foreground")}>
                    {msg.fileName || "Document"}
                  </p>
                  <p className={cn("text-[10px]", isMe ? (isFailed ? "text-muted-foreground" : "text-primary-foreground/60") : "text-muted-foreground")}>
                    {msg.fileUrl ? (downloading ? "Downloading…" : "Tap to download") : "Uploading…"}
                  </p>
                </div>
                {msg.fileUrl && (
                  <button
                    onClick={handleDocumentDownload}
                    disabled={downloading}
                    aria-label="Download document"
                    className="flex-shrink-0 disabled:opacity-50"
                  >
                    {downloading
                      ? <Loader2 className={cn("w-4 h-4 animate-spin", isMe ? (isFailed ? "text-muted-foreground" : "text-primary-foreground/70") : "text-muted-foreground")} />
                      : <Download className={cn("w-4 h-4 cursor-pointer", isMe ? (isFailed ? "text-muted-foreground" : "text-primary-foreground/70") : "text-muted-foreground")} />
                    }
                  </button>
                )}
              </div>
              <div className={cn("flex items-center gap-1 mt-1", isMe ? "justify-end" : "justify-start")}>
                <span className={cn("text-[10px]", isMe ? (isFailed ? "text-muted-foreground" : "text-primary-foreground/70") : "text-muted-foreground")}>
                  {formatTime(msg.timestamp)}
                </span>
                {isMe && <StatusIcon status={msg.status} />}
              </div>
            </div>
          ) : (
            <div>
              <p className={msg.type === "emoji" ? "text-3xl" : ""}>{msg.content}</p>
              <div className={cn("flex items-center gap-1 mt-1", isMe ? "justify-end" : "justify-start")}>
                <span className={cn("text-[10px]", isMe ? (isFailed ? "text-muted-foreground" : "text-primary-foreground/70") : "text-muted-foreground")}>
                  {formatTime(msg.timestamp)}
                </span>
                {isMe && <StatusIcon status={msg.status} />}
              </div>
            </div>
          )}
        </div>
      </div>
      {isMe && isFailed && onRetry && (
        <button
          onClick={() => onRetry(msg)}
          className="flex items-center gap-1 text-[11px] text-destructive hover:text-destructive/80 transition-colors mr-1"
        >
          <RefreshCw className="w-3 h-3" />
          Failed · Tap to retry
        </button>
      )}
    </div>
  );
};
const EmojiPicker = ({ onSelect, onClose }: { onSelect: (emoji: string) => void; onClose: () => void }) => (
  <div className="absolute bottom-14 right-12 z-30 bg-popover border border-border rounded-2xl shadow-xl p-3 w-64">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Emojis</span>
      <button onClick={onClose}><X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" /></button>
    </div>
    <div className="grid grid-cols-8 gap-1">
      {EMOJI_LIST.map((emoji) => (
        <button
          key={emoji}
          onClick={() => { onSelect(emoji); onClose(); }}
          className="text-xl hover:bg-accent rounded-lg p-1 transition-colors leading-none"
        >
          {emoji}
        </button>
      ))}
    </div>
  </div>
);

const FilePreviewBar = ({
  file, preview, uploading, onRemove,
}: {
  file: File; preview?: string; uploading?: boolean; onRemove: () => void;
}) => (
  <div className="px-4 pt-2 flex items-center gap-3 bg-accent/30 border-t border-border">
    {preview ? (
      <img src={preview} alt="preview" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
    ) : (
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <FileText className="w-6 h-6 text-primary" />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-foreground truncate">{file.name}</p>
      <p className="text-[10px] text-muted-foreground">
        {uploading ? "Uploading…" : `${(file.size / 1024).toFixed(1)} KB`}
      </p>
    </div>
    {uploading ? (
      <Loader2 className="w-4 h-4 text-muted-foreground animate-spin flex-shrink-0" />
    ) : (
      <button onClick={onRemove} className="flex-shrink-0 p-1 hover:bg-destructive/10 rounded-lg transition-colors">
        <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
      </button>
    )}
  </div>
);

const FileErrorBanner = ({ message, onDismiss }: { message: string; onDismiss: () => void }) => (
  <div className="mx-4 mb-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs">
    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
    <span className="flex-1">{message}</span>
    <button onClick={onDismiss}><X className="w-3 h-3" /></button>
  </div>
);

const TypingIndicator = () => (
  <div className="flex items-end gap-2">
    <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
        ))}
      </div>
    </div>
  </div>
);

// ─── InputBar ─────────────────────────────────────────────────────────────────

interface InputBarProps {
  placeholder: string;
  input: string;
  setInput: (val: string) => void;
  selectedFile: File | null;
  uploading: boolean;
  showEmoji: boolean;
  setShowEmoji: (val: boolean | ((prev: boolean) => boolean)) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  imageInputRef: React.RefObject<HTMLInputElement | null>;
  onSend: () => void;
  onTyping: () => void;
  onEmojiSelect: (emoji: string) => void;
}

const InputBar = ({
  placeholder, input, setInput, selectedFile, uploading, showEmoji, setShowEmoji,
  inputRef, fileInputRef, imageInputRef, onSend, onTyping, onEmojiSelect,
}: InputBarProps) => {
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
  };

  const canSend = (input.trim() || selectedFile) && !uploading;

  return (
    <div className="px-4 py-3 border-t border-border bg-background relative">
      {showEmoji && <EmojiPicker onSelect={onEmojiSelect} onClose={() => setShowEmoji(false)} />}
      <div className="flex items-center gap-2 bg-accent/40 rounded-2xl px-3 py-1.5 border border-border focus-within:border-ring focus-within:bg-background transition-colors">
        <Button
          variant="ghost" size="icon"
          className="w-7 h-7 flex-shrink-0 rounded-lg text-muted-foreground hover:text-primary hover:bg-transparent"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Paperclip className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost" size="icon"
          className="w-7 h-7 flex-shrink-0 rounded-lg text-muted-foreground hover:text-primary hover:bg-transparent"
          onClick={() => imageInputRef.current?.click()}
          disabled={uploading}
        >
          <ImageIcon className="w-4 h-4" />
        </Button>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => { setInput(e.target.value); onTyping(); }}
          onKeyDown={handleKey}
          placeholder={uploading ? "Uploading file…" : selectedFile ? "Add a caption…" : placeholder}
          disabled={uploading}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none py-1.5 min-w-0 disabled:opacity-60"
        />
        <Button
          variant="ghost" size="icon"
          className={cn("w-7 h-7 flex-shrink-0 rounded-lg hover:bg-transparent transition-colors", showEmoji ? "text-primary" : "text-muted-foreground hover:text-primary")}
          onClick={() => setShowEmoji((s) => !s)}
          disabled={uploading}
        >
          <Smile className="w-4 h-4" />
        </Button>
        <Button
          onClick={onSend}
          disabled={!canSend}
          size="icon"
          className="w-8 h-8 flex-shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-secondary disabled:opacity-40 transition-all"
        >
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        </Button>
      </div>
      <p className="text-center text-[10px] text-muted-foreground mt-2">
        Messages are end-to-end encrypted · For emergencies, call 911
      </p>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const PatientChatPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [ghost, setGhost] = useState<GhostConversation | null>(null);
  const [ghostLoading, setGhostLoading] = useState(false);
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | undefined>(undefined);
  const [imageModal, setImageModal] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [fileError, setFileError] = useState<string | null>(null);
  /** True while the HTTP upload is in-flight */
  const [uploading, setUploading] = useState(false);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const active = conversations.find((c) => c.id === activeConvId) ?? null;
  const filtered = conversations.filter(
    (c) =>
      (c.doctor?.fullName ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const grouped = active ? groupMessagesByDate(active.messages) : [];

  // ── API helpers ──────────────────────────────────────────────────────────────

  const fetchDoctorInfo = async (doctorId: string): Promise<DoctorInfo | null> => {
    try {
      const response = await doctorServiceApi.get(
        { input: { doctorId } },
        `id fullName email profilePhoto profile { personal { specializations } }`
      );
      return response?.data?.getDoctor ?? null;
    } catch (err) {
      console.error("Failed to fetch doctor info:", err);
      return null;
    }
  };

  const fetchConversations = useCallback(async () => {
    try {
      setConversationsLoading(true);
      const response = await conversationApiService.getUserConversations(`
        id participants { userId role }
        lastMessage lastMessageType lastMessageAt createdAt updatedAt
      `);
      const apiConvs: ApiConversation[] = response?.data?.getUserConversations ?? [];
      const convs: Conversation[] = apiConvs.map((c) => {
        const doctorParticipant = c.participants.find((p) => p.role === "DOCTOR");
        return {
          id: c.id,
          doctorId: doctorParticipant?.userId ?? "",
          doctor: null,
          lastMessage: c.lastMessage ?? "",
          lastMessageType: c.lastMessageType ?? "text",
          lastMessageAt: c.lastMessageAt ?? c.createdAt,
          unread: 0,
          messages: [],
          messagesLoaded: false,
        };
      });
      setConversations(convs);
      convs.forEach(async (conv) => {
        if (!conv.doctorId) return;
        const doctor = await fetchDoctorInfo(conv.doctorId);
        if (doctor) setConversations((prev) => prev.map((c) => (c.id === conv.id ? { ...c, doctor } : c)));
      });
      return convs;
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
      return [];
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const user = await userServiceApi.findOne({ fields: `id fullName email isAdmin isBlocked` });
      const uid: string | undefined = user?.data?.findUser?.id;
      setUserId(uid);
      if (!uid) return;

      setMessagesLoading(true);
      const response = await messageApiService.get(
        { input: { conversationId } },
        `id conversationId sender { userId } content type fileUrl fileName mimeType status createdAt updatedAt`
      );
      const apiMessages: ApiMessage[] = response?.data?.getMessages ?? [];
      const messages = apiMessages.map((m) => mapApiMessageToMessage(m, uid));
      setConversations((prev) =>
        prev.map((c) => c.id === conversationId ? { ...c, messages, messagesLoaded: true, unread: 0 } : c)
      );
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  // ── Effects ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const doctorId = searchParams.get("id");
    fetchConversations().then((convs) => {
      if (doctorId) {
        const existing = convs.find((c) => c.doctorId === doctorId);
        if (existing) {
          setGhost(null);
          setActiveConvId(existing.id);
          fetchMessages(existing.id);
        } else {
          setActiveConvId(null);
          setGhostLoading(true);
          fetchDoctorInfo(doctorId).then((doctor) => {
            if (doctor) setGhost({ doctorId, doctor });
            setGhostLoading(false);
          });
        }
      } else if (convs.length > 0) {
        setGhost(null);
        setActiveConvId(convs[0].id);
        fetchMessages(convs[0].id);
      }
    });
  }, []);

  useEffect(() => {
    const socket = connectSocket();
    const cleanup = onReceiveMessage((data: any) => {
      const incomingMsg: Message = {
        id: `recv-${Date.now()}`,
        content: data.message ?? data.content,
        senderId: data.senderId,
        senderRole: "DOCTOR",
        timestamp: new Date(data.timestamp ?? Date.now()),
        status: "delivered",
        type: (data.type?.toLowerCase() as MessageType) ?? "text",
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        mimeType: data.mimeType,
      };
      setConversations((prev) =>
        prev.map((c) => {
          const isMatch = (data.conversationId && c.id === data.conversationId) || c.doctorId === data.senderId;
          if (!isMatch) return c;
          return {
            ...c,
            messages: [...c.messages, incomingMsg],
            lastMessage: data.type?.toLowerCase() === "text" ? (data.message ?? data.content) : `📎 ${data.fileName || data.type}`,
            lastMessageType: data.type?.toLowerCase() ?? "text",
            lastMessageAt: new Date().toISOString(),
            unread: c.id !== activeConvId ? c.unread + 1 : 0,
          };
        })
      );
    });
    socket.on("newConversation", () => { fetchConversations(); });
    return () => {
      cleanup?.();
      socket.off("typing");
      socket.off("newConversation");
      disconnectSocket();
    };
  }, [activeConvId, conversations, fetchConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages.length]);

  // Revoke object URLs when file is cleared to prevent memory leaks
  useEffect(() => {
    if (!selectedFile && filePreview && filePreview.startsWith("blob:")) {
      URL.revokeObjectURL(filePreview);
    }
  }, [selectedFile, filePreview]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleSelectConversation = (convId: string) => {
    setActiveConvId(convId);
    setGhost(null);
    setShowInfo(false);
    setIsTyping(false);
    const conv = conversations.find((c) => c.id === convId);
    if (!conv) return;
    if (conv.doctorId) router.push(`?id=${conv.doctorId}`, { scroll: false });
    setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, unread: 0 } : c)));
    if (!conv.messagesLoaded) fetchMessages(convId);
  };

  const handleTyping = useCallback(() => {
    const receiverId = active?.doctorId ?? ghost?.doctorId;
    if (!receiverId) return;
    const socket = getSocket();
    if (socket) socket.emit("typing", { receiverId, isTyping: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (socket) socket.emit("typing", { receiverId, isTyping: false });
    }, 1500);
  }, [active, ghost]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "document") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError(`"${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 10 MB.`);
      e.target.value = "";
      return;
    }

    setFileError(null);
    setSelectedFile(file);

    if (type === "image") {
      // Object URL for preview only — never sent over the wire
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(undefined);
    }
    e.target.value = "";
  };

  const emitAndTrack = useCallback(
    (
      conversationId: string,
      tempId: string,
      payload: { receiverId: string; message: string; type: MessageType; fileName?: string; fileUrl?: string; mimeType?: string }
    ) => {
      try {
        emitMessage(payload);
      } catch (err) {
        console.error("Socket emit error:", err);
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? { ...c, messages: c.messages.map((m) => m.id === tempId ? { ...m, status: "failed" as MessageStatus } : m) }
              : c
          )
        );
        return;
      }
      setTimeout(() => {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? { ...c, messages: c.messages.map((m) => m.id === tempId ? { ...m, status: "delivered" as MessageStatus } : m) }
              : c
          )
        );
      }, 800);
    },
    []
  );

  const handleRetry = useCallback(
    (msg: Message) => {
      if (!active || !msg._retryPayload) return;
      setConversations((prev) =>
        prev.map((c) =>
          c.id === active.id
            ? { ...c, messages: c.messages.map((m) => m.id === msg.id ? { ...m, status: "sending" as MessageStatus } : m) }
            : c
        )
      );
      emitAndTrack(active.id, msg.id, msg._retryPayload);
    },
    [active, emitAndTrack]
  );

  const sendMessage = useCallback(async () => {
    if (!input.trim() && !selectedFile) return;
    const targetDoctorId = active?.doctorId ?? ghost?.doctorId;
    if (!targetDoctorId) return;

    let msgType: MessageType = "text";
    let content = input.trim();
    let remoteFileUrl: string | undefined;
    let fileName: string | undefined;
    let mimeType: string | undefined;
    let localObjectUrl: string | undefined;

    if (selectedFile) {
      fileName = selectedFile.name;
      mimeType = selectedFile.type;
      msgType = selectedFile.type.startsWith("image/") ? "image" : "document";
      content = input.trim() || fileName;
      localObjectUrl = filePreview;

      setUploading(true);
      try {
        remoteFileUrl = await uploadFile(selectedFile);
      } catch (err: any) {
        // setFileError(err?.message ?? "Upload failed. Please try again.");
        setFileError(err?.message || "Upload failed. Please try again!")
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    // Clear UI immediately after upload succeeds
    setInput("");
    setSelectedFile(null);
    setFilePreview(undefined);
    setFileError(null);
    inputRef.current?.focus();

    const retryPayload = {
      receiverId: targetDoctorId,
      message: content,
      type: msgType,
      fileName,
      fileUrl: remoteFileUrl, // short URL string, not base64
      mimeType,
    };

    // ── Ghost path ────────────────────────────────────────────────────────────
    if (!active && ghost) {
      emitMessage(retryPayload);
      const pollForConversation = async (retries = 10, delay = 600) => {
        for (let i = 0; i < retries; i++) {
          await new Promise((r) => setTimeout(r, delay));
          const convs = await fetchConversations();
          const created = convs.find((c) => c.doctorId === targetDoctorId);
          if (created) {
            setGhost(null);
            setActiveConvId(created.id);
            fetchMessages(created.id);
            router.push(`?id=${targetDoctorId}`, { scroll: false });
            return;
          }
        }
        console.warn("Conversation did not appear after polling.");
      };
      pollForConversation();
      return;
    }

    if (!active) return;

    const tempId = `temp-${Date.now()}`;
    const newMsg: Message = {
      id: tempId,
      content,
      senderId: userId ?? "me",
      senderRole: MY_ROLE,
      timestamp: new Date(),
      status: "sending",
      type: msgType,
      // For image preview show the local object URL until the remote URL arrives via socket
      fileUrl: msgType === "image" ? (localObjectUrl ?? remoteFileUrl) : remoteFileUrl,
      fileName,
      mimeType,
      _objectUrl: localObjectUrl,
      _retryPayload: retryPayload,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? {
            ...c,
            messages: [...c.messages, newMsg],
            lastMessage: msgType === "text" ? content : `📎 ${fileName}`,
            lastMessageType: msgType,
            lastMessageAt: new Date().toISOString(),
          }
          : c
      )
    );

    emitAndTrack(active.id, tempId, retryPayload);
  }, [input, active, ghost, selectedFile, filePreview, fetchConversations, fetchMessages, router, userId, emitAndTrack]);

  const handleEmojiSelect = (emoji: string) => {
    setInput((prev) => prev + emoji);
    inputRef.current?.focus();
  };

  const inputBarProps: InputBarProps = {
    input, setInput, selectedFile, uploading, showEmoji, setShowEmoji,
    inputRef, fileInputRef, imageInputRef,
    onSend: sendMessage, onTyping: handleTyping, onEmojiSelect: handleEmojiSelect,
    placeholder: "",
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx" className="hidden" onChange={(e) => handleFileSelect(e, "document")} />
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, "image")} />

      {imageModal && <ImageModal src={imageModal} onClose={() => setImageModal(null)} />}

      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside className={cn("flex flex-col border-r border-border bg-background transition-all duration-300", showSidebar ? "w-80 xl:w-96" : "w-0 overflow-hidden")}>
        <div className="px-4 pt-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="font-semibold text-base text-foreground">Messages</h1>
          </div>
        </div>

        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-xs bg-accent/50 border-transparent focus:border-ring rounded-xl"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
          {conversationsLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {searchQuery ? "No conversations found" : "No conversations yet"}
            </div>
          ) : (
            filtered.map((c) => (
              <ConversationItem key={c.id} conv={c} active={c.id === activeConvId} onClick={() => handleSelectConversation(c.id)} />
            ))
          )}
        </nav>

        <div className="p-3 border-t border-border flex items-center gap-3">
          <Avatar initials="ME" size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">You</p>
            <p className="text-xs text-muted-foreground">Patient</p>
          </div>
          <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent" onClick={() => router.push('/profile/appointments')}>
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        {!active && ghost ? (
          <>
            <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="hidden md:flex w-8 h-8 rounded-lg text-muted-foreground hover:bg-accent" onClick={() => setShowSidebar((s) => !s)}>
                  <ChevronLeft className={cn("w-4 h-4 transition-transform", !showSidebar && "rotate-180")} />
                </Button>
                <div className="flex items-center gap-3">
                  <Avatar initials={getInitials(ghost.doctor.fullName)} photoUrl={ghost.doctor.profilePhoto} />
                  <div>
                    <p className="font-semibold text-sm text-foreground">{ghost.doctor.fullName}</p>
                    <p className="text-xs text-muted-foreground">{ghost.doctor.profile?.personal?.specializations?.[0] ?? "Doctor"}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"><Phone className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"><Video className="w-4 h-4" /></Button>
              </div>
            </header>
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <Avatar initials={getInitials(ghost.doctor.fullName)} photoUrl={ghost.doctor.profilePhoto} size="lg" />
              <h3 className="mt-3 font-semibold text-foreground text-base">{ghost.doctor.fullName}</h3>
              {ghost.doctor.profile?.personal?.specializations?.length ? (
                <p className="text-xs text-muted-foreground mt-1">{ghost.doctor.profile.personal.specializations.join(" · ")}</p>
              ) : null}
              <p className="text-sm text-muted-foreground mt-4 max-w-xs">
                This is the beginning of your conversation with {ghost.doctor.fullName}. Send a message to get started.
              </p>
            </div>
            {selectedFile && <FilePreviewBar file={selectedFile} preview={filePreview} uploading={uploading} onRemove={() => { setSelectedFile(null); setFilePreview(undefined); }} />}
            {fileError && <FileErrorBanner message={fileError} onDismiss={() => setFileError(null)} />}
            <InputBar {...inputBarProps} placeholder={`Message ${ghost.doctor.fullName}…`} />
          </>
        ) : active ? (
          <>
            <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-muted-foreground hover:bg-accent md:hidden" onClick={() => setShowSidebar((s) => !s)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="hidden md:flex w-8 h-8 rounded-lg text-muted-foreground hover:bg-accent" onClick={() => setShowSidebar((s) => !s)}>
                  <ChevronLeft className={cn("w-4 h-4 transition-transform", !showSidebar && "rotate-180")} />
                </Button>
                <button onClick={() => setShowInfo((s) => !s)} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <Avatar initials={getInitials(active.doctor?.fullName ?? "??")} photoUrl={active.doctor?.profilePhoto} />
                  <div>
                    <p className="font-semibold text-sm text-foreground">{active.doctor?.fullName ?? "Loading…"}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      {isTyping ? <span className="text-primary animate-pulse">typing…</span> : (active.doctor?.profile?.personal?.specializations?.[0] ?? "Doctor")}
                    </p>
                  </div>
                </button>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"><Phone className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"><Video className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"><MoreVertical className="w-4 h-4" /></Button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" onClick={() => setShowEmoji(false)}>
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : (
                <>
                  {grouped.map((group) => (
                    <div key={group.date}>
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-[11px] text-muted-foreground font-medium px-2">{group.date}</span>
                        <div className="flex-1 h-px bg-border" />
                      </div>
                      <div className="space-y-2">
                        {group.messages.map((msg) => (
                          <MessageBubble
                            key={msg.id}
                            msg={msg}
                            isMe={msg.senderId === userId || msg.senderRole === MY_ROLE}
                            onImageClick={(url) => setImageModal(url)}
                            onRetry={handleRetry}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                  {grouped.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center px-6">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                        <MessageSquare className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">No messages yet. Say hello!</p>
                    </div>
                  )}
                  {isTyping && <div className="px-1"><TypingIndicator /></div>}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {selectedFile && <FilePreviewBar file={selectedFile} preview={filePreview} uploading={uploading} onRemove={() => { setSelectedFile(null); setFilePreview(undefined); }} />}
            {fileError && <FileErrorBanner message={fileError} onDismiss={() => setFileError(null)} />}
            <InputBar {...inputBarProps} placeholder="Type a message…" />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              {ghostLoading ? <Loader2 className="w-8 h-8 text-primary animate-spin" /> : <MessageSquare className="w-8 h-8 text-primary" />}
            </div>
            <h2 className="font-semibold text-foreground text-lg mb-1">
              {ghostLoading ? "Loading doctor info…" : "Your Messages"}
            </h2>
            <p className="text-sm text-muted-foreground max-w-xs">
              {ghostLoading ? "Please wait a moment." : conversationsLoading ? "Loading your conversations…" : "Select a conversation from the list to start messaging your care team."}
            </p>
          </div>
        )}
      </main>

      {showInfo && active && (
        <aside className="w-72 border-l border-border bg-background flex flex-col overflow-y-auto">
          <div className="p-4 flex items-center justify-between border-b border-border">
            <h2 className="font-semibold text-sm text-foreground">Details</h2>
            <Button variant="ghost" size="icon" className="w-7 h-7 rounded-lg text-muted-foreground hover:bg-accent" onClick={() => setShowInfo(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-col items-center py-6 px-4 border-b border-border">
            <Avatar initials={getInitials(active.doctor?.fullName ?? "??")} photoUrl={active.doctor?.profilePhoto} size="lg" />
            <h3 className="mt-3 font-semibold text-foreground text-base">{active.doctor?.fullName ?? "Doctor"}</h3>
            {active.doctor?.profile?.personal?.specializations?.length ? (
              <p className="text-xs text-muted-foreground mt-0.5">{active.doctor.profile.personal.specializations.join(" · ")}</p>
            ) : null}
            <div className="flex gap-2 mt-4">
              <Button size="sm" variant="outline" className="text-xs h-8 rounded-xl gap-1.5"><Phone className="w-3 h-3" /> Call</Button>
              <Button size="sm" variant="outline" className="text-xs h-8 rounded-xl gap-1.5"><Video className="w-3 h-3" /> Video</Button>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</h4>
            {[{ icon: Trash2, label: "Delete chat", destructive: true }].map(({ icon: Icon, label, destructive }) => (
              <button key={label} className={cn("w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors", destructive ? "text-destructive hover:bg-destructive/10" : "text-foreground hover:bg-accent")}>
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-border mt-auto">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Shared Media</h4>
            <div className="grid grid-cols-3 gap-1.5">
              {active.messages.filter((m) => m.type === "image" && m.fileUrl).slice(-6).map((m) => (
                <button key={m.id} onClick={() => setImageModal(m.fileUrl!)} className="aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity">
                  <img src={m.fileUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
              {active.messages.filter((m) => m.type === "image" && m.fileUrl).length === 0 &&
                [...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-square rounded-lg bg-muted/50 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};

export default PatientChatPage;