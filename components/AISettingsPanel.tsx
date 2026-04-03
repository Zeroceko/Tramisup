"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Link2, Unplug, Bot, ShieldCheck, KeyRound } from "lucide-react";
import { toast } from "@/components/ui/sonner";

type AIConnectionItem = {
  id: string;
  provider: "GOOGLE_AI" | "OPENAI" | "ANTHROPIC";
  authType: string;
  status: string;
  label: string | null;
  remoteAccountEmail: string | null;
  createdAt: string;
  updatedAt: string;
};

type ProductAISettingsItem = {
  mode: "PLATFORM_DEFAULT" | "CONNECTED_MODEL";
  selectedConnectionId: string | null;
};

type FeedbackTone = "success" | "error";

const FEEDBACK_COPY: Record<string, {
  tone: FeedbackTone;
  en: { title: string; body: string };
  tr: { title: string; body: string };
}> = {
  google_ai_connected: {
    tone: "success",
    en: { title: "Google AI account connected", body: "This connection is now available to select for this product. We linked it via OAuth." },
    tr: { title: "Google AI hesabı bağlandı", body: "Bu bağlantı artık bu ürün için seçilebilir. Google hesabını OAuth ile bağladık." },
  },
  google_ai_denied: {
    tone: "error",
    en: { title: "Google AI connection not completed", body: "The OAuth flow was cancelled. You can try again whenever you're ready." },
    tr: { title: "Google AI bağlantısı tamamlanmadı", body: "OAuth akışı yarıda kaldı. İstersen tekrar deneyebilirsin." },
  },
  google_ai_invalid_state: {
    tone: "error",
    en: { title: "Connection state mismatch", body: "The OAuth callback didn't match the expected product or user. Please try again." },
    tr: { title: "Bağlantı state'i uyuşmadı", body: "OAuth callback beklenen ürün veya kullanıcı bilgisiyle eşleşmedi. Tekrar dene." },
  },
  google_ai_unauthorized_product: {
    tone: "error",
    en: { title: "Connection could not be verified for this product", body: "The selected product didn't match the connected account. Refresh and try again." },
    tr: { title: "Bu ürün için bağlantı doğrulanamadı", body: "Seçili ürün ile bağlanan hesap eşleşmedi. Sayfayı yenileyip tekrar dene." },
  },
  google_ai_missing_env: {
    tone: "error",
    en: { title: "Google AI OAuth configuration missing", body: "The required Google client credentials appear to be missing on the server." },
    tr: { title: "Google AI OAuth ayarı eksik", body: "Sunucuda gerekli Google client secret ayarları eksik görünüyor." },
  },
  google_ai_exchange_failed: {
    tone: "error",
    en: { title: "Google token exchange failed", body: "Google granted access but the token exchange step didn't complete." },
    tr: { title: "Google token değişimi başarısız oldu", body: "Google izin verdi ama token alma aşaması tamamlanamadı." },
  },
  google_ai_oauth_crash: {
    tone: "error",
    en: { title: "Google AI callback encountered an error", body: "The OAuth callback stopped unexpectedly. Please try again." },
    tr: { title: "Google AI callback hata verdi", body: "OAuth callback beklenmedik şekilde durdu." },
  },
};

const PROVIDER_NAMES: Record<AIConnectionItem["provider"], string> = {
  GOOGLE_AI: "Google AI",
  OPENAI: "ChatGPT",
  ANTHROPIC: "Claude",
};

export default function AISettingsPanel({
  locale,
  activeProductId,
  activeProductName,
  connections,
  settings,
  success,
  error,
}: {
  locale: string;
  activeProductId: string | null;
  activeProductName: string | null;
  connections: AIConnectionItem[];
  settings: ProductAISettingsItem | null;
  success?: string;
  error?: string;
}) {
  const router = useRouter();
  const isEn = locale === "en";
  const [savingMode, setSavingMode] = useState(false);
  const [disconnectingId, setDisconnectingId] = useState<string | null>(null);
  const [connectionProvider, setConnectionProvider] = useState<"GOOGLE_AI" | "OPENAI" | "ANTHROPIC">("GOOGLE_AI");
  const [apiKeyValue, setApiKeyValue] = useState("");
  const [savingApiKey, setSavingApiKey] = useState(false);

  const connectedConnections = useMemo(
    () => connections.filter((item) => item.status === "CONNECTED"),
    [connections]
  );
  const selectedConnectionId = settings?.selectedConnectionId ?? null;
  const activeMode = settings?.mode ?? "PLATFORM_DEFAULT";
  const feedbackEntry = success ? FEEDBACK_COPY[success] : error ? FEEDBACK_COPY[error] : null;
  const feedback = feedbackEntry
    ? { tone: feedbackEntry.tone, ...(isEn ? feedbackEntry.en : feedbackEntry.tr) }
    : null;

  async function selectMode(mode: "PLATFORM_DEFAULT" | "CONNECTED_MODEL", connectionId?: string) {
    if (!activeProductId) return;

    setSavingMode(true);
    try {
      const res = await fetch(`/api/products/${activeProductId}/ai-settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          selectedConnectionId: mode === "CONNECTED_MODEL" ? connectionId : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (isEn ? "Failed to save AI setting" : "AI ayarı kaydedilemedi"));
      }

      toast.success(
        mode === "PLATFORM_DEFAULT"
          ? isEn
            ? "Tiramisup AI is active for this product."
            : "Bu ürün için Tiramisup AI aktif."
          : isEn
            ? "Your connected model is active for this product."
            : "Bu ürün için bağladığın model aktif."
      );
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : (isEn ? "Failed to save AI setting" : "AI ayarı kaydedilemedi"));
    } finally {
      setSavingMode(false);
    }
  }

  async function disconnect(connectionId: string) {
    setDisconnectingId(connectionId);
    try {
      const res = await fetch(`/api/ai/connections/${connectionId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (isEn ? "Could not remove connection" : "Bağlantı kaldırılamadı"));
      }

      toast.success(isEn ? "Connection removed." : "Bağlantı kaldırıldı.");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : (isEn ? "Could not remove connection" : "Bağlantı kaldırılamadı"));
    } finally {
      setDisconnectingId(null);
    }
  }

  async function saveApiKeyConnection() {
    if (!apiKeyValue.trim() || connectionProvider === "GOOGLE_AI") return;

    setSavingApiKey(true);
    try {
      const res = await fetch("/api/ai/connections/api-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: connectionProvider,
          apiKey: apiKeyValue.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (isEn ? "Could not save API key" : "API key kaydedilemedi"));
      }

      toast.success(
        isEn
          ? `${PROVIDER_NAMES[connectionProvider]} connection saved.`
          : `${PROVIDER_NAMES[connectionProvider]} bağlantısı kaydedildi.`
      );
      setApiKeyValue("");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : (isEn ? "Could not save API key" : "API key kaydedilemedi"));
    } finally {
      setSavingApiKey(false);
    }
  }

  return (
    <section className="space-y-5 rounded-[20px] border border-[#e8e8e8] bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">
            {isEn ? "AI engine" : "AI Motoru"}
          </p>
          <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
            {isEn ? "Choose how Ask Tiramisup should think" : "Ask Tiramisup hangi motorla çalışsın?"}
          </h2>
          <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#666d80]">
            {isEn
              ? "Keep Tiramisup AI as the default, or connect your Google AI account with OAuth and use it per product."
              : "Varsayılan olarak Tiramisup AI kalabilir. İstersen Google AI hesabını OAuth ile bağlayıp ürün bazında kullanabilirsin."}
          </p>
        </div>

      </div>

      {feedback && (
        <div
          className={`rounded-[16px] border p-4 ${
            feedback.tone === "success"
              ? "border-[#bbf7d0] bg-[#f0fdf4]"
              : "border-[#fecaca] bg-[#fef2f2]"
          }`}
        >
          <p className="text-[13px] font-semibold text-[#0d0d12]">{feedback.title}</p>
          <p className="mt-0.5 text-[13px] leading-5 text-[#666d80]">{feedback.body}</p>
        </div>
      )}

      <div className="rounded-[18px] border border-[#dbeafe] bg-[#eff6ff] p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#2563eb]">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div className="space-y-2 text-[13px] leading-6 text-[#36527a]">
            <p className="font-semibold text-[#163c71]">
              {isEn ? "How we keep model connections safe" : "Model bağlantılarını nasıl güvenli tutuyoruz"}
            </p>
            <p>
              {isEn
                ? "We only ask for provider-issued credentials. Keys and OAuth tokens are encrypted before they reach the database, used only to answer inside Tiramisup, and you can disconnect them anytime."
                : "Yalnızca sağlayıcının verdiği kimlik bilgisini isteriz. Anahtarlar ve OAuth token'ları veritabanına yazılmadan önce şifrelenir, sadece Tiramisup içindeki yanıtlar için kullanılır ve istediğin an bağlantıyı kaldırabilirsin."}
            </p>
            <p>
              {isEn
                ? "If you prefer, create a separate project-scoped key for Tiramisup instead of reusing your main account key."
                : "İstersen ana hesabındaki anahtarı kullanmak yerine Tiramisup için ayrı, proje-bazlı bir key oluşturabilirsin."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-[18px] border border-[#eadfe6] bg-[linear-gradient(180deg,_#fffefe_0%,_#fff7fa_100%)] p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fce7f3] text-[#c45d97]">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[15px] font-semibold text-[#0d0d12]">Tiramisup AI</p>
              <p className="text-[12px] text-[#8b93a6]">
                {isEn ? "Default product-aware assistant" : "Varsayılan, ürün bağlamını bilen asistan"}
              </p>
            </div>
          </div>

          <p className="mt-4 text-[13px] leading-6 text-[#666d80]">
            {isEn
              ? "Best when you want zero setup. Ask Tiramisup continues to use platform AI and product context."
              : "Kurulum gerektirmeden çalışır. Ask Tiramisup platform AI'ı ve ürün bağlamını kullanmaya devam eder."}
          </p>

          <button
            type="button"
            onClick={() => void selectMode("PLATFORM_DEFAULT")}
            disabled={savingMode || !activeProductId}
            className={`mt-4 inline-flex h-10 items-center justify-center rounded-full px-4 text-[13px] font-semibold transition ${
              activeMode === "PLATFORM_DEFAULT"
                ? "bg-[#ffd7ef] text-[#0d0d12]"
                : "bg-[#111014] text-white hover:bg-[#28232a]"
            } disabled:opacity-60`}
          >
            {activeMode === "PLATFORM_DEFAULT"
              ? isEn
                ? "Active for this product"
                : "Bu üründe aktif"
              : isEn
                ? "Use Tiramisup AI"
                : "Tiramisup AI kullan"}
          </button>
        </div>

        <div className="rounded-[18px] border border-[#e8e8e8] bg-[#fafafa] p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4ff] text-[#2563eb]">
              <Bot className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[15px] font-semibold text-[#0d0d12]">
                {isEn ? "Your connected model" : "Bağladığın model"}
              </p>
              <p className="text-[12px] text-[#8b93a6]">
                {activeProductName
                  ? isEn
                    ? `Set a product-specific engine for ${activeProductName}.`
                    : `${activeProductName} için ürün bazlı motor seç.`
                  : isEn
                    ? "Choose a connected engine per product."
                    : "Ürün bazında bağlı motor seç."}
              </p>
            </div>
          </div>

          {connectedConnections.length === 0 ? (
            <div className="mt-4 rounded-[14px] border border-dashed border-[#d8dbe2] bg-white px-4 py-4 text-[13px] leading-6 text-[#666d80]">
              {isEn
                ? "No model connection yet. Add one from the provider picker below, then activate it for this product."
                : "Henüz bir model bağlantısı yok. Aşağıdaki sağlayıcı seçiciden ekleyip sonra bu ürün için aktifleştirebilirsin."}
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {connectedConnections.map((connection) => {
                const isSelected =
                  activeMode === "CONNECTED_MODEL" &&
                  selectedConnectionId === connection.id;

                return (
                  <div
                    key={connection.id}
                    className={`rounded-[16px] border p-4 ${
                      isSelected
                        ? "border-[#bfd7ff] bg-[#f5f9ff]"
                        : "border-[#e8e8e8] bg-white"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[14px] font-semibold text-[#0d0d12]">
                          {connection.label || "Google AI"}
                        </p>
                        <p className="mt-1 text-[12px] text-[#666d80]">
                          {connection.remoteAccountEmail || (isEn ? "Connected with OAuth" : "OAuth ile bağlandı")}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          connection.status === "CONNECTED"
                            ? "bg-[#f0fdf4] text-[#15803d]"
                            : "bg-[#fef2f2] text-[#dc2626]"
                        }`}
                      >
                        {connection.status === "CONNECTED"
                          ? isEn
                            ? "Connected"
                            : "Bağlı"
                          : connection.status}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void selectMode("CONNECTED_MODEL", connection.id)}
                        disabled={savingMode || !activeProductId || connection.status !== "CONNECTED"}
                        className={`inline-flex h-10 items-center justify-center rounded-full px-4 text-[13px] font-semibold transition ${
                          isSelected
                            ? "bg-[#dbeafe] text-[#1d4ed8]"
                            : "bg-[#111014] text-white hover:bg-[#28232a]"
                        } disabled:opacity-60`}
                      >
                        {isSelected
                          ? isEn
                            ? "Active for this product"
                            : "Bu üründe aktif"
                          : isEn
                            ? "Use for this product"
                            : "Bu üründe kullan"}
                      </button>

                      <button
                        type="button"
                        onClick={() => void disconnect(connection.id)}
                        disabled={disconnectingId === connection.id}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-4 text-[13px] font-semibold text-[#666d80] transition hover:bg-[#f7f7fa] hover:text-[#0d0d12] disabled:opacity-60"
                      >
                        <Unplug className="h-4 w-4" />
                        {disconnectingId === connection.id
                          ? isEn
                            ? "Removing..."
                            : "Kaldırılıyor..."
                          : isEn
                            ? "Disconnect"
                            : "Bağlantıyı kaldır"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="rounded-[18px] border border-[#e8e8e8] bg-white p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ecfeff] text-[#0f766e]">
              <KeyRound className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[15px] font-semibold text-[#0d0d12]">
                {isEn ? "Add a model connection" : "Bir model bağlantısı ekle"}
              </p>
              <p className="text-[12px] text-[#8b93a6]">
                {isEn
                  ? "Google AI, ChatGPT, and Claude all live in the same connection picker."
                  : "Google AI, ChatGPT ve Claude aynı bağlantı seçicisinde yer alır."}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {(["GOOGLE_AI", "OPENAI", "ANTHROPIC"] as const).map((provider) => {
              const active = connectionProvider === provider;
              return (
                <button
                  key={provider}
                  type="button"
                  onClick={() => setConnectionProvider(provider)}
                  className={`inline-flex h-9 items-center rounded-full px-4 text-[12px] font-semibold transition ${
                    active
                      ? "bg-[#111014] text-white"
                      : "bg-[#f7f7fa] text-[#666d80] hover:bg-[#eef1f6] hover:text-[#0d0d12]"
                  }`}
                >
                  {PROVIDER_NAMES[provider]}
                </button>
              );
            })}
          </div>

          <div className="mt-4 space-y-3">
            {connectionProvider === "GOOGLE_AI" ? (
              <>
                <div className="rounded-[14px] border border-[#dbeafe] bg-[#eff6ff] px-4 py-4 text-[13px] leading-6 text-[#36527a]">
                  {isEn
                    ? "Google AI connects with OAuth. We redirect you to Google, you approve access, and Tiramisup stores the encrypted token."
                    : "Google AI OAuth ile bağlanır. Seni Google'a yönlendiririz, erişimi onaylarsın ve Tiramisup şifreli token'ı saklar."}
                </div>
                <a
                  href={activeProductId ? `/api/ai/connections/google/link?productId=${activeProductId}&locale=${locale}` : "#"}
                  className={`inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-[13px] font-semibold transition ${
                    activeProductId
                      ? "bg-[#111014] text-white hover:bg-[#28232a]"
                      : "cursor-not-allowed bg-[#e5e7eb] text-[#9ca3af]"
                  }`}
                  aria-disabled={!activeProductId}
                >
                  <Link2 className="h-4 w-4" />
                  {isEn ? "Connect Google AI" : "Google AI bağla"}
                </a>
              </>
            ) : (
              <>
                <input
                  type="password"
                  value={apiKeyValue}
                  onChange={(event) => setApiKeyValue(event.target.value)}
                  placeholder={connectionProvider === "OPENAI" ? "sk-..." : "sk-ant-..."}
                  className="w-full rounded-[14px] border border-[#e8e8e8] bg-white px-4 py-3 text-[13px] text-[#0d0d12] outline-none transition focus:border-[#95dbda]"
                />
                <p className="text-[12px] leading-5 text-[#666d80]">
                  {connectionProvider === "OPENAI"
                    ? isEn
                      ? "Paste an OpenAI API key. This is not your ChatGPT password; use a project key from the OpenAI platform."
                      : "OpenAI API key yapıştır. Bu ChatGPT şifren değil; OpenAI platformunda ürettiğin proje key'ini kullan."
                    : isEn
                      ? "Paste an Anthropic API key. We recommend creating a separate key for Tiramisup."
                      : "Anthropic API key yapıştır. Tiramisup için ayrı bir key oluşturmanı öneririz."}
                </p>
                <button
                  type="button"
                  onClick={() => void saveApiKeyConnection()}
                  disabled={savingApiKey || !apiKeyValue.trim()}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-[#111014] px-4 text-[13px] font-semibold text-white transition hover:bg-[#28232a] disabled:opacity-60"
                >
                  {savingApiKey
                    ? isEn
                      ? "Saving..."
                      : "Kaydediliyor..."
                    : isEn
                      ? `Save ${PROVIDER_NAMES[connectionProvider]}`
                      : `${PROVIDER_NAMES[connectionProvider]} kaydet`}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="rounded-[18px] border border-[#e8e8e8] bg-[#fafafa] p-4">
          <p className="text-[15px] font-semibold text-[#0d0d12]">
            {isEn ? "What users need to know" : "Kullanıcıya neyi anlatıyoruz"}
          </p>
          <div className="mt-4 space-y-3 text-[13px] leading-6 text-[#666d80]">
            <p>
              {isEn
                ? "Google AI uses sign-in with OAuth."
                : "Google AI tarafı OAuth ile bağlanır."}
            </p>
            <p>
              {isEn
                ? "ChatGPT and Claude use provider API keys today because the provider-managed login flow is not exposed to Tiramisup the same way."
                : "ChatGPT ve Claude tarafı bugün API key ile çalışır; çünkü sağlayıcının giriş akışı Tiramisup'a doğrudan açılmış değil."}
            </p>
            <p>
              {isEn
                ? "Disconnecting a connection stops new requests immediately. Existing stored answers remain, but no future model calls use that credential."
                : "Bağlantıyı kaldırdığında yeni istekler anında durur. Mevcut kaydedilmiş cevaplar kalır ama sonraki model çağrıları o credential'ı kullanmaz."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
