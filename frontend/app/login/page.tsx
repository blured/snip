'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Scissors } from 'lucide-react';

export default function LoginPage() {
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    // Store errors in sessionStorage so they survive reloads
    const storedErrors = sessionStorage.getItem('login-errors');
    if (storedErrors) {
      setErrors(JSON.parse(storedErrors));
      sessionStorage.removeItem('login-errors');
    }

    // Check for debug info
    const debugInfo = sessionStorage.getItem('login-debug');
    const debugApi = sessionStorage.getItem('login-debug-api');
    if (debugInfo || debugApi) {
      console.log('=== DEBUG INFO FROM PREVIOUS ATTEMPT ===', debugInfo, debugApi);
      const debugMessages = [];
      if (debugInfo) debugMessages.push('Form: ' + debugInfo);
      if (debugApi) debugMessages.push('API: ' + debugApi);
      setErrors(debugMessages);
      sessionStorage.removeItem('login-debug');
      sessionStorage.removeItem('login-debug-api');
    }

    // Global error handler
    const handleError = (event: ErrorEvent) => {
      const errorMessages = [...errors, event.message || String(event.error)];
      sessionStorage.setItem('login-errors', JSON.stringify(errorMessages));
      console.error('Caught error:', event.error);
    };

    // Promise rejection handler
    const handleRejection = (event: PromiseRejectionEvent) => {
      const errorMessages = [...errors, String(event.reason)];
      sessionStorage.setItem('login-errors', JSON.stringify(errorMessages));
      console.error('Caught rejection:', event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  if (isAuthenticated) {
    router.push('/dashboard');
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('=== LOGIN FORM SUBMITTED ===', { email, emailLength: email.length, password: '***' });
    sessionStorage.setItem('login-debug', JSON.stringify({ email, emailLength: email.length }));
    setLoading(true);

    try {
      console.log('Calling login API with:', { email });
      sessionStorage.setItem('login-debug-api', JSON.stringify({ email }));
      await login({ email, password });
      console.log('Login successful');
      sessionStorage.setItem('login-debug', 'success');
    } catch (error) {
      console.error('Login failed:', error);
      sessionStorage.setItem('login-debug', 'error: ' + String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-blue-600 p-3">
              <Scissors className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Salon Manager</CardTitle>
          <p className="text-sm text-gray-600">Sign in to your account</p>
          <p className="text-xs text-gray-400 mt-1">v{process.env.NEXT_PUBLIC_GIT_VERSION || 'dev'}</p>
          {errors.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-left">
              <p className="text-xs font-semibold text-red-800 mb-2">Errors detected:</p>
              {errors.map((error, i) => (
                <p key={i} className="text-xs text-red-600 font-mono break-all">{error}</p>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
