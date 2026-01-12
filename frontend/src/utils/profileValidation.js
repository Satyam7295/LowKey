/**
 * Profile Form Validation Utilities
 */

export const MAX_BIO_LENGTH = 500;
export const MAX_PROMPTS = 5;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MIN_PROMPT_ANSWER_LENGTH = 3;

/**
 * Validate profile picture file
 */
export const validateProfilePicture = (file) => {
  if (!file) return null;

  if (!file.type.startsWith("image/")) {
    return "Please select an image file";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return "Image must be less than 5MB";
  }

  return null;
};

/**
 * Validate bio text
 */
export const validateBio = (bio) => {
  if (!bio || bio.trim().length === 0) {
    return "Bio is required";
  }

  if (bio.length > MAX_BIO_LENGTH) {
    return `Bio must not exceed ${MAX_BIO_LENGTH} characters`;
  }

  return null;
};

/**
 * Validate individual prompt
 */
export const validatePrompt = (prompt) => {
  if (!prompt.title || !prompt.answer) {
    return "Both title and answer are required";
  }

  if (prompt.answer.trim().length < MIN_PROMPT_ANSWER_LENGTH) {
    return `Answer must be at least ${MIN_PROMPT_ANSWER_LENGTH} characters`;
  }

  return null;
};

/**
 * Validate prompts array
 */
export const validatePrompts = (prompts) => {
  if (prompts.length === 0) {
    return "At least one prompt is required";
  }

  if (prompts.length > MAX_PROMPTS) {
    return `Maximum ${MAX_PROMPTS} prompts allowed`;
  }

  // Check for duplicate titles
  const titles = prompts.map((p) => p.title.toLowerCase().trim());
  const uniqueTitles = new Set(titles);
  if (titles.length !== uniqueTitles.size) {
    return "Duplicate prompt titles are not allowed";
  }

  return null;
};

/**
 * Validate entire profile form
 */
export const validateProfileForm = (formData) => {
  const errors = {};

  // Validate bio
  const bioError = validateBio(formData.bio);
  if (bioError) errors.bio = bioError;

  // Validate prompts array
  const promptsError = validatePrompts(formData.prompts);
  if (promptsError) errors.prompts = promptsError;

  // Validate individual prompts
  formData.prompts.forEach((prompt, index) => {
    const promptError = validatePrompt(prompt);
    if (promptError) {
      errors[`prompt_${index}`] = promptError;
    }
  });

  // Validate profile picture if provided
  if (formData.profilePic) {
    const picError = validateProfilePicture(formData.profilePic);
    if (picError) errors.profilePic = picError;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Get bio character count status
 */
export const getBioCharacterStatus = (length) => {
  const percentage = (length / MAX_BIO_LENGTH) * 100;
  
  if (percentage >= 90) {
    return { color: "text-red-600", weight: "font-semibold" };
  } else if (percentage >= 75) {
    return { color: "text-amber-600", weight: "font-medium" };
  } else {
    return { color: "text-gray-500", weight: "" };
  }
};

/**
 * Check if prompts limit reached
 */
export const isPromptsLimitReached = (prompts) => {
  return prompts.length >= MAX_PROMPTS;
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
};
