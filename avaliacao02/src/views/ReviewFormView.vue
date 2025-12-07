<template>
  <v-card class="rounded-xxl pa-4" elevation="3" max-width="700" mx="auto">
    <v-card-title class="text-h5">
      {{ isEdit ? 'Editar resenha' : 'Nova resenha' }}
    </v-card-title>

    <v-divider class="my-3" />

    <v-form ref="formRef" @submit.prevent="save">
      <v-select
        v-model="form.bookId"
        :items="bookOptions"
        item-title="title"
        item-value="id"
        label="Livro *"
        prepend-inner-icon="mdi-book"
        :rules="[rules.required]"
        required
      />

      <div class="mt-4">
        <div class="text-caption mb-1">Avaliação *</div>
        <v-rating
          v-model="form.rating"
          length="5"
          size="32"
          color="amber"
        />
        <span v-if="ratingError" class="text-error text-caption">
          {{ ratingError }}
        </span>
      </div>

      <v-textarea
        class="mt-4"
        v-model="form.text"
        label="Escreva sua resenha *"
        auto-grow
        prepend-inner-icon="mdi-pencil"
        :rules="[rules.required]"
        required
      />

      <div class="switch-container">
        <div class="switch-text">
          <div class="text-body-2 font-weight-medium">
            Visibilidade da resenha
          </div>
          <div class="text-caption text-medium-emphasis">
            {{
              form.isPublic
                ? 'Outros usuários poderão ver esta resenha.'
                : 'Somente você verá esta resenha.'
            }}
          </div>
        </div>

        <v-switch
          v-model="form.isPublic"
          inset
          class="custom-switch"
          hide-details
          density="comfortable"
          :label="form.isPublic ? 'Pública' : 'Privada'"
        >
          <template #thumb>
            <v-icon size="18" color="white">
              {{ form.isPublic ? 'mdi-earth' : 'mdi-lock' }}
            </v-icon>
          </template>

          <template #track>
            <div class="switch-border"></div>
            <div :class="form.isPublic ? 'track-public' : 'track-private'"></div>
          </template>
        </v-switch>
      </div>

      <v-btn block type="submit" color="primary" class="mt-4">
        {{ isEdit ? 'Salvar alterações' : 'Salvar resenha' }}
      </v-btn>
    </v-form>

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      location="bottom right"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBooksStore } from '../stores/books'
import { useReviewsStore } from '../stores/reviews'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()

const booksStore = useBooksStore()
const reviewsStore = useReviewsStore()
const authStore = useAuthStore()

const isEdit = computed(() => !!route.params.id)

const formRef = ref(null)
const ratingError = ref('')

const form = ref({
  bookId: null,
  rating: null,
  text: '',
  isPublic: true,
})

const rules = {
  required: (v) => !!v || 'Campo obrigatório',
}

const snackbar = reactive({
  show: false,
  message: '',
  color: 'success',
})

const showToast = (type, message) => {
  snackbar.color = type === 'error' ? 'error' : 'success'
  snackbar.message = message
  snackbar.show = true
}

const bookOptions = computed(() =>
  (booksStore.books || []).map((b) => ({
    id: b.id,
    title: b.title,
  }))
)

onMounted(async () => {
  await booksStore.fetchBooks()

  if (!isEdit.value) return

  const id = Number(route.params.id)

  const review = await reviewsStore.fetchReviewById(id)

  if (!review) {
    console.warn('Resenha não encontrada')
    showToast('error', 'Resenha não encontrada.')
    return
  }

  form.value.bookId = review.book_id
  form.value.rating = review.rating
  form.value.text = review.body || ''
  form.value.isPublic = review.is_public ?? true
})

const save = async () => {
  const result = await formRef.value.validate()
  const valid = result.valid ?? result

  ratingError.value = ''
  if (!form.value.rating || form.value.rating <= 0) {
    ratingError.value = 'Informe uma avaliação.'
  }

  if (!valid || ratingError.value) return

  const book = booksStore.books.find((b) => b.id === form.value.bookId)
  if (!book) {
    showToast('error', 'Selecione um livro válido.')
    return
  }

  const userId = authStore.user?.uid || authStore.user?.id || null
  const userName =
    authStore.user?.displayName ||
    authStore.user?.name ||
    authStore.user?.email ||
    'Usuário'

  const basePayload = {
    bookId: book.id,
    bookTitle: book.title,
    rating: form.value.rating,
    comment: form.value.text,
    isPublic: form.value.isPublic,
    userId,
    userName,
  }

  let resultAction

  if (isEdit.value) {
    resultAction = await reviewsStore.updateReview(
      Number(route.params.id),
      basePayload
    )

    if (resultAction?.ok) {
      showToast('success', 'Resenha atualizada com sucesso!')
      router.push('/my-reviews')
      await booksStore.fetchBooks()
    } else {
      showToast('error', 'Erro ao atualizar resenha.')
    }
  } else {
    resultAction = await reviewsStore.addReview({
      ...basePayload,
      createdAt: new Date().toISOString(),
    })

    if (resultAction?.ok) {
      showToast('success', 'Resenha criada com sucesso!')
      router.push('/my-reviews')
      await booksStore.fetchBooks()
    } else {
      showToast('error', 'Erro ao criar resenha.')
    }
  }
}
</script>



<style scoped>
.rounded-xxl {
  border-radius: 20px;
}

/* “Cartãozinho” em volta do switch para parecer botão */
.switch-container {
  margin-top: 1.25rem;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-primary), 0.25);
  background-color: rgba(var(--v-theme-surface), 0.98);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease,
    background-color 0.2s ease;
  cursor: pointer;
}

.switch-container:hover {
  border-color: rgba(var(--v-theme-primary), 0.6);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.switch-text {
  flex: 1;
  min-width: 0;
}

.switch-container :deep(.v-selection-control) {
  cursor: pointer;
}

.custom-switch {
  margin: 0;
}

:deep(.custom-switch .v-switch__track) {
  background-color: transparent !important;
  border: none !important;
  height: 26px;
  min-width: 48px;
}

:deep(.custom-switch .v-switch__thumb) {
  width: 22px;
  height: 22px;
  background-color: rgb(var(--v-theme-primary)) !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
  transition: box-shadow 0.2s ease, transform 0.15s ease;
}

:deep(.custom-switch:hover .v-switch__thumb) {
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.45);
}

.switch-border {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  border: 2px solid rgba(var(--v-theme-primary), 0.5);
  pointer-events: none;
}

.track-public {
  background: linear-gradient(
    90deg,
    rgba(var(--v-theme-primary), 0.95),
    rgba(var(--v-theme-accent), 0.85)
  );
  width: 100%;
  height: 100%;
  border-radius: 999px;
}

.track-private {
  background-color: rgba(var(--v-theme-on-surface), 0.16);
  width: 100%;
  height: 100%;
  border-radius: 999px;
}
</style>
