import { supabase } from "../db/db.js";

/**
 * Criar uma nova resenha
 */
export const createReview = async (req, res) => {


};

/** 
 * Obter todas as resenhas
 */
export const getReviews = async (req, res) => {
    try {
        const { data: reviews, error } = await supabase
            .from("reviews")
            .select("*")
            .order("book_id", { ascending: true }); 

        if (error) throw error;

        res.status(200).json({ success: true, data: reviews });

    } catch (error) {
        console.error("Erro ao obter resenhas:", error);
        res.status(500).json({ success: false, error: "Erro ao obter resenhas" });
    }

};

/**
 * Atualizar uma resenha por ID
 */
export const updateReview = async (req, res) => {

};


/**
 * Deletar uma resenha por ID
 */
export const deleteReview = async (req, res) => {

};