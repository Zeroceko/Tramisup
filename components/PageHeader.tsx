import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export default function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <section className="mb-8 overflow-hidden rounded-[28px] border border-white/70 bg-white/75 p-6 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.25)] backdrop-blur xl:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? (
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              {eyebrow}
            </div>
          ) : null}
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}
