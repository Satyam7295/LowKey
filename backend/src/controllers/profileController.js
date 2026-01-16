import { User } from "../models/User.js";
import { Notification } from "../models/Notification.js";
import { ApiError } from "../utils/apiError.js";

export async function createProfile(req, res) {
  const userId = req.user.id;
  const { name, bio, prompts, tags, poll } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Handle prompts validation - now optional
  let parsedPrompts = [];
  if (prompts) {
    try {
      parsedPrompts = typeof prompts === "string" ? JSON.parse(prompts) : prompts;
    } catch (err) {
      throw new ApiError(400, "Invalid prompts format");
    }

    if (!Array.isArray(parsedPrompts)) {
      throw new ApiError(400, "Prompts must be an array");
    }

    if (parsedPrompts.length > 5) {
      throw new ApiError(400, "Maximum 5 prompts allowed");
    }

    // Check for duplicate titles
    const titles = parsedPrompts.map((p) => p.title?.toLowerCase().trim());
    const uniqueTitles = new Set(titles);
    if (titles.length !== uniqueTitles.size) {
      throw new ApiError(400, "Duplicate prompt titles are not allowed");
    }

    // Validate each prompt has title and answer
    for (const prompt of parsedPrompts) {
      if (!prompt.title || !prompt.answer) {
        throw new ApiError(400, "Each prompt must have a title and answer");
      }
    }
  }

  // Handle tags validation - optional
  let parsedTags = [];
  if (tags) {
    try {
      parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
    } catch (err) {
      throw new ApiError(400, "Invalid tags format");
    }

    if (!Array.isArray(parsedTags)) {
      throw new ApiError(400, "Tags must be an array");
    }

    if (parsedTags.length > 10) {
      throw new ApiError(400, "Maximum 10 tags allowed");
    }

    // Normalize and validate each tag
    parsedTags = parsedTags.map((t) => (t || "").toString().trim()).filter(Boolean);
    const uniqueTags = new Set(parsedTags.map((t) => t.toLowerCase()));
    if (uniqueTags.size !== parsedTags.length) {
      throw new ApiError(400, "Duplicate tags are not allowed");
    }

    for (const tag of parsedTags) {
      if (tag.length > 30) {
        throw new ApiError(400, "Tags must be 30 characters or less");
      }
    }
  }

  // Handle poll validation - optional
  let parsedPoll = null;
  if (poll) {
    try {
      parsedPoll = typeof poll === "string" ? JSON.parse(poll) : poll;
    } catch (err) {
      throw new ApiError(400, "Invalid poll format");
    }

    const question = (parsedPoll.question || "").toString().trim();
    const options = Array.isArray(parsedPoll.options)
      ? parsedPoll.options.map((o) => (o || "").toString().trim()).filter(Boolean)
      : [];

    if (question || options.length) {
      if (!question) {
        throw new ApiError(400, "Poll question is required when adding options");
      }
      if (options.length < 2) {
        throw new ApiError(400, "Poll must have at least 2 options");
      }
      if (options.length > 5) {
        throw new ApiError(400, "Poll can have at most 5 options");
      }
      const uniqueOptions = new Set(options.map((o) => o.toLowerCase()));
      if (uniqueOptions.size !== options.length) {
        throw new ApiError(400, "Poll options must be unique");
      }
      for (const opt of options) {
        if (opt.length > 60) {
          throw new ApiError(400, "Poll options must be 60 characters or less");
        }
      }
      parsedPoll = { question, options };
    } else {
      parsedPoll = null;
    }
  }

  // Handle file uploads (req.files for multiple files)
  if (req.files) {
    // Profile picture
    if (req.files.profilePic && req.files.profilePic[0]) {
      user.profilePic = `/uploads/${req.files.profilePic[0].filename}`;
    }

    // Gallery pictures
    const galleryPics = [];
    for (let i = 0; i < 10; i++) {
      const fieldName = `galleryPic${i}`;
      if (req.files[fieldName] && req.files[fieldName][0]) {
        galleryPics.push(`/uploads/${req.files[fieldName][0].filename}`);
      }
    }
    if (galleryPics.length > 0) {
      user.gallery = galleryPics;
    }

    // Video
    if (req.files.video && req.files.video[0]) {
      user.video = `/uploads/${req.files.video[0].filename}`;
    }
  }

  if (bio !== undefined) {
    user.bio = bio;
  }

  if (parsedPrompts.length > 0) {
    user.prompts = parsedPrompts;
  }

  if (parsedTags.length > 0) {
    user.tags = parsedTags;
  }

  if (parsedPoll) {
    user.poll = parsedPoll;
  }

  // Handle name update with uniqueness check
  if (name !== undefined) {
    const trimmedName = name.toString().trim();
    if (trimmedName.length < 2) {
      throw new ApiError(400, "Name must be at least 2 characters");
    }

    const existingName = await User.findOne({ name: trimmedName, _id: { $ne: userId } });
    if (existingName) {
      throw new ApiError(400, "Name already in use, please choose another");
    }

    user.name = trimmedName;
  }

  await user.save();

  res.status(200).json({
    success: true,
    user: user.toJSON()
  });
}

export async function updateProfile(req, res) {
  const userId = req.user.id;
  const { name, bio, prompts, tags, poll } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Handle prompts validation - now optional
  if (prompts !== undefined) {
    let parsedPrompts;
    try {
      parsedPrompts = typeof prompts === "string" ? JSON.parse(prompts) : prompts;
    } catch (err) {
      throw new ApiError(400, "Invalid prompts format");
    }

    if (!Array.isArray(parsedPrompts)) {
      throw new ApiError(400, "Prompts must be an array");
    }

    if (parsedPrompts.length > 5) {
      throw new ApiError(400, "Maximum 5 prompts allowed");
    }

    // Check for duplicate titles
    const titles = parsedPrompts.map((p) => p.title?.toLowerCase().trim());
    const uniqueTitles = new Set(titles);
    if (titles.length !== uniqueTitles.size) {
      throw new ApiError(400, "Duplicate prompt titles are not allowed");
    }

    // Validate each prompt
    for (const prompt of parsedPrompts) {
      if (!prompt.title || !prompt.answer) {
        throw new ApiError(400, "Each prompt must have a title and answer");
      }
    }

    user.prompts = parsedPrompts;
  }

  // Handle tags validation - optional
  if (tags !== undefined) {
    let parsedTags;
    try {
      parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
    } catch (err) {
      throw new ApiError(400, "Invalid tags format");
    }

    if (!Array.isArray(parsedTags)) {
      throw new ApiError(400, "Tags must be an array");
    }

    if (parsedTags.length > 10) {
      throw new ApiError(400, "Maximum 10 tags allowed");
    }

    parsedTags = parsedTags.map((t) => (t || "").toString().trim()).filter(Boolean);
    const uniqueTags = new Set(parsedTags.map((t) => t.toLowerCase()));
    if (uniqueTags.size !== parsedTags.length) {
      throw new ApiError(400, "Duplicate tags are not allowed");
    }

    for (const tag of parsedTags) {
      if (tag.length > 30) {
        throw new ApiError(400, "Tags must be 30 characters or less");
      }
    }

    user.tags = parsedTags;
  }

  // Handle poll validation - optional
  if (poll !== undefined) {
    let parsedPoll;
    try {
      parsedPoll = typeof poll === "string" ? JSON.parse(poll) : poll;
    } catch (err) {
      throw new ApiError(400, "Invalid poll format");
    }

    const question = (parsedPoll?.question || "").toString().trim();
    const options = Array.isArray(parsedPoll?.options)
      ? parsedPoll.options.map((o) => (o || "").toString().trim()).filter(Boolean)
      : [];

    if (question || options.length) {
      if (!question) {
        throw new ApiError(400, "Poll question is required when adding options");
      }
      if (options.length < 2) {
        throw new ApiError(400, "Poll must have at least 2 options");
      }
      if (options.length > 5) {
        throw new ApiError(400, "Poll can have at most 5 options");
      }
      const uniqueOptions = new Set(options.map((o) => o.toLowerCase()));
      if (uniqueOptions.size !== options.length) {
        throw new ApiError(400, "Poll options must be unique");
      }
      for (const opt of options) {
        if (opt.length > 60) {
          throw new ApiError(400, "Poll options must be 60 characters or less");
        }
      }
      user.poll = { question, options };
    } else {
      user.poll = { question: "", options: [] };
    }
  }

  // Handle file uploads (req.files for multiple files)
  if (req.files) {
    // Profile picture
    if (req.files.profilePic && req.files.profilePic[0]) {
      user.profilePic = `/uploads/${req.files.profilePic[0].filename}`;
    }

    // Gallery pictures
    const galleryPics = [];
    for (let i = 0; i < 10; i++) {
      const fieldName = `galleryPic${i}`;
      if (req.files[fieldName] && req.files[fieldName][0]) {
        galleryPics.push(`/uploads/${req.files[fieldName][0].filename}`);
      }
    }
    if (galleryPics.length > 0) {
      user.gallery = galleryPics;
    }

    // Video
    if (req.files.video && req.files.video[0]) {
      user.video = `/uploads/${req.files.video[0].filename}`;
    }
  }

  if (bio !== undefined) {
    user.bio = bio;
  }

  // Handle name update with uniqueness check
  if (name !== undefined) {
    const trimmedName = name.toString().trim();
    if (trimmedName.length < 2) {
      throw new ApiError(400, "Name must be at least 2 characters");
    }

    const existingName = await User.findOne({ name: trimmedName, _id: { $ne: userId } });
    if (existingName) {
      throw new ApiError(400, "Name already in use, please choose another");
    }

    user.name = trimmedName;
  }

  await user.save();

  res.status(200).json({
    success: true,
    user: user.toJSON()
  });
}

export async function getProfile(req, res) {
  const { username } = req.params;

  const user = await User.findOne({ username }).select("-password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json({
    success: true,
    user: user.toJSON()
  });
}

export async function searchProfiles(req, res) {
  const { q, tags } = req.query;

  const filters = {};

  if (q && q.trim()) {
    const searchQuery = q.trim();
    filters.$or = [
      { name: { $regex: searchQuery, $options: "i" } },
      { username: { $regex: searchQuery, $options: "i" } },
      { bio: { $regex: searchQuery, $options: "i" } },
      { tags: { $regex: searchQuery, $options: "i" } }
    ];
  }

  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : [tags];
    filters.tags = { $in: tagArray };
  }

  if (!filters.$or && !filters.tags) {
    return res.status(400).json({
      success: false,
      message: "Search query or tags are required"
    });
  }

  const profiles = await User.find(filters)
    .select("-password")
    .limit(20);

  res.status(200).json({
    success: true,
    profiles: profiles.map((p) => p.toJSON())
  });
}

export async function getRecommendations(req, res) {
  const userId = req.user.id;

  // Get current user's profile to check their tags
  const currentUser = await User.findById(userId).select("tags");
  
  let recommendations;
  
  // If user has tags, find users with similar tags
  if (currentUser && currentUser.tags && currentUser.tags.length > 0) {
    // Find users with at least one matching tag
    const usersWithTags = await User.find({
      _id: { $ne: userId },
      tags: { $in: currentUser.tags }
    })
      .select("name username profilePic tags bio")
      .lean();
    
    // Calculate similarity score
    const usersWithScore = usersWithTags.map(user => {
      const commonTags = user.tags ? user.tags.filter(tag => currentUser.tags.includes(tag)) : [];
      return {
        ...user,
        commonTags,
        similarityScore: commonTags.length
      };
    });
    
    // Sort by similarity score (most similar first)
    usersWithScore.sort((a, b) => b.similarityScore - a.similarityScore);
    
    // Take top 12 or fill with random users if not enough
    if (usersWithScore.length >= 12) {
      recommendations = usersWithScore.slice(0, 12);
    } else {
      // Get additional random users to fill up to 12
      const additionalCount = 12 - usersWithScore.length;
      const excludeIds = [userId, ...usersWithScore.map(u => u._id)];
      const additionalUsers = await User.find({
        _id: { $nin: excludeIds }
      })
        .select("name username profilePic tags bio")
        .limit(additionalCount)
        .lean();
      
      recommendations = [...usersWithScore, ...additionalUsers];
    }
  } else {
    // If user has no tags, return random users
    recommendations = await User.find({ _id: { $ne: userId } })
      .select("name username profilePic tags bio")
      .limit(12)
      .lean();
  }

  res.status(200).json({
    success: true,
    profiles: recommendations
  });
}

export async function getSimilarUsers(req, res) {
  const { username } = req.params;
  const currentUserId = req.user.id;

  // Get the target user's profile
  const targetUser = await User.findOne({ username });
  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  // If target user has no tags, return empty array
  if (!targetUser.tags || targetUser.tags.length === 0) {
    return res.status(200).json({
      success: true,
      users: []
    });
  }

  // Find users with similar tags (excluding current user and target user)
  const similarUsers = await User.find({
    _id: { $nin: [currentUserId, targetUser._id] },
    tags: { $in: targetUser.tags }
  })
    .select("name username profilePic tags bio")
    .lean();

  // Calculate similarity score and sort by it
  const usersWithScore = similarUsers.map(user => {
    const commonTags = user.tags ? user.tags.filter(tag => targetUser.tags.includes(tag)) : [];
    return {
      ...user,
      commonTags,
      similarityScore: commonTags.length
    };
  });

  // Sort by similarity score (most similar first) and limit to exactly 4
  usersWithScore.sort((a, b) => b.similarityScore - a.similarityScore);
  const topFourUsers = usersWithScore.slice(0, 4);

  res.status(200).json({
    success: true,
    users: topFourUsers
  });
}

export async function requestFriendship(req, res) {
  const userId = req.user.id;
  const { username } = req.params;

  const targetUser = await User.findOne({ username });
  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  if (targetUser._id.toString() === userId) {
    throw new ApiError(400, "You cannot send a friend request to yourself");
  }

  // Check if request already exists
  const existingRequest = targetUser.friendRequests.some(
    (r) => r.from.toString() === userId
  );
  if (existingRequest) {
    throw new ApiError(400, "Friend request already sent");
  }

  targetUser.friendRequests.push({ from: userId });
  await targetUser.save();

  res.status(200).json({
    success: true,
    message: "Friend request sent"
  });
}

export async function poke(req, res) {
  const userId = req.user.id;
  const { username } = req.params;

  const currentUser = await User.findById(userId);
  const targetUser = await User.findOne({ username });
  
  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  if (targetUser._id.toString() === userId) {
    throw new ApiError(400, "You cannot poke yourself");
  }

  targetUser.pokes.push({ from: userId });
  await targetUser.save();

  // Create notification
  await Notification.create({
    recipient: targetUser._id,
    sender: userId,
    type: "poke",
    message: `${currentUser.name || currentUser.username} checked in`
  });

  res.status(200).json({
    success: true,
    message: "Poke sent"
  });
}

export async function ask(req, res) {
  const userId = req.user.id;
  const { username } = req.params;
  const { message } = req.body;

  if (!message || !message.trim()) {
    throw new ApiError(400, "Message is required");
  }

  const targetUser = await User.findOne({ username });
  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  if (targetUser._id.toString() === userId) {
    throw new ApiError(400, "You cannot ask yourself");
  }

  targetUser.asks.push({ from: userId, message: message.trim() });
  await targetUser.save();

  // Create notification
  await Notification.create({
    recipient: targetUser._id,
    sender: userId,
    type: "ask",
    message: message.trim()
  });

  res.status(200).json({
    success: true,
    message: "Question sent"
  });
}

export async function replyToAsk(req, res) {
  const userId = req.user.id;
  const { notificationId, answer, isPublic } = req.body;

  if (!answer || !answer.trim()) {
    throw new ApiError(400, "Answer is required");
  }

  if (!notificationId) {
    throw new ApiError(400, "Notification ID is required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Get the notification to find the original question
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (notification.recipient.toString() !== userId) {
    throw new ApiError(403, "You can only reply to your own notifications");
  }

  if (notification.type !== "ask") {
    throw new ApiError(400, "This notification is not an ask");
  }

  if (isPublic) {
    // Add to spillback for public replies
    user.spillback.push({
      question: notification.message,
      answer: answer.trim(),
      isVisible: true
    });
    await user.save();
  } else {
    // TODO: Implement private reply (direct message or notification to sender)
  }

  // Mark notification as read
  notification.isRead = true;
  await notification.save();

  res.status(200).json({
    success: true,
    message: isPublic ? "Public reply posted" : "Private reply sent"
  });
}

export async function deleteSpillback(req, res) {
  const userId = req.user.id;
  const { index } = req.params;

  if (index === undefined || index === null) {
    throw new ApiError(400, "Spillback index is required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const spillbackIndex = parseInt(index, 10);
  if (isNaN(spillbackIndex) || spillbackIndex < 0 || spillbackIndex >= user.spillback.length) {
    throw new ApiError(400, "Invalid spillback index");
  }

  // Remove the spillback item at the specified index
  user.spillback.splice(spillbackIndex, 1);
  await user.save();

  res.status(200).json({
    success: true,
    message: "Spillback deleted"
  });
}
export async function toggleSpillbackVisibility(req, res) {
  const userId = req.user.id;
  const { index } = req.params;

  if (index === undefined || index === null) {
    throw new ApiError(400, "Spillback index is required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const spillbackIndex = parseInt(index, 10);
  if (isNaN(spillbackIndex) || spillbackIndex < 0 || spillbackIndex >= user.spillback.length) {
    throw new ApiError(400, "Invalid spillback index");
  }

  // Toggle visibility
  if (!user.spillback[spillbackIndex].isVisible) {
    user.spillback[spillbackIndex].isVisible = true;
  } else {
    user.spillback[spillbackIndex].isVisible = false;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: user.spillback[spillbackIndex].isVisible ? "Spillback is now public" : "Spillback is now hidden",
    user: user.toJSON()
  });
}