import React from "react";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { fireEvent, render, waitFor } from "@testing-library/react";

const replace = jest.fn<(...args: unknown[]) => void>();
const refresh = jest.fn<(...args: unknown[]) => void>();
const logoutAction = jest.fn<(...args: unknown[]) => Promise<{ redirectTo: string }>>();
const unregisterNotificationDevice = jest.fn<(...args: unknown[]) => Promise<void>>();
const getRegisteredFcmToken = jest.fn<(...args: unknown[]) => string | null>();
const clearRegisteredFcmToken = jest.fn<(...args: unknown[]) => void>();
const clearAuthStore = jest.fn<(...args: unknown[]) => void>();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace,
    refresh,
  }),
}));

jest.mock("@/features/auth/server/actions", () => ({
  logoutAction: (...args: unknown[]) => logoutAction(...args),
}));

jest.mock("@/services/notification.service", () => ({
  unregisterNotificationDevice: (...args: unknown[]) =>
    unregisterNotificationDevice(...args),
}));

jest.mock("@/lib/firebase-messaging", () => ({
  getRegisteredFcmToken: (...args: unknown[]) => getRegisteredFcmToken(...args),
  clearRegisteredFcmToken: (...args: unknown[]) => clearRegisteredFcmToken(...args),
}));

jest.mock("@/lib/auth-store", () => ({
  clear: (...args: unknown[]) => clearAuthStore(...args),
}));

describe("LogoutButton integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("unregisters FCM token and redirects to login", async () => {
    const { LogoutButton } = await import("@/components/auth/LogoutButton");
    getRegisteredFcmToken.mockReturnValue("test-fcm-token");
    unregisterNotificationDevice.mockResolvedValue(undefined);
    logoutAction.mockResolvedValue({ redirectTo: "/login" });

    const { getByTestId } = render(<LogoutButton data-testid="sign-out-action" />);
    fireEvent.click(getByTestId("sign-out-action"));

    await waitFor(() =>
      expect(unregisterNotificationDevice).toHaveBeenCalledWith("test-fcm-token"),
    );
    expect(clearRegisteredFcmToken).toHaveBeenCalled();
    expect(clearAuthStore).toHaveBeenCalled();
    expect(logoutAction).toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith("/login");
    expect(refresh).toHaveBeenCalled();
  });
});
