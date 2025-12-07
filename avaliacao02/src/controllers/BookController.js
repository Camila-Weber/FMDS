import { supabase } from "../db/db.js";

/**
 * Criar um novo livro
 */
export const createBook = async (req, res) => {
  const {
    title,
    author,
    genres,   // espera array de IDs: [4, 6]
  } = req.body;

  console.log('Criando livro com dados:', { title, author, genres });

  const available = true; // valor padrão
  const rating = 0; // valor padrão
  
  if (!title || !author || genres.length === 0) {
    return res.status(400).json({ success: false, error: "Campos obrigatórios ausentes: title, author e genres são necessários." });
  }

  try {
    // Chama a RPC que insere o livro e suas associações de gênero de forma atômica
    const { data, error } = await supabase.rpc('insert_book_genres', {
      _title: title,
      _author: author,
      _available: available,
      _avg_rating: rating,
      _genre_ids: genres
    });

    if (error) {
      console.error('Erro ao inserir via RPC:', error);
      return res.status(500).json({ success: false, error: 'Erro ao criar livro' });
    }

    if (!data) {
      console.error('RPC retornou sem dados:', data);
      return res.status(500).json({ success: false, error: 'RPC não retornou o livro criado' });
    }

    res.status(201).json({ success: true, data: data });
  } catch (error) {
    console.error("Erro ao criar livro:", error);
    res.status(500).json({ success: false, error: "Erro ao criar livro" });
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
        genres:book_genres (
          genres ( id, name )
        )
      `)
      .order("id", { ascending: true });

    if (error) throw error;
    
    // Flatten genres (cada book.genres é um array de { genres: { id, name } })
    const booksTransformed = books.map(book => {
      const genresFlat = (book.genres || []).map(rel => rel.genres);
      return { ...book, genres: genresFlat };
    });
    

    res.status(200).json({ success: true, data: booksTransformed });
  } catch (error) {
    console.error("Erro ao obter livros:", error);
    res.status(500).json({ success: false, error: "Erro ao obter livros" });
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
      return res.status(404).json({ success: false, error: "Livro não encontrado" });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Erro ao obter livro:", error);
    res.status(500).json({ success: false, error: "Erro ao obter livro" });
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
    genres,   // espera array de IDs: [4, 6]
  } = req.body;

  const bookId = Number(id); // garante que é número

  if (!title || !author) {
    return res.status(400).json({ success: false, error: "Campos obrigatórios ausentes: title e author são necessários." });
  }
  
  const genresArray = Array.isArray(genres) ? genres : null;
  if (genresArray === null || genresArray === 0) {
    return res.status(400).json({ success: false, error: "Campo 'genres' é obrigatório." });
  }

  try {
    // Chama a RPC que atualiza o livro e suas associações de gênero de forma atômica
    const { data, error } = await supabase.rpc('update_book_genres', {
      _book_id: bookId,
      _title: title,
      _author: author,
      _genre_ids: genresArray
    });


    if (error) {
      console.error('Erro ao atualizar via RPC:', error);
      return res.status(500).json({ success: false, error: 'Erro ao atualizar livro' });
    }

    if (!data) {
      return res.status(404).json({ success: false, error: 'Livro não encontrado ou RPC não retornou dados.' });
    }

    res.status(200).json({ success: true, data: data });
  } catch (error) {
    console.error("Erro ao atualizar livro:", error);
    res.status(500).json({ success: false, error: "Erro ao atualizar livro" });
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
      return res.status(404).json({ success: false, error: "Livro não encontrado" });
    }

    res.status(200).json({ success: true, message: "Livro deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar livro:", error);
    res.status(500).json({ success: false, error: "Erro ao deletar livro" });
  }
};
