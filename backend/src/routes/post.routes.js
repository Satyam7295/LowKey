import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authenticate } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import {
  createPost,
  getFeed,
  getPostById,
  addComment,
  deleteComment,
  deletePost,
  likePost
} from "../controllers/postController.js";

const router = Router();

router.post(
  "/",
  authenticate,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 }
  ]),
  asyncHandler(createPost)
);

router.get("/feed", authenticate, asyncHandler(getFeed));
router.get("/:postId", asyncHandler(getPostById));
router.post("/:postId/comment", authenticate, asyncHandler(addComment));
router.delete("/:postId/comment/:commentId", authenticate, asyncHandler(deleteComment));
router.delete("/:postId", authenticate, asyncHandler(deletePost));
router.post("/:postId/like", authenticate, asyncHandler(likePost));

export default router;
