<template>
  <v-card max-width="700" class="mx-auto rounded-xxl" elevation="3">
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2">mdi-book-open-page-variant</v-icon>
      {{ isEdit ? 'Editar livro' : 'Cadastrar livro' }}
    </v-card-title>

    <v-divider />

    <v-card-text>
      <v-form @submit.prevent="handleSubmit">
        <v-row class="mt-2" dense>
          <v-col cols="12" md="8">
            <v-text-field
              v-model="form.title"
              label="Título"
              prepend-inner-icon="mdi-format-title"
              required
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field
              v-model="form.author"
              label="Autor"
              prepend-inner-icon="mdi-account"
              required
            />
          </v-col>

          <v-col cols="12" md="12">
            <v-autocomplete
              v-model="form.genres"
              :items="genresOptions"
              label="Gêneros"
              prepend-inner-icon="mdi-bookmark-multiple-outline"
              multiple
              chips
              closable-chips
              hide-selected
            />
          </v-col>
        </v-row>

        <div class="mt-4 d-flex justify-end">
          <v-btn
            variant="text"
            class="mr-2"
            @click="$router.back()"
          >
            Cancelar
          </v-btn>

          <v-btn
            type="submit"
            color="primary"
          >
            <v-icon start>mdi-content-save-outline</v-icon>
            Salvar
          </v-btn>
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { reactive, computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBooksStore } from '../stores/books'
// futuramente, você pode buscar do backend:
// import { api } from '../services/api'

const route = useRoute()
const router = useRouter()
const booksStore = useBooksStore()

const isEdit = computed(() => !!route.params.id)

const form = reactive({
  title: '',
  author: '',
  genres: [],
  rating: 0,
  available: true,
})

const genresOptions = ref([])

const loadGenres = async () => {
  // FUTURO: buscar do backend
  // const { data } = await api.get('/genres')
  // genresOptions.value = data

  // MOCK local (até ter backend)
  genresOptions.value = [
    'Romance',
    'Drama',
    'Clássico',
    'Ficção histórica',
    'Fantasia',
    'Suspense',
  ]
}

onMounted(() => {
  loadGenres()

  if (isEdit.value) {
    const book = booksStore.books.find(
      (b) => b.id === Number(route.params.id)
    )
    if (book) {
      form.title = book.title
      form.author = book.author
      form.genres = book.genres ? [...book.genres] : []
      form.rating = book.rating || 0
      form.available = book.available
    }
  }
})

const handleSubmit = async () => {
  const payload = {
    title: form.title,
    author: form.author,
    genres: [...form.genres],
    rating: form.rating || 0,
    available: form.available,
  }

  if (isEdit.value) {
    await booksStore.updateBook(Number(route.params.id), payload)
  } else {
    await booksStore.createBook(payload)
  }
  router.push({ name: 'books-list' })
}
</script>

<style scoped>
.rounded-xxl {
  border-radius: 20px;
}
</style>
