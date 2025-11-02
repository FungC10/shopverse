'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AddressSchema } from '@/lib/validation';
import { z } from 'zod';
import { getStoredEmail } from '@/lib/cart';
import Link from 'next/link';

export default function CheckoutPage() {
  const form = useForm<z.infer<typeof AddressSchema>>({
    resolver: zodResolver(AddressSchema),
    defaultValues: {
      email: typeof window !== 'undefined' ? getStoredEmail() || '' : '',
      name: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
    },
    mode: 'onChange',
  });

  const onSubmit = async (address: z.infer<typeof AddressSchema>) => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('shopverse:cart') : null;
    const items = raw ? JSON.parse(raw) : [];

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, address }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Checkout failed');
      }

      if (json?.url) {
        window.location.href = json.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      // TODO: Show error to user
    }
  };

  const raw = typeof window !== 'undefined' ? localStorage.getItem('shopverse:cart') : null;
  const items = raw ? JSON.parse(raw) : [];

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Checkout</h1>
        <p className="text-slate-400">Cart is empty. <Link className="text-cyan-300" href="/">Browse products</Link></p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <h1 className="text-xl font-semibold">Checkout</h1>
        
        <div>
          <input
            placeholder="Email"
            {...form.register('email')}
            className="w-full rounded bg-white/10 border border-white/20 p-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          {form.formState.errors.email && (
            <p className="mt-1 text-sm text-red-400">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div>
          <input
            placeholder="Name"
            {...form.register('name')}
            className="w-full rounded bg-white/10 border border-white/20 p-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          {form.formState.errors.name && (
            <p className="mt-1 text-sm text-red-400">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div>
          <input
            placeholder="Address line 1"
            {...form.register('addressLine1')}
            className="w-full rounded bg-white/10 border border-white/20 p-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          {form.formState.errors.addressLine1 && (
            <p className="mt-1 text-sm text-red-400">{form.formState.errors.addressLine1.message}</p>
          )}
        </div>

        <div>
          <input
            placeholder="Address line 2 (optional)"
            {...form.register('addressLine2')}
            className="w-full rounded bg-white/10 border border-white/20 p-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          {form.formState.errors.addressLine2 && (
            <p className="mt-1 text-sm text-red-400">{form.formState.errors.addressLine2.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              placeholder="City"
              {...form.register('city')}
              className="w-full rounded bg-white/10 border border-white/20 p-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            {form.formState.errors.city && (
              <p className="mt-1 text-sm text-red-400">{form.formState.errors.city.message}</p>
            )}
          </div>
          <div>
            <input
              placeholder="State (optional)"
              {...form.register('state')}
              className="w-full rounded bg-white/10 border border-white/20 p-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            {form.formState.errors.state && (
              <p className="mt-1 text-sm text-red-400">{form.formState.errors.state.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              placeholder="Postal code"
              {...form.register('postalCode')}
              className="w-full rounded bg-white/10 border border-white/20 p-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            {form.formState.errors.postalCode && (
              <p className="mt-1 text-sm text-red-400">{form.formState.errors.postalCode.message}</p>
            )}
          </div>
          <div>
            <input
              placeholder="Country (US/CA/HK)"
              {...form.register('country')}
              className="w-full rounded bg-white/10 border border-white/20 p-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            {form.formState.errors.country && (
              <p className="mt-1 text-sm text-red-400">{form.formState.errors.country.message}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={!form.formState.isValid}
          className="rounded bg-cyan-500 px-4 py-2 font-medium text-slate-950 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Pay with Stripe
        </button>
      </form>

      {/* Simple summary */}
      <div className="rounded border border-white/10 p-4">
        <h2 className="mb-2 font-medium">Order summary</h2>
        <p className="text-sm text-slate-400">Prices will be validated server-side.</p>
      </div>
    </div>
  );
}
