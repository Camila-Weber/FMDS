import { supabase } from "../db/db.js";
// NÃO TESTE nada além das rotas GET, as outras estão incompletas e podem causar erros.

/**
 * Criar um novo livro
 */
export const createBook = async (req, res) => {
  const {
    title,
    author,
    available = true,
    rating = 0
  } = req.body;

  // exempo - genres: Array [ 4, 6 ]
  const genres = req.body.genres || [];
  
  if (!title || !author || genres.length === 0) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes: title, author e genres são necessários." });
  }

  try {
  // Chama a função que faz a transação no DB
    const { data, error } = await supabase.rpc('insert_book_genres', {
      _title: title,
      _author: author,
      _available: available,
      _avg_rating: rating,
      _genre_ids: genres
    });

    if (error) {
      console.error('Erro ao inserir via RPC:', error);
      throw error;
    }

    res.status(201).json({ success: true, data: data[0] });
  } catch (error) {
    console.error("Erro ao criar livro:", error);
    res.status(500).json({ error: "Erro ao criar livro" });
  }
};

/**
 * Listar todos os livros
 */
export const getBooks = async (req, res) => {
  try {
    const { data: books, error } = await supabase
      .from("books")
      .select(`
        *,
        book_genres (
          genres ( id, name )
        )
      `);

    if (error) throw error;

    // Mapear os gêneros para cada livro
    books.forEach((book) => {
      book.genres = book.book_genres?.map((bg) => bg.genres?.name) || [];
      delete book.book_genres;  // remove o objeto intermediário
    });

    res.status(200).json({ success: true, data: books });
  } catch (error) {
    console.error("Erro ao obter livros:", error);
    res.status(500).json({ error: "Erro ao obter livros" });
  }
};

/**
 * Obter livro por ID
 */
export const getBookById = async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from("books")
      .select(`
        *,
        book_genres (
          genres ( id, name )
        )
      `)
      .eq("id", id) // Precisa ser exatamente igual ao ID fornecido
      .single();

    if (error) {
      return res.status(404).json({ error: "Livro não encontrado" });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Erro ao obter livro:", error);
    res.status(500).json({ error: "Erro ao obter livro" });
  }
};

/**
 * Atualizar livro por ID
 */
export const updateBook = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    author,
    synopsis,
    published_year,
    isbn,
    pages,
    cover_url,
    available
  } = req.body;

  if (!title && !author && !synopsis && !published_year && !isbn && !pages && !cover_url && available === undefined) {
    return res.status(400).json({ error: "Nenhum campo para atualizar." });
  }

  try {
    const { data, error } = await supabase
      .from("books")
      .update({
        title,
        author,
        synopsis,
        published_year,
        isbn,
        pages,
        cover_url,
        available
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(404).json({ error: "Livro não encontrado" });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Erro ao atualizar livro:", error);
    res.status(500).json({ error: "Erro ao atualizar livro" });
  }
};

/**
 * Deletar livro por ID
 */
export const deleteBook = async (req, res) => {
  const { id } = req.params;

  try {
    const { error } = await supabase
      .from("books")
      .delete()
      .eq("id", id);

    if (error) {
      return res.status(404).json({ error: "Livro não encontrado" });
    }

    res.status(200).json({ success: true, message: "Livro deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar livro:", error);
    res.status(500).json({ error: "Erro ao deletar livro" });
  }
};
