<template>
  <v-btn color="secondary" @click="login" prepend-icon="mdi-google">
    Entrar com Google
  </v-btn>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
const login = () => auth.loginWithGoogle()
</script>
