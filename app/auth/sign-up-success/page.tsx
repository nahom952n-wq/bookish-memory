'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Wallet, CheckCircle } from 'lucide-react';

export default function SignUpSuccessPage() {
  const router = useRouter();
  const supabase = createClient();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user is authenticated (email confirmed)
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        // User is confirmed and authenticated, redirect to dashboard
        router.push('/dashboard');
      } else {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [supabase, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        <div className="flex items-center justify-center mb-8">
          <Wallet className="w-10 h-10 text-blue-600 mr-2" />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">FiscalFlow</h1>
            <p className="text-xs text-gray-500">Pro</p>
          </div>
        </div>

        <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />

        <h2 className="text-2xl font-bold text-gray-800 mb-2">Account Created!</h2>

        {checkingAuth ? (
          <>
            <p className="text-gray-600 mb-6">Checking your email confirmation...</p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              We&apos;ve sent a confirmation link to your email. Please confirm your email to activate your account.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Once confirmed, you&apos;ll be redirected to your dashboard automatically.
            </p>
            <a
              href="/auth/login"
              className="inline-block bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition"
            >
              Back to Login
            </a>
          </>
        )}
      </div>
    </div>
  );
}
