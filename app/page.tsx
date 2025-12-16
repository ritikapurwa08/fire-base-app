'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import Link from 'next/link';
import { AvatarSelector } from '@/components/profile/avatar-selector';

export default function Page() {
  // const router = useRouter();
  const { user, loading, refreshUser } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Optional: router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="bg-muted/40 flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
          <p className="text-muted-foreground mt-2">Manage your account details</p>
        </div>

        {loading ? (
          /* Granular Loading Skeleton - Only replaces the card */
          <div className="w-full animate-pulse space-y-8">
            <div className="bg-card space-y-6 rounded-xl border p-6 shadow-sm">
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-muted-foreground/20 h-20 w-20 rounded-full" />
                <div className="flex w-full flex-col items-center space-y-2">
                  <div className="bg-muted-foreground/20 h-7 w-32 rounded" />
                  <div className="bg-muted-foreground/20 h-4 w-48 rounded" />
                </div>
              </div>
              <div className="space-y-4 border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="bg-muted-foreground/20 h-4 w-20 rounded" />
                    <div className="bg-muted-foreground/20 h-5 w-16 rounded" />
                  </div>
                  <div className="space-y-2">
                    <div className="bg-muted-foreground/20 h-4 w-20 rounded" />
                    <div className="bg-muted-foreground/20 h-5 w-24 rounded" />
                  </div>
                </div>
              </div>
              <div className="bg-muted-foreground/20 h-10 w-full rounded" />
            </div>
          </div>
        ) : user ? (
          <div className="bg-card text-card-foreground space-y-6 rounded-xl border p-6 shadow-sm">
            <div className="flex flex-col items-center space-y-4">
              <AvatarSelector
                userId={user.uid}
                currentAvatarUrl={user.photoURL}
                onAvatarUpdate={async (url) => {
                  console.log('Avatar updated:', url);
                  await refreshUser();
                }}
              >
                <div className="group relative cursor-pointer">
                  {user.photoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.photoURL}
                      alt="Profile"
                      className="border-primary/10 h-20 w-20 rounded-full border-2 object-cover transition-opacity group-hover:opacity-80"
                    />
                  ) : (
                    <div className="border-primary/10 bg-muted flex h-20 w-20 items-center justify-center rounded-full border-2 transition-opacity group-hover:opacity-80">
                      <span className="text-xl font-bold">{user.displayName?.[0] || 'U'}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                    <Pencil className="h-6 w-6 text-white drop-shadow-md" />
                  </div>
                </div>
              </AvatarSelector>

              <div className="text-center">
                <h2 className="text-xl font-semibold">{user.displayName || 'User'}</h2>
                <p className="text-muted-foreground text-sm">{user.email}</p>
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground block">Verified Status</span>
                  <span
                    className={
                      user.emailVerified
                        ? 'font-medium text-green-600'
                        : 'font-medium text-yellow-600'
                    }
                  >
                    {user.emailVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Account ID</span>
                  <span className="block truncate font-mono text-xs" title={user.uid}>
                    {user.uid.substring(0, 8)}...
                  </span>
                </div>
              </div>
            </div>

            <Button onClick={handleSignOut} variant="destructive" className="w-full">
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="bg-card text-card-foreground space-y-6 rounded-xl border p-8 text-center shadow-sm">
            <p className="text-muted-foreground">You are currently functioning as a guest.</p>
            <div className="grid gap-3">
              <Button asChild className="w-full">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/signup">Create Account</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
