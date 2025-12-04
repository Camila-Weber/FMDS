import { defineStore } from 'pinia'

const BASE_URL = 'http://localhost:3001/books'

export const useBooksStore = defineStore('books', {
  state: () => ({
    books: [],
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
        const res = await fetch(BASE_URL)
        const data = await res.json()
        this.books = data.data
      } catch (e) {
        console.error('Erro ao buscar livros', e)
      } finally {
        this.loading = false
      }
    },

    async createBook(payload) {
      try {
        const res = await fetch(BASE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (data.success) {
          this.books.push(data.data) // adiciona o livro retornado pela API
        } else {
          console.error('Erro ao criar livro', data.error)
        }
      } catch (e) {
        console.error('Erro ao criar livro', e)
      }
    },


    async updateBook(id, payload) {
      try {
        const res = await fetch(`${BASE_URL}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (data.success) {
          const index = this.books.findIndex((b) => b.id === id)
          if (index !== -1) this.books[index] = data.data
        } else {
          console.error('Erro ao atualizar livro', data.error)
        }
      } catch (e) {
        console.error('Erro ao atualizar livro', e)
      }
    },

    async deleteBook(id) {
      try {
        const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' })
        const data = await res.json()
        if (data.success) {
          this.books = this.books.filter((b) => b.id !== id)
        } else {
          console.error('Erro ao deletar livro', data.error)
        }
      } catch (e) {
        console.error('Erro ao deletar livro', e)
      }
    },
  },
})
