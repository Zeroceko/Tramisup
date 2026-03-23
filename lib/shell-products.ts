import { prisma } from "@/lib/prisma";

type ShellProduct = {
  id: string;
  name: string;
  status?: "PRE_LAUNCH" | "LAUNCHED" | "GROWING";
};

export async function getShellProducts(userId: string): Promise<ShellProduct[]> {
  try {
    return await prisma.product.findMany({
      where: { userId },
      select: { id: true, name: true, status: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("[shell-products] Failed to load products for shell:", error);
    return [];
  }
}
