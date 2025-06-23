'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export function AuthForm({ mode }: AuthFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (mode === 'login') {
        response = await api.login({ email: formData.email, password: formData.password });
      } else {
        await api.register(formData);
        response = await api.login({ email: formData.email, password: formData.password });
      }
      login(response.user, response.token);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-0 bg-white/90 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold text-indigo-800 mb-2">
          {mode === 'login' ? 'Sign In to Payment App' : 'Create Your Account'}
        </CardTitle>
        <div className="flex justify-center mb-2">
          <span className="inline-block w-16 h-1 rounded bg-gradient-to-r from-indigo-400 via-amber-300 to-indigo-400" />
        </div>
        <p className="text-center text-gray-500 text-sm">
          {mode === 'login'
            ? 'Access your dashboard and manage your payments.'
            : 'Join us for secure and seamless payment management.'}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <Input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-indigo-50 focus:bg-white"
              />
            </div>
          )}
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="bg-indigo-50 focus:bg-white"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
            disabled={loading}
          >
            {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <Button
            variant="link"
            className="text-indigo-700 hover:text-amber-500 font-semibold"
            onClick={() => router.push(mode === 'login' ? '/register' : '/login')}
          >
            {mode === 'login'
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}