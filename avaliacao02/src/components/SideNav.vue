<template>
  <!-- quando collapsed = true, o drawer some completamente -->
  <v-navigation-drawer
    v-if="!collapsed"
    permanent
    color="secondary"
    width="260"
    class="px-2"
  >
    <v-sheet class="py-6 text-center" color="transparent">
      <v-avatar size="56" class="mb-2">
        <v-icon size="36">mdi-library-shelves</v-icon>
      </v-avatar>

      <div>
        <div class="text-h6 font-weight-bold">Sistema</div>
        <small class="text-medium-emphasis">Biblioteca</small>
      </div>
    </v-sheet>

    <v-divider />

    <v-list nav density="comfortable" class="mt-4">
      <v-list-item
        prepend-icon="mdi-view-dashboard-outline"
        title="Dashboard"
        to="/"
        exact
        :value="$route.path === '/'"
      />

      <v-list-item
        prepend-icon="mdi-book-open-page-variant"
        title="Livros"
        to="/books"
        :value="$route.path.includes('/books')"
      />

      <v-list-item
        prepend-icon="mdi-calendar-clock"
        title="Reservas & Devoluções"
        to="/reservations"
        :value="$route.path.includes('/reservations')"
      />
      
      <v-list-item
        prepend-icon="mdi-note"
        title="Resenhas"
        to="/reviews"
        :value="$route.path.includes('/reviews')"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
defineProps({
  collapsed: {
    type: Boolean,
    default: false,
  },
})
</script>
