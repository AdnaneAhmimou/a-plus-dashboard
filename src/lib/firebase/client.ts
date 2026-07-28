"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
  type Messaging,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

function getFirebaseApp() {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

// Cached across calls: `isSupported()` does its own feature detection
// (fails in SSR, some browsers, private-browsing contexts) and there's no
// reason to redo that work or re-initialize messaging on every call.
let messagingInstance: Messaging | null | undefined;

async function getMessagingIfSupported(): Promise<Messaging | null> {
  if (messagingInstance !== undefined) return messagingInstance;
  if (!firebaseConfig.apiKey || !(await isSupported())) {
    messagingInstance = null;
    return null;
  }
  messagingInstance = getMessaging(getFirebaseApp());
  return messagingInstance;
}

export type PushRegistrationResult =
  | { status: "granted"; token: string }
  | { status: "denied" }
  | { status: "unsupported" };

// Requests notification permission, registers the FCM service worker, and
// returns a device token to send to the server. Safe to call more than
// once — Firebase returns the existing token when one is already valid.
export async function requestPushRegistration(): Promise<PushRegistrationResult> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !VAPID_KEY) {
    return { status: "unsupported" };
  }

  const messaging = await getMessagingIfSupported();
  if (!messaging) return { status: "unsupported" };

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { status: "denied" };

  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js"
  );
  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  return { status: "granted", token };
}

// Foreground pushes don't show a native notification on their own — only
// background ones do (via the service worker). Callers show their own UI.
export async function onForegroundPush(
  callback: (payload: { title?: string; body?: string }) => void
): Promise<() => void> {
  const messaging = await getMessagingIfSupported();
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    callback({
      title: payload.notification?.title,
      body: payload.notification?.body,
    });
  });
}
