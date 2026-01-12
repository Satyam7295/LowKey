import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authenticate } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import {
  createProfile,
  updateProfile,
  getProfile,
  searchProfiles,
  getRecommendations,
  requestFriendship,
  poke,
  ask,
  replyToAsk,
  deleteSpillback
} from "../controllers/profileController.js";

const router = Router();

router.post(
  "/",
  authenticate,
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "galleryPic0", maxCount: 1 },
    { name: "galleryPic1", maxCount: 1 },
    { name: "galleryPic2", maxCount: 1 },
    { name: "galleryPic3", maxCount: 1 },
    { name: "galleryPic4", maxCount: 1 },
    { name: "galleryPic5", maxCount: 1 },
    { name: "galleryPic6", maxCount: 1 },
    { name: "galleryPic7", maxCount: 1 },
    { name: "galleryPic8", maxCount: 1 },
    { name: "galleryPic9", maxCount: 1 },
    { name: "video", maxCount: 1 }
  ]),
  asyncHandler(createProfile)
);

router.put(
  "/",
  authenticate,
  upload.fields([
    { name: "profilePic", maxCount: 1 },
    { name: "galleryPic0", maxCount: 1 },
    { name: "galleryPic1", maxCount: 1 },
    { name: "galleryPic2", maxCount: 1 },
    { name: "galleryPic3", maxCount: 1 },
    { name: "galleryPic4", maxCount: 1 },
    { name: "galleryPic5", maxCount: 1 },
    { name: "galleryPic6", maxCount: 1 },
    { name: "galleryPic7", maxCount: 1 },
    { name: "galleryPic8", maxCount: 1 },
    { name: "galleryPic9", maxCount: 1 },
    { name: "video", maxCount: 1 }
  ]),
  asyncHandler(updateProfile)
);

router.get("/search", authenticate, asyncHandler(searchProfiles));
router.get("/recommendations", authenticate, asyncHandler(getRecommendations));
router.post("/:username/request-friendship", authenticate, asyncHandler(requestFriendship));
router.post("/:username/poke", authenticate, asyncHandler(poke));
router.post("/:username/ask", authenticate, asyncHandler(ask));
router.post("/reply-to-ask", authenticate, asyncHandler(replyToAsk));
router.delete("/spillback/:index", authenticate, asyncHandler(deleteSpillback));
router.get("/:username", asyncHandler(getProfile));

export default router;
