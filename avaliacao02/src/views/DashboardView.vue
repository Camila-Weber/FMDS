<template>
  <div>
    <v-row class="gy-6">
      <v-col cols="12">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Buscar livro ou autor..."
          variant="solo"
          density="comfortable"
          class="rounded-lg"
          @keyup.enter="applySearch"
        >
          <template #append-inner>
            <v-btn icon variant="text" @click="openAdvancedSearch">
              <v-icon>mdi-tune</v-icon>
            </v-btn>
          </template>
        </v-text-field>
      </v-col>

      <v-col cols="12" md="8">
        <!-- VISÃO GERAL -->
        <v-card elevation="2" class="rounded-xxl pa-4">
          <v-card-title class="d-flex align-center mb-3">
            <v-icon class="mr-2">mdi-library</v-icon>
            <span class="text-h5 font-weight-medium">Visão geral da biblioteca</span>
          </v-card-title>

          <v-row class="mt-2">
            <v-col cols="4" class="text-center">
              <v-sheet class="pa-4 rounded-lg stat-card">
                <div class="text-medium-emphasis text-caption">Total</div>
                <div class="text-h5">{{ totalBooks }}</div>
              </v-sheet>
            </v-col>

            <v-col cols="4" class="text-center">
              <v-sheet class="pa-4 rounded-lg stat-card">
                <div class="text-medium-emphasis text-caption">Disponíveis</div>
                <div class="text-h5 text-success">{{ availableBooks.length }}</div>
              </v-sheet>
            </v-col>

            <v-col cols="4" class="text-center">
              <v-sheet class="pa-4 rounded-lg stat-card">
                <div class="text-medium-emphasis text-caption">Reservados</div>
                <div class="text-h6 text-warning">{{ reservedCount }}</div>
              </v-sheet>
            </v-col>
          </v-row>
        </v-card>

        <!-- LISTA DE DISPONÍVEIS -->
        <v-card elevation="2" class="rounded-xxl pa-4 mt-6">
          <v-card-title class="d-flex align-center mb-3">
            <v-icon class="mr-2">mdi-book-check</v-icon>
            <span class="text-h5 font-weight-medium">Livros disponíveis</span>
          </v-card-title>

          <v-chip
            v-for="book in filteredAvailableBooks"
            :key="book.id"
            class="ma-1 available-chip"
            color="primary"
            variant="tonal"
          >
            {{ book.title }} — {{ book.author }}
          </v-chip>

          <div v-if="!filteredAvailableBooks.length" class="text-medium-emphasis">
            Nenhum livro encontrado.
          </div>
        </v-card>
      </v-col>

      <!-- ATALHOS -->
      <v-col cols="12" md="4">
        <v-card class="rounded-xxl pa-4" elevation="2">
          <v-card-title class="d-flex align-center mb-3">
            <v-icon class="mr-2">mdi-flash</v-icon>
            <span class="text-h5 font-weight-medium">Atalhos</span>
          </v-card-title>

          <!-- Se não estiver autenticado, manda para /login -->
          <v-btn
            block
            color="primary"
            class="mb-3"
            :to="isAuthenticated ? '/books/new' : '/login'"
          >
            <v-icon start>mdi-book-plus</v-icon>
            Novo livro
          </v-btn>

          <v-btn
            block
            variant="outlined"
            color="primary"
            :to="isAuthenticated ? '/reservations' : '/login'"
          >
            <v-icon start>mdi-calendar-check</v-icon>
            Reservas
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- BUSCA AVANÇADA -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card class="pa-4">
        <v-card-title class="text-h6 font-weight-medium">
          Busca avançada
        </v-card-title>

        <v-text-field
          v-model="filters.title"
          label="Título"
          prepend-inner-icon="mdi-book"
        />
        <v-text-field
          v-model="filters.author"
          label="Autor"
          prepend-inner-icon="mdi-account"
        />
        <v-select
          v-model="filters.status"
          :items="['Disponível', 'Reservado']"
          label="Status"
          prepend-inner-icon="mdi-tag"
        />

        <v-row class="mt-3">
          <v-col cols="6">
            <v-btn block color="primary" @click="applyAdvancedSearch">
              Aplicar
            </v-btn>
          </v-col>
          <v-col cols="6">
            <v-btn block variant="text" @click="dialog = false">
              Fechar
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBooksStore } from '../stores/books'
import { useAuthStore } from '../stores/auth'

const booksStore = useBooksStore()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)

const search = ref('')
const dialog = ref(false)
const filters = ref({
  title: '',
  author: '',
  status: null,
})

const openAdvancedSearch = () => (dialog.value = true)
const applySearch = () => {}
const applyAdvancedSearch = () => {
  dialog.value = false
}

const totalBooks = computed(() => booksStore.books.length)
const availableBooks = computed(() =>
  booksStore.books.filter(b => b.available)
)
const reservedCount = computed(
  () => booksStore.books.filter((b) => !b.available).length
)

const filteredAvailableBooks = computed(() => {
  const s = search.value.toLowerCase()
  return availableBooks.value.filter((book) => {
    return (
      book.title.toLowerCase().includes(s) ||
      book.author.toLowerCase().includes(s)
    )
  })
})
</script>

<style scoped>
.rounded-xxl {
  border-radius: 20px;
}

.stat-card {
  background-color: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-primary), 0.25);
  transition: background-color 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

/* hover tema claro */
.stat-card:hover {
  background-color: rgba(var(--v-theme-surface), 0.95);
  border-color: rgba(var(--v-theme-primary), 0.35);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

/* hover tema escuro */
:deep(html.v-theme--libraryDark) .stat-card:hover {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(var(--v-theme-primary), 0.45);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
}

.available-chip {
  font-weight: 500;
}
</style>
