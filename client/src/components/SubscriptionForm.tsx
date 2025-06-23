'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { loadRazorpay } from '@/lib/razorpay';
import { useAuth } from '@/hooks/useAuth';

const SUBSCRIPTION_PLANS = [
  { id: 'plan_Qj8nMr5pdMtqBB', name: 'Basic Plan', price: 100, duration: 'Monthly' },
  { id: 'plan_QkbYF2RjLJPGq6', name: 'Gold Plan', price: 10, duration: 'Weekly' }
];

export function SubscriptionForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activePlans, setActivePlans] = useState<string[]>([]);
  const { user } = useAuth();

  // Fetch user's active subscriptions on mount
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const subs = await api.getSubscriptions();
        // Collect plan IDs of active subscriptions
        setActivePlans(
          subs
            .filter((sub: any) => sub.status === 'active')
            .map((sub: any) => sub.razorpay_plan_id)
        );
      } catch (err) {
        // ignore error
      }
    };
    fetchSubscriptions();
  }, []);

  const handleSubscribe = async (planId: string, price: number) => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // Load Razorpay script
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        throw new Error('Failed to load Razorpay');
      }

      // Create subscription
      const subscription = await api.createSubscription({
        planId: planId,
      });

      // Configure Razorpay subscription options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: subscription.subscription_id,
        name: 'Your App Subscription',
        description: `${planId} subscription`,
        handler: async (response: any) => {
          try {
            await api.verifySubscription({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
              plan_id: planId,
            });
            alert('Subscription successful!');
            setActivePlans((prev) => [...prev, planId]);
          } catch (err) {
            setError('Subscription verification failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#3B82F6',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Subscription failed');
    } finally {
      setLoading(false);
    }
  };

  // Filter out plans that are already subscribed to
  const availablePlans = SUBSCRIPTION_PLANS.filter(
    (plan) => !activePlans.includes(plan.id)
  );

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-indigo-800 font-bold text-xl flex items-center gap-2">
          <span role="img" aria-label="subscription">📅</span> Choose a Subscription Plan
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-red-500 text-sm mb-4">{error}</div>
        )}
        {availablePlans.length === 0 ? (
          <div className="text-center text-gray-500">You are subscribed to all available plans.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {availablePlans.map((plan) => (
              <div key={plan.id} className="border rounded-2xl p-6 text-center bg-indigo-50 hover:bg-amber-50 transition">
                <h3 className="font-semibold text-lg text-indigo-700">{plan.name}</h3>
                <p className="text-3xl font-extrabold text-amber-500 my-2">
                  ₹{plan.price}
                </p>
                <p className="text-gray-500 mb-4">{plan.duration}</p>
                <Button
                  onClick={() => handleSubscribe(plan.id, plan.price)}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-200 to-amber-200 text-indigo-900 font-semibold shadow hover:scale-105 transition-transform"
                >
                  {loading ? 'Processing...' : 'Subscribe'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}