import { supabase } from "../db/db.js";

/**
 * Buscar todos os gêneros
 */
const getGenres = async (req, res) => {
  try {
    const { data: genres, error } = await supabase
      .from("genres")
      .select("*");

    if (error) throw error;

    res.status(200).json({ success: true, data: genres });
  } catch (error) {
    console.error("Erro ao obter gêneros:", error);
    res.status(500).json({ error: "Erro ao obter gêneros" });
  }
};

export default getGenres;