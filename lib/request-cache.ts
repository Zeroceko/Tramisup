import { cache } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getActiveProductId } from "@/lib/activeProduct";
import { getShellProducts } from "@/lib/shell-products";

export const getRequestSession = cache(async () => getServerSession(authOptions));

export const getRequestActiveProductId = cache(async () => getActiveProductId());

export const getRequestShellContext = cache(async (userId: string) => {
  const [products, requestedActiveProductId] = await Promise.all([
    getShellProducts(userId),
    getRequestActiveProductId(),
  ]);

  const effectiveActiveProductId =
    products.find((product) => product.id === requestedActiveProductId)?.id ??
    products[0]?.id;

  return {
    products,
    requestedActiveProductId,
    effectiveActiveProductId,
  };
});
