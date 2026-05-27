// lib/useGoogleLogin.ts
"use client";

import { IPayload } from "@/interfaces/common/payload.interface";
import { useCallback, useEffect, useState } from "react";

declare global {
  interface Window {
    google?: any;
  }
}

export function useGoogleLogin() {
  const [isReady, setIsReady] = useState(false);
  const [payload, setPayload] = useState<IPayload>()

  // Load Google script only once
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.google?.accounts?.id) {
      setIsReady(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;

    script.onload = () => setIsReady(true);
    script.onerror = () => setIsReady(false);

    document.head.appendChild(script);
  }, []);

  const login = useCallback(() => {
    if (!isReady) return false;

    try {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: (response: any) => {
          if (response.credential) {
            const token = response.credential;
            const payload = JSON.parse(atob(token.split(".")[1]));

            console.log("Google Sign-In Success!", {
              name: payload.name,
              email: payload.email,
              picture: payload.picture,
              id: payload.sub,
            });

            setPayload({
              name: payload.name,
              email: payload.email,
              sub: payload.sub,
              picture: payload.picture
            })

            // alert(`Welcome ${payload.name || payload.email}!`);
          }
        },
      });

      window.google.accounts.id.prompt();
      return true;
    } catch (err) {
      console.error("Google Login Error:", err);
      return false;
    }
  }, [isReady]);

  return { login, isReady, payload };
}
