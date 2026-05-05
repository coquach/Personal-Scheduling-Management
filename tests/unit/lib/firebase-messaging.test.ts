import {
  getFirebaseMessagingToken,
  onForegroundMessage,
  requestNotificationPermission,
} from "@/lib/firebase-messaging";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("firebase/app", () => ({
  getApps: jest.fn(() => []),
  initializeApp: jest.fn(() => ({ name: "app" })),
}));

jest.mock("firebase/messaging", () => ({
  getMessaging: jest.fn(() => ({ name: "messaging" })),
  getToken: jest.fn(async () => "firebase-token"),
  isSupported: jest.fn(async () => false),
  onMessage: jest.fn(() => () => undefined),
}));

const { getToken } = jest.requireMock("firebase/messaging") as {
  getToken: jest.Mock;
};

describe("firebase-messaging", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    Object.defineProperty(window, "Notification", {
      configurable: true,
      value: {
        requestPermission: jest.fn(async () => "denied"),
      },
    });
  });

  it("returns permission state from browser", async () => {
    const permission = await requestNotificationPermission();
    expect(permission).toBe("denied");
  });

  it("returns null when permission is not granted", async () => {
    const token = await getFirebaseMessagingToken();
    expect(token).toBeNull();
    expect(getToken).not.toHaveBeenCalled();
  });

  it("returns test token override when provided", async () => {
    (window as Window & { __PSMS_TEST_FCM_TOKEN__?: string }).__PSMS_TEST_FCM_TOKEN__ =
      "override-token";

    const token = await getFirebaseMessagingToken();

    expect(token).toBe("override-token");
    expect(getToken).not.toHaveBeenCalled();
  });

  it("subscribes and receives foreground test events", async () => {
    const callback = jest.fn();
    const unsubscribe = await onForegroundMessage(callback);

    window.dispatchEvent(
      new CustomEvent("psms:test-foreground-message", {
        detail: {
          notification: { title: "Reminder", body: "Meeting now" },
          data: { message: "Meeting now" },
        },
      }),
    );

    expect(callback).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
});
