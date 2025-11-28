import { defineStore } from 'pinia'

export const useBooksStore = defineStore('books', {
  state: () => ({
    books: [
      {
        id: 1,
        title: 'Dom Casmurro',
        author: 'Machado de Assis',
        available: true,
        genres: ['Romance', 'Clássico'],
        rating: 4.5,
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        title: 'Grande Sertão: Veredas',
        author: 'Guimarães Rosa',
        available: false,
        genres: ['Romance', 'Ficção histórica'],
        rating: 4.8,
        createdAt: new Date().toISOString(),
      },
    ],
    loading: false,
  }),

  getters: {
    availableBooks(state) {
      return state.books.filter((b) => b.available)
    },
  },

  actions: {
    async fetchBooks() {
      this.loading = true
      try {
        // Exemplo para futuro backend:
        // const { data } = await api.get('/books')
        // this.books = data
      } catch (e) {
        console.error('Erro ao buscar livros', e)
      } finally {
        this.loading = false
      }
    },

    async createBook(payload) {
      const newId = this.books.length
        ? Math.max(...this.books.map((b) => b.id)) + 1
        : 1

      this.books.push({
        id: newId,
        ...payload,
        available: payload.available ?? true,
        rating: Number(payload.rating ?? 0),
        createdAt: new Date().toISOString(),
      })
    },

    async updateBook(id, payload) {
      const index = this.books.findIndex((b) => b.id === id)
      if (index !== -1) {
        this.books[index] = {
          ...this.books[index],
          ...payload,
        }
      }
    },

    async deleteBook(id) {
      this.books = this.books.filter((b) => b.id !== id)
    },
  },
})
