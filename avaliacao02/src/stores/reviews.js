import { defineStore } from 'pinia'

export const useReviewsStore = defineStore('reviews', {
  state: () => ({
    reviews: [],
  }),

  actions: {
    async addReview(payload) {
      const newId = this.reviews.length
        ? Math.max(...this.reviews.map((r) => r.id)) + 1
        : 1

      this.reviews.push({
        id: newId,
        ...payload,
      })
    },

    async updateReview(id, payload) {
      const index = this.reviews.findIndex((r) => r.id === id)
      if (index !== -1) {
        this.reviews[index] = {
          ...this.reviews[index],
          ...payload,
        }
      }
    },

    async deleteReview(id) {
      this.reviews = this.reviews.filter((r) => r.id !== id)
    },
  },
})