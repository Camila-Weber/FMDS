<template>
  <v-card class="rounded-xxl pa-4" elevation="3" max-width="700" mx="auto">
    <v-card-title class="text-h5">
      Nova resenha
    </v-card-title>

    <v-divider class="my-3" />

    <v-form @submit.prevent="save">
      <v-select
        v-model="form.bookId"
        :items="bookOptions"
        item-title="title"
        item-value="id"
        label="Livro"
        prepend-inner-icon="mdi-book"
        required
      />

      <v-rating
        v-model="form.rating"
        length="5"
        size="32"
        class="my-4"
        color="amber"
      />

      <v-textarea
        v-model="form.text"
        label="Escreva sua resenha"
        auto-grow
        prepend-inner-icon="mdi-pencil"
        required
      />

      <v-btn block type="submit" color="primary" class="mt-4">
        Salvar resenha
      </v-btn>
    </v-form>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBooksStore } from '../stores/books'
import { useReviewsStore } from '../stores/reviews'
import { useRouter } from 'vue-router'

const booksStore = useBooksStore()
const reviewsStore = useReviewsStore()
const router = useRouter()

const form = ref({
  bookId: null,
  rating: 0,
  text: '',
})

const bookOptions = computed(() =>
  booksStore.books.map(b => ({ id: b.id, title: b.title }))
)

const save = async () => {
  await reviewsStore.addReview(form.value)
  router.push('/reviews')
}
</script>
