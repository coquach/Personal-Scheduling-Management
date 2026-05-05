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
  const messaging = await getFirebaseMessaging();

  if (!messaging) {
    return () => undefined;
  }

  return onMessage(messaging, callback);
}

