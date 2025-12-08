import { getBooks, getBookById, createBook, updateBook, deleteBook } from "../controllers/BookController.js";
import { Router } from "express";
const router = Router();

// Não teste nada além das rotas GET, as outras estão incompletas e podem causar erros.

router.post("/", createBook); // Criar um novo livro
router.get("/", getBooks); // Listar todos os livros
router.get("/:id", getBookById); // Obter livro por ID
router.put("/:id", updateBook); // Atualizar livro por ID
router.delete("/:id", deleteBook); // Deletar livro por ID

export default router;