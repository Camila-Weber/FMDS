import { createReview, getReviews, updateReview, deleteReview, getReviewById } from "../controllers/ReviewController.js";
import { Router } from "express";
const router = Router();

router.get("/", getReviews);
router.post("/", createReview);
router.put("/:id", updateReview);
router.delete("/:id", deleteReview);
router.get("/:id", getReviewById);

export default router;