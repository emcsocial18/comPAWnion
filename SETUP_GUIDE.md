# ComPAWnion Setup Guide

This guide will help you configure Firebase Authentication, Cloud Storage, and OpenAI for your ComPAWnion app.

---

## 🔥 Firebase Setup

### Step 1: Create a Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add project" or "Create a project"
3. Enter project name: `comPAWnion` (or your preferred name)
4. Click "Continue"
5. Optional: Enable Google Analytics (recommended)
6. Click "Create project"

### Step 2: Add a Web App to Your Project

1. In your Firebase project, click the **</>** (web) icon
2. Enter app nickname: `comPAWnion-app`
3. **DO NOT** check "Firebase Hosting" (not needed for React Native)
4. Click "Register app"
5. **IMPORTANT**: Copy the `firebaseConfig` object - you'll need this!

### Step 3: Enable Authentication

1. In Firebase Console, go to **Build** > **Authentication**
2. Click "Get started"
3. Under "Sign-in method" tab, enable **Email/Password**
4. Click on "Email/Password" provider
5. Toggle "Enable" to ON
6. Click "Save"

### Step 4: Enable Cloud Firestore

1. In Firebase Console, go to **Build** > **Firestore Database**
2. Click "Create database"
3. Choose "Start in test mode" (for development)
   - **Important**: For production, you'll need to set up security rules!
4. Choose a Cloud Firestore location (closest to your users)
5. Click "Enable"

### Step 5: Configure Your App

1. Open `src/config/firebase.js`
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY_HERE",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

**Where to find these values:**
- Firebase Console > Project Settings > General > Your apps > SDK setup and configuration
- Select "Config" option (not "CDN")
- Copy the values from the `firebaseConfig` object

### Step 6: Set Up Firestore Security Rules (Production)

For production, update Firestore rules:

1. Go to **Firestore Database** > **Rules** tab
2. Replace with these rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click "Publish"

---

## 🤖 OpenAI Setup

### Step 1: Create an OpenAI Account

1. Go to https://platform.openai.com/signup
2. Sign up with email or Google account
3. Verify your email address
4. Add payment method (if required)
   - **Note**: New accounts get free credits ($5-$18)
   - After free credits, it's pay-as-you-go

### Step 2: Get Your API Key

1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Give it a name: `comPAWnion-key`
4. **IMPORTANT**: Copy the key immediately (starts with `sk-`)
5. **You won't be able to see it again!** Store it securely

### Step 3: Configure Your App

1. Open `src/services/ai.js`
2. Find line with `const API_KEY`
3. Replace the placeholder:

```javascript
const API_KEY = 'sk-your-actual-openai-api-key-here';
```

4. Change `USE_REAL_AI` to `true`:

```javascript
const USE_REAL_AI = true; // Set to true to use OpenAI
```

### Step 4: Understand Costs

- **Model**: GPT-3.5-Turbo
- **Cost**: ~$0.002 per message (~$0.001 input + $0.001 output)
- **Example**: $5 credit = ~2,500 chat messages
- **Free tier**: New accounts get $5-$18 in free credits (expires after 3 months)

**Cost Optimization Tips:**
- The app limits responses to 150 tokens (keeping costs low)
- Only chat messages use the API (not navigation, profiles, etc.)
- If you run out of credits, app falls back to offline responses

---

## 🧪 Testing Your Setup

### Test Firebase Authentication

1. Run your app: `npx expo start`
2. Open on your device via Expo Go
3. Try signing up with a test email
4. Check Firebase Console > Authentication > Users
5. You should see your test user!

### Test Cloud Firestore

1. Create a pet in the app
2. Go to Firebase Console > Firestore Database
3. Navigate to: `users > [your-user-id] > data > pets`
4. You should see your pet data!

### Test OpenAI

1. Make sure you added your API key
2. Set `USE_REAL_AI = true` in `ai.js`
3. Open a chat with your pet
4. Send a message like "How are you feeling today?"
5. You should get a conversational response!

**If it doesn't work:**
- Check the API key is correct (starts with `sk-`)
- Check you have credits remaining: https://platform.openai.com/usage
- Look for errors in the terminal/console

---

## 🚨 Troubleshooting

### Firebase Errors

**Error: "Permission denied"**
- Make sure you're signed in
- Check Firestore security rules
- Verify user ID matches in rules

**Error: "Firebase not initialized"**
- Check `firebase.js` config is filled out
- Verify all values are correct (no placeholders)
- Restart your app after changing config

### OpenAI Errors

**Error: "Invalid API key"**
- Double-check the key starts with `sk-`
- Make sure there are no extra spaces
- Generate a new key if needed

**Error: "Insufficient credits"**
- Check usage: https://platform.openai.com/usage
- Add payment method to continue

**Offline Fallback**
- If OpenAI fails, app automatically uses enhanced pattern-based responses
- No error shown to user - seamless fallback

---

## 🔒 Security Best Practices

### API Key Security

**❌ DON'T:**
- Commit API keys to GitHub
- Share API keys publicly
- Use production keys in development

**✅ DO:**
- Use environment variables for production
- Create separate keys for dev/prod
- Rotate keys periodically
- Set up usage limits in OpenAI dashboard

### Firebase Security

**For Production:**
1. Enable App Check (prevents unauthorized access)
2. Set up proper Firestore rules
3. Enable 2FA on your Firebase account
4. Use environment variables for config
5. Monitor usage in Firebase Console

---

## 📱 Next Steps

1. ✅ Complete Firebase and OpenAI setup above
2. Test authentication (signup/login)
3. Test cloud sync (create pet, check Firestore)
4. Test AI chat (send messages)
5. Add multiple pets (Settings > Manage Pets)
6. Export/import data as backup
7. Customize your pets!

---

## 💡 Tips

- **Development**: Use test mode for Firestore (easier testing)
- **Production**: Update security rules before launch
- **Costs**: Monitor OpenAI usage dashboard
- **Backup**: Use app's export feature regularly
- **Offline**: App works without internet (local storage only)

---

## 📞 Need Help?

Common issues:
- Firebase not connecting → Check config in `firebase.js`
- Auth not working → Verify Email/Password is enabled
- Cloud sync failing → Check Firestore rules
- AI not responding → Verify API key and credits
- Can't create pets → Check AsyncStorage permissions

---

**You're all set! 🎉**

Restart your app after configuration:
```bash
npx expo start --clear
```

Then open in Expo Go and test your new features!
