import { cookies } from "next/headers";

export async function getActiveProductId(): Promise<string | undefined> {
  const store = await cookies();
  return store.get("activeProductId")?.value;
}

