import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    console.log('Stripe Key:', stripeKey ? 'Set' : 'Not set');
    
    if (!stripeKey) {
      throw new Error('Stripe publishable key is not set in environment variables.');
    }
    
    stripePromise = loadStripe(stripeKey);
  }
  return stripePromise;
};