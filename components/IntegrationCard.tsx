"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Integration {
  provider: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface ExistingIntegration {
  id: string;
  status: string;
  lastSyncAt: Date | null;
}

export default function IntegrationCard({
  integration,
  existingIntegration,
  projectId,
}: {
  integration: Integration;
  existingIntegration?: ExistingIntegration;
  projectId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [apiKey, setApiKey] = useState("");

  const isConnected = existingIntegration?.status === "CONNECTED";

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          provider: integration.provider,
          apiKey,
        }),
      });

      if (response.ok) {
        setShowConfig(false);
        setApiKey("");
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to connect integration:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!existingIntegration) return;
    setLoading(true);

    try {
      await fetch(`/api/integrations/${existingIntegration.id}`, {
        method: "DELETE",
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to disconnect integration:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!existingIntegration) return;
    setLoading(true);

    try {
      await fetch(`/api/integrations/${existingIntegration.id}/test`, {
        method: "POST",
      });
      alert("Test connection successful! (Mock response)");
      router.refresh();
    } catch (error) {
      console.error("Failed to test connection:", error);
      alert("Test connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${integration.color} flex items-center justify-center text-2xl mb-4`}>
        {integration.icon}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{integration.name}</h3>
      <p className="text-sm text-gray-600 mb-4">{integration.description}</p>

      {isConnected ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
              ✓ Connected
            </span>
            {existingIntegration?.lastSyncAt && (
              <span className="text-xs text-gray-500">
                Last: {new Date(existingIntegration.lastSyncAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleTestConnection}
              disabled={loading}
              className="flex-1 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              Test Connection
            </button>
            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              Disconnect
            </button>
          </div>
        </div>
      ) : showConfig ? (
        <form onSubmit={handleConnect} className="space-y-3">
          <input
            type="text"
            placeholder="API Key / Token"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Connecting..." : "Connect"}
            </button>
            <button
              type="button"
              onClick={() => setShowConfig(false)}
              className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowConfig(true)}
          className="w-full px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Connect
        </button>
      )}
    </div>
  );
}
