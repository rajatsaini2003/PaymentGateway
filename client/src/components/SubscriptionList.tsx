'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Subscription } from '@/lib/types';

export function SubscriptionList() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const data = await api.getSubscriptions();
        setSubscriptions(data);
      } catch (err) {
        setError('Failed to fetch subscriptions');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const handleUnsubscribe = async (subscriptionId: string) => {
    setCancelingId(subscriptionId);
    setError('');
    try {
      await api.cancelSubscription({ subscriptionId });
      setSubscriptions((subs) =>
        subs.map((s) =>
          s.razorpay_subscription_id === subscriptionId
            ? { ...s, status: 'cancelled' }
            : s
        )
      );
    } catch (err) {
      setError('Failed to cancel subscription');
    } finally {
      setCancelingId(null);
    }
  };

  const pendingSubs = subscriptions.filter((s) => s.status === 'pending');

  if (loading) {
    return (
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-indigo-800 font-bold text-xl flex items-center gap-2">
            <span role="img" aria-label="subscription">📅</span> Active Subscriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-indigo-700">Loading subscriptions...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-indigo-800 font-bold text-xl flex items-center gap-2">
          <span role="img" aria-label="subscription">📅</span> Active Subscriptions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        {pendingSubs.length > 0 && (
          <div className="mb-4 p-3 rounded bg-amber-100 text-amber-800 border border-amber-300 text-center font-medium">
            You have one or more subscriptions with pending fees. Please pay soon or they will be cancelled automatically.
          </div>
        )}
        {subscriptions.length === 0 ? (
          <p className="text-gray-500 text-center">No active subscriptions</p>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((subscription) => (
              <div
                key={subscription._id}
                className="border rounded-lg p-4 bg-indigo-50 hover:bg-amber-50 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-indigo-900">Plan: {subscription.razorpay_plan_id}</p>
                    <p className="text-sm text-gray-500">
                      Started: {new Date(subscription.current_period_start).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      ID: {subscription.razorpay_subscription_id}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        subscription.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : subscription.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : subscription.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : subscription.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {subscription.status.toUpperCase()}
                    </span>
                    {(subscription.status === 'active' || subscription.status === 'pending') && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
                        disabled={cancelingId === subscription.razorpay_subscription_id}
                        onClick={() => handleUnsubscribe(subscription.razorpay_subscription_id)}
                      >
                        {cancelingId === subscription.razorpay_subscription_id ? 'Cancelling...' : 'Unsubscribe'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}