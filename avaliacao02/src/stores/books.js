import { defineStore } from 'pinia'

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
        const res = await fetch(GENRES_URL, { method: 'GET' })
        const data = await res.json()
        return data
      } catch (e) {
        console.error('Erro ao buscar gêneros', e)
        throw e
      } finally {
        this.loading = false
      }
    },

    async fetchBooks() {
      this.loading = true
      try {
        const res = await fetch(BOOKS_URL, { method: 'GET' })
        const data = await res.json()
        this.books = data.data
      } catch (e) {
        console.error('Erro ao buscar livros', e)
      } finally {
        this.loading = false
      }
    },

    async createBook(payload) {
      const genreIds = (payload.genres || []).map(g =>
        g && typeof g === 'object' ? g.id : g
      )

      const bodyToApi = {
        ...payload,
        genres: genreIds, // API recebe apenas ids
      }

      try {
        const res = await fetch(BOOKS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyToApi),
        })
        const data = await res.json()

        if (data.success) {
          this.books.push(data.data)
          return { ok: true, book: data.data }
        } else {
          console.error('Erro ao criar livro', data.error)
          return { ok: false, error: data.error || 'Erro ao criar livro' }
        }
      } catch (e) {
        console.error('Erro ao criar livro', e)
        return { ok: false, error: e.message || 'Erro ao criar livro' }
      }
    },

    async updateBook(id, payload) {
      const genreIds = (payload.genres || []).map(g =>
        g && typeof g === 'object' ? g.id : g
      )

      const bodyToApi = {
        ...payload,
        genres: genreIds,
      }

      try {
        const res = await fetch(`${BOOKS_URL}/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyToApi),
        })

        const data = await res.json()

        if (data.success) {
          const index = this.books.findIndex((b) => b.id === id)
          if (index !== -1) this.books[index] = data.data
          return { ok: true, book: data.data }
        } else {
          console.error('Erro ao atualizar livro', data.error)
          return { ok: false, error: data.error || 'Erro ao atualizar livro' }
        }
      } catch (e) {
        console.error('Erro ao atualizar livro', e)
        return { ok: false, error: e.message || 'Erro ao atualizar livro' }
      }
    },

    async deleteBook(id) {
      try {
        const res = await fetch(`${BOOKS_URL}/${id}`, { method: 'DELETE' })
        const data = await res.json()
        if (data.success) {
          this.books = this.books.filter((b) => b.id !== id)
          return { ok: true }
        } else {
          console.error('Erro ao deletar livro', data.error)
          return { ok: false, error: data.error || 'Erro ao deletar livro' }
        }
      } catch (e) {
        console.error('Erro ao deletar livro', e)
        return { ok: false, error: e.message || 'Erro ao deletar livro' }
      }
    },
  },
})
