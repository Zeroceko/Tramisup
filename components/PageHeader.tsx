import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  titleSuffix?: string; // emoji after title
  description?: string;
  actions?: ReactNode;
  aside?: ReactNode; // right column content
};

export default function PageHeader({
  eyebrow,
  title,
  titleSuffix,
  description,
  actions,
  aside,
}: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {eyebrow && (
          <p className="text-[13px] font-normal text-[#666d80] mb-0.5">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[32px] font-bold text-[#0d0d12] tracking-[-0.03em] leading-tight">
          {title}
          {titleSuffix && (
            <span className="ml-2 text-[28px]">{titleSuffix}</span>
          )}
        </h1>
        {description && (
          <p className="mt-1.5 text-[14px] text-[#666d80] max-w-xl leading-6">
            {description}
          </p>
        )}
        {actions && (
          <div className="mt-4 flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
      {aside && <div className="shrink-0">{aside}</div>}
    </div>
  );
}
