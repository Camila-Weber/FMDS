import { supabase } from '../db/db.js'

const recomputeBookRating = async (bookId) => {
  const id = Number(bookId)

  if (!id) {
    console.warn('recomputeBookRating: bookId inválido:', bookId)
    return
  }

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('book_id', id)

  if (error) {
    console.error('Erro ao buscar resenhas para recalcular média:', error)
    return
  }

  if (!reviews || reviews.length === 0) {
    const { error: updateError } = await supabase
      .from('books')
      .update({ avg_rating: 0 })
      .eq('id', id)

    if (updateError) {
      console.error('Erro ao zerar avg_rating do livro:', updateError)
    } else {
      console.log('avg_rating do livro', id, 'zerado com sucesso')
    }

    return
  }

  const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0)
  const avg = sum / reviews.length

  const { error: updateError } = await supabase
    .from('books')
    .update({ avg_rating: avg })
    .eq('id', id)

  if (updateError) {
    console.error('Erro ao atualizar avg_rating do livro:', updateError)
  } else {
    console.log('avg_rating do livro', id, 'atualizado para', avg)
  }
}

export const createReview = async (req, res) => {
  const {
    book_id,
    rating,
    comment,
    is_public = true,
    user_id,
    title,
  } = req.body

  if (!book_id || !rating || !user_id) {
    return res.status(400).json({
      success: false,
      error: 'Campos obrigatórios: book_id, rating e user_id.',
    })
  }

  try {
    const insertPayload = {
      book_id,
      rating,
      title: title || 'Resenha',
      body: comment || '',
      is_public,
      user_id,
      // se tiver coluna user_name na tabela, pode usar:
      // user_name: req.body.user_name,
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert(insertPayload)
      .select()
      .single()

    if (error) {
      console.error('Erro ao inserir resenha:', error)
      return res
        .status(500)
        .json({ success: false, error: 'Erro ao criar resenha' })
    }

    // 🔁 após criar, recalcula média do livro
    await recomputeBookRating(book_id)

    return res.status(201).json({ success: true, data })
  } catch (error) {
    console.error('Erro ao criar resenha:', error)
    return res
      .status(500)
      .json({ success: false, error: 'Erro ao criar resenha' })
  }
}

export const getReviews = async (req, res) => {
    const { user_id } = req.query

    try {
        let query = supabase
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false })

        if (user_id) {
            query = query.eq('user_id', user_id)
        } else {
            query = query.eq('is_public', true)
        }

        const { data, error } = await query

        if (error) {
            console.error('Erro ao obter resenhas:', error)
            return res
                .status(500)
                .json({ success: false, error: 'Erro ao obter resenhas' })
        }

        return res.status(200).json({ success: true, data })
    } catch (error) {
        console.error('Erro ao obter resenhas:', error)
        return res
            .status(500)
            .json({ success: false, error: 'Erro ao obter resenhas' })
    }
}

export const updateReview = async (req, res) => {
    const { id } = req.params
    const { rating, comment, is_public, title } = req.body

    if (
        rating === undefined &&
        comment === undefined &&
        is_public === undefined &&
        title === undefined
    ) {
        return res.status(400).json({
            success: false,
            error: 'Nenhum campo para atualizar.',
        })
    }

    const updatePayload = {}
    if (rating !== undefined) updatePayload.rating = rating
    if (comment !== undefined) updatePayload.body = comment
    if (is_public !== undefined) updatePayload.is_public = is_public
    if (title !== undefined) updatePayload.title = title

    try {
        const { data, error } = await supabase
            .from('reviews')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .single()

        if (error || !data) {
            return res
                .status(404)
                .json({ success: false, error: 'Resenha não encontrada' })
        }

        if (data.book_id) {
            await recomputeBookRating(data.book_id)
        }

        return res.status(200).json({ success: true, data })
    } catch (error) {
        console.error('Erro ao atualizar resenha:', error)
        return res
            .status(500)
            .json({ success: false, error: 'Erro ao atualizar resenha' })
    }
}

export const deleteReview = async (req, res) => {
    const { id } = req.params

    try {
        const { data: review, error: fetchError } = await supabase
            .from('reviews')
            .select('book_id')
            .eq('id', id)
            .single()

        if (fetchError || !review) {
            return res
                .status(404)
                .json({ success: false, error: 'Resenha não encontrada' })
        }

        const bookId = review.book_id

        const { error: deleteError } = await supabase
            .from('reviews')
            .delete()
            .eq('id', id)

        if (deleteError) {
            console.error('Erro ao deletar resenha:', deleteError)
            return res
                .status(500)
                .json({ success: false, error: 'Erro ao deletar resenha' })
        }

        if (bookId) {
            await recomputeBookRating(bookId)
        }

        return res.status(200).json({ success: true })
    } catch (error) {
        console.error('Erro ao deletar resenha:', error)
        return res
            .status(500)
            .json({ success: false, error: 'Erro ao deletar resenha' })
    }
}

export const getReviewById = async (req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from("reviews")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !data) {
            return res.status(404).json({
                success: false,
                error: "Resenha não encontrada",
            });
        }

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error("Erro ao obter resenha:", error);
        return res.status(500).json({
            success: false,
            error: "Erro ao obter resenha",
        });
    }
};