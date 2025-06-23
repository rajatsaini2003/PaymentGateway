'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { loadRazorpay } from '@/lib/razorpay';
import { useAuth } from '@/hooks/useAuth';

export function PaymentForm() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // Load Razorpay script
      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        throw new Error('Failed to load Razorpay');
      }

      // Create order
      const order = await api.createOrder({
        amount: parseInt(amount), // Send amount in rupees, backend converts to paise
        currency: 'INR',
      });

      // Configure Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Payment App',
        description: 'Payment for services',
        order_id: order.id,
        handler: async (response: any) => {
          try {
            await api.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: order.amount,
            });
            alert('Payment successful!');
            setAmount('');
          } catch (err) {
            setError('Payment verification failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#fbbf24', // Amber-400
        },
        image: '/payment-logo.svg', // Optional: add your logo here
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-indigo-800 font-bold text-xl flex items-center gap-2">
          <span role="img" aria-label="money">💸</span> Make a Payment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-indigo-700">Amount (₹)</label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              required
              className="bg-indigo-50 focus:bg-white"
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-300 to-indigo-400 text-indigo-900 font-semibold shadow-md hover:scale-105 transition-transform"
            disabled={loading || !amount}
          >
            {loading ? 'Processing...' : `Pay ₹${amount || '0'}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}