<template>
  <v-row class="gy-6">
    <!-- Card de nova reserva -->
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
                  required
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

    <!-- Card de listagem de reservas -->
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
  </v-row>
</template>


<script setup>
import { computed, reactive, ref } from 'vue'
import { useBooksStore } from '../stores/books'

const booksStore = useBooksStore()

const reservation = reactive({
  bookId: null,
  userName: '',
  days: 7,
})

const reservations = ref([])

const headers = [
  { title: 'Usuário', value: 'userName' },
  { title: 'Livro', value: 'bookTitle' },
  { title: 'Devolução em', value: 'dueDate' },
  { title: 'Dias restantes', value: 'daysLeft' },
  { title: 'Status', value: 'status' },
  { title: 'Ações', value: 'actions', sortable: false },
]

const availableBooks = computed(() => booksStore.availableBooks)

const createReservation = () => {
  const book = booksStore.books.find(
    (b) => b.id === reservation.bookId
  )
  if (!book) return

  const id = reservations.value.length
    ? Math.max(...reservations.value.map((r) => r.id)) + 1
    : 1

  const today = new Date()
  const dueDate = new Date()
  dueDate.setDate(today.getDate() + Number(reservation.days))

  reservations.value.push({
    id,
    userName: reservation.userName,
    bookId: book.id,
    bookTitle: book.title,
    createdAt: today.toISOString(),
    dueDate: dueDate.toISOString(),
  })

  booksStore.updateBook(book.id, { available: false })

  reservation.bookId = null
  reservation.userName = ''
  reservation.days = 7

  updateReservationStatus()
}

const updateReservationStatus = () => {
  const now = new Date()
  reservations.value = reservations.value.map((res) => {
    const due = new Date(res.dueDate)
    const diffMs = due - now
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    return {
      ...res,
      daysLeft: diffDays,
      isLate: diffDays < 0,
    }
  })
}

const returnBook = (id) => {
  const res = reservations.value.find((r) => r.id === id)
  if (!res) return

  booksStore.updateBook(res.bookId, { available: true })
  reservations.value = reservations.value.filter((r) => r.id !== id)
}

updateReservationStatus()
setInterval(updateReservationStatus, 60_000)
</script>
