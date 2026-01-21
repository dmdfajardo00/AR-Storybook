import { userStorage } from '$lib/utils/storage';
import type { User } from '$lib/types';

// Initialize from localStorage
function createUserStore() {
  let user = $state<User | null>(null);
  let isLoaded = $state(false);

  // Derived state
  const hasUser = $derived(user !== null && user.name.trim() !== '');
  const displayName = $derived(user?.name ?? 'Explorer');

  // Load user from storage
  function load() {
    if (typeof window !== 'undefined') {
      user = userStorage.get();
      isLoaded = true;
    }
  }

  // Set user name
  function setName(name: string) {
    const trimmedName = name.trim();
    if (trimmedName) {
      user = {
        name: trimmedName,
        createdAt: user?.createdAt ?? new Date().toISOString(),
      };
      userStorage.set(user);
    }
  }

  // Clear user
  function clear() {
    user = null;
    userStorage.clear();
  }

  return {
    get user() {
      return user;
    },
    get hasUser() {
      return hasUser;
    },
    get displayName() {
      return displayName;
    },
    get isLoaded() {
      return isLoaded;
    },
    load,
    setName,
    clear,
  };
}

export const userStore = createUserStore();
