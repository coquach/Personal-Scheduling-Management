import type { FirebaseOptions } from "firebase/app";

type FirebaseWebConfig = FirebaseOptions & {
  vapidKey: string;
};

function readEnv(name: string) {
  const value = process.env[name];
  return typeof value === "string" && value.trim() ? value : null;
}

export function getFirebaseWebConfig(): FirebaseWebConfig | null {
  const apiKey = readEnv("NEXT_PUBLIC_FIREBASE_API_KEY");
  const authDomain = readEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
  const projectId = readEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  const messagingSenderId = readEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
  const appId = readEnv("NEXT_PUBLIC_FIREBASE_APP_ID");
  const vapidKey = readEnv("NEXT_PUBLIC_FIREBASE_VAPID_KEY");

  if (
    !apiKey ||
    !authDomain ||
    !projectId ||
    !messagingSenderId ||
    !appId ||
    !vapidKey
  ) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    messagingSenderId,
    appId,
    vapidKey,
  };
}

