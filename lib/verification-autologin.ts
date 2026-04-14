import { createHmac, timingSafeEqual } from "crypto";

const DEFAULT_TTL_MS = 10 * 60 * 1000;

function getTokenSecret() {
  return process.env.NEXTAUTH_SECRET || process.env.RECAPTCHA_SECRET_KEY || "";
}

function signPayload(payload: string) {
  return createHmac("sha256", getTokenSecret()).update(payload).digest("hex");
}

export function createVerificationAutoLoginToken(
  email: string,
  userId: string,
  ttlMs = DEFAULT_TTL_MS,
) {
  const secret = getTokenSecret();
  if (!secret) return null;

  const normalizedEmail = email.trim().toLowerCase();
  const exp = Date.now() + ttlMs;
  const payload = `${userId}:${normalizedEmail}:${exp}`;
  const signature = signPayload(payload);

  return Buffer.from(`${payload}:${signature}`).toString("base64url");
}

export function verifyVerificationAutoLoginToken(
  token: string | null | undefined,
  email: string,
  userId: string,
) {
  const secret = getTokenSecret();
  if (!secret || !token) return false;

  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [tokenUserId, tokenEmail, expString, signature] = decoded.split(":");

    if (!tokenUserId || !tokenEmail || !expString || !signature) {
      return false;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (tokenUserId !== userId || tokenEmail !== normalizedEmail) {
      return false;
    }

    const exp = Number(expString);
    if (!Number.isFinite(exp) || Date.now() > exp) {
      return false;
    }

    const payload = `${tokenUserId}:${tokenEmail}:${exp}`;
    const expectedSignature = signPayload(payload);

    return timingSafeEqual(
      Buffer.from(signature, "utf8"),
      Buffer.from(expectedSignature, "utf8"),
    );
  } catch {
    return false;
  }
}
