import { cookies } from "next/headers";
import { prisma } from "./prisma";

export async function getActiveProductId(): Promise<string | undefined> {
  const store = await cookies();
  return store.get("activeProductId")?.value;
}

/**
 * Get the active product for a user, with fallback to first product if cookie is invalid
 */
export async function getActiveProduct(userId: string) {
  const activeId = await getActiveProductId();

  const product = await prisma.product.findFirst({
    where: {
      userId,
      ...(activeId ? { id: activeId } : {}),
    },
  });

  // If no product found but activeId was set (invalid/deleted), fall back to first product
  if (!product && activeId) {
    return prisma.product.findFirst({
      where: { userId },
    });
  }

  return product;
}
