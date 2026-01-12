import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { profileApi } from "../api/profile";

// Predefined prompt titles
const PROMPT_TITLES = [
  "What's your favorite hobby?",
  "Dream vacation destination?",
  "What makes you laugh?",
  "Your guilty pleasure?",
  "Best skill you have?",
  "Favorite quote or motto?",
  "What's your superpower?",
  "Coffee or tea?",
  "Morning person or night owl?",
  "What are you passionate about?",
];

const TAG_OPTIONS = ["Cricket", "Coffee Lover", "Tea Lover", "Adventure"];

const MAX_PROMPTS = 5;
const MAX_BIO_LENGTH = 500;
const MAX_POLL_OPTIONS = 5;
const ALLOW_POLL = true;

export default function ProfileForm() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [bio, setBio] = useState("");
  const [prompts, setPrompts] = useState([]);
  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [galleryPics, setGalleryPics] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [video, setVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [tags, setTags] = useState([]);
  const [customTag, setCustomTag] = useState("");
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  // Check if editing existing profile
  const isEditing = user?.bio || user?.prompts?.length > 0;

  // Load existing profile data
  useEffect(() => {
    if (isEditing) {
      loadProfileData();
    }
  }, []);

  const loadProfileData = async () => {
    setLoadingProfile(true);
    try {
      const response = await profileApi.getMe();
      const userData = response.user;
      
      if (userData.bio) setBio(userData.bio);
      if (userData.prompts) setPrompts(userData.prompts);
      if (userData.profilePic) setPreviewUrl(userData.profilePic);
      if (userData.tags) setTags(userData.tags);
      if (!isEditing && userData.poll) {
        setPollQuestion(userData.poll.question || "");
        if (Array.isArray(userData.poll.options) && userData.poll.options.length >= 2) {
          setPollOptions(userData.poll.options);
        }
      }
    } catch (error) {
      showToast("Failed to load profile data", "error");
    } finally {
      setLoadingProfile(false);
    }
  };

  // Handle profile picture selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrors({ ...errors, profilePic: "Please select an image file" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, profilePic: "Image must be less than 5MB" });
      return;
    }

    setProfilePic(file);
    setErrors({ ...errors, profilePic: null });

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle gallery pictures
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const previews = [];
    
    files.forEach(file => {
      if (!file.type.startsWith("image/")) return;
      if (file.size > 5 * 1024 * 1024) return;
      
      validFiles.push(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        if (previews.length === validFiles.length) {
          setGalleryPreviews([...galleryPreviews, ...previews]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    setGalleryPics([...galleryPics, ...validFiles]);
  };

  // Remove gallery picture
  const removeGalleryPic = (index) => {
    setGalleryPics(galleryPics.filter((_, i) => i !== index));
    setGalleryPreviews(galleryPreviews.filter((_, i) => i !== index));
  };

  // Tag handlers
  const addTag = (tag) => {
    const value = (tag || "").trim();
    if (!value) return;

    if (tags.some((t) => t.toLowerCase() === value.toLowerCase())) {
      return;
    }

    if (tags.length >= 10) {
      setErrors({ ...errors, tags: "Maximum 10 tags allowed" });
      return;
    }

    setTags([...tags, value]);
    setCustomTag("");
    setErrors({ ...errors, tags: null });
  };

  const removeTag = (value) => {
    setTags(tags.filter((t) => t !== value));
  };

  // Poll handlers
  const setOptionValue = (index, value) => {
    const updated = [...pollOptions];
    updated[index] = value;
    setPollOptions(updated);
  };

  const addPollOption = () => {
    if (pollOptions.length >= MAX_POLL_OPTIONS) return;
    setPollOptions([...pollOptions, ""]);
  };

  const removePollOption = (index) => {
    if (pollOptions.length <= 2) return; // keep minimum 2 slots
    setPollOptions(pollOptions.filter((_, i) => i !== index));
  };

  // Handle video upload
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setErrors({ ...errors, video: "Please select a video file" });
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setErrors({ ...errors, video: "Video must be less than 50MB" });
      return;
    }

    setVideo(file);
    setErrors({ ...errors, video: null });

    const reader = new FileReader();
    reader.onloadend = () => {
      setVideoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle bio change
  const handleBioChange = (e) => {
    const value = e.target.value;
    if (value.length <= MAX_BIO_LENGTH) {
      setBio(value);
      setErrors({ ...errors, bio: null });
    }
  };

  // Add new prompt
  const addPrompt = () => {
    if (prompts.length >= MAX_PROMPTS) {
      setErrors({ ...errors, prompts: `Maximum ${MAX_PROMPTS} prompts allowed` });
      return;
    }

    setPrompts([...prompts, { title: "", answer: "" }]);
    setErrors({ ...errors, prompts: null });
  };

  // Update prompt
  const updatePrompt = (index, field, value) => {
    const updated = [...prompts];
    updated[index][field] = value;
    setPrompts(updated);

    if (errors[`prompt_${index}`]) {
      const newErrors = { ...errors };
      delete newErrors[`prompt_${index}`];
      setErrors(newErrors);
    }
  };

  // Delete prompt
  const deletePrompt = (index) => {
    const updated = prompts.filter((_, i) => i !== index);
    setPrompts(updated);
    setErrors({ ...errors, prompts: null });
  };

  // Validate form - all fields are optional now
  const validateForm = () => {
    const newErrors = {};

    // Poll validation only when creating
    if (!isEditing) {
      const hasPollContent = pollQuestion.trim().length > 0 || pollOptions.some((o) => o.trim().length > 0);
      if (hasPollContent) {
        if (!pollQuestion.trim()) {
          newErrors.poll = "Poll question is required";
        }
        const filledOptions = pollOptions.map((o) => o.trim()).filter(Boolean);
        if (filledOptions.length < 2) {
          newErrors.poll = "Add at least 2 poll options";
        }
        if (filledOptions.length > MAX_POLL_OPTIONS) {
          newErrors.poll = `Maximum ${MAX_POLL_OPTIONS} options allowed`;
        }
        const lower = filledOptions.map((o) => o.toLowerCase());
        const uniq = new Set(lower);
        if (uniq.size !== lower.length) {
          newErrors.poll = "Poll options must be unique";
        }
      }
    }

    // Only validate prompts if they exist
    if (prompts.length > 0) {
      prompts.forEach((prompt, index) => {
        if (!prompt.title || !prompt.answer) {
          newErrors[`prompt_${index}`] = "Both title and answer are required";
        } else if (prompt.answer.trim().length < 3) {
          newErrors[`prompt_${index}`] = "Answer must be at least 3 characters";
        }
      });

      // Check for duplicate titles
      const titles = prompts.map((p) => p.title.toLowerCase().trim());
      const uniqueTitles = new Set(titles);
      if (titles.length !== uniqueTitles.size) {
        newErrors.prompts = "Duplicate prompt titles are not allowed";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast("Please fix all errors before submitting", "error");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      if (bio) formData.append("bio", bio);
      if (prompts.length > 0) formData.append("prompts", JSON.stringify(prompts));
      if (tags.length > 0) formData.append("tags", JSON.stringify(tags));

      if (!isEditing) {
        const filledPollOptions = pollOptions.map((o) => o.trim()).filter(Boolean);
        if (pollQuestion.trim() && filledPollOptions.length >= 2) {
          formData.append(
            "poll",
            JSON.stringify({ question: pollQuestion.trim(), options: filledPollOptions.slice(0, MAX_POLL_OPTIONS) })
          );
        }
      }
      
      if (profilePic) {
        formData.append("profilePic", profilePic);
      }
      
      // Add gallery pictures
      galleryPics.forEach((pic, index) => {
        formData.append(`galleryPic${index}`, pic);
      });
      
      // Add video
      if (video) {
        formData.append("video", video);
      }

      const response = isEditing
        ? await profileApi.update(formData)
        : await profileApi.create(formData);

      // Optimistic UI update
      if (updateUser) {
        updateUser(response.user);
      }

      showToast(`Profile ${isEditing ? "updated" : "created"} successfully!`, "success");
      
      setTimeout(() => {
        navigate("/home");
      }, 1500);
    } catch (error) {
      const message = error.response?.data?.message || "Failed to save profile";
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Toast notification
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-slate-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Logout Button */}
        <div className="mb-8 flex justify-between items-start">
          <h1 className="text-4xl font-bold text-white mb-2">
            {isEditing ? "Tweak your profile" : "Create Your Profile"}
          </h1>
          {isEditing && (
            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
            >
              Log out
            </button>
          )}
        </div>

        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Section */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-purple-500/30 rounded-2xl shadow-xl shadow-purple-500/10 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">Profile Picture</h2>
              <p className="text-slate-400">Update your avatar and add what describes you</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-40 h-40 rounded-full overflow-hidden bg-slate-800 border-4 border-purple-500/60 shadow-lg">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Profile preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-800/50">
                        <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {user?.name && (
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-white">{user.name}</h3>
                    <p className="text-sm text-slate-400">@{user.username}</p>
                  </div>
                )}

                <label className="block w-full">
                  <span className="sr-only">Choose profile picture</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-slate-300
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-purple-600 file:text-white
                      hover:file:bg-purple-700
                      cursor-pointer transition"
                  />
                </label>

                <p className="text-xs text-slate-500 text-center">PNG, JPG, GIF up to 5MB</p>

                {errors.profilePic && (
                  <p className="text-sm text-red-400 text-center">{errors.profilePic}</p>
                )}
              </div>

              {/* Tags Section */}
              <div className="flex-1 bg-slate-900/80 border border-purple-400/20 rounded-xl p-6 space-y-4 w-full">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-white font-semibold text-lg">What describes you?</p>
                    <p className="text-xs text-slate-400 mt-1">Add tags to help others discover you</p>
                  </div>
                  <span className="text-sm font-medium text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full">{tags.length}/10</span>
                </div>

                {/* Predefined Tags */}
                <div>
                  <p className="text-sm text-slate-300 mb-2 font-medium">Quick select:</p>
                  <div className="flex flex-wrap gap-2">
                    {TAG_OPTIONS.map((option) => {
                      const isActive = tags.some((t) => t.toLowerCase() === option.toLowerCase());
                      return (
                        <button
                          type="button"
                          key={option}
                          onClick={() => addTag(option)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                            isActive
                              ? "bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/20"
                              : "bg-slate-800 text-slate-300 border-slate-600 hover:border-purple-400 hover:bg-slate-700"
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Tag Input */}
                <div>
                  <p className="text-sm text-slate-300 mb-2 font-medium">Add custom tag:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag(customTag);
                        }
                      }}
                      placeholder="e.g., Photography, Gaming..."
                      className="flex-1 px-4 py-2 rounded-lg border-2 border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={() => addTag(customTag)}
                      className="px-4 py-2 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Selected Tags Display */}
                {tags.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-300 mb-2 font-medium">Your tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-200 text-sm font-medium"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-purple-300 hover:text-purple-100 transition"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {errors.tags && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-2">{errors.tags}</p>}
              </div>
            </div>
          </div>

          {/* Gallery Pictures Section */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Gallery Pictures <span className="text-sm text-slate-400">(Optional - Upload multiple)</span>
            </h2>
            
            <div className="space-y-4">
              <label className="block">
                <span className="sr-only">Choose gallery pictures</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryChange}
                  className="block w-full text-sm text-slate-300
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-purple-600 file:text-white
                    hover:file:bg-purple-700
                    cursor-pointer"
                />
              </label>
              
              {galleryPreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                  {galleryPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryPic(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Video Section */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Video <span className="text-sm text-slate-400">(Optional - Max 50MB)</span>
            </h2>
            
            <div className="space-y-4">
              <label className="block">
                <span className="sr-only">Choose video</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="block w-full text-sm text-slate-300
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-purple-600 file:text-white
                    hover:file:bg-purple-700
                    cursor-pointer"
                />
              </label>
              
              {videoPreview && (
                <video
                  src={videoPreview}
                  controls
                  className="w-full max-w-md rounded-lg border-2 border-slate-700"
                />
              )}
              
              {errors.video && (
                <p className="text-sm text-red-400">{errors.video}</p>
              )}
            </div>
          </div>

          {/* Bio Section */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">
                Bio <span className="text-sm text-slate-400">(Optional)</span>
              </h2>
              <span
                className={`text-sm ${
                  bio.length > MAX_BIO_LENGTH * 0.9
                    ? "text-red-400 font-semibold"
                    : "text-slate-400"
                }`}
              >
                {bio.length} / {MAX_BIO_LENGTH}
              </span>
            </div>

            <textarea
              value={bio}
              onChange={handleBioChange}
              placeholder="Tell us about yourself..."
              rows={5}
              className={`w-full px-4 py-3 rounded-lg border-2 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.bio ? "border-red-500" : "border-slate-700"
              }`}
            />
            {errors.bio && (
              <p className="mt-2 text-sm text-red-400">{errors.bio}</p>
            )}
          </div>

          {/* Prompts Section */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">
                Prompts ({prompts.length}/{MAX_PROMPTS}) <span className="text-sm text-slate-400">(Optional)</span>
              </h2>
              <button
                type="button"
                onClick={addPrompt}
                disabled={prompts.length >= MAX_PROMPTS}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  prompts.length >= MAX_PROMPTS
                    ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
              >
                + Add Prompt
              </button>
            </div>

            {errors.prompts && (
              <div className="mb-4 p-3 bg-red-900/30 border border-red-500 rounded-lg">
                <p className="text-sm text-red-400">{errors.prompts}</p>
              </div>
            )}

            {prompts.length === 0 && (
              <div className="text-center text-slate-500 py-8" />
            )}

            <div className="space-y-4">
              {prompts.map((prompt, index) => (
                <div
                  key={index}
                  className="border-2 border-slate-700 rounded-lg p-4 hover:border-purple-500 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="inline-block bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Prompt {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => deletePrompt(index)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Question
                      </label>
                      <select
                        value={prompt.title}
                        onChange={(e) =>
                          updatePrompt(index, "title", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-lg border-2 border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Select a question...</option>
                        {PROMPT_TITLES.map((title) => (
                          <option key={title} value={title}>
                            {title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Your Answer
                      </label>
                      <textarea
                        value={prompt.answer}
                        onChange={(e) =>
                          updatePrompt(index, "answer", e.target.value)
                        }
                        placeholder="Share your answer..."
                        rows={3}
                        className="w-full px-3 py-2 rounded-lg border-2 border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    {errors[`prompt_${index}`] && (
                      <p className="text-sm text-red-400">
                        {errors[`prompt_${index}`]}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!isEditing && ALLOW_POLL && (
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Poll <span className="text-sm text-slate-400">(Optional)</span></h2>
                <span className="text-sm text-slate-400">Add a question with up to {MAX_POLL_OPTIONS} options</span>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="Poll question"
                  className="w-full px-3 py-2 rounded-lg border-2 border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

                <div className="space-y-2">
                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => setOptionValue(idx, e.target.value)}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 px-3 py-2 rounded-lg border-2 border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removePollOption(idx)}
                          className="px-3 py-2 rounded-lg text-red-400 hover:text-red-200"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={addPollOption}
                    disabled={pollOptions.length >= MAX_POLL_OPTIONS}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      pollOptions.length >= MAX_POLL_OPTIONS
                        ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                  >
                    + Add Option
                  </button>
                  <span className="text-sm text-slate-400 self-center">{pollOptions.length}/{MAX_POLL_OPTIONS}</span>
                </div>

                {errors.poll && <p className="text-sm text-red-400">{errors.poll}</p>}
              </div>
            </div>
          )}

          {/* Spillback Section - Read Only */}
          {isEditing && user?.spillback && user.spillback.length > 0 && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-pink-500/30 rounded-2xl shadow-xl shadow-pink-500/10 p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-1">Spillback 🎭</h2>
                <p className="text-slate-400">Your public responses to anonymous questions</p>
              </div>
              <div className="space-y-4">
                {user.spillback.map((item, index) => (
                  <div
                    key={index}
                    className="bg-slate-800/50 border border-pink-400/20 rounded-xl p-5 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-pink-500/20 border border-pink-400/40 flex items-center justify-center flex-shrink-0">
                        <span className="text-pink-300 text-xs">?</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-pink-400 font-medium mb-1">Anonymous</p>
                        <p className="text-slate-200 leading-relaxed">{item.question}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 ml-0 pl-11 border-l-2 border-cyan-400/30">
                      <div className="flex-1">
                        <p className="text-xs text-cyan-400 font-medium mb-1">You</p>
                        <p className="text-slate-300 leading-relaxed">{item.answer}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/home")}
              className="flex-1 py-3 px-6 rounded-lg border-2 border-slate-600 text-slate-300 font-semibold hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || prompts.length > MAX_PROMPTS}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition-all ${
                loading || prompts.length > MAX_PROMPTS
                  ? "bg-slate-700 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </span>
              ) : (
                `${isEditing ? "Update" : "Create"} Profile`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
