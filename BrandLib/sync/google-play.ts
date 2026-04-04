import { OAuth2Client } from "google-auth-library";
import { decryptSecret } from "@/lib/crypto";

interface GooglePlayConfig {
  encryptedRefreshToken: string | null;
  encryptedAccessToken: string;
  scope?: string;
  accountDisplayName?: string;
}

export async function refreshGooglePlayToken(config: GooglePlayConfig): Promise<string> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is not configured");
  }

  if (!config.encryptedRefreshToken) {
    throw new Error("Google Play config is missing refresh token — re-authorization required");
  }

  const refreshToken = decryptSecret(config.encryptedRefreshToken);

  const oauth2Client = new OAuth2Client(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const tokenResponse = await oauth2Client.getAccessToken();
  if (!tokenResponse.token) {
    throw new Error("Failed to refresh Google Play access token");
  }

  return tokenResponse.token;
}

async function callAndroidPublisherApi<T>(path: string, accessToken: string): Promise<T> {
  const res = await fetch(
    `https://androidpublisher.googleapis.com/androidpublisher/v3${path}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Android Publisher API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

export async function syncGooglePlay(
  _productId: string,
  configData: string
): Promise<number> {
  const config = JSON.parse(configData) as GooglePlayConfig;

  const accessToken = await refreshGooglePlayToken(config);

  // Verify connection by calling the orders endpoint with a minimal query.
  // A 404 ("app not found") here still means the token works — the account just
  // may not have apps yet, which is valid. We only fail on auth errors.
  try {
    await callAndroidPublisherApi<unknown>(
      "/applications/invalid-placeholder-bundle/purchases/subscriptions?maxResults=1",
      accessToken
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    // 404 = token works, app just doesn't exist at that path — that's fine
    if (!msg.includes("404")) {
      throw err;
    }
  }

  // Connection verified. Package-specific sync (reviews, installs) requires a
  // configured packageName which is not stored yet.
  // Return 0 — no metric rows written until package name is configured.
  return 0;
}
