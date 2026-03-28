import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '@/lib/prisma';
import { getDefaultGa4Property } from '@/lib/ga4-admin';
import { syncMetricToEntry } from '@/lib/sync-to-metric-entry';

export async function syncGa4(productId: string, configData: string): Promise<number> {
  const config = JSON.parse(configData);
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret || !config.refresh_token) {
    throw new Error("Missing Google OAuth components or missing refresh_token");
  }

  const oauth2Client = new OAuth2Client(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: config.refresh_token });
  const propertyId =
    typeof config.propertyId === "string" && config.propertyId.length > 0
      ? config.propertyId
      : (await getDefaultGa4Property(configData)).propertyId;

  const analyticsDataClient = new BetaAnalyticsDataClient({ authClient: oauth2Client });

  const [response] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [
      {
        startDate: '14daysAgo',
        endDate: 'today',
      },
    ],
    dimensions: [
      {
        name: 'date',
      },
    ],
    metrics: [
      { name: 'activeUsers' },
      { name: 'totalUsers' },
      { name: 'newUsers' }
    ],
  });

  let syncedRecords = 0;

  if (response.rows) {
    for (const row of response.rows) {
      if (!row.dimensionValues || !row.metricValues) continue;

      const dateStr = row.dimensionValues[0].value;
      if (!dateStr || dateStr.length !== 8) continue;
      
      const year = parseInt(dateStr.substring(0, 4));
      const month = parseInt(dateStr.substring(4, 6)) - 1;
      const day = parseInt(dateStr.substring(6, 8));
      
      const date = new Date(year, month, day, 0, 0, 0, 0);
      
      const dau = parseInt(row.metricValues[0].value || '0');
      const mau = parseInt(row.metricValues[1].value || '0'); // using totalUsers as broad replacement
      const newSignups = parseInt(row.metricValues[2].value || '0');

      await prisma.metric.upsert({
        where: {
          productId_date: {
            productId,
            date
          }
        },
        create: {
          productId,
          date,
          dau,
          mau,
          newSignups,
          source: 'INTEGRATION'
        },
        update: {
          dau,
          mau,
          newSignups,
          source: 'INTEGRATION'
        }
      });

      // Bridge: propagate synced values into AARRR MetricEntry
      await syncMetricToEntry(productId, date);

      syncedRecords++;
    }
  }

  return syncedRecords;
}
