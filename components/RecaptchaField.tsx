"use client";

import { useEffect, useMemo, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";

type RecaptchaFieldProps = {
  locale: string;
  onTokenChange: (token: string | null) => void;
  resetNonce?: number;
};

export default function RecaptchaField({
  locale,
  onTokenChange,
  resetNonce = 0,
}: RecaptchaFieldProps) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
  const isEnabled = useMemo(() => isClientRecaptchaEnabled(), []);
  const recaptchaRef = useRef<ReCAPTCHA | null>(null);
  const shouldRender = isEnabled && Boolean(siteKey);

  useEffect(() => {
    if (!shouldRender || resetNonce === 0) {
      return;
    }

    recaptchaRef.current?.reset();
    onTokenChange(null);
  }, [onTokenChange, resetNonce, shouldRender]);

  if (!shouldRender) {
    return null;
  }

  return (
    <div className="rounded-[16px] border border-[#ece7e2] bg-[#fffaf6] p-3">
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={siteKey}
        hl={locale}
        onChange={onTokenChange}
        onExpired={() => onTokenChange(null)}
        onErrored={() => onTokenChange(null)}
      />
    </div>
  );
}

export function isClientRecaptchaEnabled() {
  return process.env.NEXT_PUBLIC_RECAPTCHA_ENABLED?.trim() === "true";
}
