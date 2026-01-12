# Profile Feature - Component Architecture

## 📦 Component Structure

```
ProfileForm (pages/ProfileForm.jsx)
│
├─ Header Section
│  ├─ Title (Create/Edit based on mode)
│  └─ Description Text
│
├─ Profile Picture Section (Card)
│  ├─ Avatar Preview (circular, 128x128)
│  ├─ File Input (styled)
│  └─ Validation Messages
│
├─ Bio Section (Card)
│  ├─ Character Counter (dynamic color)
│  ├─ Textarea (5 rows)
│  └─ Validation Messages
│
├─ Prompts Section (Card)
│  ├─ Header
│  │  ├─ Counter Badge (X/5)
│  │  └─ Add Prompt Button
│  │
│  └─ Prompt List (dynamic)
│     └─ For each prompt:
│        ├─ Prompt Badge (#1, #2, etc)
│        ├─ Delete Button
│        ├─ Title Dropdown (predefined)
│        ├─ Answer Textarea
│        └─ Validation Messages
│
├─ Action Buttons
│  ├─ Cancel Button (navigate back)
│  └─ Submit Button (with loading state)
│
└─ Toast Notification (conditional)
   ├─ Success Toast (green)
   └─ Error Toast (red)
```

## 🔄 Data Flow

```
User Input
    ↓
Local State (useState)
    ↓
Validation (on change/submit)
    ↓
Form Submission
    ↓
API Call (profileApi.create/update)
    ↓
Response
    ↓
AuthContext Update (optimistic UI)
    ↓
Toast Notification
    ↓
Navigation (redirect to dashboard)
```

## 🎯 State Management

### Form State

```javascript
bio: string                    // Bio text
prompts: Array<{title, answer}>  // Prompts list
profilePic: File | null        // Selected image file
previewUrl: string             // Image preview URL
```

### UI State

```javascript
loading: boolean               // Form submission loading
loadingProfile: boolean        // Initial data loading
errors: Object                 // Validation errors
toast: {message, type} | null  // Toast notification
```

### Computed

```javascript
isEditing: boolean; // Auto-detected from user data
```

## 🔌 API Integration

### Profile API Service

```javascript
profileApi.getMe(); // Fetch current user
profileApi.create(formData); // Create profile
profileApi.update(formData); // Update profile
```

### Auth Context

```javascript
user; // Current user data
updateUser(data); // Optimistic update
```

## 🎨 Styling System

### Theme Colors

- **Primary Gradient**: `from-purple-600 to-pink-600`
- **Background**: `from-purple-50 to-pink-50`
- **Cards**: `bg-white` with shadows
- **Errors**: `text-red-600`, `border-red-300`
- **Success**: `bg-green-500`

### Responsive Breakpoints

- **Mobile**: Default (full width)
- **Container**: max-w-3xl (768px)
- **Cards**: Full width with padding

## 📝 Form Validation Flow

```
User inputs data
    ↓
onChange validation (immediate feedback)
    ↓
User submits form
    ↓
validateForm() runs
    ↓
If errors exist:
    - Set errors state
    - Show toast
    - Prevent submission
    ↓
If valid:
    - Build FormData
    - Submit to API
    - Handle response
```

## 🛠 Key Functions

### Image Handling

```javascript
handleImageChange(e)
    ↓ Validate file type & size
    ↓ Generate preview with FileReader
    ↓ Update state
```

### Prompts CRUD

```javascript
addPrompt()           → Push new prompt to array
updatePrompt(i, f, v) → Update specific field
deletePrompt(i)       → Filter out prompt
```

### Validation

```javascript
validateForm()
    ↓ Check bio
    ↓ Check prompts count
    ↓ Check each prompt
    ↓ Check duplicates
    ↓ Return boolean + errors
```

### Submission

```javascript
handleSubmit(e)
    ↓ Prevent default
    ↓ Validate form
    ↓ Build FormData
    ↓ API call (create/update)
    ↓ Update auth context
    ↓ Show success toast
    ↓ Navigate to dashboard
```

## 🎯 UX Features

### Loading States

1. **Initial Load**: Full-screen spinner
2. **Submit**: Button spinner + disabled state
3. **Image Upload**: Preview generation

### Error Handling

1. **Inline**: Field-level validation
2. **Global**: Toast notifications
3. **Network**: API error messages

### Success Flow

1. Toast notification (green)
2. Context update (optimistic)
3. Auto-navigation (1.5s delay)

## 📱 Mobile Optimizations

- Touch-friendly buttons (min 44px)
- Full-width inputs
- Responsive grid layout
- Stack on small screens
- Larger tap targets

## 🔐 Security

- JWT auth via axios interceptor
- File type validation
- File size limits
- XSS prevention (React escaping)
- CSRF protection (credentials)

## ⚡ Performance

- Lazy image preview generation
- Debounced validation (on change)
- Optimistic UI updates
- Single API call on submit
- Minimal re-renders
