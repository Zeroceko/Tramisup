function convertDriveUrl(url: string): string | null {
  const docMatch = url.match(/docs\.google\.com\/document\/d\/([^/]+)/);
  if (docMatch) return `https://docs.google.com/document/d/${docMatch[1]}/export?format=txt`;
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
  return null;
}

/**
 * Fetches a URL and extracts readable text content for AI analysis.
 * Supports regular websites and Google Drive/Docs public share links.
 * Returns null on any failure — always optional.
 */
export async function scrapeUrl(inputUrl: string): Promise<string | null> {
  if (!inputUrl || !inputUrl.startsWith("http")) return null;

  const url = convertDriveUrl(inputUrl) ?? inputUrl;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Tiramisup/1.0 (product analysis bot)" },
    });

    clearTimeout(timeout);

    if (!res.ok) return null;

    const html = await res.text();

    // Strip HTML tags and collapse whitespace
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s+/g, " ")
      .trim();

    // Return first 3000 chars — enough context for the AI
    return text.slice(0, 3000) || null;
  } catch {
    return null;
  }
}
