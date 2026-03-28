import { prisma } from "@/lib/prisma";
import { listGa4Properties, type Ga4PropertyOption } from "@/lib/ga4-admin";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { OAuth2Client } from "google-auth-library";
import Stripe from "stripe";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ValidationStatus = "TRUSTED" | "UNTRUSTED" | "UNKNOWN";

export type ValidationErrorCode =
  | "AUTH_EXPIRED"
  | "PERMISSION_DENIED"
  | "NO_DATA"
  | "WRONG_PROPERTY"
  | "NETWORK"
  | "MISSING_CONFIG";

export type ValidationCheck = {
  key: string;
  label: string;
  passed: boolean;
  detail?: string;
};

export type Ga4ValidationResult = {
  provider: "GA4";
  status: ValidationStatus;
  checks: ValidationCheck[];
  errorCode?: ValidationErrorCode;
  properties?: Ga4PropertyOption[];
  selectedPropertyId?: string | null;
  preview?: {
    dau: number;
    totalUsers: number;
    newUsers: number;
    dataPointCount: number;
    dateRange: string;
  };
};

export type StripeValidationResult = {
  provider: "STRIPE";
  status: ValidationStatus;
  checks: ValidationCheck[];
  errorCode?: ValidationErrorCode;
  preview?: {
    activeSubscriptions: number;
    mrr: number;
    currency: string;
    recentCharges: number;
  };
};

export type ValidationResult = Ga4ValidationResult | StripeValidationResult;

// ─── GA4 Validation ──────────────────────────────────────────────────────────

export async function validateGa4(
  integrationId: string
): Promise<Ga4ValidationResult> {
  const checks: ValidationCheck[] = [];

  const integration = await prisma.integration.findUnique({
    where: { id: integrationId },
  });

  if (!integration?.config) {
    return {
      provider: "GA4",
      status: "UNTRUSTED",
      checks: [
        { key: "config", label: "Bağlantı bilgileri", passed: false, detail: "OAuth yapılandırması bulunamadı." },
      ],
      errorCode: "MISSING_CONFIG",
    };
  }

  const config = JSON.parse(integration.config) as {
    refresh_token?: string;
    propertyId?: string;
  };

  // Check 1: OAuth token validity
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret || !config.refresh_token) {
    checks.push({ key: "auth", label: "OAuth kimlik doğrulama", passed: false, detail: "Eksik kimlik bilgileri." });
    return { provider: "GA4", status: "UNTRUSTED", checks, errorCode: "AUTH_EXPIRED" };
  }

  let oauth2Client: OAuth2Client;
  try {
    oauth2Client = new OAuth2Client(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: config.refresh_token });
    await oauth2Client.getAccessToken();
    checks.push({ key: "auth", label: "OAuth kimlik doğrulama", passed: true });
  } catch {
    checks.push({ key: "auth", label: "OAuth kimlik doğrulama", passed: false, detail: "Token yenileme başarısız. Yeniden bağlanmak gerekiyor." });
    return { provider: "GA4", status: "UNTRUSTED", checks, errorCode: "AUTH_EXPIRED" };
  }

  // Check 2: Property access — list available properties
  let properties: Ga4PropertyOption[] = [];
  try {
    properties = await listGa4Properties(integration.config);
    checks.push({
      key: "properties",
      label: "GA4 property erişimi",
      passed: properties.length > 0,
      detail: properties.length > 0
        ? `${properties.length} property bulundu.`
        : "Bu hesapta erişilebilir property yok.",
    });
  } catch {
    checks.push({ key: "properties", label: "GA4 property erişimi", passed: false, detail: "Property listesi alınamadı. Yetki sorunu olabilir." });
    return { provider: "GA4", status: "UNTRUSTED", checks, errorCode: "PERMISSION_DENIED", properties: [] };
  }

  if (properties.length === 0) {
    return { provider: "GA4", status: "UNTRUSTED", checks, errorCode: "NO_DATA", properties: [] };
  }

  // Check 3: If property selected, validate it has recent data
  const propertyId = config.propertyId;
  if (!propertyId) {
    checks.push({ key: "property_selected", label: "Property seçimi", passed: false, detail: "Henüz bir property seçilmedi." });
    return { provider: "GA4", status: "UNKNOWN", checks, properties, selectedPropertyId: null };
  }

  const propertyExists = properties.some((p) => p.propertyId === propertyId);
  checks.push({
    key: "property_selected",
    label: "Property seçimi",
    passed: propertyExists,
    detail: propertyExists ? `Property ${propertyId} erişilebilir.` : "Seçili property bu hesapta bulunamadı.",
  });

  if (!propertyExists) {
    return { provider: "GA4", status: "UNTRUSTED", checks, errorCode: "WRONG_PROPERTY", properties, selectedPropertyId: propertyId };
  }

  // Check 4: Recent data check — pull last 7 days
  try {
    const analyticsClient = new BetaAnalyticsDataClient({ authClient: oauth2Client });
    const [response] = await analyticsClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "activeUsers" },
        { name: "totalUsers" },
        { name: "newUsers" },
      ],
    });

    const rows = response.rows ?? [];
    const hasData = rows.length > 0;

    let totalDau = 0;
    let totalUsers = 0;
    let totalNew = 0;

    for (const row of rows) {
      if (!row.metricValues) continue;
      totalDau += parseInt(row.metricValues[0]?.value || "0");
      totalUsers += parseInt(row.metricValues[1]?.value || "0");
      totalNew += parseInt(row.metricValues[2]?.value || "0");
    }

    checks.push({
      key: "recent_data",
      label: "Son 7 gün verisi",
      passed: hasData,
      detail: hasData
        ? `${rows.length} günlük veri bulundu. Toplam ${totalDau} aktif kullanıcı.`
        : "Son 7 günde hiç veri yok. Property doğru mu kontrol et.",
    });

    const status: ValidationStatus = hasData ? "TRUSTED" : "UNTRUSTED";

    return {
      provider: "GA4",
      status,
      checks,
      properties,
      selectedPropertyId: propertyId,
      errorCode: hasData ? undefined : "NO_DATA",
      preview: hasData
        ? {
            dau: totalDau,
            totalUsers: totalUsers,
            newUsers: totalNew,
            dataPointCount: rows.length,
            dateRange: "Son 7 gün",
          }
        : undefined,
    };
  } catch {
    checks.push({ key: "recent_data", label: "Son 7 gün verisi", passed: false, detail: "Veri çekilemedi. Property yetkileri kontrol edilmeli." });
    return { provider: "GA4", status: "UNTRUSTED", checks, errorCode: "PERMISSION_DENIED", properties, selectedPropertyId: propertyId };
  }
}

// ─── Stripe Validation ───────────────────────────────────────────────────────

export async function validateStripe(
  integrationId: string
): Promise<StripeValidationResult> {
  const checks: ValidationCheck[] = [];

  const integration = await prisma.integration.findUnique({
    where: { id: integrationId },
  });

  if (!integration?.config) {
    return {
      provider: "STRIPE",
      status: "UNTRUSTED",
      checks: [
        { key: "config", label: "Bağlantı bilgileri", passed: false, detail: "Stripe yapılandırması bulunamadı." },
      ],
      errorCode: "MISSING_CONFIG",
    };
  }

  const config = JSON.parse(integration.config) as {
    stripe_user_id?: string;
    access_token?: string;
  };

  // Check 1: Stripe user ID exists
  if (!config.stripe_user_id) {
    checks.push({ key: "account", label: "Stripe hesap bağlantısı", passed: false, detail: "Stripe hesap ID'si bulunamadı." });
    return { provider: "STRIPE", status: "UNTRUSTED", checks, errorCode: "MISSING_CONFIG" };
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    checks.push({ key: "api_key", label: "Stripe API anahtarı", passed: false, detail: "Sunucu tarafında Stripe anahtarı eksik." });
    return { provider: "STRIPE", status: "UNTRUSTED", checks, errorCode: "MISSING_CONFIG" };
  }

  const stripe = new Stripe(secretKey, { apiVersion: "2026-02-25.clover" });
  const stripeAccount = config.stripe_user_id;

  // Check 2: Account accessibility
  try {
    await stripe.accounts.retrieve(stripeAccount);
    checks.push({ key: "account", label: "Stripe hesap erişimi", passed: true, detail: `Hesap ${stripeAccount} erişilebilir.` });
  } catch {
    checks.push({ key: "account", label: "Stripe hesap erişimi", passed: false, detail: "Stripe hesabına erişilemiyor. Yetki iptal edilmiş olabilir." });
    return { provider: "STRIPE", status: "UNTRUSTED", checks, errorCode: "AUTH_EXPIRED" };
  }

  // Check 3: Active subscriptions
  let activeCount = 0;
  let mrr = 0;
  let currency = "usd";
  try {
    const subs = await stripe.subscriptions.list(
      { status: "active", limit: 100 },
      { stripeAccount }
    );
    activeCount = subs.data.length;

    for (const sub of subs.data) {
      const item = sub.items.data[0];
      if (!item) continue;
      currency = item.price.currency;
      if (item.price.recurring?.interval === "month") {
        mrr += ((item.price.unit_amount || 0) * (item.quantity ?? 1)) / 100;
      } else if (item.price.recurring?.interval === "year") {
        mrr += ((item.price.unit_amount || 0) * (item.quantity ?? 1)) / 100 / 12;
      }
    }

    checks.push({
      key: "subscriptions",
      label: "Aktif abonelikler",
      passed: true,
      detail: activeCount > 0
        ? `${activeCount} aktif abonelik, ~${Math.round(mrr)} ${currency.toUpperCase()} MRR.`
        : "Henüz aktif abonelik yok. Veriler abonelik oluştukça akmaya başlar.",
    });
  } catch {
    checks.push({ key: "subscriptions", label: "Aktif abonelikler", passed: false, detail: "Abonelik verisi okunamadı. Yetki sorunu olabilir." });
    return { provider: "STRIPE", status: "UNTRUSTED", checks, errorCode: "PERMISSION_DENIED" };
  }

  // Check 4: Recent charges (last 30 days)
  let recentCharges = 0;
  try {
    const charges = await stripe.charges.list(
      {
        created: { gte: Math.floor(Date.now() / 1000) - 30 * 86400 },
        limit: 100,
      },
      { stripeAccount }
    );
    recentCharges = charges.data.length;

    checks.push({
      key: "recent_activity",
      label: "Son 30 gün aktivitesi",
      passed: true,
      detail: recentCharges > 0
        ? `${recentCharges} ödeme işlemi bulundu.`
        : "Son 30 günde ödeme işlemi yok. Veri abonelik veya ödeme oluştukça akar.",
    });
  } catch {
    checks.push({ key: "recent_activity", label: "Son 30 gün aktivitesi", passed: false, detail: "Ödeme verisi okunamadı." });
  }

  // Trust decision: connected + account accessible = at least partially trusted
  // No data doesn't mean untrusted for Stripe (new products might not have revenue yet)
  const allPassed = checks.every((c) => c.passed);
  const status: ValidationStatus = allPassed ? "TRUSTED" : "UNTRUSTED";

  return {
    provider: "STRIPE",
    status,
    checks,
    preview: {
      activeSubscriptions: activeCount,
      mrr: Math.round(mrr),
      currency: currency.toUpperCase(),
      recentCharges,
    },
  };
}
