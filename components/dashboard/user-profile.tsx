"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";
import { updateProfile, signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function UserProfile() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.displayName || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  if (!user) return null;

  const handleUpdateName = async () => {
    if (!name.trim()) return;
    setIsUpdating(true);
    try {
      await updateProfile(user, { displayName: name });
      toast.success("Profile updated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to log out");
    }
  };

  return (
    <Card className="w-100">
      <CardHeader>
        <CardTitle>Welcome, {user.displayName || "User"}!</CardTitle>
        <CardDescription>Manage your profile settings.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none">Email</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <div className="space-y-2">
           <p className="text-sm font-medium leading-none">Display Name</p>
           <div className="flex gap-2">
             <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
             />
             <Button onClick={handleUpdateName} disabled={isUpdating}>
               {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               Save
             </Button>
           </div>
           <p className="text-xs text-muted-foreground">
             Set your display name to personalize your experience.
           </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="destructive" className="w-full" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </CardFooter>
    </Card>
  );
}
