<template>
  <v-app>
    <v-layout>
      <SideNav
        v-if="isAuthenticated"
        :collapsed="collapsed"
      />

      <v-main class="app-background">
        <AppBar
          v-if="isAuthenticated"
          :collapsed="collapsed"
          @toggleSidebar="toggleSidebar"
        />

        <v-container fluid class="py-8">
          <v-row justify="center">
            <v-col cols="12" lg="10">
              <router-view />
            </v-col>
          </v-row>
        </v-container>

        <!-- SNACKBAR GLOBAL -->
        <v-snackbar
          v-model="ui.snackbar.show"
          :color="ui.snackbar.color"
          :timeout="ui.snackbar.timeout"
          location="bottom right"
        >
          {{ ui.snackbar.message }}
        </v-snackbar>
      </v-main>
    </v-layout>
  </v-app>
</template>


<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from './stores/auth'
import { useUiStore } from './stores/ui' 
import AppBar from './components/AppBar.vue'
import SideNav from './components/SideNav.vue'

const authStore = useAuthStore()
const ui = useUiStore()                    

const isAuthenticated = computed(() => authStore.isAuthenticated)

const collapsed = ref(false)

const toggleSidebar = () => {
  collapsed.value = !collapsed.value
}
</script>

<style scoped>
.app-background {
  background-color: rgb(var(--v-theme-background));
  min-height: 100vh;
}

</style>
