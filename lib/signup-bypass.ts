import { createHmac, timingSafeEqual } from "crypto";

const DEFAULT_TTL_MS = 5 * 60 * 1000;

function getBypassSecret() {
  return process.env.NEXTAUTH_SECRET || process.env.RECAPTCHA_SECRET_KEY || "";
}

function signPayload(payload: string) {
  return createHmac("sha256", getBypassSecret()).update(payload).digest("hex");
}

export function createSignupBypassToken(email: string, ttlMs = DEFAULT_TTL_MS) {
  const secret = getBypassSecret();
  if (!secret) {
    return null;
  }

  const exp = Date.now() + ttlMs;
  const normalizedEmail = email.trim().toLowerCase();
  const payload = `${normalizedEmail}:${exp}`;
  const signature = signPayload(payload);

  return Buffer.from(`${payload}:${signature}`).toString("base64url");
}

export function verifySignupBypassToken(token: string | null | undefined, email: string) {
  const secret = getBypassSecret();
  if (!secret || !token) {
    return false;
  }

  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [tokenEmail, expString, signature] = decoded.split(":");

    if (!tokenEmail || !expString || !signature) {
      return false;
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (tokenEmail !== normalizedEmail) {
      return false;
    }

    const exp = Number(expString);
    if (!Number.isFinite(exp) || Date.now() > exp) {
      return false;
    }

    const payload = `${tokenEmail}:${exp}`;
    const expectedSignature = signPayload(payload);

    return timingSafeEqual(
      Buffer.from(signature, "utf8"),
      Buffer.from(expectedSignature, "utf8"),
    );
  } catch {
    return false;
  }
}
