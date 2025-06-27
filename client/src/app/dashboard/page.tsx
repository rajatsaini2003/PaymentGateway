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
  const { user,isTokenExpired, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);



  // Check token expiry every 5 minutes
  useEffect(() => {
    const check = () => {
      if (isTokenExpired()) {
        logout();
        router.push('/login');
      }
    };

    // Initial check (on page load)
    check();

    const interval = setInterval(check, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(interval);
  }, [logout, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isAuthenticated || !user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-blue-50 to-amber-100 relative">
      {/* Header */}
      <header className="bg-white/90 shadow-lg backdrop-blur-md z-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-extrabold text-indigo-800 drop-shadow">Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, <span className="font-semibold text-amber-600">{user.name}</span>!
              </p>
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

      {/* Decorative Background Circles */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-indigo-200 rounded-full opacity-20 blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-amber-200 rounded-full opacity-20 blur-2xl pointer-events-none" />

      {/* Main Section */}
      <main className="relative z-10 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left Column: Forms */}
            <div className="space-y-8">
              <div className="rounded-2xl shadow-lg bg-white/90 p-6">
                <PaymentForm />
              </div>
              <div className="rounded-2xl shadow-lg bg-white/90 p-6">
                <SubscriptionForm />
              </div>
            </div>
            {/* Right Column: Lists */}
            <div className="space-y-8">
              <div className="rounded-2xl shadow-lg bg-white/90 p-6 max-h-[400px] overflow-auto">
                <TransactionList />
              </div>
              <div className="rounded-2xl shadow-lg bg-white/90 p-6 max-h-[600px] overflow-auto">
                <SubscriptionList />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
