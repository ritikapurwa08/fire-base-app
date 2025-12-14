import { SignInForm } from "@/components/auth/sign-in-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-4">
      <SignInForm />
      <p className="mt-4 text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
          Sign up
        </Link>
      </p>
    </div>
  );
}
