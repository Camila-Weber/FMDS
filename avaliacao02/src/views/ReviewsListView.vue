<template>
  <v-card class="rounded-xxl pa-4">
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="text-h5">Resenhas</span>

      <v-btn color="primary" to="/reviews/new">
        <v-icon start>mdi-pencil-plus</v-icon>
        Nova resenha
      </v-btn>
    </v-card-title>

    <v-divider class="my-4" />

    <div
      v-if="!enrichedReviews.length"
      class="text-medium-emphasis text-center"
    >
      Nenhuma resenha cadastrada.
    </div>

    <div v-else>
      <v-row class="mb-4" dense>
        <v-col cols="12" md="4">
          <v-autocomplete
            v-model="filters.bookId"
            :items="bookOptions"
            item-title="label"
            item-value="id"
            label="Livro"
            prepend-inner-icon="mdi-book"
            density="comfortable"
            variant="outlined"
            hide-details
            clearable
          />
        </v-col>

        <!-- AUTOR -->
        <v-col cols="12" md="4">
          <v-text-field
            v-model="filters.author"
            label="Autor"
            prepend-inner-icon="mdi-account"
            density="comfortable"
            variant="outlined"
            hide-details
          />
        </v-col>

        <!-- USUÁRIO -->
        <v-col cols="12" md="4">
          <v-text-field
            v-model="filters.user"
            label="Usuário"
            prepend-inner-icon="mdi-account-circle"
            density="comfortable"
            variant="outlined"
            hide-details
          />
        </v-col>

        <!-- AVALIAÇÃO -->
        <v-col cols="12" md="4">
          <v-select
            v-model="filters.rating"
            :items="ratingOptions"
            label="Avaliação"
            prepend-inner-icon="mdi-star"
            density="comfortable"
            variant="outlined"
            hide-details
            clearable
          />
        </v-col>
      </v-row>

      <!-- LISTA DE RESENHAS FILTRADAS -->
      <div
        v-if="!filteredReviews.length"
        class="text-medium-emphasis text-center py-6"
      >
        Nenhuma resenha encontrada com os filtros informados.
      </div>

      <v-list v-else class="py-0">
        <v-list-item
          v-for="review in filteredReviews"
          :key="review.id"
          class="mb-2 rounded-lg review-item"
        >
          <v-list-item-title
            class="d-flex align-center justify-space-between"
          >
            <div>
              <span class="font-weight-medium">
                {{ review.displayTitle }}
              </span>
              <span
                v-if="review.displayAuthor"
                class="text-medium-emphasis ml-2"
              >
                — {{ review.displayAuthor }}
              </span>
            </div>

            <div class="d-flex align-center">
              <v-rating
                :model-value="review.rating"
                density="compact"
                size="small"
                readonly
                color="amber"
              />
              <span class="text-caption ml-1">
                {{ Number(review.rating).toFixed(1) }}
              </span>
            </div>
          </v-list-item-title>

          <v-list-item-subtitle class="mt-1">
            <div class="d-flex flex-wrap align-center">
              <!-- <v-chip
                size="x-small"
                class="mr-2 mb-1"
                color="primary"
                variant="tonal"
              >
                <v-icon start size="14">mdi-account</v-icon>
                {{ review.userName || 'Usuário não informado' }}
              </v-chip> -->

              <span class="text-caption text-medium-emphasis mb-1">
                Criada em
                {{
                  new Date(
                    review.createdAt || review.date || Date.now()
                  ).toLocaleDateString('pt-BR')
                }}
              </span>
            </div>

            <div class="mt-2 text-body-2">
              {{ review.comment || 'Sem texto de resenha.' }}
            </div>
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </div>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useReviewsStore } from '../stores/reviews'
import { useBooksStore } from '../stores/books'

const reviewsStore = useReviewsStore()
const booksStore = useBooksStore()

const bookOptions = computed(() =>
  (booksStore.books || []).map((b) => ({
    id: b.id,
    label: b.author ? `${b.title} — ${b.author}` : b.title,
    title: b.title,
    author: b.author || '',
  }))
)

const booksMap = computed(() => {
  const map = new Map()
  ;(booksStore.books || []).forEach((b) => {
    map.set(b.id, b)
  })
  return map
})

const enrichedReviews = computed(() => {
  const base = reviewsStore.reviews || []
  const map = booksMap.value

  return base.map((rev) => {
    const book = rev.book_id ? map.get(rev.book_id) : null
    return {
      ...rev,
      bookId: rev.book_id,
      displayTitle: book?.title || rev.title || 'Livro não encontrado',
      displayAuthor: book?.author || '',
      comment: rev.body || '',
      createdAt: rev.created_at,
      userName: rev.user_name || 'Usuário não informado',
    }
  })
})

const filters = ref({
  bookId: null,
  author: '',
  user: '',
  rating: null,
})

const ratingOptions = [
  { title: '1 ★', value: 1 },
  { title: '2 ★', value: 2 },
  { title: '3 ★', value: 3 },
  { title: '4 ★', value: 4 },
  { title: '5 ★', value: 5 },
]

const filteredReviews = computed(() => {
  const f = filters.value

  return enrichedReviews.value.filter((rev) => {
    let ok = true

    if (f.bookId) {
      ok = ok && Number(rev.bookId) === Number(f.bookId)
    }

    if (f.author) {
      ok =
        ok &&
        (rev.displayAuthor || '')
          .toLowerCase()
          .includes(f.author.toLowerCase())
    }

    if (f.user) {
      ok =
        ok &&
        (rev.userName || '')
          .toLowerCase()
          .includes(f.user.toLowerCase())
    }

    if (f.rating) {
      ok = ok && Number(rev.rating) === Number(f.rating)
    }

    return ok
  })
})

onMounted(async () => {
  await booksStore.fetchBooks()
  await reviewsStore.fetchAllReviews()
})
</script>

<style scoped>
.rounded-xxl {
  border-radius: 20px;
}

.review-item {
  background-color: rgb(var(--v-theme-surface));
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.review-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}
</style>
