import { authenticate, expect, test } from "./fixtures/app-fixture";

test.describe("Team Management", () => {
  test.beforeEach(async ({ page, psmsApi }) => {
    await authenticate(page);
    // Set a baseline payload with valid UUIDs matching mock-api-server defaults
    psmsApi.setPayload({
      teams: [
        { id: "11111111-1111-4111-8111-111111111111", name: "Engineering", description: "Core", role: "OWNER", memberCount: 2 }
      ],
      teamMembers: [
        { teamId: "11111111-1111-4111-8111-111111111111", userId: "33333333-3333-4333-8333-333333333333", email: "profile@example.com", displayName: "Initial Name", role: "OWNER", status: "ACTIVE", joinedAt: new Date().toISOString() },
        { teamId: "11111111-1111-4111-8111-111111111111", userId: "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee", email: "coworker@example.com", displayName: "Co-worker", role: "MEMBER", status: "ACTIVE", joinedAt: new Date().toISOString() }
      ],
      invitations: []
    });
  });

  test("TEAM-01: create a new team", async ({ page }) => {
    await page.goto("/teams");

    await page.getByTestId("create-team-trigger").click();
    await page.getByTestId("team-name-input").fill("Alpha Team");
    await page.getByTestId("team-description-input").fill("First team");
    
    const responsePromise = page.waitForResponse(r => r.url().includes("/teams") && r.request().method() === "POST");
    await page.getByTestId("team-save").click();
    await responsePromise;

    await expect(page.getByText(/created successfully/i)).toBeVisible();
    await expect(page.getByTestId("create-team-modal")).not.toBeVisible();
    await expect(page.getByText("Alpha Team")).toBeVisible();
  });

  test("TEAM-02: reject duplicate team names", async ({ page, psmsApi }) => {
    psmsApi.mockFailure({ method: "POST", path: "/teams" }, 400, "Duplicate team names within the owner scope are rejected.");

    await page.goto("/teams");

    await page.getByTestId("create-team-trigger").click();
    await page.getByTestId("team-name-input").fill("Engineering");
    await page.getByTestId("team-save").click();

    await expect(page.getByText(/Duplicate team names/i).first()).toBeVisible();
  });

  test("TEAM-03: invite a new member", async ({ page, psmsApi }) => {
    // Need to mock searchUserByEmail with a valid UUID
    psmsApi.mockSuccess({ method: "GET", path: "/users/search" }, { 
      id: "99999999-9999-4999-8999-999999999999", 
      email: "newbie@example.com", 
      displayName: "Newbie",
      timezone: "UTC",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await page.goto("/teams/11111111-1111-4111-8111-111111111111");

    await page.getByTestId("team-invite-trigger").click();
    await page.getByTestId("team-invite-email-input").fill("newbie@example.com");
    
    const responsePromise = page.waitForResponse(r => r.url().includes("/invitations") && r.request().method() === "POST");
    await page.getByTestId("team-invite-submit").click();
    await responsePromise;

    await expect(page.getByText(/sent successfully/i)).toBeVisible();
    await expect(page.getByTestId("invite-member-modal")).not.toBeVisible();
  });

  test("TEAM-04: change member role", async ({ page }) => {
    await page.goto("/teams/11111111-1111-4111-8111-111111111111");

    // Expecting a row for 'Co-worker' with a role change trigger
    const memberRow = page.getByTestId("member-row-eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee");
    await expect(memberRow).toBeVisible();
    
    const responsePromise = page.waitForResponse(r => r.url().includes("/role") && r.request().method() === "PATCH");
    await memberRow.getByTestId("role-change-trigger").click();
    await page.getByRole("option", { name: "ADMIN" }).click();
    await responsePromise;
    
    await expect(memberRow.getByTestId("member-role")).toContainText("ADMIN");
  });

  test("TEAM-05: leave a team", async ({ page, psmsApi }) => {
    const teamId = "22222222-2222-4222-8222-222222222222";
    psmsApi.setPayload({
      teams: [
        { 
          id: teamId, 
          name: "Design Team", 
          description: "Designers", 
          ownerId: "11111111-1111-4111-8111-111111111111",
          role: "MEMBER", 
          memberCount: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      teamMembers: [
        { teamId: teamId, userId: "33333333-3333-4333-8333-333333333333", email: "profile@example.com", displayName: "Initial Name", role: "MEMBER", status: "ACTIVE", joinedAt: new Date().toISOString() }
      ]
    });

    await page.goto(`/teams/${teamId}`);

    page.once("dialog", dialog => dialog.accept());
    const responsePromise = page.waitForResponse(r => r.url().includes("/leave") && r.request().method() === "POST");
    await page.getByTestId("team-leave-trigger").click();
    await responsePromise;

    await expect(page).toHaveURL(/\/teams$/);
    await expect(page.getByText("Design Team")).not.toBeVisible();
  });

  test("TEAM-06: block owner from leaving without transfer", async ({ page }) => {
    await page.goto("/teams/11111111-1111-4111-8111-111111111111");

    // Per COS and BR-43, OWNER cannot leave without transfer.
    // UI should show "Delete Team" instead of "Leave Team" for OWNER.
    await expect(page.getByTestId("team-leave-trigger")).not.toBeVisible();
    await expect(page.getByTestId("team-delete-trigger")).toBeVisible();
  });

  test("TEAM-07: accept a team invitation", async ({ page, psmsApi }) => {
    const inviteId = "99999999-9999-4999-8999-999999999999";
    const teamId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    psmsApi.setPayload({
      invitations: [
        {
          id: inviteId,
          teamId: teamId,
          teamName: "External Project",
          invitedUserId: "33333333-3333-4333-8333-333333333333",
          invitedById: "other-user",
          role: "MEMBER",
          status: "PENDING",
          createdAt: new Date().toISOString(),
          expiresAt: null
        }
      ]
    });

    await page.goto("/teams"); 
    
    const responsePromise = page.waitForResponse(r => r.url().includes("/accept") && r.request().method() === "POST");
    await page.getByTestId(`invitation-accept-${inviteId}`).click();
    await responsePromise;

    await expect(page.getByText(/accepted/i)).toBeVisible();
    
    // UI should refresh or we might need to navigate
    await expect(page.getByText("External Project")).toBeVisible();
  });
});

