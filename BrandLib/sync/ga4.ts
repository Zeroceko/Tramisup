import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { prisma } from '@/lib/prisma';

export async function syncGa4(productId: string, propertyId: string): Promise<number> {
  const analyticsDataClient = new BetaAnalyticsDataClient();

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
      syncedRecords++;
    }
  }

  return syncedRecords;
}
