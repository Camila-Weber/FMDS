import { defineStore } from 'pinia'

if (!import.meta.env.VITE_API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL não está definida nas variáveis de ambiente')
}

const API_URL = import.meta.env.VITE_API_BASE_URL
const RESERVATIONS_URL = `${API_URL}/reservations`

export const useReservationsStore = defineStore('reservations', {
    state: () => ({
        reservations: [],   
        loading: false,
    }),

    getters: {
        activeReservations(state) {
            return state.reservations.filter(
                (r) => r.status === 'reservado'
            )
        },

        decoratedReservations(state) {
            const now = new Date()

            return state.reservations
                .filter((r) => r.status === 'reservado')  
                .map((r) => {
                    const due = r.due_date ? new Date(r.due_date) : null
                    let daysLeft = null
                    let isLate = false

                    if (due) {
                        const diffMs = due.getTime() - now.getTime()
                        daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
                        isLate = daysLeft < 0
                    }

                    return {
                        ...r,
                        dueDate: r.due_date,
                        daysLeft,
                        isLate,
                    }
                })
        },
    },

    actions: {
        async fetchReservations(userId) {
            this.loading = true
            try {
                const url = userId
                    ? `${RESERVATIONS_URL}?user_id=${encodeURIComponent(userId)}`
                    : RESERVATIONS_URL

                const res = await fetch(url)
                const data = await res.json()
                this.reservations = data.data || []
            } catch (e) {
                console.error('Erro ao buscar reservas', e)
            } finally {
                this.loading = false
            }
        },

        async createReservation(payload) {
            try {
                const res = await fetch(RESERVATIONS_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: payload.userId,   
                        book_id: payload.bookId,
                        days: payload.days,
                        notes: payload.userName,
                    }),
                })

                const data = await res.json()

                if (data.success) {
                    this.reservations.push(data.data)
                    return data.data        
                } else {
                    console.error('Erro ao criar reserva', data.error)
                    return false            
                }
            } catch (e) {
                console.error('Erro ao criar reserva', e)
                return false           
            }
        },

        async returnReservation(id, userId) {
            try {
                const res = await fetch(`${RESERVATIONS_URL}/${id}/return`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: userId }),
                })
                const data = await res.json()

                if (data.success) {
                    const index = this.reservations.findIndex((r) => r.id === id)
                    if (index !== -1) this.reservations[index] = data.data
                    return true 
                } else {
                    console.error('Erro ao devolver livro', data.error)
                    return false 
                }
            } catch (e) {
                console.error('Erro ao devolver livro', e)
                return false 
            }
        },

        async cancelReservation(id) {
            try {
                const res = await fetch(`${RESERVATIONS_URL}/${id}/cancel`, {
                    method: 'PUT',
                })
                const data = await res.json()

                if (data.success) {
                    const index = this.reservations.findIndex((r) => r.id === id)
                    if (index !== -1) this.reservations[index] = data.data
                } else {
                    console.error('Erro ao cancelar reserva', data.error)
                }
            } catch (e) {
                console.error('Erro ao cancelar reserva', e)
            }
        },

        async deleteReservation(id) {
            try {
                const res = await fetch(`${RESERVATIONS_URL}/${id}`, {
                    method: 'DELETE',
                })
                const data = await res.json()

                if (data.success) {
                    this.reservations = this.reservations.filter((r) => r.id !== id)
                } else {
                    console.error('Erro ao deletar reserva', data.error)
                }
            } catch (e) {
                console.error('Erro ao deletar reserva', e)
            }
        },
    },
})
