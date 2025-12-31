'use client';

import { useState } from 'react';
import { useToast } from '@/lib/useToast';

export default function AddToCart({ productId }: { productId: string }) {
  const [busy, setBusy] = useState(false);
  const { push } = useToast();

  return (
    <button
      disabled={busy}
      onClick={() => {
        setBusy(true);
        let raw: string | null = null;
        try {
          raw = localStorage.getItem('shopverse:cart');
        } catch {
          setBusy(false);
          return;
        }
        let items: { productId: string; quantity: number }[] = [];
        try {
          items = raw ? JSON.parse(raw) : [];
        } catch {
          items = [];
        }
        const idx = items.findIndex((i) => i.productId === productId);
        if (idx >= 0) items[idx].quantity += 1;
        else items.push({ productId, quantity: 1 });
        try {
          localStorage.setItem('shopverse:cart', JSON.stringify(items));
        } catch {
          // localStorage unavailable (e.g., Safari Private Mode)
        }
        setBusy(false);
        // Dispatch event to update navbar cart count
        window.dispatchEvent(new Event('cartUpdated'));
        // Show toast notification
        push({ title: 'Added', message: 'Item added to cart', variant: 'success' });
      }}
      className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 px-4 py-2.5 font-semibold text-slate-950 hover:from-cyan-400 hover:to-cyan-500 hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
    >
      Add to cart
    </button>
  );
}
