<template>
  <div>
    <v-row class="gy-6">
      <!-- BUSCA GLOBAL -->
      <v-col cols="12">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Buscar livro ou autor..."
          variant="solo"
          density="comfortable"
          class="rounded-lg"
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

        <!-- LISTAGEM DE LIVROS -->
        <v-card elevation="2" class="rounded-xxl pa-4 mt-6">
          <v-card-title class="d-flex align-center mb-3">
            <v-icon class="mr-2">mdi-book-open-page-variant</v-icon>
            <span class="text-h5 font-weight-medium">Livros cadastrados</span>
          </v-card-title>

          <v-divider class="mb-3" />

          <v-list density="comfortable">
            <v-list-item
              v-for="book in filteredBooks"
              :key="book.id"
              class="book-list-item"
            >
              <v-list-item-title class="font-weight-medium">
                {{ book.title }}
              </v-list-item-title>

              <v-list-item-subtitle>
                {{ book.author }}
              </v-list-item-subtitle>

              <template #append>
                <div class="d-flex align-center flex-wrap justify-end">
                  <!-- status -->
                  <v-chip
                    size="x-small"
                    :color="book.available ? 'success' : 'warning'"
                    variant="flat"
                    class="mr-2 mb-1"
                  >
                    {{ book.available ? 'Disponível' : 'Reservado' }}
                  </v-chip>

                  <!-- rating (se existir) -->
                  <div v-if="book.rating" class="d-flex align-center mr-2 mb-1">
                    <v-icon size="18" color="amber">mdi-star</v-icon>
                    <span class="text-caption ml-1">
                      {{ book.rating.toFixed(1) }}
                    </span>
                  </div>

                  <!-- atalho para resenha desse livro (se quiser algo mais específico depois) -->
                  <v-btn
                    icon
                    size="small"
                    :to="isAuthenticated ? `/reviews?bookId=${book.id}` : '/login'"
                    variant="text"
                  >
                    <v-icon>mdi-note-text-outline</v-icon>
                  </v-btn>
                </div>
              </template>
            </v-list-item>

            <v-list-item v-if="!filteredBooks.length">
              <v-list-item-title class="text-medium-emphasis">
                Nenhum livro encontrado.
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- ATALHOS -->
      <v-col cols="12" md="4">
        <v-card class="rounded-xxl pa-4" elevation="2">
          <v-card-title class="d-flex align-center mb-3">
            <v-icon class="mr-2">mdi-flash</v-icon>
            <span class="text-h5 font-weight-medium">Atalhos</span>
          </v-card-title>

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
            class="mb-3"
            :to="isAuthenticated ? '/reservations' : '/login'"
          >
            <v-icon start>mdi-calendar-check</v-icon>
            Reservas
          </v-btn>

          <!-- NOVO ATALHO: RESENHAS -->
          <v-btn
            block
            variant="outlined"
            color="primary"
            :to="isAuthenticated ? '/reviews' : '/login'"
          >
            <v-icon start>mdi-note-text-outline</v-icon>
            Resenhas
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- BUSCA AVANÇADA (mantida) -->
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
const applyAdvancedSearch = () => {
  dialog.value = false
}

const totalBooks = computed(() => booksStore.books.length)
const availableBooks = computed(() =>
  booksStore.books.filter((b) => b.available)
)
const reservedCount = computed(
  () => booksStore.books.filter((b) => !b.available).length
)

// LISTAGEM QUE ALIMENTA O CARD "LIVROS CADASTRADOS"
const filteredBooks = computed(() => {
  const s = search.value.toLowerCase()
  const { title, author, status } = filters.value

  return booksStore.books.filter((b) => {
    let ok = true

    // busca simples (campo de cima)
    if (s) {
      ok =
        ok &&
        (b.title.toLowerCase().includes(s) ||
          b.author.toLowerCase().includes(s))
    }

    // filtros avançados (opcionais)
    if (title) {
      ok = ok && b.title.toLowerCase().includes(title.toLowerCase())
    }

    if (author) {
      ok = ok && b.author.toLowerCase().includes(author.toLowerCase())
    }

    if (status) {
      const disponivel = b.available
      if (status === 'Disponível' && !disponivel) ok = false
      if (status === 'Reservado' && disponivel) ok = false
    }

    return ok
  })
})
</script>

<style scoped>
.rounded-xxl {
  border-radius: 20px;
}

/* cards de estatística */
.stat-card {
  background-color: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-primary), 0.25);
  transition: background-color 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.stat-card:hover {
  background-color: rgba(var(--v-theme-surface), 0.95);
  border-color: rgba(var(--v-theme-primary), 0.35);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

/* linha da lista de livros */
.book-list-item {
  border-radius: 12px;
  margin-bottom: 4px;
  transition: background-color 0.2s ease;
}

.book-list-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.06);
}
</style>
