"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";

export type RecaptchaFieldHandle = {
  executeAsync: () => Promise<string | null>;
  reset: () => void;
};

type RecaptchaFieldProps = {
  locale: string;
  resetNonce?: number;
};

const RecaptchaField = forwardRef<RecaptchaFieldHandle, RecaptchaFieldProps>(
  function RecaptchaField({ locale, resetNonce = 0 }, forwardedRef) {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY?.trim() || "";
    const isEnabled = useMemo(() => isClientRecaptchaEnabled(), []);
    const recaptchaRef = useRef<ReCAPTCHA | null>(null);
    const shouldRender = isEnabled && Boolean(siteKey);

    useImperativeHandle(
      forwardedRef,
      () => ({
        async executeAsync() {
          if (!shouldRender || !recaptchaRef.current) {
            return null;
          }

          return recaptchaRef.current.executeAsync();
        },
        reset() {
          recaptchaRef.current?.reset();
        },
      }),
      [shouldRender],
    );

    useEffect(() => {
      if (!shouldRender || resetNonce === 0) {
        return;
      }

      recaptchaRef.current?.reset();
    }, [resetNonce, shouldRender]);

    if (!shouldRender) {
      return null;
    }

    return (
      <div className="pointer-events-none fixed bottom-4 right-4 z-[950]">
        <div className="pointer-events-auto recaptcha-inline-badge">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={siteKey}
            hl={locale}
            size="invisible"
            badge="inline"
          />
        </div>
      </div>
    );
  },
);

export default RecaptchaField;

export function isClientRecaptchaEnabled() {
  return process.env.NEXT_PUBLIC_RECAPTCHA_ENABLED?.trim() === "true";
}
