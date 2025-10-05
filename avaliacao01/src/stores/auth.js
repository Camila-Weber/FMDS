import { defineStore } from 'pinia'
import { auth, provider } from '@/firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
  state: () => ({ user: null, ready: false }),
  actions: {
    init() {
      return new Promise((resolve) => {
        onAuthStateChanged(auth, (u) => {
          this.user = u ? { uid: u.uid, name: u.displayName, photo: u.photoURL, email: u.email } : null
          this.ready = true
          resolve()
        })
      })
    },
    async loginWithGoogle() {
      await signInWithPopup(auth, provider)
      router.push({ name: 'home' })
    },
    async logout() {
      await signOut(auth)
      this.user = null
      router.push({ name: 'login' })
    }
  }
})