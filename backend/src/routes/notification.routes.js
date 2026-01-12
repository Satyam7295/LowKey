import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authenticate } from "../middleware/auth.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from "../controllers/notificationController.js";

const router = Router();

router.get("/", authenticate, asyncHandler(getNotifications));
router.put("/:notificationId/read", authenticate, asyncHandler(markAsRead));
router.put("/mark-all-read", authenticate, asyncHandler(markAllAsRead));
router.delete("/:notificationId", authenticate, asyncHandler(deleteNotification));

export default router;
