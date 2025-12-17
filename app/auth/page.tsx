'use client';

import { SignInForm } from '@/components/auth/sign-in-form';
import { SignUpForm } from '@/components/auth/sign-up-form';

import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isLogin = searchParams.get('mode') !== 'signup';

  const handleModeChange = (mode: 'login' | 'signup') => {
    const params = new URLSearchParams(searchParams.toString());
    if (mode === 'signup') {
      params.set('mode', 'signup');
    } else {
      params.delete('mode');
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center overflow-hidden p-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {isLogin ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <SignInForm />
              <p className="text-muted-foreground mt-4 text-center text-sm">
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => handleModeChange('signup')}
                  className="hover:text-primary underline underline-offset-4"
                >
                  Sign up
                </button>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <SignUpForm />
              <p className="text-muted-foreground mt-4 text-center text-sm">
                Already have an account?{' '}
                <button
                  onClick={() => handleModeChange('login')}
                  className="hover:text-primary underline underline-offset-4"
                >
                  Login
                </button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
