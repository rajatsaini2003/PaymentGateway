'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, hasHydrated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [hasHydrated, isAuthenticated]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-indigo-300 flex items-center justify-center">
      <div className="relative w-full max-w-2xl mx-auto px-6 py-16 rounded-3xl shadow-2xl bg-white/80 backdrop-blur-md border border-indigo-100">
        {/* Decorative Circles */}
        <div className="absolute -top-8 -left-8 w-32 h-32 bg-indigo-200 rounded-full opacity-30 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-amber-200 rounded-full opacity-30 blur-2xl pointer-events-none" />

        <div className="text-center relative z-10">
          <h1 className="text-5xl font-extrabold text-indigo-800 mb-4 drop-shadow">
            Payment App
          </h1>
          <p className="text-lg text-gray-700 mb-8 max-w-xl mx-auto">
            <span className="font-semibold text-indigo-500">Secure</span> and <span className="font-semibold text-amber-500">seamless</span> payment processing with <span className="underline decoration-amber-300">subscription management</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button
              className="bg-gradient-to-r from-amber-300 to-amber-400 text-indigo-900 font-semibold shadow-lg hover:scale-105 transition-transform"
              size="lg"
              onClick={() => router.push('/login')}
            >
              Sign In
            </Button>
            <Button
              className="bg-gradient-to-r from-indigo-200 to-indigo-400 text-indigo-900 font-semibold shadow-lg hover:scale-105 transition-transform border-2 border-indigo-300"
              variant="outline"
              size="lg"
              onClick={() => router.push('/register')}
            >
              Create Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}