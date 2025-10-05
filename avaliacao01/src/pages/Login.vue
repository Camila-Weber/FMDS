<template>
  <div class="login-page">
    <div class="login-box">
      <h1 class="title">Catálogo de Receitas</h1>
      <p class="subtitle">Acesse sua conta para continuar.</p>

      <v-btn
        color="secondary"
        prepend-icon="mdi-google"
        size="large"
        class="mt-6"
        @click="login"
      >
        Entrar com Google
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
const login = () => auth.loginWithGoogle()
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #1e1b18, #3e2e26, #8b4513);
}

.login-box {
  text-align: center;
  background: rgba(0,0,0,0.5);
  padding: 48px 32px;
  border-radius: 16px;
  width: min(520px, 94vw);
  box-shadow: 0 8px 24px rgba(0,0,0,0.6);
}

/* tipografia */
.title {
  color: #ffddb0;
  font-weight: 800;
  font-size: clamp(1.6rem, 4vw, 2.2rem);
  margin: 0 0 6px;
}
.subtitle {
  color: #d6b78b;
  margin: 0 0 4px;
}
</style>
