# Profile Create/Edit Feature - Documentation

## Overview

A comprehensive profile management system with image upload, bio editing, and dynamic prompts functionality.

## Features Implemented

### 1. Profile Picture Upload

- **Image Preview**: Live preview before submission
- **File Validation**:
  - Type validation (images only)
  - Size limit: 5MB max
  - Error handling with inline messages
- **Circular Avatar**: Modern circular design with border

### 2. Bio Section

- **Character Counter**: Real-time counter (500 max)
- **Visual Feedback**: Counter turns red at 90% capacity
- **Validation**: Required field with min/max length checks

### 3. Prompts Management

- **Dynamic CRUD**:
  - Add prompts (up to 5 maximum)
  - Edit existing prompts
  - Delete prompts
  - Visual prompt counter
- **Predefined Questions**: Dropdown with 10 curated prompts:
  - "What's your favorite hobby?"
  - "Dream vacation destination?"
  - "What makes you laugh?"
  - "Your guilty pleasure?"
  - "Best skill you have?"
  - "Favorite quote or motto?"
  - "What's your superpower?"
  - "Coffee or tea?"
  - "Morning person or night owl?"
  - "What are you passionate about?"
- **Validation**:
  - No duplicate titles
  - Both title and answer required
  - Minimum 3 characters for answers
  - Maximum 5 prompts enforced

### 4. Form Validation

- **Inline Error Messages**: Real-time field-level validation
- **Submit Prevention**: Disabled state when errors exist
- **Error Types**:
  - Required fields
  - Character limits
  - Duplicate detection
  - File type/size validation

### 5. UX Enhancements

- **Loading States**:
  - Initial profile data loading
  - Form submission loading with spinner
  - Disabled buttons during processing
- **Toast Notifications**:
  - Success messages (green)
  - Error messages (red)
  - Auto-dismiss after 3 seconds
- **Optimistic UI Updates**: Immediate state update in AuthContext
- **Smooth Navigation**: Auto-redirect to dashboard on success

### 6. Responsive Design

- **Mobile-First**: Fully responsive layouts
- **Tailwind CSS**: Modern gradient backgrounds
- **Card-Based UI**: Clean, organized sections
- **Hover Effects**: Interactive feedback on all elements

## File Structure

```
frontend/src/
├── pages/
│   └── ProfileForm.jsx          # Main profile form component
├── api/
│   └── profile.js               # Profile API service (updated)
├── context/
│   └── AuthContext.jsx          # Auth context (updated with updateUser)
└── App.jsx                      # Routing (updated)
```

## Routes

- `/profile/create` - Create new profile
- `/profile/edit` - Edit existing profile (same component, auto-detects)

## API Integration

### Endpoints Used

```javascript
GET / auth / me; // Get current user profile
POST / profile; // Create profile
PUT / profile; // Update profile
```

### Request Format

```javascript
// FormData with multipart/form-data
{
  bio: string,
  prompts: JSON.stringify([{title, answer}]),
  profilePic: File (optional)
}
```

### Response Format

```javascript
{
  success: true,
  user: {
    id,
    username,
    email,
    bio,
    prompts: [{title, answer}],
    profilePic: "/uploads/filename.jpg"
  }
}
```

## Component Props & State

### State Management

```javascript
// Form State
const [bio, setBio] = useState("");
const [prompts, setPrompts] = useState([]);
const [profilePic, setProfilePic] = useState(null);
const [previewUrl, setPreviewUrl] = useState("");

// UI State
const [loading, setLoading] = useState(false);
const [loadingProfile, setLoadingProfile] = useState(false);
const [errors, setErrors] = useState({});
const [toast, setToast] = useState(null);
```

## Key Functions

### Validation

```javascript
validateForm(); // Returns boolean, sets errors object
```

### CRUD Operations

```javascript
addPrompt(); // Add new prompt
updatePrompt(index, field, value); // Update specific prompt
deletePrompt(index); // Remove prompt
```

### Image Handling

```javascript
handleImageChange(e); // File validation & preview generation
```

### Submit

```javascript
handleSubmit(e); // Form submission with validation
```

## Styling Classes

### Color Scheme

- **Primary**: Purple gradient (`from-purple-600 to-pink-600`)
- **Background**: Soft gradient (`from-purple-50 to-pink-50`)
- **Accents**: Purple-100, Purple-200 for highlights
- **Errors**: Red-500, Red-600
- **Success**: Green-500

### Responsive Breakpoints

- Mobile: Default (< 640px)
- Tablet: sm (640px+)
- Desktop: lg (1024px+)
- Max-width container: 3xl (768px)

## Usage Example

### Navigation to Profile Form

```javascript
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();
navigate("/profile/create");
```

### Access from Dashboard

```jsx
<button onClick={() => navigate("/profile/create")}>Create Profile</button>
```

## Validation Rules

| Field         | Rule                    | Error Message                                                     |
| ------------- | ----------------------- | ----------------------------------------------------------------- |
| Bio           | Required, max 500 chars | "Bio is required"                                                 |
| Prompts       | Min 1, Max 5            | "At least one prompt required" / "Max 5 prompts allowed"          |
| Prompt Title  | Required, no duplicates | "Both title and answer required" / "Duplicate titles not allowed" |
| Prompt Answer | Required, min 3 chars   | "Answer must be at least 3 characters"                            |
| Profile Pic   | Image type, max 5MB     | "Please select an image file" / "Image must be less than 5MB"     |

## Error Handling

### Network Errors

```javascript
try {
  await profileApi.create(formData);
} catch (error) {
  const message = error.response?.data?.message || "Failed to save profile";
  showToast(message, "error");
}
```

### Validation Errors

- Inline error messages below each field
- Error object structure: `{ fieldName: "error message" }`
- Prompt-specific errors: `{ prompt_0: "error", prompt_1: "error" }`

## Testing Checklist

- [ ] Create profile with all fields
- [ ] Edit existing profile
- [ ] Upload profile picture (various formats/sizes)
- [ ] Bio character counter accuracy
- [ ] Add maximum prompts (5)
- [ ] Try adding 6th prompt (should be disabled)
- [ ] Delete prompts
- [ ] Submit with missing fields
- [ ] Submit with duplicate prompt titles
- [ ] Test on mobile viewport
- [ ] Toast notifications display correctly
- [ ] Loading states work
- [ ] Navigation after success
- [ ] Optimistic UI update

## Future Enhancements

- [ ] Drag-and-drop image upload
- [ ] Image cropping/editing
- [ ] Custom prompt creation
- [ ] Prompt reordering (drag & drop)
- [ ] Rich text editor for bio
- [ ] Emoji picker
- [ ] Save draft functionality
- [ ] Character personality prompts
- [ ] Social media link integration

## Dependencies

```json
{
  "react": "^18.x",
  "react-router-dom": "^6.x",
  "axios": "^1.x",
  "tailwindcss": "^3.x"
}
```

## Notes

- Form auto-detects create vs edit mode based on existing user data
- Uses FormData for multipart file upload
- JWT token automatically attached via axios interceptor
- Profile picture URLs are relative to backend server
- Toast component is built-in (no external library needed)
