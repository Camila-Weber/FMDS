// src/stores/auth.js
import { defineStore } from 'pinia'
import { auth, provider } from '../firebase'
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import router from '../router'   // ✅ IMPORTA O ROUTER

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: true,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    userName: (state) => state.user?.name ?? '',
    userEmail: (state) => state.user?.email ?? '',
    userPhoto: (state) => state.user?.photoURL ?? '',
  },

  actions: {
    initAuthListener() {
      onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          this.user = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
          }
        } else {
          this.user = null
        }
        this.loading = false
      })
    },

    async loginWithGoogle() {
      try {
        const result = await signInWithPopup(auth, provider)
        const firebaseUser = result.user
        this.user = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        }
      } catch (error) {
        console.error('Erro ao logar com Google:', error)
        throw error
      }
    },

    async logout() {
      await signOut(auth)
      this.user = null
      // ✅ SEM CONDIÇÃO: SEMPRE VOLTA PARA O DASHBOARD PÚBLICO
      router.push({ name: 'dashboard' })
    },
  },
})
