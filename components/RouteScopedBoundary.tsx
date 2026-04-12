"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function RouteScopedBoundary({
  children,
  scope,
}: {
  children: ReactNode;
  scope: string;
}) {
  const pathname = usePathname() ?? "";

  return <div key={`${scope}:${pathname}`}>{children}</div>;
}
