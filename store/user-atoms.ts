import { atomWithStorage } from 'jotai/utils';

export interface SerializableUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export const userAtom = atomWithStorage<SerializableUser | null>('firebase_user', null);
