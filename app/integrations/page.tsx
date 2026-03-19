import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import IntegrationCard from "@/components/IntegrationCard";

const AVAILABLE_INTEGRATIONS = [
  {
    provider: "STRIPE",
    name: "Stripe",
    description: "Import revenue, subscriptions, and customer data",
    icon: "💳",
    color: "from-purple-500 to-indigo-500",
  },
  {
    provider: "GA4",
    name: "Google Analytics 4",
    description: "Sync user behavior and traffic data",
    icon: "📊",
    color: "from-orange-500 to-red-500",
  },
  {
    provider: "MIXPANEL",
    name: "Mixpanel",
    description: "Track events and user analytics",
    icon: "📈",
    color: "from-blue-500 to-purple-500",
  },
  {
    provider: "SEGMENT",
    name: "Segment",
    description: "Centralized data collection platform",
    icon: "🔄",
    color: "from-green-500 to-teal-500",
  },
  {
    provider: "AMPLITUDE",
    name: "Amplitude",
    description: "Product analytics and user insights",
    icon: "📉",
    color: "from-indigo-500 to-blue-500",
  },
  {
    provider: "POSTHOG",
    name: "PostHog",
    description: "Open-source product analytics",
    icon: "🦔",
    color: "from-yellow-500 to-orange-500",
  },
];

export default async function IntegrationsPage() {
  const session = await getServerSession(authOptions);

  const product = await prisma.product.findFirst({
    where: { userId: session?.user?.id },
  });

  if (!product) {
    return <div>Product not found</div>;
  }

  const existingIntegrations = await prisma.integration.findMany({
    where: { productId: product.id },
  });

  const integrationMap = new Map(
    existingIntegrations.map((i) => [i.provider, i])
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Integrations</h1>
        <p className="text-gray-600">
          Connect your tools to automatically sync metrics and data
        </p>
      </div>

      <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
        <div className="flex items-start gap-3">
          <span className="text-2xl">ℹ️</span>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">Integration Foundation (v1)</h3>
            <p className="text-sm text-blue-800">
              This version includes the integration architecture and connection UI.
              Actual data syncing will be implemented in future releases.
              You can test connections and see mock sync jobs.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {AVAILABLE_INTEGRATIONS.map((integration) => {
          const existing = integrationMap.get(integration.provider as any);
          return (
            <IntegrationCard
              key={integration.provider}
              integration={integration}
              existingIntegration={existing}
              productId={product.id}
            />
          );
        })}
      </div>

      {existingIntegrations.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Sync Jobs</h2>
          <div className="text-center text-gray-500 py-8">
            Sync history will appear here once integrations are active
          </div>
        </div>
      )}
    </div>
  );
}
