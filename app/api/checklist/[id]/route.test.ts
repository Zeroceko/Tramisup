import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getServerSessionMock,
  launchChecklistFindFirstMock,
  launchChecklistUpdateMock,
  taskFindUniqueMock,
  taskUpdateMock,
  metricSetupFindUniqueMock,
  transactionMock,
  emitTaskLifecycleEventMock,
} = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
  launchChecklistFindFirstMock: vi.fn(),
  launchChecklistUpdateMock: vi.fn(),
  taskFindUniqueMock: vi.fn(),
  taskUpdateMock: vi.fn(),
  metricSetupFindUniqueMock: vi.fn(),
  transactionMock: vi.fn(),
  emitTaskLifecycleEventMock: vi.fn(),
}));

vi.mock("next-auth", () => ({
  getServerSession: getServerSessionMock,
}));

vi.mock("@/lib/auth", () => ({
  authOptions: {},
}));

vi.mock("@/lib/task-events", () => ({
  emitTaskLifecycleEvent: emitTaskLifecycleEventMock,
}));

vi.mock("@/lib/metric-setup", () => ({
  updateIgnoredChecklistIds: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    launchChecklist: {
      findFirst: launchChecklistFindFirstMock,
    },
    metricSetup: {
      findUnique: metricSetupFindUniqueMock,
    },
    $transaction: transactionMock,
  },
}));

describe("PATCH /api/checklist/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getServerSessionMock.mockResolvedValue({ user: { id: "user-1" } });
    launchChecklistFindFirstMock.mockResolvedValue({
      id: "checklist-1",
      productId: "product-1",
      linkedTaskId: "task-1",
      product: { userId: "user-1" },
    });
    transactionMock.mockImplementation(async (callback: (tx: unknown) => unknown) =>
      callback({
        launchChecklist: {
          update: launchChecklistUpdateMock,
        },
        task: {
          findUnique: taskFindUniqueMock,
          update: taskUpdateMock,
        },
      }),
    );
    launchChecklistUpdateMock.mockResolvedValue({
      id: "checklist-1",
      completed: true,
    });
    taskFindUniqueMock.mockResolvedValue({
      id: "task-1",
      productId: "product-1",
      status: "TODO",
    });
    taskUpdateMock.mockResolvedValue({
      id: "task-1",
      status: "DONE",
    });
  });

  it("updates the linked task status in the same completion flow", async () => {
    const { PATCH } = await import("@/app/api/checklist/[id]/route");

    const response = await PATCH(
      new Request("http://localhost/api/checklist/checklist-1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true }),
      }),
      { params: Promise.resolve({ id: "checklist-1" }) },
    );

    expect(launchChecklistUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          completed: true,
        }),
      }),
    );
    expect(taskUpdateMock).toHaveBeenCalledWith({
      where: { id: "task-1" },
      data: expect.objectContaining({
        status: "DONE",
        startedAt: expect.any(Date),
        completedAt: expect.any(Date),
      }),
    });
    expect(emitTaskLifecycleEventMock).toHaveBeenCalledWith({
      taskId: "task-1",
      productId: "product-1",
      eventType: "COMPLETED",
      metadata: { source: "CHECKLIST_SURFACE" },
    });

    expect(response.status).toBe(200);
  });
});
