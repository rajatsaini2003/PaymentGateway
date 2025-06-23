'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { PaymentForm } from '@/components/PaymentForm';
import { TransactionList } from '@/components/TransactionList';
import { SubscriptionForm } from '@/components/SubscriptionForm';
import { SubscriptionList } from '@/components/SubscriptionList';

export default function DashboardPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return <div>Loading...</div>;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-amber-100">
      <header className="bg-white/90 shadow-lg backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-extrabold text-indigo-800 drop-shadow">Dashboard</h1>
              <p className="text-gray-600">Welcome back, <span className="font-semibold text-amber-600">{user.name}</span>!</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-indigo-300 text-indigo-800 hover:bg-amber-200 hover:text-indigo-900 transition"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Decorative Circles */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-indigo-200 rounded-full opacity-20 blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-amber-200 rounded-full opacity-20 blur-2xl pointer-events-none" />

      <main className="relative z-10 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-8">
              <div className="rounded-2xl shadow-lg bg-white/90 p-6">
                <PaymentForm />
              </div>
              <div className="rounded-2xl shadow-lg bg-white/90 p-6">
                <SubscriptionForm />
              </div>
            </div>
            <div className="space-y-8">
              <div className="rounded-2xl shadow-lg bg-white/90 p-6">
                <TransactionList />
              </div>
              <div className="rounded-2xl shadow-lg bg-white/90 p-6">
                <SubscriptionList />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}