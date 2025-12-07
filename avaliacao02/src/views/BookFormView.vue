<template>
  <v-card max-width="700" class="mx-auto rounded-xxl" elevation="3">
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2">mdi-book-open-page-variant</v-icon>
      {{ isEdit ? 'Editar livro' : 'Cadastrar livro' }}
    </v-card-title>

    <v-divider />

    <v-card-text>
      <v-form ref="formRef" @submit.prevent="handleSubmit">
        <v-row class="mt-2" dense>
          
          <v-col cols="12" md="8">
            <v-text-field
              v-model="form.title"
              label="Título *"
              prepend-inner-icon="mdi-format-title"
              :rules="[rules.required]"
              required
            />
          </v-col>

          <v-col cols="12" md="4">
            <v-text-field
              v-model="form.author"
              label="Autor *"
              prepend-inner-icon="mdi-account"
              :rules="[rules.required]"
              required
            />
          </v-col>

          <v-col cols="12">
            <v-autocomplete
              v-model="form.genres"
              :items="genresOptions"
              item-title="name"
              item-value="id"
              label="Gêneros *"
              prepend-inner-icon="mdi-bookmark-multiple-outline"
              multiple
              chips
              closable-chips
              hide-selected
              :rules="[rules.requiredArray]"
              required
            />
          </v-col>

        </v-row>

        <div class="mt-4 d-flex justify-end">
          <v-btn variant="text" class="mr-2" @click="$router.back()">
            Cancelar
          </v-btn>

          <v-btn type="submit" color="primary">
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

const route = useRoute()
const router = useRouter()
const booksStore = useBooksStore()

const formRef = ref(null)

const isEdit = computed(() => !!route.params.id)

const form = reactive({
  title: '',
  author: '',
  genres: [],
})

const rules = {
  required: (v) => !!v || 'Campo obrigatório',
  requiredArray: (v) => (v?.length > 0) || 'Selecione pelo menos 1 gênero',
}

const genresOptions = ref([])

const loadGenres = async () => {
  try {
    const data = await booksStore.fetchGenres()
    genresOptions.value = data.data
    
  } catch (error) {
    console.error('Erro ao carregar gêneros:', error)
    genresOptions.value = []
  }
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
      form.genres = book.genres
    }
  }
})

const handleSubmit = async () => {
  if (!formRef.value) return

  const { valid } = await formRef.value.validate()
  if (!valid) return

  const payload = {
    title: form.title,
    author: form.author,
    genres: [...form.genres],
  }

  try {
    console.log('genres no payload:', payload.genres)
    if (isEdit.value) {
      await booksStore.updateBook(Number(route.params.id), payload)
    } else {
      await booksStore.createBook(payload)
    }

    router.push({ name: 'books-list' })
  } catch (error) {
    console.error('Erro ao salvar livro:', error)
  }
}
</script>

<style scoped>
.rounded-xxl {
  border-radius: 20px;
}
</style>
