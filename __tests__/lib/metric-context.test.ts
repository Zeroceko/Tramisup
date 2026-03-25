import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma before importing the module
vi.mock('@/lib/prisma', () => ({
  prisma: {
    metric: {
      findMany: vi.fn(),
    },
    integration: {
      findMany: vi.fn(),
    },
  },
}));

import { getMetricContext } from '@/lib/metric-context';
import { prisma } from '@/lib/prisma';

const mockedMetricFindMany = vi.mocked(prisma.metric.findMany);
const mockedIntegrationFindMany = vi.mocked(prisma.integration.findMany);

describe('getMetricContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null snapshot and empty integrations when no data exists', async () => {
    mockedMetricFindMany.mockResolvedValue([]);
    mockedIntegrationFindMany.mockResolvedValue([]);

    const result = await getMetricContext('product-123');

    expect(result.snapshot).toBeNull();
    expect(result.integrations).toEqual([]);
    expect(result.contextString).toContain('Henüz metrik kaydı yok');
    expect(result.contextString).toContain('Bağlı entegrasyon yok');
  });

  it('returns snapshot with correct values when metrics exist', async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    mockedMetricFindMany.mockResolvedValue([
      {
        id: 'metric-1',
        productId: 'product-123',
        date: today,
        dau: 150,
        mau: 1200,
        mrr: 2500.0,
        activeSubscriptions: 45,
        newSignups: 12,
        churnedUsers: 3,
        activationRate: 0.65,
        source: 'INTEGRATION' as const,
        createdAt: today,
      },
      {
        id: 'metric-2',
        productId: 'product-123',
        date: yesterday,
        dau: 140,
        mau: 1180,
        mrr: 2400.0,
        activeSubscriptions: 43,
        newSignups: 10,
        churnedUsers: 1,
        activationRate: 0.62,
        source: 'INTEGRATION' as const,
        createdAt: yesterday,
      },
    ]);

    mockedIntegrationFindMany.mockResolvedValue([
      {
        id: 'int-1',
        productId: 'product-123',
        provider: 'GA4' as const,
        status: 'CONNECTED' as const,
        config: '{}',
        lastSyncAt: today,
        createdAt: today,
        updatedAt: today,
      },
      {
        id: 'int-2',
        productId: 'product-123',
        provider: 'STRIPE' as const,
        status: 'CONNECTED' as const,
        config: '{}',
        lastSyncAt: today,
        createdAt: today,
        updatedAt: today,
      },
    ]);

    const result = await getMetricContext('product-123');

    // Snapshot values
    expect(result.snapshot).not.toBeNull();
    expect(result.snapshot!.latestMrr).toBe(2500.0);
    expect(result.snapshot!.latestDau).toBe(150);
    expect(result.snapshot!.latestMau).toBe(1200);
    expect(result.snapshot!.latestNewSignups).toBe(12);
    expect(result.snapshot!.latestChurnedUsers).toBe(3);
    expect(result.snapshot!.latestActiveSubscriptions).toBe(45);
    expect(result.snapshot!.latestActivationRate).toBe(0.65);

    // Trend calculations
    expect(result.snapshot!.mrrTrend).toBe('up');   // 2500 > 2400
    expect(result.snapshot!.dauTrend).toBe('up');    // 150 > 140

    // Integration list
    expect(result.integrations).toEqual(['GA4', 'STRIPE']);

    // Context string content
    expect(result.contextString).toContain('GERÇEK METRİK VERİSİ');
    expect(result.contextString).toContain('MRR');
    expect(result.contextString).toContain('DAU');
    expect(result.contextString).toContain('GA4');
    expect(result.contextString).toContain('STRIPE');
  });

  it('detects downward MRR trend correctly', async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    mockedMetricFindMany.mockResolvedValue([
      {
        id: 'metric-1',
        productId: 'product-123',
        date: today,
        dau: 100,
        mau: null,
        mrr: 1800.0,
        activeSubscriptions: null,
        newSignups: null,
        churnedUsers: null,
        activationRate: null,
        source: 'INTEGRATION' as const,
        createdAt: today,
      },
      {
        id: 'metric-2',
        productId: 'product-123',
        date: yesterday,
        dau: 120,
        mau: null,
        mrr: 2200.0,
        activeSubscriptions: null,
        newSignups: null,
        churnedUsers: null,
        activationRate: null,
        source: 'INTEGRATION' as const,
        createdAt: yesterday,
      },
    ]);

    mockedIntegrationFindMany.mockResolvedValue([]);

    const result = await getMetricContext('product-123');

    expect(result.snapshot!.mrrTrend).toBe('down');  // 1800 < 2200
    expect(result.snapshot!.dauTrend).toBe('down');   // 100 < 120
    expect(result.contextString).toContain('DİKKAT');  // Warning flags
    expect(result.contextString).toContain('MRR düşüş');
    expect(result.contextString).toContain('DAU düşüyor');
  });

  it('handles stable metrics correctly', async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    mockedMetricFindMany.mockResolvedValue([
      {
        id: 'metric-1',
        productId: 'product-123',
        date: today,
        dau: 100,
        mau: null,
        mrr: 2000.0,
        activeSubscriptions: null,
        newSignups: null,
        churnedUsers: 0,
        activationRate: null,
        source: 'MANUAL' as const,
        createdAt: today,
      },
      {
        id: 'metric-2',
        productId: 'product-123',
        date: yesterday,
        dau: 100,
        mau: null,
        mrr: 2000.0,
        activeSubscriptions: null,
        newSignups: null,
        churnedUsers: 0,
        activationRate: null,
        source: 'MANUAL' as const,
        createdAt: yesterday,
      },
    ]);

    mockedIntegrationFindMany.mockResolvedValue([]);

    const result = await getMetricContext('product-123');

    expect(result.snapshot!.mrrTrend).toBe('stable');
    expect(result.snapshot!.dauTrend).toBe('stable');
    expect(result.contextString).toContain('Manuel giriş');
  });

  it('shows integration recommendation when no integrations are connected', async () => {
    mockedMetricFindMany.mockResolvedValue([]);
    mockedIntegrationFindMany.mockResolvedValue([]);

    const result = await getMetricContext('product-123');

    expect(result.contextString).toContain('Stripe');
    expect(result.contextString).toContain('GA4');
  });

  it('shows integration names when synced but waiting for first data', async () => {
    mockedMetricFindMany.mockResolvedValue([]);
    mockedIntegrationFindMany.mockResolvedValue([
      {
        id: 'int-1',
        productId: 'product-123',
        provider: 'GA4' as const,
        status: 'CONNECTED' as const,
        config: '{}',
        lastSyncAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const result = await getMetricContext('product-123');

    expect(result.snapshot).toBeNull();
    expect(result.integrations).toEqual(['GA4']);
    expect(result.contextString).toContain('GA4');
    expect(result.contextString).toContain('İlk sync bekleniyor');
  });
});
