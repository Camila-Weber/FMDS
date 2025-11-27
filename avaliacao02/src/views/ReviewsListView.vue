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

    <div v-if="!reviews.length" class="text-medium-emphasis text-center">
      Nenhuma resenha cadastrada.
    </div>

    <v-list v-else>
      <v-list-item
        v-for="review in reviews"
        :key="review.id"
      >
        <v-list-item-title>{{ review.bookTitle }}</v-list-item-title>
        <v-list-item-subtitle class="text-medium-emphasis">
          Nota: {{ review.rating }} ★
        </v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup>
import { useReviewsStore } from '../stores/reviews'

const reviewsStore = useReviewsStore()
const reviews = reviewsStore.reviews
</script>
