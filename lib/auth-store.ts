import "client-only";

type Listener = () => void;

let accessToken: string | null = null;
const listeners = new Set<Listener>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string) {
  accessToken = token;
  emitChange();
}

export function clear() {
  accessToken = null;
  emitChange();
}

export function subscribe(listener: Listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

// This store is intentionally memory-only.
// A full page reload clears the module state, so bootstrap must run again by
// using the HttpOnly refresh cookie from the server to mint a new access token.
