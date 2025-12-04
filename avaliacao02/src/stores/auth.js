// src/stores/auth.js
import { defineStore } from 'pinia'
import { supabase } from '../supabase'
// import { auth, provider } from '../firebase'
// import {
//   signInWithPopup,
//   signOut,
//   onAuthStateChanged,
// } from 'firebase/auth'
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
    // initAuthListener() {
    //   onAuthStateChanged(auth, (firebaseUser) => {
    //     if (firebaseUser) {
    //       this.user = {
    //         uid: firebaseUser.uid,
    //         name: firebaseUser.displayName,
    //         email: firebaseUser.email,
    //         photoURL: firebaseUser.photoURL,
    //       }
    //     } else {
    //       this.user = null
    //     }
    //     this.loading = false
    //   })
    // },
    
    async initAuthListener() {
      // 🔥 Pega sessão atual ao recarregar
      const { data: { session } } = await supabase.auth.getSession()
        
      if (session?.user) {
        this.user = {
          uid: session.user.id,
          name: session.user.user_metadata.full_name,
          email: session.user.email,
          photoURL: session.user.user_metadata.avatar_url,
        }
      } else {
        this.user = null
      }
    
      this.loading = false
    
      // 🔥 Escuta mudanças de autenticação
      supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          this.user = {
            uid: session.user.id,
            name: session.user.user_metadata.full_name,
            email: session.user.email,
            photoURL: session.user.user_metadata.avatar_url,
          }
        } else {
          this.user = null
        }
      })
    },


    // async loginWithGoogle() {
    //   try {
    //     const result = await signInWithPopup(auth, provider)
    //     const firebaseUser = result.user
    //     this.user = {
    //       uid: firebaseUser.uid,
    //       name: firebaseUser.displayName,
    //       email: firebaseUser.email,
    //       photoURL: firebaseUser.photoURL,
    //     }
    //   } catch (error) {
    //     console.error('Erro ao logar com Google:', error)
    //     throw error
    //   }
    // },

    async loginWithGoogle() {
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin, // retorna ao app
          }
        })

        if (error) throw error

      } catch (error) {
        console.error('Erro ao logar com Google:', error)
        throw error
      }
    },

    // async logout() {
    //   await signOut(auth)
    //   this.user = null
    //   // ✅ SEM CONDIÇÃO: SEMPRE VOLTA PARA O DASHBOARD PÚBLICO
    //   router.push({ name: 'dashboard' })
    // },
    
    async logout() {
      await supabase.auth.signOut()
      this.user = null
      router.push({ name: 'dashboard' })
    },
  },
})
