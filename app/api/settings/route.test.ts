import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getServerSessionMock,
  userUpdateMock,
  productFindFirstMock,
  productUpdateMock,
  transactionMock,
} = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
  userUpdateMock: vi.fn(),
  productFindFirstMock: vi.fn(),
  productUpdateMock: vi.fn(),
  transactionMock: vi.fn(),
}));

vi.mock("next-auth", () => ({
  getServerSession: getServerSessionMock,
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: transactionMock,
  },
}));

describe("PATCH /api/settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getServerSessionMock.mockResolvedValue({
      user: { id: "user-1" },
    });
    transactionMock.mockImplementation(async (callback: (tx: unknown) => unknown) =>
      callback({
        user: { update: userUpdateMock },
        product: {
          findFirst: productFindFirstMock,
          update: productUpdateMock,
        },
      }),
    );
    userUpdateMock.mockResolvedValue({
      id: "user-1",
      name: "Founder",
      email: "founder@example.com",
      preferredLocale: "en",
    });
    productFindFirstMock.mockResolvedValue({
      id: "product-1",
      userId: "user-1",
      launchGoals: JSON.stringify({ goalKey: "prepare_launch" }),
    });
    productUpdateMock.mockResolvedValue({
      id: "product-1",
      name: "StackSignal",
      description: "Async standup replacement",
      website: "https://stacksignal.app",
      category: "Developer Tool / Platform",
      targetAudience: "Remote engineering teams",
      businessModel: "Subscription",
      launchStatus: "LIVE",
      status: "LAUNCHED",
      launchDate: new Date("2026-05-01T00:00:00.000Z"),
      launchGoals: JSON.stringify({
        goalKey: "prepare_launch",
        growthGoal: "Get first users",
        contextLinks: ["https://docs.example.com"],
      }),
    });
  });

  it("persists the canonical productName + launchStageKey contract and returns a snapshot", async () => {
    const { PATCH } = await import("@/app/api/settings/route");

    const response = await PATCH(
      new Request("http://localhost/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: "product-1",
          name: "Founder",
          productName: "StackSignal",
          description: "Async standup replacement",
          website: "https://stacksignal.app",
          category: "Developer Tool / Platform",
          targetAudience: "Remote engineering teams",
          businessModel: "Subscription",
          launchStageKey: "LIVE",
          growthGoal: "Get first users",
          goalKey: "prepare_launch",
          contextLinks: "https://docs.example.com",
          launchDate: "2026-05-01",
          preferredLocale: "en",
        }),
      }),
    );

    expect(productUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "StackSignal",
          launchStatus: "LIVE",
          status: "LAUNCHED",
        }),
      }),
    );

    const payload = await response.json();
    expect(payload.product.name).toBe("StackSignal");
    expect(payload.product.launchStatus).toBe("LIVE");
    expect(payload.product.status).toBe("LAUNCHED");
  });

  it("keeps backward compatibility for projectName during the transition", async () => {
    const { PATCH } = await import("@/app/api/settings/route");

    await PATCH(
      new Request("http://localhost/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: "product-1",
          name: "Founder",
          projectName: "Legacy Name",
          launchStageKey: "GROWING",
        }),
      }),
    );

    expect(productUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "Legacy Name",
          launchStatus: "GROWING",
          status: "GROWING",
        }),
      }),
    );
  });
});
