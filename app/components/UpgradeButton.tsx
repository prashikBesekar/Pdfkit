'use client'

import React, { useState } from 'react'
import { Loader2, Zap } from 'lucide-react'
import { getCurrentUser } from '../../lib/supabase'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface UpgradeButtonProps {
  className?: string
  text?: string
}

export default function UpgradeButton({ 
  className = '',
  text = 'Upgrade to Premium'
}: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false)

 const handleUpgrade = async () => {
  setLoading(true);
  try {
    const { user } = await getCurrentUser(); // still need to fix this (see below)
    if (!user) {
      window.location.href = '/signup';
      return;
    }

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, userEmail: user.email }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Server error:', response.status, errorData);
      alert(`Checkout failed: ${response.status} – ${errorData.error || 'Unknown error'}`);
      setLoading(false);
      return;
    }

    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    } else if (data.sessionId) {
      const stripe = await stripePromise;
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
        if (error) throw error;
      }
    } else {
      alert('No checkout session created');
      setLoading(false);
    }
  } catch (error) {
    console.error('Upgrade error:', error);
    alert('An unexpected error occurred');
    setLoading(false);
  }
};

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className={`bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 py-3 px-6 rounded-lg font-medium transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Zap className="w-5 h-5" />
          {text}
        </>
      )}
    </button>
  )
}