<template>
  <router-view v-if="!showShell" />

  <v-app v-else class="bg-background">
    <v-app-bar elevation="2">
      <v-app-bar-nav-icon />
      <v-toolbar-title>Receitas Saudáveis</v-toolbar-title>
      <v-spacer />
      <v-btn
        icon
        variant="tonal"
        :title="`Tema: ${isDark ? 'escuro' : 'claro'}`"
        @click="toggleTheme"
      >
        <v-icon>mdi-theme-light-dark</v-icon>
      </v-btn>
      <template v-if="auth.user">
        <v-avatar class="ml-3" size="32">
          <v-img :src="auth.user.photo" alt="avatar" />
        </v-avatar>


        <div class="d-flex align-center ml-2">
          <span class="mr-2">{{ auth.user.name }}</span>
          <v-btn size="small" @click="auth.logout()">Sair</v-btn>
        </div>
      </template>
    </v-app-bar>

    <v-navigation-drawer permanent rail expand-on-hover>
      <v-list density="compact" nav>
        <v-list-item to="/" prepend-icon="mdi-home" title="Catálogo" />
        <v-list-item to="/receitas" prepend-icon="mdi-silverware-fork-knife" title="CRUD de Receitas" />
        <v-list-item to="/sobre" prepend-icon="mdi-information" title="Sobre" />
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <v-container class="py-6">
        <router-view />
      </v-container>
    </v-main>
    <v-snackbar
      v-model="snack.show"
      location="top right"
      timeout="3000"
      color="secondary"
      elevation="6"
      variant="tonal"
    >
      {{ snack.text }}
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { computed } from 'vue'
import { useTheme } from 'vuetify'
import { useAuthStore } from '@/stores/auth'
import { useRoute } from 'vue-router'

const theme = useTheme()
const auth = useAuthStore()
const route = useRoute()
const snack = ref({ show: false, text: '' })

const isDark = computed(() => theme.global.current.value.dark)
function toggleTheme() {
  theme.global.name.value = isDark.value ? 'coresLight' : 'coresDark'
}

const showShell = computed(() => !!auth.user && route.name !== 'login')
</script>

<style>
:root { --focus-caramelo: #C08A5C; }

.v-application .v-btn:focus,
.v-application .v-icon-button:focus {
  outline: 2px dashed var(--focus-caramelo) !important; 
  outline-offset: 3px !important;
  box-shadow: 0 0 0 2px rgba(192,138,92,0.25) !important;
  border-radius: 9999px !important; 
  transition: outline-color .15s ease, box-shadow .15s ease;
}

.v-application .v-rating__wrapper:focus,
.v-application .v-rating .v-btn:focus{
  outline: 2px dashed var(--focus-caramelo) !important;
  outline-offset: 3px !important;
  box-shadow: 0 0 0 2px rgba(192,138,92,0.25) !important;
  border-radius: 12px !important;
  transition: outline-color .15s ease, box-shadow .15s ease;
}

.v-application :focus {
  transition: box-shadow .15s ease, outline-color .15s ease;
}

</style>