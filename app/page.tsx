"use client";

import { useAuth } from "@/hooks/use-auth";
import { UserProfile } from "@/components/dashboard/user-profile";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 dark:bg-zinc-900">
      {user ? (
        <UserProfile />
      ) : (
        <div className="space-y-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Welcome to Firebase App
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            A simple authentication demo using Firebase.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
