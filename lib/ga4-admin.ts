import { AnalyticsAdminServiceClient } from "@google-analytics/admin";
import { OAuth2Client } from "google-auth-library";

export type Ga4PropertyOption = {
  accountName: string;
  accountDisplayName: string;
  propertyId: string;
  propertyName: string;
  propertyDisplayName: string;
};

function createOAuthClient(configData: string) {
  const config = JSON.parse(configData) as {
    refresh_token?: string;
  };
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret || !config.refresh_token) {
    throw new Error("Missing Google OAuth components or missing refresh_token");
  }

  const oauth2Client = new OAuth2Client(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: config.refresh_token });

  return oauth2Client;
}

export async function listGa4Properties(configData: string): Promise<Ga4PropertyOption[]> {
  const oauth2Client = createOAuthClient(configData);
  const adminClient = new AnalyticsAdminServiceClient({ authClient: oauth2Client });
  const [accountSummaries] = await adminClient.listAccountSummaries();

  const options = (accountSummaries ?? []).flatMap((accountSummary) =>
    (accountSummary.propertySummaries ?? []).flatMap((propertySummary) => {
      const propertyName = propertySummary.property ?? "";
      const propertyId = propertyName.replace("properties/", "");

      if (!propertyId) {
        return [];
      }

      return [
        {
          accountName: accountSummary.name ?? "",
          accountDisplayName: accountSummary.displayName ?? "Google Analytics account",
          propertyId,
          propertyName,
          propertyDisplayName: propertySummary.displayName ?? propertyId,
        },
      ];
    }),
  );

  return options.sort((left: Ga4PropertyOption, right: Ga4PropertyOption) => {
    const leftLabel = `${left.accountDisplayName} ${left.propertyDisplayName}`;
    const rightLabel = `${right.accountDisplayName} ${right.propertyDisplayName}`;
    return leftLabel.localeCompare(rightLabel, "tr");
  });
}

export async function getDefaultGa4Property(configData: string): Promise<Ga4PropertyOption> {
  const properties = await listGa4Properties(configData);
  const firstProperty = properties[0];

  if (!firstProperty) {
    throw new Error("No Google Analytics 4 properties found on this account.");
  }

  return firstProperty;
}
