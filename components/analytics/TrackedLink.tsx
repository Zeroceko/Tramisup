"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics";

type TrackedLinkProps = {
  children: ReactNode;
  className?: string;
  eventName: string;
  href: string;
  params?: Record<string, string | number | boolean>;
};

export default function TrackedLink({
  children,
  className,
  eventName,
  href,
  params = {},
}: TrackedLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        trackAnalyticsEvent(eventName, params);
      }}
    >
      {children}
    </Link>
  );
}
