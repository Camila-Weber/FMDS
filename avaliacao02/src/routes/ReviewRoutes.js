import { createReview, getReviews, updateReview, deleteReview } from "../controllers/ReviewController.js";
import { Router } from "express";
const router = Router();

router.get("/", getReviews);
router.post("/", createReview);
router.put("/:id", updateReview);
router.patch("/:id", updateReview);
router.delete("/:id", deleteReview);

export default router;