import { authenticate, expect, test } from "./fixtures/app-fixture";

function successEnvelope<T>(data: T, message = "OK") {
  return {
    success: true,
    message,
    data,
  };
}

function failureEnvelope(message: string) {
  return {
    success: false,
    message,
    data: null,
  };
}

const now = "2026-03-29T10:00:00.000Z";

type AppointmentItem = {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

async function installStatefulAppointmentsMock(page: import("@playwright/test").Page) {
  let appointments: AppointmentItem[] = [
    {
      id: "appt-1",
      title: "Team Standup",
      description: "Weekly product sync",
      startTime: "2026-03-29T09:00:00.000Z",
      endTime: "2026-03-29T09:30:00.000Z",
      status: "SCHEDULED",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "appt-2",
      title: "Doctor Appointment",
      description: "Routine check-up",
      startTime: "2026-03-30T11:30:00.000Z",
      endTime: "2026-03-30T12:15:00.000Z",
      status: "SCHEDULED",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "appt-3",
      title: "Study Session",
      description: "System design review",
      startTime: "2026-03-31T19:00:00.000Z",
      endTime: "2026-03-31T20:30:00.000Z",
      status: "COMPLETED",
      createdAt: now,
      updatedAt: now,
    },
  ];

  await page.route("**/api/v1/appointments**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (request.method() === "GET" && url.pathname.endsWith("/appointments")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          successEnvelope({
            items: appointments,
            page: 1,
            limit: appointments.length,
            total: appointments.length,
          }),
        ),
      });
      return;
    }

    if (request.method() === "POST" && url.pathname.endsWith("/appointments")) {
      const body = JSON.parse(request.postData() ?? "{}") as {
        title?: string;
        description?: string;
        startTime?: string;
        endTime?: string;
      };
      const createdAppointment: AppointmentItem = {
        id: "appt-new",
        title: body.title ?? "New appointment",
        description: body.description ?? null,
        startTime: body.startTime ?? now,
        endTime: body.endTime ?? now,
        status: "SCHEDULED",
        createdAt: now,
        updatedAt: now,
      };

      appointments = [createdAppointment, ...appointments];

      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(successEnvelope({ id: createdAppointment.id })),
      });
      return;
    }

    if (request.method() === "PUT" && /\/appointments\/[^/]+$/.test(url.pathname)) {
      const appointmentId = url.pathname.split("/").pop() ?? "";
      const body = JSON.parse(request.postData() ?? "{}") as {
        title?: string;
        description?: string;
        startTime?: string;
        endTime?: string;
      };

      appointments = appointments.map((appointment) =>
        appointment.id === appointmentId
          ? {
              ...appointment,
              title: body.title ?? appointment.title,
              description: body.description ?? appointment.description,
              startTime: body.startTime ?? appointment.startTime,
              endTime: body.endTime ?? appointment.endTime,
              updatedAt: now,
            }
          : appointment,
      );

      const updatedAppointment = appointments.find(
        (appointment) => appointment.id === appointmentId,
      );

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(successEnvelope(updatedAppointment)),
      });
      return;
    }

    await route.fallback();
  });
}

test.describe("Midterm workspace coverage", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
  });

  test("creates a new appointment and refreshes the list", async ({ page }) => {
    await installStatefulAppointmentsMock(page);

    await page.goto("/appointments");
    await page.getByTestId("appointment-create-trigger").click();
    await page.getByTestId("appointment-title-input").fill("Quarterly Review");
    await page
      .getByTestId("appointment-description-input")
      .fill("Review roadmap and delivery status");
    await page.getByTestId("appointment-start-input").fill("2026-04-02T10:00");
    await page.getByTestId("appointment-end-input").fill("2026-04-02T11:00");
    await page.getByTestId("appointment-save").click();

    await expect(page.getByTestId("appointment-form-modal")).not.toBeVisible();
    await expect(page.getByText("Quarterly Review")).toBeVisible();
    await expect(page.getByTestId("appointment-row")).toHaveCount(4);
  });

  test("shows conflict feedback for overlapping appointments", async ({ page }) => {
    await page.route("**/api/v1/appointments", async (route) => {
      await route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify(failureEnvelope("Overlapping appointment")),
      });
    });

    await page.goto("/appointments");

    await page.getByTestId("appointment-create-trigger").click();
    await expect(page.getByTestId("appointment-form-modal")).toBeVisible();
    await page.getByTestId("appointment-title-input").fill("Overlap Attempt");
    await page.getByTestId("appointment-start-input").fill("2026-03-29T09:00");
    await page.getByTestId("appointment-end-input").fill("2026-03-29T09:30");
    await page.getByTestId("appointment-save").click();

    await expect(page.getByTestId("appointment-conflict-alert")).toContainText(
      "Overlapping appointment",
    );
    await expect(page.getByTestId("appointment-form-modal")).toBeVisible();
  });

  test("shows backend time-range validation errors without closing the form", async ({
    page,
  }) => {
    await page.route("**/api/v1/appointments", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify(
          failureEnvelope("Start time must be before end time"),
        ),
      });
    });

    await page.goto("/appointments");
    await page.getByTestId("appointment-create-trigger").click();
    await page.getByTestId("appointment-title-input").fill("Broken Range");
    await page.getByTestId("appointment-start-input").fill("2026-04-02T12:00");
    await page.getByTestId("appointment-end-input").fill("2026-04-02T11:00");
    await page.getByTestId("appointment-save").click();

    await expect(page.getByTestId("appointment-time-error")).toContainText(
      "Start time must be before end time",
    );
    await expect(page.getByTestId("appointment-form-modal")).toBeVisible();
  });

  test("shows backend past-date validation errors without closing the form", async ({
    page,
  }) => {
    await page.route("**/api/v1/appointments", async (route) => {
      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify(
          failureEnvelope("Past appointments are not allowed"),
        ),
      });
    });

    await page.goto("/appointments");
    await page.getByTestId("appointment-create-trigger").click();
    await page.getByTestId("appointment-title-input").fill("Past Attempt");
    await page.getByTestId("appointment-start-input").fill("2025-03-29T09:00");
    await page.getByTestId("appointment-end-input").fill("2025-03-29T10:00");
    await page.getByTestId("appointment-save").click();

    await expect(page.getByTestId("appointment-time-error")).toContainText(
      "Past appointments are not allowed",
    );
    await expect(page.getByTestId("appointment-form-modal")).toBeVisible();
  });

  test("updates editable profile information and keeps email read-only", async ({
    page,
  }) => {
    await page.goto("/profile");

    await page.getByTestId("profile-name-input").fill("Jamie Planner");
    await page
      .getByTestId("profile-timezone-select")
      .fill("Asia/Singapore");
    await page.getByTestId("profile-save").click();

    await expect(page.getByTestId("profile-name-input")).toHaveValue(
      "Jamie Planner",
    );
    await expect(page.getByTestId("profile-timezone-select")).toHaveValue(
      "Asia/Singapore",
    );
    await expect(page.getByTestId("profile-email-input")).toHaveValue(
      "john.doe@example.com",
    );
    await expect(page.getByTestId("profile-email-input")).toHaveJSProperty(
      "readOnly",
      true,
    );
    await expect(page.getByTestId("profile-success-banner")).toBeVisible();
  });
});
