"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type Messaging,
  type MessagePayload,
} from "firebase/messaging";

import { getFirebaseWebConfig } from "@/lib/firebase-config";

let firebaseApp: FirebaseApp | null = null;
let messagingInstance: Messaging | null = null;
const REGISTERED_FCM_TOKEN_STORAGE_KEY = "psms:registered-fcm-token";
const TEST_FOREGROUND_EVENT_NAME = "psms:test-foreground-message";

function buildServiceWorkerUrl() {
  const config = getFirebaseWebConfig();

  if (!config) {
    return null;
  }

  const query = new URLSearchParams({
    apiKey: config.apiKey ?? "",
    authDomain: config.authDomain ?? "",
    projectId: config.projectId ?? "",
    messagingSenderId: config.messagingSenderId ?? "",
    appId: config.appId ?? "",
  });

  return `/firebase-messaging-sw.js?${query.toString()}`;
}

export async function isFirebaseMessagingAvailable() {
  if (typeof window === "undefined") {
    return false;
  }

  if (!("serviceWorker" in navigator) || !("Notification" in window)) {
    return false;
  }

  return isSupported();
}

export function getFirebaseApp() {
  const config = getFirebaseWebConfig();

  if (!config) {
    return null;
  }

  if (firebaseApp) {
    return firebaseApp;
  }

  firebaseApp =
    getApps()[0] ??
    initializeApp({
      apiKey: config.apiKey,
      authDomain: config.authDomain,
      projectId: config.projectId,
      messagingSenderId: config.messagingSenderId,
      appId: config.appId,
    });

  return firebaseApp;
}

export async function registerFirebaseMessagingServiceWorker() {
  if (!(await isFirebaseMessagingAvailable())) {
    return null;
  }

  const serviceWorkerUrl = buildServiceWorkerUrl();

  if (!serviceWorkerUrl) {
    return null;
  }

  return navigator.serviceWorker.register(serviceWorkerUrl);
}

export async function getFirebaseMessaging() {
  if (!(await isFirebaseMessagingAvailable())) {
    return null;
  }

  const app = getFirebaseApp();

  if (!app) {
    return null;
  }

  if (messagingInstance) {
    return messagingInstance;
  }

  messagingInstance = getMessaging(app);
  return messagingInstance;
}

export async function requestNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied" as const;
  }

  return Notification.requestPermission();
}

export async function getFirebaseMessagingToken() {
  if (typeof window !== "undefined") {
    const maybeTestToken = (
      window as Window & { __PSMS_TEST_FCM_TOKEN__?: string }
    ).__PSMS_TEST_FCM_TOKEN__;

    if (typeof maybeTestToken === "string" && maybeTestToken.trim()) {
      return maybeTestToken.trim();
    }
  }

  const permission = await requestNotificationPermission();

  if (permission !== "granted") {
    return null;
  }

  const messaging = await getFirebaseMessaging();
  const serviceWorkerRegistration =
    await registerFirebaseMessagingServiceWorker();
  const config = getFirebaseWebConfig();

  if (!messaging || !serviceWorkerRegistration || !config?.vapidKey) {
    return null;
  }

  return getToken(messaging, {
    vapidKey: config.vapidKey,
    serviceWorkerRegistration,
  });
}

export async function onForegroundMessage(
  callback: (payload: MessagePayload) => void,
) {
  const testListener = (event: Event) => {
    const customEvent = event as CustomEvent<MessagePayload>;
    callback(customEvent.detail);
  };

  if (typeof window !== "undefined") {
    window.addEventListener(TEST_FOREGROUND_EVENT_NAME, testListener as EventListener);
  }

  const messaging = await getFirebaseMessaging();

  if (!messaging) {
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener(
          TEST_FOREGROUND_EVENT_NAME,
          testListener as EventListener,
        );
      }
    };
  }

  const unsubscribe = onMessage(messaging, callback);

  return () => {
    unsubscribe();
    if (typeof window !== "undefined") {
      window.removeEventListener(
        TEST_FOREGROUND_EVENT_NAME,
        testListener as EventListener,
      );
    }
  };
}

export function getRegisteredFcmToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(REGISTERED_FCM_TOKEN_STORAGE_KEY);
}

export function setRegisteredFcmToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(REGISTERED_FCM_TOKEN_STORAGE_KEY, token);
}

export function clearRegisteredFcmToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(REGISTERED_FCM_TOKEN_STORAGE_KEY);
}
