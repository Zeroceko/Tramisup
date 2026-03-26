import { useState } from 'react';

function parseAdvisorError(error: string | undefined): string {
  if (!error) return 'Bir hata oluştu. Lütfen tekrar dene.';
  if (error.includes('API key') || error.includes('LoadAPIKeyError')) return 'AI servisi şu an yapılandırılmamış.';
  if (error.includes('quota') || error.includes('429')) return 'AI servisinin kullanım limiti doldu. Biraz sonra tekrar dene.';
  if (error.includes('network') || error.includes('fetch')) return 'Bağlantı hatası. İnternet bağlantını kontrol et.';
  if (error.includes('timeout') || error.includes('408')) return 'İstek zaman aşımına uğradı. Tekrar dene.';
  if (error.includes('500') || error.includes('Internal')) return 'Sunucu hatası oluştu. Biraz sonra tekrar dene.';
  return 'Öneri alınamadı. Lütfen tekrar dene.';
}

export function useAdvisor(productId: string) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const askAdvisor = async (prompt: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, productId }),
      });

      const data = await res.json();
      if (data.success) {
        setResponse(data.text);
        return data.text;
      } else {
        const message = parseAdvisorError(data.details || data.error);
        setResponse(message);
        return null;
      }
    } catch {
      setResponse('Bağlantı hatası. İnternet bağlantını kontrol et.');
    } finally {
      setLoading(false);
    }
  };

  return { askAdvisor, response, loading };
}
