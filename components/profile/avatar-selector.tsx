'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AVATAR_CONFIG, getAvatarsByCategory } from '@/config/avatars';
import { UserService } from '@/services/user-service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AvatarSelectorProps {
  userId: string;
  currentAvatarUrl?: string | null;
  onAvatarUpdate?: (newUrl: string) => void;
  children: React.ReactNode;
}

export function AvatarSelector({
  userId,
  currentAvatarUrl,
  onAvatarUpdate,
  children,
}: AvatarSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatarUrl || AVATAR_CONFIG.default);
  const [isSaving, setIsSaving] = useState(false);

  const upstreamAvatars = getAvatarsByCategory('upstream');
  const teamAvatars = getAvatarsByCategory('teams');

  const handleSave = async () => {
    if (selectedAvatar === currentAvatarUrl) {
      setIsOpen(false);
      return;
    }

    setIsSaving(true);
    try {
      // 1. Update Firestore
      await UserService.updateUserProfile(userId, { photoUrl: selectedAvatar });

      // 2. Update Auth Profile (so it reflects in UI immediately if using useAuth)
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL: selectedAvatar });
      }

      if (onAvatarUpdate) {
        onAvatarUpdate(selectedAvatar);
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to update avatar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Choose an Avatar</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="upstream" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upstream">Upstream</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
          </TabsList>

          <TabsContent value="upstream" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-4 gap-4 sm:grid-cols-5">
                {upstreamAvatars.map((avatar, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAvatar(avatar)}
                    className={cn(
                      'relative aspect-square overflow-hidden rounded-full border-4 transition-all hover:scale-105',
                      selectedAvatar === avatar
                        ? 'border-primary'
                        : 'hover:border-muted border-transparent',
                    )}
                  >
                    <Image src={avatar} alt={`Avatar ${index + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="teams" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="grid grid-cols-4 gap-4 sm:grid-cols-5">
                {teamAvatars.map((avatar, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedAvatar(avatar)}
                    className={cn(
                      'relative aspect-square overflow-hidden rounded-full border-4 transition-all hover:scale-105',
                      selectedAvatar === avatar
                        ? 'border-primary'
                        : 'hover:border-muted border-transparent',
                    )}
                  >
                    <Image
                      src={avatar}
                      alt={`Team Avatar ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
