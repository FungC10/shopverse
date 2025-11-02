import Stripe from 'stripe';
import { env } from './env';

// Singleton Stripe instance
// Using latest stable API version (2024-11-20.acacia)
const getStripe = (): Stripe => {
  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-11-20.acacia',
  });
};

export const stripe = getStripe();

