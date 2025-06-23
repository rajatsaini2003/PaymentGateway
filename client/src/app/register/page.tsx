'use client';
import { useEffect } from 'react';
import { AuthForm } from '@/components/AuthForm';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, hasHydrated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [hasHydrated, isAuthenticated]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-blue-50 to-amber-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-0 left-0 w-48 h-48 bg-indigo-200 rounded-full opacity-30 blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-amber-200 rounded-full opacity-30 blur-2xl pointer-events-none" />
      <div className="relative z-10 w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-indigo-800 text-center mb-6 drop-shadow">
          Create Your Account
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Join us for secure and seamless payment management.
        </p>
        <AuthForm mode="register" />
      </div>
    </div>
  );
}