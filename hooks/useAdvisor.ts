import { useState } from 'react';

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
        console.error('Advisor error:', data.error);
        setResponse('AI Hatası: ' + data.error);
        return null;
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setResponse('Ağ Hatası yaşandı.');
    } finally {
      setLoading(false);
    }
  };

  return { askAdvisor, response, loading };
}
