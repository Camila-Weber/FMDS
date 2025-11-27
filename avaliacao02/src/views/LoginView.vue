<template>
  <v-container class="fill-height d-flex justify-center align-center">
    <v-card max-width="420" class="pa-6 elevation-4 rounded-xl">
      <div class="text-center mb-6">
        <v-avatar size="64" class="mb-3" color="secondary">
          <v-icon size="36">local_library</v-icon>
        </v-avatar>
        <h2 class="mb-1">Bem-vindo(a) à Biblioteca</h2>
        <p class="text-medium-emphasis">
          Acesse com sua conta Google para gerenciar livros, reservas e devoluções.
        </p>
      </div>

      <v-btn
        block
        color="primary"
        size="large"
        @click="handleLogin"
      >
        <v-icon start>login</v-icon>
        Entrar com Google
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogin = async () => {
  try {
    await authStore.loginWithGoogle()
    router.push({ name: 'dashboard' })
  } catch (e) {
    alert('Erro ao fazer login. Tente novamente.')
  }
}
</script>
