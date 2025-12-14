import { SignUpForm } from "@/components/auth/sign-up-form";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center p-4">
      <SignUpForm />
      <p className="mt-4 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="underline underline-offset-4 hover:text-primary">
          Login
        </Link>
      </p>
    </div>
  );
}
