import { defineStore } from 'pinia'

if (!import.meta.env.VITE_API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL não está definida nas variáveis de ambiente')
}

const API_URL = import.meta.env.VITE_API_BASE_URL
const REVIEWS_URL = `${API_URL}/reviews`

export const useReviewsStore = defineStore('reviews', {
  state: () => ({
    reviews: [],   
    myReviews: [],  
    loading: false,
  }),

  actions: {
    async fetchAllReviews() {
      this.loading = true
      try {
        const res = await fetch(REVIEWS_URL)
        const data = await res.json()
        this.reviews = data.data || []
      } catch (e) {
        console.error('Erro ao buscar resenhas', e)
      } finally {
        this.loading = false
      }
    },

    async fetchMyReviews(userId) {
      if (!userId) return
      this.loading = true
      try {
        const res = await fetch(
          `${REVIEWS_URL}?user_id=${encodeURIComponent(userId)}`
        )
        const data = await res.json()
        this.myReviews = data.data || []
      } catch (e) {
        console.error('Erro ao buscar MINHAS resenhas', e)
      } finally {
        this.loading = false
      }
    },

    async addReview(payload) {
      try {
        const res = await fetch(REVIEWS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            book_id: payload.bookId,
            rating: payload.rating,
            comment: payload.comment,
            is_public: payload.isPublic,
            user_id: payload.userId,
            title: payload.title || payload.bookTitle,
          }),
        })

        const data = await res.json()

        if (data.success) {
          if (data.data.is_public) {
            this.reviews.unshift(data.data)
          }

          if (payload.userId === data.data.user_id) {
            this.myReviews.unshift(data.data)
          }

          return { ok: true, review: data.data }
        } else {
          console.error('Erro ao criar resenha', data.error)
          return { ok: false, error: data.error }
        }
      } catch (e) {
        console.error('Erro ao criar resenha', e)
        return { ok: false, error: e }
      }
    },


    async updateReview(id, payload) {
      try {
        const res = await fetch(`${REVIEWS_URL}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rating: payload.rating,
            comment: payload.comment,
            is_public: payload.isPublic,
            title: payload.title || payload.bookTitle,
          }),
        })

        const data = await res.json()

        if (data.success) {
          if (data.data.is_public) {
            const idx = this.reviews.findIndex((r) => r.id === id)
            if (idx !== -1) {
              this.reviews[idx] = data.data
            } else {
              this.reviews.unshift(data.data)
            }
          } else {
            this.reviews = this.reviews.filter((r) => r.id !== id)
          }

          const idxMy = this.myReviews.findIndex((r) => r.id === id)
          if (idxMy !== -1) {
            this.myReviews[idxMy] = data.data
          }

          return { ok: true }
        }

      } catch (e) {
        console.error('Erro ao atualizar resenha', e)
        return { ok: false, error: e }
      }
    },

    async deleteReview(id) {
      try {
        const res = await fetch(`${REVIEWS_URL}/${id}`, {
          method: 'DELETE',
        })
        const data = await res.json()

        if (data.success) {
          this.reviews = this.reviews.filter((r) => r.id !== id)
          this.myReviews = this.myReviews.filter((r) => r.id !== id)
          return { ok: true }
        } else {
          console.error('Erro ao deletar resenha', data.error)
          return { ok: false, error: data.error }
        }
      } catch (e) {
        console.error('Erro ao deletar resenha', e)
        return { ok: false, error: e }
      }
    },

    async fetchReviewById(id) {
      try {
        const res = await fetch(`${API_URL}/reviews/${id}`)
        const data = await res.json()
        return data.success ? data.data : null
      } catch (e) {
        console.error("Erro buscando resenha", e)
        return null
      }
    }

  },
})
