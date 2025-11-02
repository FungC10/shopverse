'use client';

import { useState, useEffect } from 'react';

interface PromoCodeInputProps {
  value: string;
  onChange: (code: string) => void;
  onValidation: (isValid: boolean) => void;
  error?: string;
}

export default function PromoCodeInput({
  value,
  onChange,
  onValidation,
  error,
}: PromoCodeInputProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [featureEnabled, setFeatureEnabled] = useState(false);

  useEffect(() => {
    // Check feature flag client-side
    setFeatureEnabled(process.env.NEXT_PUBLIC_ENABLE_PROMO_CODES === 'true');
  }, []);

  // Only show if feature is enabled
  if (!featureEnabled) {
    return null;
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    onChange(code);
    onValidation(false);

    if (code.length >= 3) {
      setIsValidating(true);
      try {
        const response = await fetch(`/api/promo-codes/validate?code=${encodeURIComponent(code)}`);
        const data = await response.json();
        onValidation(data.valid === true);
      } catch {
        onValidation(false);
      } finally {
        setIsValidating(false);
      }
    }
  };

  return (
    <div>
      <label htmlFor="promoCode" className="block text-sm font-medium text-slate-300 mb-2">
        Promo Code <span className="text-slate-500 text-xs">(Optional)</span>
      </label>
      <div className="flex gap-2">
        <input
          id="promoCode"
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="Enter promo code"
          className="flex-1 px-4 py-2 bg-white/10 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950 focus:border-transparent uppercase"
          aria-label="Promo code"
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? 'promo-code-error' : undefined}
        />
        {isValidating && (
          <div className="flex items-center px-2" aria-label="Validating">
            <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      {error && (
        <p id="promo-code-error" className="mt-1 text-sm text-red-400" role="alert" aria-live="polite">
          {error}
        </p>
      )}
      {value && !error && !isValidating && (
        <p className="mt-1 text-sm text-green-400" role="status" aria-live="polite">
          ✓ Promo code applied
        </p>
      )}
    </div>
  );
}

