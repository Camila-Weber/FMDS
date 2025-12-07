import { defineStore } from 'pinia'

// Cadastrar uma variável em .env para a URL da API
// VITE_API_BASE_URL=https://localhost:3001
if (!import.meta.env.VITE_API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL não está definida nas variáveis de ambiente')
}

const API_URL = import.meta.env.VITE_API_BASE_URL
const BOOKS_URL = `${API_URL}/books`
const GENRES_URL = `${API_URL}/genres`

export const useBooksStore = defineStore('books', {
  state: () => ({
    books: [],
    loading: false,
    _fetchController: null,
  }),

  getters: {
    availableBooks(state) {
      return state.books.filter((b) => b.available)
    },
  },

  actions: {
    async fetchGenres() {
      this.loading = true
      try {
        const res = await fetch(GENRES_URL,
          { method: 'GET' }
        )
        const data = await res.json()
        return data
      } catch (e) {
        console.error('Erro ao buscar gêneros', e)

      } finally {
        this.loading = false
      }
    },


    async fetchBooks() {
      this.loading = true
      try {
        const res = await fetch(BOOKS_URL,
          { method: 'GET' }
        )
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
        const res = await fetch(BOOKS_URL, {
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
        const res = await fetch(`${BOOKS_URL}/${id}`, {
          method: 'PATCH',
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
        const res = await fetch(`${BOOKS_URL}/${id}`, { method: 'DELETE' })
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
