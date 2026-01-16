import { Post } from "../models/Post.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";

// Helper function to generate anonymous alias
function generateLowkeyAlias() {
  const ALIAS_POOL = ["anon", "npc", "ghost", "void", "user", "quiet", "lowkey"];
  const prefix = ALIAS_POOL[Math.floor(Math.random() * ALIAS_POOL.length)];
  const digits = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `${prefix}_${digits}`;
}

export async function createPost(req, res) {
  const userId = req.user.id;
  const { content, poll, tags, isAnonymous } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if at least content or poll is provided
  const hasPoll = poll && (() => {
    try {
      const parsedPoll = typeof poll === "string" ? JSON.parse(poll) : poll;
      const question = (parsedPoll.question || "").toString().trim();
      const options = Array.isArray(parsedPoll.options)
        ? parsedPoll.options.map((o) => (o || "").toString().trim()).filter(Boolean)
        : [];
      return question && options.length >= 2;
    } catch {
      return false;
    }
  })();

  if ((!content || !content.trim()) && !hasPoll) {
    throw new ApiError(400, "Please provide either content or a poll");
  }

  const postData = {
    author: userId,
    content: content ? content.trim() : "",
    isAnonymous: isAnonymous === true || isAnonymous === "true"
  };

  // Generate anonymous alias if needed
  if (postData.isAnonymous) {
    postData.anonymousAlias = generateLowkeyAlias();
  }

  // Handle tags
  if (tags) {
    try {
      const parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
      if (Array.isArray(parsedTags) && parsedTags.length > 0) {
        postData.tags = parsedTags;
      }
    } catch (err) {
      throw new ApiError(400, "Invalid tags format");
    }
  }

  // Handle file uploads
  if (req.files) {
    if (req.files.image && req.files.image[0]) {
      postData.image = `/uploads/${req.files.image[0].filename}`;
    }
    if (req.files.video && req.files.video[0]) {
      postData.video = `/uploads/${req.files.video[0].filename}`;
    }
  }

  // Handle poll
  if (poll) {
    try {
      const parsedPoll = typeof poll === "string" ? JSON.parse(poll) : poll;
      const question = (parsedPoll.question || "").toString().trim();
      const options = Array.isArray(parsedPoll.options)
        ? parsedPoll.options.map((o) => (o || "").toString().trim()).filter(Boolean)
        : [];

      if (question && options.length >= 2) {
        postData.poll = { question, options };
      }
    } catch (err) {
      throw new ApiError(400, "Invalid poll format");
    }
  }

  const post = await Post.create(postData);
  const populatedPost = await post.populate("author", "name username profilePic");

  res.status(201).json({
    success: true,
    post: populatedPost.toJSON()
  });
}

export async function getFeed(req, res) {
  const userId = req.user.id;

  const posts = await Post.find()
    .populate("author", "name username profilePic")
    .populate("comments.author", "name username profilePic")
    .populate("likes.user", "name username")
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json({
    success: true,
    posts: posts.map((p) => p.toJSON())
  });
}

export async function getPostById(req, res) {
  const { postId } = req.params;

  const post = await Post.findById(postId)
    .populate("author", "name username profilePic")
    .populate("comments.author", "name username profilePic")
    .populate("likes.user", "name username");

  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  res.status(200).json({
    success: true,
    post: post.toJSON()
  });
}

export async function addComment(req, res) {
  const userId = req.user.id;
  const { postId } = req.params;
  const { text, isAnonymous } = req.body;

  if (!text || !text.trim()) {
    throw new ApiError(400, "Comment text is required");
  }

  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const comment = {
    author: userId,
    text: text.trim(),
    isAnonymous: isAnonymous === true || isAnonymous === "true"
  };

  // Generate anonymous alias if needed
  if (comment.isAnonymous) {
    comment.anonymousAlias = generateLowkeyAlias();
  }

  post.comments.push(comment);
  await post.save();

  const updatedPost = await post.populate("comments.author", "name username profilePic");

  res.status(201).json({
    success: true,
    post: updatedPost.toJSON()
  });
}

export async function deleteComment(req, res) {
  const userId = req.user.id;
  const { postId, commentId } = req.params;

  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const comment = post.comments.id(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.author.toString() !== userId) {
    throw new ApiError(403, "You can only delete your own comments");
  }

  comment.deleteOne();
  await post.save();

  const updatedPost = await post.populate("comments.author", "name username profilePic");

  res.status(200).json({
    success: true,
    post: updatedPost.toJSON()
  });
}

export async function deletePost(req, res) {
  const userId = req.user.id;
  const { postId } = req.params;

  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  if (post.author.toString() !== userId) {
    throw new ApiError(403, "You can only delete your own posts");
  }

  await Post.findByIdAndDelete(postId);

  res.status(200).json({
    success: true,
    message: "Post deleted"
  });
}

export async function likePost(req, res) {
  const userId = req.user.id;
  const { postId } = req.params;
  const { isAnonymous } = req.body;

  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  const existingLike = post.likes.find((l) => l.user.toString() === userId);

  if (existingLike) {
    post.likes = post.likes.filter((l) => l.user.toString() !== userId);
  } else {
    const like = {
      user: userId,
      isAnonymous: isAnonymous === true || isAnonymous === "true"
    };
    
    // Generate anonymous alias if needed
    if (like.isAnonymous) {
      like.anonymousAlias = generateLowkeyAlias();
    }
    
    post.likes.push(like);
  }

  await post.save();

  const updatedPost = await post.populate("author", "name username profilePic").populate("comments.author", "name username profilePic");

  res.status(200).json({
    success: true,
    post: updatedPost.toJSON()
  });
}
