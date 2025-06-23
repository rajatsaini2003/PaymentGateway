'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { Subscription } from '@/lib/types';

export function SubscriptionList() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const data = await api.getSubscriptions();
        setSubscriptions(data);
      } catch (err) {
        console.error('Failed to fetch subscriptions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

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
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      subscription.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : subscription.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : subscription.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {subscription.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}