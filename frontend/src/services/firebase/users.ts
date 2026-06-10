import { ref, set, get, remove, update } from "firebase/database";
import { database } from "@/config/firebase";
import type { AppUser } from "@/types";

/** Base path for all user records in RTDB */
const USERS_PATH = "users";

/**
 * Writes a new user record to users/{cardUID}.
 */
export async function createUser(user: AppUser): Promise<void> {
  const userRef = ref(database, `${USERS_PATH}/${user.cardUID}`);
  await set(userRef, user);
}

/**
 * Returns true if a user record already exists for the given cardUID.
 */
export async function isCardRegistered(cardUID: string): Promise<boolean> {
  const userRef   = ref(database, `${USERS_PATH}/${cardUID}`);
  const snapshot  = await get(userRef);
  return snapshot.exists();
}

/**
 * Toggles the isActive flag for a user at users/{cardUID}.
 */
export async function setUserActive(cardUID: string, isActive: boolean): Promise<void> {
  const userRef = ref(database, `${USERS_PATH}/${cardUID}`);
  await update(userRef, { isActive });
}

/**
 * Permanently removes a user record from users/{cardUID}.
 */
export async function deleteUser(cardUID: string): Promise<void> {
  const userRef = ref(database, `${USERS_PATH}/${cardUID}`);
  await remove(userRef);
}
