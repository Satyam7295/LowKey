# Quick Start Guide - Profile Feature

## 🚀 How to Use

### 1. Start the Development Server

```bash
cd frontend
npm run dev
```

### 2. Access the Profile Form

#### Option A: From Dashboard

1. Login to your account
2. Navigate to `/dashboard`
3. Click "Create Profile →" button (if profile doesn't exist)
4. Or click "Edit Profile →" (if profile exists)

#### Option B: Direct URL

Navigate directly to:

- Create: `http://localhost:5173/profile/create`
- Edit: `http://localhost:5173/profile/edit`

## 📝 Filling Out the Profile

### Profile Picture

1. Click "Choose File" or drag image
2. Accepted: PNG, JPG, JPEG, WebP
3. Max size: 5MB
4. Preview appears instantly

### Bio Section

1. Write about yourself (max 500 characters)
2. Character counter shows remaining space
3. Turns red when approaching limit

### Prompts (1-5 required)

1. Click "+ Add Prompt"
2. Select a question from dropdown
3. Write your answer
4. Add up to 5 prompts total
5. Click trash icon to delete

### Submit

1. Click "Create Profile" or "Update Profile"
2. Loading spinner shows progress
3. Success toast appears
4. Auto-redirects to dashboard

## 🎨 Available Prompt Questions

1. What's your favorite hobby?
2. Dream vacation destination?
3. What makes you laugh?
4. Your guilty pleasure?
5. Best skill you have?
6. Favorite quote or motto?
7. What's your superpower?
8. Coffee or tea?
9. Morning person or night owl?
10. What are you passionate about?

## ✅ Validation Rules

| Field            | Requirement                |
| ---------------- | -------------------------- |
| Profile Picture  | Optional, but recommended  |
| Bio              | Required, 1-500 characters |
| Prompts          | 1-5 prompts required       |
| Prompt Title     | Must select from dropdown  |
| Prompt Answer    | Required, min 3 characters |
| Duplicate Titles | Not allowed                |

## 🐛 Common Issues

### "Duplicate prompt titles not allowed"

- **Fix**: Each prompt must have a unique question

### "Image must be less than 5MB"

- **Fix**: Compress your image or choose a smaller one

### "At least one prompt required"

- **Fix**: Add at least one prompt before submitting

### Submit button disabled

- **Fix**: Check for error messages and correct them

## 💡 Tips

1. **Profile Picture**: Square images work best
2. **Bio**: Be authentic and concise
3. **Prompts**: Choose questions that showcase your personality
4. **Answers**: Keep them interesting but brief (2-3 sentences)
5. **Save Often**: The form auto-saves progress on submit

## 🔄 Edit Mode

The same component handles both create and edit:

- Automatically detects if you have existing profile data
- Pre-fills all fields with current values
- Shows "Edit Your Profile" instead of "Create Your Profile"
- Update button instead of Create button

## 📱 Mobile Experience

- Fully responsive design
- Touch-friendly buttons
- Optimized for small screens
- Swipe-friendly prompts section

## 🎯 Next Steps After Creating Profile

1. View your profile on the dashboard
2. Share your profile with others
3. Browse other user profiles
4. Update prompts seasonally to keep fresh

## 📞 Need Help?

Check the comprehensive documentation in `PROFILE_FEATURE.md`
