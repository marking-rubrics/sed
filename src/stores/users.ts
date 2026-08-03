import { defineStore } from 'pinia'
import { ref } from 'vue'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import type { User } from '@/types'

export const useUserStore = defineStore('users', () => {
  // 1. Core State
  const currentUser = ref<User | null>(null)
  const isAuthLoading = ref(true)

  // 2. Resolve initialization status for router guards
  let authInitPromise: Promise<void> | null = null

  function waitForAuthInit(): Promise<void> {
    if (!authInitPromise) {
      authInitPromise = new Promise((resolve) => {
        // Attempt to sync state from storage on SPA bootup
        const storedUser = localStorage.getItem('auth_user')

        if (storedUser) {
          try {
            currentUser.value = JSON.parse(storedUser)
          } catch (e) {
            console.error('Failed to parse stored user session data:', e)
            localStorage.removeItem('auth_user')
          }
        }

        isAuthLoading.value = false
        resolve()
      })
    }
    return authInitPromise
  }

  // 3. Actions for session management
  function setCurrentUser(user: User) {
    currentUser.value = user
    localStorage.setItem('auth_user', JSON.stringify(user))
  }

  async function clearUserSession(): Promise<void> {
      try {
        // 1. Sign out from Firebase servers/tokens
        await signOut(auth)
      } catch (error) {
        console.error('Error signing out from Firebase:', error)
      } finally {
        // 2. Clear local tracking state completely even if the network call failed
        currentUser.value = null
        localStorage.removeItem('auth_user')

        // 3. Force browser-level redirect to completely dump the app's RAM state
        window.location.replace(import.meta.env.BASE_URL + 'login.html')
      }
    }

  return {
    currentUser,
    isAuthLoading,
    waitForAuthInit,
    setCurrentUser,
    clearUserSession
  }
})
