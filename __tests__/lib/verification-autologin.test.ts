import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createVerificationAutoLoginToken,
  verifyVerificationAutoLoginToken,
} from "@/lib/verification-autologin";

describe("verification auto-login token", () => {
  beforeEach(() => {
    process.env.NEXTAUTH_SECRET = "test-secret";
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-14T12:00:00.000Z"));
  });

  it("creates a token that validates for the same user", () => {
    const token = createVerificationAutoLoginToken("founder@example.com", "user_123");

    expect(token).toBeTruthy();
    expect(
      verifyVerificationAutoLoginToken(token, "founder@example.com", "user_123"),
    ).toBe(true);
  });

  it("rejects a token for another user", () => {
    const token = createVerificationAutoLoginToken("founder@example.com", "user_123");

    expect(
      verifyVerificationAutoLoginToken(token, "other@example.com", "user_123"),
    ).toBe(false);
    expect(
      verifyVerificationAutoLoginToken(token, "founder@example.com", "user_999"),
    ).toBe(false);
  });

  it("rejects an expired token", () => {
    const token = createVerificationAutoLoginToken("founder@example.com", "user_123", 1_000);
    vi.advanceTimersByTime(1_500);

    expect(
      verifyVerificationAutoLoginToken(token, "founder@example.com", "user_123"),
    ).toBe(false);
  });
});
