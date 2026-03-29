export const AUTH_STATE_COOKIE_NAME = "psms-authenticated";

const AUTH_STORAGE_KEY = "psms-auth-session";

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
};

type StoredAuthSession = {
  refreshToken: string;
};

let accessTokenCache: string | null = null;
let refreshTokenCache: string | null = null;
let hasLoadedBrowserStoredSession = false;

function canUseBrowserStorage() {
  return typeof window !== "undefined";
}

function getStorage() {
  if (!canUseBrowserStorage()) {
    return null;
  }

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function getCookieAttributes() {
  if (
    typeof window !== "undefined" &&
    window.location.protocol === "https:"
  ) {
    return "Path=/; SameSite=Lax; Secure";
  }

  return "Path=/; SameSite=Lax";
}

function setAuthStateCookie(isAuthenticated: boolean) {
  if (!canUseBrowserStorage()) {
    return;
  }

  if (isAuthenticated) {
    document.cookie = `${AUTH_STATE_COOKIE_NAME}=1; ${getCookieAttributes()}`;
    return;
  }

  document.cookie = `${AUTH_STATE_COOKIE_NAME}=; ${getCookieAttributes()}; Max-Age=0`;
}

function syncAuthStateCookie() {
  setAuthStateCookie(Boolean(accessTokenCache || refreshTokenCache));
}

function readStoredSession(): StoredAuthSession | null {
  if (!canUseBrowserStorage()) {
    return refreshTokenCache ? { refreshToken: refreshTokenCache } : null;
  }

  if (hasLoadedBrowserStoredSession) {
    return refreshTokenCache ? { refreshToken: refreshTokenCache } : null;
  }

  hasLoadedBrowserStoredSession = true;

  const storage = getStorage();

  if (!storage) {
    syncAuthStateCookie();
    return null;
  }

  let rawValue: string | null = null;

  try {
    rawValue = storage.getItem(AUTH_STORAGE_KEY);
  } catch {
    syncAuthStateCookie();
    return null;
  }

  if (!rawValue) {
    refreshTokenCache = null;
    syncAuthStateCookie();
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as StoredAuthSession;

    if (!parsedValue.refreshToken) {
      refreshTokenCache = null;
      try {
        storage.removeItem(AUTH_STORAGE_KEY);
      } catch {}
      syncAuthStateCookie();
      return null;
    }

    refreshTokenCache = parsedValue.refreshToken;
    syncAuthStateCookie();
    return parsedValue;
  } catch {
    refreshTokenCache = null;
    try {
      storage.removeItem(AUTH_STORAGE_KEY);
    } catch {}
    syncAuthStateCookie();
    return null;
  }
}

export function getAccessToken() {
  return accessTokenCache;
}

export function getRefreshToken() {
  return refreshTokenCache ?? readStoredSession()?.refreshToken ?? null;
}

export function hasAuthSession() {
  return Boolean(accessTokenCache || getRefreshToken());
}

export function setAuthSession(session: AuthSession) {
  const storage = getStorage();

  accessTokenCache = session.accessToken;
  refreshTokenCache = session.refreshToken;
  hasLoadedBrowserStoredSession = true;

  if (!storage) {
    syncAuthStateCookie();
    return;
  }

  try {
    storage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        refreshToken: session.refreshToken,
      } satisfies StoredAuthSession),
    );
  } catch {
    refreshTokenCache = null;
  }

  syncAuthStateCookie();
}

export function clearAuthSession() {
  const storage = getStorage();

  accessTokenCache = null;
  refreshTokenCache = null;
  hasLoadedBrowserStoredSession = true;

  if (!storage) {
    syncAuthStateCookie();
    return;
  }

  try {
    storage.removeItem(AUTH_STORAGE_KEY);
  } finally {
    syncAuthStateCookie();
  }
}
