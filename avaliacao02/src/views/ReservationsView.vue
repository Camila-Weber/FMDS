<template>
  <v-row>
    <v-col cols="12" md="5">
      <v-card class="mb-4">
        <v-card-title>
          <v-icon class="mr-2">event</v-icon>
          Nova reserva
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="createReservation">
            <v-select
              v-model="reservation.bookId"
              :items="availableBooks"
              item-title="title"
              item-value="id"
              label="Livro"
              required
            />
            <v-text-field
              v-model="reservation.userName"
              label="Nome do usuário"
              prepend-inner-icon="person"
              required
            />
            <v-text-field
              v-model="reservation.days"
              type="number"
              label="Dias de empréstimo"
              prepend-inner-icon="schedule"
              required
            />

            <v-btn color="primary" class="mt-3" type="submit">
              <v-icon start>event_available</v-icon>
              Reservar
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-col>

    <v-col cols="12" md="7">
      <v-card>
        <v-card-title>
          Reservas & devoluções
        </v-card-title>
        <v-data-table :headers="headers" :items="reservations">
          <template #item.status="{ item }">
            <v-chip :color="item.isLate ? 'error' : 'success'" size="small">
              {{ item.isLate ? 'Atrasado' : 'Dentro do prazo' }}
            </v-chip>
          </template>
          <template #item.daysLeft="{ item }">
            <span :class="item.isLate ? 'text-error' : ''">
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
              <v-icon start>assignment_turned_in</v-icon>
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
