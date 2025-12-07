import { supabase } from '../db/db.js'


export const createReservation = async (req, res) => {
    const { user_id, book_id, days = 7, notes } = req.body

    if (!user_id || !book_id) {
        return res.status(400).json({
            success: false,
            error: 'Campos obrigatórios ausentes: user_id e book_id são necessários.',
        })
    }

    try {
        const now = new Date()
        const due = new Date()
        due.setDate(now.getDate() + Number(days || 7))

        const insertPayload = {
            user_id,
            book_id,
            notes: notes || null,
            status: 'reservado',
            reserved_at: now.toISOString(),
            borrowed_at: now.toISOString(),
            due_date: due.toISOString(),
        }

        const { data, error } = await supabase
            .from('reservations')
            .insert(insertPayload)
            .select()
            .single()

        if (error) {
            console.error('Erro ao inserir reserva:', error)
            return res.status(500).json({ success: false, error: 'Erro ao criar reserva' })
        }

        return res.status(201).json({ success: true, data })
    } catch (error) {
        console.error('Erro ao criar reserva:', error)
        return res.status(500).json({ success: false, error: 'Erro ao criar reserva' })
    }
}

export const getReservations = async (req, res) => {
    const { user_id } = req.query

    if (!user_id) {
        return res.status(400).json({
            success: false,
            error: 'user_id é obrigatório na query string',
        })
    }

    try {
        const { data, error } = await supabase
            .from('reservations')
            .select('*')
            .eq('user_id', user_id)
            .eq('status', 'reservado')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Erro ao obter reservas:', error)
            return res.status(500).json({ success: false, error: 'Erro ao obter reservas' })
        }

        return res.status(200).json({ success: true, data })
    } catch (error) {
        console.error('Erro ao obter reservas:', error)
        return res.status(500).json({ success: false, error: 'Erro ao obter reservas' })
    }
}

export const getReservationById = async (req, res) => {
    const { id } = req.params
    const { user_id } = req.query

    if (!user_id) {
        return res.status(400).json({
            success: false,
            error: 'user_id é obrigatório na query string',
        })
    }

    try {
        const { data, error } = await supabase
            .from('reservations')
            .select('*')
            .eq('id', id)
            .eq('user_id', user_id)
            .single()

        if (error || !data) {
            return res.status(404).json({ success: false, error: 'Reserva não encontrada' })
        }

        return res.status(200).json({ success: true, data })
    } catch (error) {
        console.error('Erro ao obter reserva:', error)
        return res.status(500).json({ success: false, error: 'Erro ao obter reserva' })
    }
}

export const updateReservation = async (req, res) => {
    const { id } = req.params
    const { user_id, status, notes, due_date } = req.body

    if (!user_id) {
        return res.status(400).json({
            success: false,
            error: 'user_id é obrigatório no corpo da requisição',
        })
    }

    if (status === undefined && notes === undefined && due_date === undefined) {
        return res.status(400).json({
            success: false,
            error: 'Nenhum campo para atualizar.',
        })
    }

    const updatePayload = {}
    if (status !== undefined) updatePayload.status = status
    if (notes !== undefined) updatePayload.notes = notes
    if (due_date !== undefined) updatePayload.due_date = due_date

    try {
        const { data, error } = await supabase
            .from('reservations')
            .update(updatePayload)
            .eq('id', id)
            .eq('user_id', user_id)
            .select()
            .single()

        if (error || !data) {
            return res.status(404).json({ success: false, error: 'Reserva não encontrada' })
        }

        return res.status(200).json({ success: true, data })
    } catch (error) {
        console.error('Erro ao atualizar reserva:', error)
        return res.status(500).json({ success: false, error: 'Erro ao atualizar reserva' })
    }
}

export const returnReservation = async (req, res) => {
    const { id } = req.params
    const { user_id } = req.body

    if (!user_id) {
        return res.status(400).json({
            success: false,
            error: 'user_id é obrigatório no corpo da requisição',
        })
    }

    try {
        const now = new Date().toISOString()

        const { data, error } = await supabase
            .from('reservations')
            .update({
                status: 'devolvido',
                returned_at: now,
            })
            .eq('id', id)
            .eq('user_id', user_id)
            .select()
            .single()

        if (error || !data) {
            return res.status(404).json({ success: false, error: 'Reserva não encontrada' })
        }

        return res.status(200).json({ success: true, data })
    } catch (error) {
        console.error('Erro ao marcar reserva como devolvida:', error)
        return res.status(500).json({
            success: false,
            error: 'Erro ao marcar reserva como devolvida',
        })
    }
}

