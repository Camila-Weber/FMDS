<template>
  <v-card class="rounded-xxl" elevation="3">
    <v-toolbar flat class="px-4 toolbar-section">
      <v-toolbar-title class="font-weight-medium">
        Acervo de livros
      </v-toolbar-title>

      <v-spacer />

      <!-- busca simples -->
      <v-text-field
        v-model="search"
        placeholder="Buscar por título ou autor..."
        prepend-inner-icon="mdi-magnify"
        density="comfortable"
        variant="outlined"
        hide-details
        class="mr-2"
        style="max-width: 280px"
      />

      <!-- botão de busca avançada -->
      <v-btn
        icon
        variant="text"
        class="mr-4"
        @click="dialog = true"
      >
        <v-icon>mdi-tune</v-icon>
      </v-btn>

      <v-btn color="primary" @click="$router.push('/books/new')">
        <v-icon start>mdi-book-plus</v-icon>
        Novo livro
      </v-btn>
    </v-toolbar>

    <v-divider />

    <v-data-table
      :headers="headers"
      :items="filteredBooks"
      class="elevation-0 books-table"
      :item-class="itemClass"
    >
      <!-- status -->
      <template #item.available="{ item }">
        <v-chip
          size="small"
          :color="item.available ? 'success' : 'warning'"
          variant="flat"
        >
          {{ item.available ? 'Disponível' : 'Reservado' }}
        </v-chip>
      </template>

      <!-- gêneros -->
      <template #item.genres="{ item }">
        <div class="d-flex flex-wrap">
          <v-chip
            v-for="(g, i) in (item.genres || [])"
            :key="i"
            size="x-small"
            class="ma-1 genre-chip"
            color="primary"
            variant="tonal"
          >
            {{ g }}
          </v-chip>

          <span
            v-if="!item.genres || !item.genres.length"
            class="text-medium-emphasis text-caption"
          >
            —
          </span>
        </div>
      </template>

      <!-- avaliação -->
      <template #item.rating="{ item }">
        <div class="d-flex align-center">
          <v-rating
            :model-value="item.rating || 0"
            density="compact"
            size="small"
            readonly
            color="amber"
            half-increments
          />
          <span v-if="item.rating" class="text-caption ml-1">
            {{ item.rating.toFixed(1) }}
          </span>
        </div>
      </template>

      <!-- ações -->
      <template #item.actions="{ item }">
        <v-btn
          icon
          size="small"
          variant="text"
          :to="`/books/${(item.raw || item).id}/edit`"
        >
          <v-icon>mdi-pencil-outline</v-icon>
        </v-btn>
      
        <v-btn
          icon
          size="small"
          variant="text"
          color="error"
          @click="openDeleteDialog(item)"
        >
          <v-icon>mdi-delete-outline</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <!-- DIÁLOGO DE CONFIRMAÇÃO DE EXCLUSÃO -->
    <v-dialog v-model="confirmDialog" max-width="420">
      <v-card class="pa-4">
        <v-card-title class="text-h6">
          Confirmar exclusão
        </v-card-title>

        <v-card-text>
          Tem certeza de que deseja excluir o livro
          <strong>{{ bookToDelete?.title }}</strong>?
          <br />
          <span class="text-medium-emphasis text-caption">
            Esta ação não poderá ser desfeita.
          </span>
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="cancelDelete">
            Cancelar
          </v-btn>
          <v-btn color="error" @click="confirmDelete">
            <v-icon start size="18">mdi-delete-outline</v-icon>
            Excluir
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- BUSCA AVANÇADA -->
    <v-dialog v-model="dialog" max-width="480">
      <v-card class="pa-4">
        <v-card-title class="text-h6 font-weight-medium">
          Busca avançada
        </v-card-title>

        <v-text-field
          v-model="filters.title"
          label="Título"
          prepend-inner-icon="mdi-format-title"
          class="mb-2"
        />

        <v-text-field
          v-model="filters.author"
          label="Autor"
          prepend-inner-icon="mdi-account"
          class="mb-2"
        />

        <v-select
          v-model="filters.status"
          :items="['Disponível', 'Reservado']"
          label="Status"
          prepend-inner-icon="mdi-tag"
          class="mb-2"
          clearable
        />

        <v-autocomplete
          v-model="filters.genre"
          :items="genresOptions"
          label="Gênero"
          prepend-inner-icon="mdi-bookmark-multiple-outline"
          clearable
        />

        <v-row class="mt-4">
          <v-col cols="4">
            <v-btn block variant="text" @click="clearFilters">
              Limpar
            </v-btn>
          </v-col>
          <v-col cols="8">
            <v-btn block color="primary" @click="dialog = false">
              Aplicar filtros
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useBooksStore } from '../stores/books'

const booksStore = useBooksStore()

const search = ref('')
const itemsPerPage = ref(10)

const confirmDialog = ref(false)
const bookToDelete = ref(null)

// diálogo e filtros da busca avançada
const dialog = ref(false)
const filters = ref({
  title: '',
  author: '',
  status: null,
  genre: null,
})

const headers = [
  { title: 'ID', key: 'id', align: 'start' },
  { title: 'Título', key: 'title' },
  { title: 'Autor', key: 'author' },
  { title: 'Gênero(s)', key: 'genres', sortable: false },
  { title: 'Status', key: 'available' },
  { title: 'Avaliação', key: 'rating', sortable: false },
  { title: 'Ações', key: 'actions', sortable: false },
]

// gêneros disponíveis (derivados dos livros cadastrados)
const genresOptions = computed(() => {
  const set = new Set()
  booksStore.books.forEach((b) => {
    ;(b.genres || []).forEach((g) => set.add(g))
  })
  return Array.from(set)
})

// aplica busca simples + filtros avançados
const filteredBooks = computed(() => {
  const s = search.value.toLowerCase()
  const { title, author, status, genre } = filters.value

  return booksStore.books.filter((b) => {
    let ok = true

    // busca simples
    if (s) {
      ok =
        ok &&
        (b.title.toLowerCase().includes(s) ||
          b.author.toLowerCase().includes(s))
    }

    // filtros avançados
    if (title) {
      ok = ok && b.title.toLowerCase().includes(title.toLowerCase())
    }

    if (author) {
      ok = ok && b.author.toLowerCase().includes(author.toLowerCase())
    }

    if (status) {
      const isDisponivel = b.available
      if (status === 'Disponível' && !isDisponivel) ok = false
      if (status === 'Reservado' && isDisponivel) ok = false
    }

    if (genre) {
      ok =
        ok &&
        (b.genres || []).some(
          (g) => g.toLowerCase() === genre.toLowerCase()
        )
    }

    return ok
  })
})

const clearFilters = () => {
  filters.value = {
    title: '',
    author: '',
    status: null,
    genre: null,
  }
}

const openDeleteDialog = (item) => {
  const raw = item.raw || item
  bookToDelete.value = raw
  confirmDialog.value = true
}

const confirmDelete = async () => {
  if (!bookToDelete.value) return

  await booksStore.deleteBook(bookToDelete.value.id)
  confirmDialog.value = false
  bookToDelete.value = null
}

const cancelDelete = () => {
  confirmDialog.value = false
  bookToDelete.value = null
}

const itemClass = (item) => {
  const base = 'book-row'

  const raw = item.raw || item

  if (!raw.available) {
    return `${base} book-row--reserved`
  }
  return base
}

</script>

<style scoped>
.rounded-xxl {
  border-radius: 20px;
}

:deep(.book-row > td) {
  background-color: rgb(var(--v-theme-surface));
  transition: background-color 0.2s ease;
}

:deep(.book-row--reserved > td) {
  background-color: rgba(251, 191, 36, 0.12);
}

.toolbar-section {
  background-color: rgba(var(--v-theme-surface), 0.95);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  backdrop-filter: blur(6px);
  transition: background-color 0.25s ease, border-color 0.25s ease;
}

.v-theme--libraryDark .toolbar-section {
  background-color: rgba(var(--v-theme-secondary), 1); /* diferente do surface */
  border-bottom-color: rgba(var(--v-theme-primary), 0.45);
}

/* chips de gênero */
.genre-chip {
  font-weight: 500;
  background-color: rgba(var(--v-theme-primary), 0.16);
  color: rgb(var(--v-theme-on-primary));
}
</style>
