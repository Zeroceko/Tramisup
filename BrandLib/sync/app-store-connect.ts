import { createSign } from "node:crypto";
import { decryptSecret } from "@/lib/crypto";

interface AppStoreConnectConfig {
  issuerId: string;
  keyId: string;
  encryptedPrivateKey: string;
  appIdentifier?: string | null;
  accountDisplayName?: string | null;
}

function normalizePrivateKey(raw: string): string {
  const stripped = raw.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g, "");
  const wrapped = stripped.match(/.{1,64}/g)?.join("\n") ?? stripped;
  return `-----BEGIN PRIVATE KEY-----\n${wrapped}\n-----END PRIVATE KEY-----`;
}

export function generateAppStoreConnectJWT(
  issuerId: string,
  keyId: string,
  privateKeyPem: string
): string {
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(
    JSON.stringify({ alg: "ES256", kid: keyId, typ: "JWT" })
  ).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({ iss: issuerId, iat: now, exp: now + 1200, aud: "appstoreconnect-v1" })
  ).toString("base64url");

  const sign = createSign("SHA256");
  sign.update(`${header}.${payload}`);
  sign.end();

  const signature = sign
    .sign({ key: normalizePrivateKey(privateKeyPem), dsaEncoding: "ieee-p1363" })
    .toString("base64url");

  return `${header}.${payload}.${signature}`;
}

async function callAppStoreConnectApi<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`https://api.appstoreconnect.apple.com/v1${path}`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`App Store Connect API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

export async function syncAppStoreConnect(
  _productId: string,
  configData: string
): Promise<number> {
  const config = JSON.parse(configData) as AppStoreConnectConfig;

  if (!config.issuerId || !config.keyId || !config.encryptedPrivateKey) {
    throw new Error("App Store Connect config is incomplete: missing issuerId, keyId, or privateKey");
  }

  const privateKey = decryptSecret(config.encryptedPrivateKey);
  const jwt = generateAppStoreConnectJWT(config.issuerId, config.keyId, privateKey);

  // Verify connection by listing apps (limit 1)
  const appsResponse = await callAppStoreConnectApi<{ data: { id: string; attributes: { bundleId: string; name: string } }[] }>(
    "/apps?limit=1",
    jwt
  );

  if (!Array.isArray(appsResponse.data)) {
    throw new Error("Unexpected response from App Store Connect apps endpoint");
  }

  // If appIdentifier is set, verify the app exists in this account
  if (config.appIdentifier) {
    const encodedBundleId = encodeURIComponent(config.appIdentifier);
    const filtered = await callAppStoreConnectApi<{ data: unknown[] }>(
      `/apps?filter[bundleId]=${encodedBundleId}&limit=1`,
      jwt
    );
    if (!filtered.data || filtered.data.length === 0) {
      throw new Error(
        `App with bundle ID "${config.appIdentifier}" not found in this App Store Connect account`
      );
    }
  }

  // Connection verified. Sales report sync requires vendorNumber which is not stored yet.
  // Return 0 — no metric rows written until vendor number is configured.
  return 0;
}
