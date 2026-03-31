const VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

export function isRecaptchaEnabled() {
  return process.env.RECAPTCHA_ENABLED?.trim() === "true";
}

export function getRecaptchaSiteKey() {
  return process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() || "";
}

export function shouldRenderRecaptchaOnClient() {
  return Boolean(getRecaptchaSiteKey()) && isRecaptchaEnabled();
}

export async function verifyRecaptchaToken({
  token,
  remoteIp,
}: {
  token?: string | null;
  remoteIp?: string | null;
}) {
  if (!isRecaptchaEnabled()) {
    return { success: true, bypassed: true as const };
  }

  const secret = process.env.RECAPTCHA_SECRET_KEY?.trim();
  const siteKey = getRecaptchaSiteKey();

  if (!secret || !siteKey) {
    return {
      success: false,
      bypassed: false as const,
      error: "recaptcha_not_configured",
    };
  }

  if (!token) {
    return {
      success: false,
      bypassed: false as const,
      error: "recaptcha_required",
    };
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  });

  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }

  const response = await fetch(VERIFY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      success: false,
      bypassed: false as const,
      error: "recaptcha_verify_failed",
    };
  }

  const payload = (await response.json()) as {
    success?: boolean;
    "error-codes"?: string[];
  };

  if (!payload.success) {
    return {
      success: false,
      bypassed: false as const,
      error: payload["error-codes"]?.[0] || "recaptcha_invalid",
    };
  }

  return { success: true, bypassed: false as const };
}

export function getRequestIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || null;
  }
  return request.headers.get("x-real-ip");
}
