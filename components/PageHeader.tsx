import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export default function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#666d80] mb-1">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[28px] font-bold text-[#0d0d12] tracking-[-0.02em]">{title}</h1>
        {description && (
          <p className="mt-1 text-[14px] text-[#666d80] max-w-xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
