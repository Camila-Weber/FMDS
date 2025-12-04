import getGenres from "../controllers/GenreController.js";
import { Router } from "express";
const router = Router();

router.get("/", getGenres); // Listar todos os gêneros

export default router;