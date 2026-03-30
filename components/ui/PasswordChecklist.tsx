"use client";

import { getPasswordRuleState } from "@/lib/password-rules";

type PasswordChecklistProps = {
  password: string;
  copy: {
    title: string;
    minLength: string;
    number: string;
    special: string;
  };
};

export default function PasswordChecklist({ password, copy }: PasswordChecklistProps) {
  const rules = getPasswordRuleState(password);

  const items = [
    { key: "minLength", label: copy.minLength, met: rules.minLength },
    { key: "number", label: copy.number, met: rules.number },
    { key: "special", label: copy.special, met: rules.special },
  ];

  return (
    <div className="rounded-xl border border-[#E8DED7] bg-[#FFF8F2] px-4 py-3">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#21231D]/50">
        {copy.title}
      </p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.key} className="flex items-center gap-2 text-sm text-[#21231D]/70">
            <span
              className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                item.met
                  ? "bg-[#DFF3E6] text-[#1F7A3D]"
                  : "bg-[#F1E8E1] text-[#8D7D71]"
              }`}
            >
              {item.met ? "✓" : "•"}
            </span>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
