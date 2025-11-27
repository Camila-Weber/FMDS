<template>
  <v-app-bar color="surface"
  elevation="3"
  class="px-4 app-bar-elevated">
    <v-btn icon variant="text" @click="$emit('toggleSidebar')">
      <v-icon>mdi-menu</v-icon>
    </v-btn>

    <v-toolbar-title class="ml-2 font-weight-bold text-h6">
      Biblioteca
    </v-toolbar-title>

    <v-spacer />

    <!-- Botão de troca de tema -->
    <v-btn icon variant="text" class="mr-2" @click="toggleTheme">
      <v-icon>
        {{ isDark ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent' }}
      </v-icon>
    </v-btn>

    <!-- User info -->
    <v-btn icon variant="text" v-if="photo">
      <v-avatar size="36">
        <v-img :src="photo" />
      </v-avatar>
    </v-btn>

    <div class="mr-4 text-right d-none d-md-flex flex-column">
      <span class="font-weight-medium">{{ name }}</span>
      <small class="text-medium-emphasis">{{ email }}</small>
    </div>

    <v-btn
      color="primary"
      variant="outlined"
      size="small"
      @click="logout"
    >
      <v-icon start>mdi-logout</v-icon>
      Sair
    </v-btn>
  </v-app-bar>
</template>


<script setup>
import { computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useTheme } from 'vuetify'

const authStore = useAuthStore()
const name = computed(() => authStore.userName)
const email = computed(() => authStore.userEmail)
const photo = computed(() => authStore.userPhoto)

const logout = async () => {
  await authStore.logout()

  if (route.meta.requiresAuth && authStore.isAuthenticated) {
    router.push({ name: 'dashboard' })
  }
}

// ---- Tema claro/escuro ----
const theme = useTheme()

// computed que espelha se o tema atual é dark
const isDark = computed({
  get: () => theme.global.current.value.dark,
  set: (val) => {
    theme.global.name.value = val ? 'libraryDark' : 'libraryLight'
  },
})

const toggleTheme = () => {
  isDark.value = !isDark.value
}

// opcional: lembrar preferência no localStorage
onMounted(() => {
  const saved = localStorage.getItem('theme')
  if (saved === 'dark') {
    theme.global.name.value = 'libraryDark'
  }
})

watch(
  () => theme.global.name.value,
  (name) => {
    localStorage.setItem('theme', name === 'libraryDark' ? 'dark' : 'light')
  }
)
</script>

<style scoped>
.app-bar-elevated {
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.35);
  backdrop-filter: blur(8px);
}
</style>
