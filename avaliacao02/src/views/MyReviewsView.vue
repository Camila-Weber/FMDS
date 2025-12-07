<template>
  <v-card class="rounded-xxl pa-4">
    <v-card-title class="d-flex justify-space-between align-center">
      <span class="text-h5">Minhas resenhas</span>

      <v-btn color="primary" to="/reviews/new">
        <v-icon start>mdi-pencil-plus</v-icon>
        Nova resenha
      </v-btn>
    </v-card-title>

    <v-divider class="my-4" />

    <div v-if="!myReviews.length" class="text-medium-emphasis text-center py-6">
      Você ainda não cadastrou nenhuma resenha.
    </div>

    <div v-else>
      <!-- FILTROS AVANÇADOS -->
      <v-row class="mb-4" dense>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="filters.book"
            label="Livro"
            prepend-inner-icon="mdi-book"
            density="comfortable"
            variant="outlined"
            hide-details
          />
        </v-col>

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

      <div v-if="!filteredMyReviews.length" class="text-medium-emphasis text-center py-6">
        Nenhuma resenha encontrada com os filtros informados.
      </div>

      <v-list v-else class="py-0">
        <v-list-item
          v-for="review in filteredMyReviews"
          :key="review.id"
          class="mb-2 rounded-lg review-item"
        >
          <v-list-item-title class="d-flex align-center justify-space-between">
            <div>
              <span class="font-weight-medium">
                {{ review.bookTitle }}
              </span>
              <span v-if="review.bookAuthor" class="text-medium-emphasis ml-2">
                — {{ review.bookAuthor }}
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
            <div class="d-flex flex-wrap align-center mb-1">
              <v-chip
                size="x-small"
                class="mr-2 mb-1"
                :color="review.isPublic ? 'success' : 'grey'"
                variant="tonal"
              >
                <v-icon start size="14">
                  {{ review.isPublic ? 'mdi-eye-outline' : 'mdi-eye-off-outline' }}
                </v-icon>
                {{ review.isPublic ? 'Pública' : 'Privada' }}
              </v-chip>

              <span class="text-caption text-medium-emphasis mb-1">
                Criada em
                {{
                  new Date(
                    review.createdAt || review.date || Date.now()
                  ).toLocaleDateString('pt-BR')
                }}
              </span>
            </div>

            <div class="mt-1 text-body-2">
              {{ review.comment || 'Sem texto de resenha.' }}
            </div>
          </v-list-item-subtitle>

          <template #append>
            <v-btn
              icon
              variant="text"
              size="small"
              :to="`/reviews/${review.id}/edit`"
            >
              <v-icon>mdi-pencil-outline</v-icon>
            </v-btn>

            <v-btn
              icon
              variant="text"
              size="small"
              color="error"
              @click="openDeleteDialog(review)"
            >
              <v-icon>mdi-delete-outline</v-icon>
            </v-btn>
          </template>
        </v-list-item>
      </v-list>
    </div>

    <!-- DIÁLOGO DE EXCLUSÃO -->
    <v-dialog v-model="confirmDialog" max-width="420">
      <v-card class="pa-4">
        <v-card-title class="text-h6">
          Excluir resenha
        </v-card-title>
        <v-card-text>
          Tem certeza que deseja excluir a resenha de
          <strong>{{ reviewToDelete?.bookTitle }}</strong>?
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
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useReviewsStore } from '../stores/reviews'
import { useAuthStore } from '../stores/auth'
import { useBooksStore } from '../stores/books'

const reviewsStore = useReviewsStore()
const authStore = useAuthStore()
const booksStore = useBooksStore()

const booksMap = computed(() => {
  const map = new Map()
  ;(booksStore.books || []).forEach((b) => map.set(b.id, b))
  return map
})

const myRaw = computed(() => reviewsStore.myReviews || [])

const myReviews = computed(() => {
  const map = booksMap.value
  return myRaw.value.map((rev) => {
    const book = rev.book_id ? map.get(rev.book_id) : null
    return {
      ...rev,
      bookTitle: book?.title || rev.title || 'Livro não encontrado',
      bookAuthor: book?.author || '',
      comment: rev.body || '',
      isPublic: rev.is_public,
      createdAt: rev.created_at,
    }
  })
})

const filters = ref({
  book: '',
  author: '',
  rating: null,
})

const ratingOptions = [
  { title: '1 ★', value: 1 },
  { title: '2 ★', value: 2 },
  { title: '3 ★', value: 3 },
  { title: '4 ★', value: 4 },
  { title: '5 ★', value: 5 },
];

const filteredMyReviews = computed(() => {
  const { book, author, rating } = filters.value

  return myReviews.value.filter((rev) => {
    let ok = true

    if (book) {
      ok =
        ok &&
        (rev.bookTitle || '')
          .toLowerCase()
          .includes(book.toLowerCase())
    }

    if (author) {
      ok =
        ok &&
        (rev.bookAuthor || '')
          .toLowerCase()
          .includes(author.toLowerCase())
    }

    if (rating) {
      ok = ok && Number(rev.rating) === Number(rating)
    }

    return ok
  })
})

const confirmDialog = ref(false)
const reviewToDelete = ref(null)

const openDeleteDialog = (review) => {
  reviewToDelete.value = review
  confirmDialog.value = true
}

const cancelDelete = () => {
  confirmDialog.value = false
  reviewToDelete.value = null
}

const confirmDelete = async () => {
  if (!reviewToDelete.value) return
  await reviewsStore.deleteReview(reviewToDelete.value.id)
  await booksStore.fetchBooks()
  cancelDelete()
}

onMounted(async () => {
  const uid = authStore.user?.uid || authStore.user?.id
  if (!uid) return
  await booksStore.fetchBooks()
  await reviewsStore.fetchMyReviews(uid)  
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
