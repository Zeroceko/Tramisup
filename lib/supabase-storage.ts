import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function uploadProductFile(
  userId: string,
  productId: string,
  filename: string,
  buffer: Buffer,
  mimeType: string,
): Promise<{ path: string; url: string }> {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${userId}/${productId}/${Date.now()}-${safeName}`;
  const { error } = await supabaseAdmin.storage
    .from("product-uploads")
    .upload(path, buffer, { contentType: mimeType, upsert: false });
  if (error) throw new Error(error.message);
  const { data } = supabaseAdmin.storage.from("product-uploads").getPublicUrl(path);
  return { path, url: data.publicUrl };
}

export async function getFileBuffer(path: string): Promise<Buffer> {
  const { data, error } = await supabaseAdmin.storage
    .from("product-uploads")
    .download(path);
  if (error ?? !data) throw new Error("File not found");
  return Buffer.from(await data.arrayBuffer());
}
