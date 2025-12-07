<template>
  <v-row class="gy-6">
    <v-col cols="12">
      <v-card class="reservation-card rounded-xxl" elevation="3">
        <v-card-title class="d-flex align-center mb-2">
          <v-icon class="mr-2">mdi-calendar-plus</v-icon>
          <span class="text-h6 font-weight-medium">Nova reserva</span>
        </v-card-title>

        <v-divider />

        <v-card-text class="pt-4">
          <v-form @submit.prevent="createReservation">
            <v-row dense>
              <v-col cols="12" md="6">
                <v-select
                  v-model="reservation.bookId"
                  :items="availableBooks"
                  item-title="title"
                  item-value="id"
                  label="Livro"
                  prepend-inner-icon="mdi-book-open-page-variant"
                  variant="outlined"
                  density="comfortable"
                  required
                />
              </v-col>

              <v-col cols="12" md="6">
               <v-text-field
                v-model="reservation.userName"
                label="Nome do usuário"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                density="comfortable"
                readonly  
              />
              </v-col>

              <v-col cols="12" md="4">
                <v-text-field
                  v-model="reservation.days"
                  type="number"
                  label="Dias de empréstimo"
                  prepend-inner-icon="mdi-timer-outline"
                  variant="outlined"
                  density="comfortable"
                  min="1"
                  required
                />
              </v-col>
            </v-row>

            <div class="d-flex justify-end mt-4">
              <v-btn color="primary" type="submit">
                <v-icon start>mdi-calendar-check</v-icon>
                Reservar
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12">
      <v-card class="rounded-xxl" elevation="3">
        <v-card-title class="d-flex align-center justify-space-between">
          <div class="d-flex align-center">
            <v-icon class="mr-2">mdi-calendar-month-outline</v-icon>
            <span class="text-h6 font-weight-medium">Reservas &amp; devoluções</span>
          </div>
        </v-card-title>

        <v-divider />

        <v-data-table
          :headers="headers"
          :items="reservations"
          class="reservation-table"
        >
          <template #item.status="{ item }">
            <v-chip
              :color="item.isLate ? 'error' : 'success'"
              size="small"
              variant="flat"
            >
              {{ item.isLate ? 'Atrasado' : 'Dentro do prazo' }}
            </v-chip>
          </template>

          <template #item.daysLeft="{ item }">
            <span :class="item.isLate ? 'text-error font-weight-medium' : ''">
              {{ item.daysLeft }} dia(s)
            </span>
          </template>

          <template #item.actions="{ item }">
            <v-btn
              size="small"
              color="primary"
              variant="outlined"
              @click="returnBook(item.id)"
            >
              <v-icon start>mdi-archive-arrow-up-outline</v-icon>
              Devolver
            </v-btn>
          </template>
        </v-data-table>
      </v-card>
    </v-col>
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      location="bottom right"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </v-row>
</template>


<script setup>
import { computed, reactive, onMounted, watchEffect } from 'vue'
import { useBooksStore } from '../stores/books'
import { useReservationsStore } from '../stores/reservations'
import { useAuthStore } from '../stores/auth'

const booksStore = useBooksStore()
const reservationsStore = useReservationsStore()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)

const reservation = reactive({
  bookId: null,
  userName: '',
  days: 7,
})

const loggedUserName = computed(() => {
  if (!authStore.user) return ''
  return (
    authStore.user.displayName ||
    authStore.user.name ||
    authStore.user.email ||
    ''
  )
})

watchEffect(() => {
  if (isAuthenticated.value) {
    reservation.userName = loggedUserName.value
  }
})

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

const headers = [
  { title: 'Usuário', value: 'userName' },
  { title: 'Livro', value: 'bookTitle' },
  { title: 'Devolução em', value: 'dueDate' },
  { title: 'Dias restantes', value: 'daysLeft' },
  { title: 'Status', value: 'status' },
  { title: 'Ações', value: 'actions', sortable: false },
]

const availableBooks = computed(() => booksStore.availableBooks)

const reservations = computed(() => {
  const books = booksStore.books
  const base = reservationsStore.decoratedReservations

  return base.map((r) => {
    const book = books.find((b) => b.id === r.book_id)
    return {
      ...r,
      userName: r.notes || '',
      bookTitle: book ? book.title : '',
      dueDate: r.dueDate,
      status: r.status,
    }
  })
})

const createReservation = async () => {
  const book = booksStore.books.find((b) => b.id === reservation.bookId)
  if (!book) {
    showToast('error', 'Selecione um livro válido.')
    return
  }

  if (!isAuthenticated.value || !authStore.user) {
    showToast('error', 'Você precisa estar autenticado para reservar.')
    return
  }

  const userId = authStore.user.uid || authStore.user.id

  const created = await reservationsStore.createReservation({
    bookId: reservation.bookId,
    userId,
    userName: reservation.userName,
    days: reservation.days,
  })

  if (created) {
    await booksStore.updateBook(book.id, { available: false })
    reservation.bookId = null
    reservation.days = 7
    showToast('success', 'Livro reservado com sucesso! ')
  } else {
    showToast('error', 'Não foi possível reservar o livro. ')
  }
}

const returnBook = async (id) => {
  if (!isAuthenticated.value || !authStore.user) {
    showToast('error', 'Você precisa estar autenticado para devolver.')
    return
  }

  const userId = authStore.user.uid || authStore.user.id

  const ok = await reservationsStore.returnReservation(id, userId)

  if (ok) {
    const res = reservationsStore.reservations.find((r) => r.id === id)
    if (res) {
      await booksStore.updateBook(res.book_id, { available: true })
    }
    showToast('success', 'Livro devolvido com sucesso!')
  } else {
    showToast('error', 'Não foi possível devolver o livro.')
  }
}

onMounted(async () => {
  await booksStore.fetchBooks()
  if (authStore.user) {
    const userId = authStore.user.uid || authStore.user.id
    await reservationsStore.fetchReservations(userId)
  }
})
</script>
