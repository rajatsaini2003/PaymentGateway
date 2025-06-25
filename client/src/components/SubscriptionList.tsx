'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { Subscription, SubscriptionNotification } from '@/lib/types';

export function SubscriptionList() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [notifications, setNotifications] = useState<SubscriptionNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptionsAndNotifications();
    const interval = setInterval(fetchSubscriptionsAndNotifications, 12 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchSubscriptionsAndNotifications = async () => {
    try {
      const data = await api.getSubscriptionNotifications();
      setSubscriptions(data.subscriptions);
      setNotifications(data.notifications);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (subscriptionId: string) => {
    setCancelingId(subscriptionId);
    setError('');
    try {
      await api.cancelSubscription({ subscriptionId });
      await fetchSubscriptionsAndNotifications();
    } catch (err) {
      setError('Failed to cancel subscription');
    } finally {
      setCancelingId(null);
    }
  };

  const handleSyncStatus = async (subscriptionId: string) => {
    setSyncingId(subscriptionId);
    setError('');
    try {
      const result = await api.syncSubscriptionStatus(subscriptionId);
      setSubscriptions(prev =>
        prev.map(sub =>
          sub.razorpay_subscription_id === subscriptionId
            ? { ...sub, ...result.subscription }
            : sub
        )
      );
      setTimeout(fetchSubscriptionsAndNotifications, 500);
    } catch (err: any) {
      setError(err.message || 'Failed to sync subscription status');
    } finally {
      setSyncingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'subscription-status-badge-active';
      case 'pending': return 'subscription-status-badge-pending';
      case 'cancelled': return 'subscription-status-badge-cancelled';
      case 'completed': return 'subscription-status-badge-completed';
      default: return 'subscription-status-badge-default';
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysUntil = (date: string | Date) => {
    const targetDate = new Date(date);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const renderSubscription = (subscription: Subscription) => {
    const daysUntilNext = getDaysUntil(subscription.current_period_end);
    const isExpiring = daysUntilNext <= 3 && daysUntilNext > 0;
    const isOverdue = daysUntilNext < 0;

    const cardClass = [
      'subscription-card',
      isOverdue
        ? 'subscription-card-overdue'
        : isExpiring
        ? 'subscription-card-expiring'
        : subscription.status === 'active'
        ? 'subscription-card-active'
        : 'subscription-card-default',
    ].join(' ');

    return (
      <div key={subscription._id} className={cardClass}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              {getStatusIcon(subscription.status)}
              <h3 className="font-semibold text-lg text-gray-900">
                Plan: {subscription.razorpay_plan_id}
              </h3>
              <Badge className={`${getStatusColor(subscription.status)} border`}>
                {subscription.status.toUpperCase()}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-600">
                  <span className="font-medium">Started:</span> {formatDate(subscription.current_period_start)}
                </p>

                {/* Only show next billing if not cancelled */}
                {subscription.status !== 'cancelled' && (
                  <p className="text-gray-600">
                    <span className="font-medium">Next billing:</span> {formatDate(subscription.current_period_end)}
                    {daysUntilNext > 0 && (
                      <span className="ml-1 text-xs text-gray-500">({daysUntilNext} days)</span>
                    )}
                    {daysUntilNext < 0 && (
                      <span className="ml-1 text-xs text-red-600 font-medium">
                        ({Math.abs(daysUntilNext)} days overdue)
                      </span>
                    )}
                  </p>
                )}
              </div>

              <div>
                {subscription.last_payment_date && (
                  <p className="text-gray-600">
                    <span className="font-medium">Last payment:</span> {formatDate(subscription.last_payment_date)}
                  </p>
                )}
                {subscription.last_payment_amount && (
                  <p className="text-gray-600">
                    <span className="font-medium">Amount:</span> ₹{subscription.last_payment_amount}
                  </p>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-3">
              ID: {subscription.razorpay_subscription_id}
            </p>
          </div>

          <div className="flex flex-col gap-2 ml-4">
            {/* Only show sync for non-cancelled */}
            {subscription.status !== 'cancelled' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSyncStatus(subscription.razorpay_subscription_id)}
                disabled={syncingId === subscription.razorpay_subscription_id}
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                {syncingId === subscription.razorpay_subscription_id ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Sync
                  </>
                )}
              </Button>
            )}

            {(subscription.status === 'active' || subscription.status === 'pending') && (
              <Button
                size="sm"
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50"
                disabled={cancelingId === subscription.razorpay_subscription_id}
                onClick={() => handleUnsubscribe(subscription.razorpay_subscription_id)}
              >
                {cancelingId === subscription.razorpay_subscription_id ? 'Cancelling...' : 'Unsubscribe'}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const activeSubscriptions = subscriptions.filter(sub => sub.status !== 'cancelled');
  const cancelledSubscriptions = subscriptions.filter(sub => sub.status === 'cancelled');

  if (loading) {
    return (
      <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-indigo-800 font-bold text-xl flex items-center gap-2">
            <span role="img" aria-label="subscription">📅</span> Subscription Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-indigo-700 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Loading subscriptions...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-indigo-800 font-bold text-xl flex items-center gap-2">
          <span role="img" aria-label="subscription">📅</span> Subscription Management
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSubscriptionsAndNotifications}
            className="ml-auto"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {notifications.length > 0 && (
          <div className="mb-6 space-y-2">
            <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Notifications
            </h3>
            {notifications.map((notification, index) => (
              <Alert
                key={index}
                className={`${
                  notification.severity === 'error'
                    ? 'border-red-200 bg-red-50'
                    : notification.severity === 'warning'
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-blue-200 bg-blue-50'
                }`}
              >
                <AlertTriangle className={`h-4 w-4 ${
                  notification.severity === 'error'
                    ? 'text-red-600'
                    : notification.severity === 'warning'
                    ? 'text-yellow-600'
                    : 'text-blue-600'
                }`} />
                <AlertDescription className={`${
                  notification.severity === 'error'
                    ? 'text-red-800'
                    : notification.severity === 'warning'
                    ? 'text-yellow-800'
                    : 'text-blue-800'
                }`}>
                  {notification.message}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        <div className="space-y-8">
          {activeSubscriptions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Active Subscriptions</h2>
              <div className="space-y-4">
                {activeSubscriptions.map(renderSubscription)}
              </div>
            </div>
          )}

          {cancelledSubscriptions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Cancelled Subscriptions</h2>
              <div className="space-y-4">
                {cancelledSubscriptions.map(renderSubscription)}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
