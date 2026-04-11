export type ExtractedContent = {
  text: string;
  source: "pdf" | "docx" | "image_vision" | "unknown";
};

export async function extractFileContent(
  buffer: Buffer,
  mimeType: string,
  filename: string,
): Promise<ExtractedContent> {
  if (mimeType === "application/pdf") {
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = (pdfParseModule as unknown as { default: (buf: Buffer) => Promise<{ text: string }> }).default ?? pdfParseModule;
    const data = await (pdfParse as (buf: Buffer) => Promise<{ text: string }>)(buffer);
    return { text: data.text.slice(0, 8000), source: "pdf" };
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    filename.endsWith(".docx")
  ) {
    const mammoth = await import("mammoth");
    const { value } = await mammoth.extractRawText({ buffer });
    return { text: value.slice(0, 8000), source: "docx" };
  }

  if (mimeType.startsWith("image/")) {
    try {
      const base64 = buffer.toString("base64");
      const text = await describeImageWithVision(base64, mimeType);
      return { text: text.slice(0, 4000), source: "image_vision" };
    } catch {
      return { text: `[Image uploaded: ${filename}]`, source: "unknown" };
    }
  }

  return { text: "", source: "unknown" };
}

async function describeImageWithVision(base64: string, mimeType: string): Promise<string> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genai.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent([
    { inlineData: { data: base64, mimeType } },
    "Describe this image as product context. Extract any visible text, UI elements, or key information. Be concise but thorough (max 400 words).",
  ]);
  return result.response.text();
}
