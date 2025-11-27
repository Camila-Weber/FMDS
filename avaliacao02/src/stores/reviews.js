import { defineStore } from 'pinia'

export const useReviewsStore = defineStore('reviews', {
  state: () => ({
    reviews: [],
  }),

  actions: {
    addReview(review) {
      this.reviews.push({
        id: Date.now(),
        ...review,
      })
    },
  },
})
