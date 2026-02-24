# comPAWnion 🐾

ComPawnion — a minimalist, gentle companion app for remembering pets or creating virtual PawPals.

## Overview

comPAWnion helps users cherish the memories of their deceased pets or create virtual pet companions (PawPals). Built with emotional care, the app provides a calming, easy-to-use experience for pet lovers.

## Features

### Core Features (Free)
- **Pet Profiles**: Create profiles with photos, personality traits, habits, and more
- **AI Chat**: Converse with your memorial pet or virtual PawPal
- **Memories Timeline**: Store and browse cherished memories with photos
- **Save Chat Messages**: Convert special chat moments into saved memories

### Premium Features
- **Ad-Free Experience**: Remove all advertisements
- **Pet Customization**: Advanced appearance customization options
- **Memory Walks**: Guided walks with your virtual companion
- **Rainbow Bridge**: Shared memorial space for invited users

## Quick Start

1. Install Expo CLI: `npm install -g expo-cli`
2. Install dependencies (recommended using `expo install` for native deps):

```bash
npm install
expo install expo-image-picker @react-native-async-storage/async-storage react-native-screens react-native-safe-area-context
```

3. Start the app (recommended using LAN to avoid ngrok issues):

```powershell
cd "C:\Users\corpu\Desktop\APP CODING"
# Preferred: use npx (no global install required)
npx expo start --lan

# or use npm scripts added to this project:
npm run start:lan

# To use tunnel (may attempt to install ngrok):
npx expo start --tunnel
```

## Navigation Structure

Bottom tab navigation with 6 tabs:
- 🏠 **Home**: Main dashboard with pet info and quick actions
- 📖 **Memories**: Timeline of all saved memories
- 🐾 **Pet Profile**: View and edit pet information
- 🔒 **Memory Walks**: Guided walks (Premium feature)
- 🔒 **Rainbow Bridge**: Memorial space (Premium feature)
- ⚙️ **Settings**: Premium status, donations, preferences

## App Flows

1. **First Launch**: 
   - Splash screen → Onboarding → Pet Profile setup → Main app

2. **Remember a Pet**:
   - Choose "Remember a Pet" → Enter pet details → Access comforting chat interface

3. **Create Virtual PawPal**:
   - Choose "Create Virtual PawPal" → Enter pet details → Access playful chat interface

4. **Add Memories**:
   - From Memories tab → Add Memory → Enter text and optional photo → Save

5. **Chat & Save**:
   - Chat with pet → Long-press pet message → Save as memory

## Project Structure

```
APP CODING/
├── App.js                 # Main entry point
├── app.json              # Expo configuration
├── package.json          # Dependencies
├── assets/               # Images and assets
└── src/
    ├── components/       # Reusable UI components
    │   ├── AdBanner.js
    │   ├── ChatBox.js
    │   ├── MemoryCard.tsx
    │   ├── PetAvatar.tsx
    │   └── PremiumLock.tsx
    ├── context/          # Global state management
    │   ├── AppContext.js
    │   └── PremiumContext.tsx
    ├── models/           # Data models
    │   ├── pet.js
    │   └── memory.js
    ├── navigation/       # Navigation configuration
    │   └── AppNavigator.tsx
    ├── screens/          # All app screens
    │   ├── OnboardingScreen.js
    │   ├── SplashScreen.js
    │   ├── HomeScreen.js
    │   ├── ChatScreen.tsx
    │   ├── PetProfileScreen.js
    │   ├── MemoriesScreen.js
    │   ├── AddMemoryScreen.js
    │   ├── SettingsScreen.js
    │   ├── CustomizationScreen.tsx
    │   ├── MemoryWalksScreen.tsx
    │   └── RainbowBridgeScreen.tsx
    ├── services/         # External services
    │   └── ai.js         # AI chat service (mock, ready for API)
    ├── utils/            # Utility functions
    │   └── storage.js
    └── theme.js          # Color palette and styling
```

## Design Philosophy

- **Minimalist**: Clean, uncluttered interfaces
- **Emotionally Gentle**: Soft colors, calming tones  
- **Respectful**: Handles sensitive memories with care
- **Accessible**: Easy for non-technical users

### Color Palette

```javascript
{
  background: '#fffaf6',  // Warm off-white
  primary: '#8eb6b9',     // Soft teal
  secondary: '#b08bb0',   // Gentle purple
  muted: '#c9d6d6',       // Light gray-blue
  text: '#2b2b2b',        // Dark gray
  subtext: '#666'         // Medium gray
}
```

## Troubleshooting

- If `npx` or `npm` isn't recognized, restart your terminal or run `RefreshEnv` in PowerShell after installing Node.
- If `expo start --tunnel` fails with an ngrok install error, use `--lan` instead to avoid automatic ngrok installation.
- If you see warnings about the legacy global `expo-cli`, prefer `npx expo ...` (the new CLI is bundled with the `expo` package).
- To run dependency checks and try to auto-fix mismatches:

```powershell
# install expo-doctor locally if needed
npm install --save-dev expo-doctor
npm run doctor
```

## Development

### Adding New Features

1. **New Screens**: Add to `src/screens/` and register in `AppNavigator.tsx`
2. **New Components**: Create in `src/components/`
3. **Data Models**: Extend models in `src/models/`
4. **Global State**: Add to `AppContext.js`

### AI Integration

The app includes a mock AI service at `src/services/ai.js`. To integrate a real AI:

```javascript
// src/services/ai.js
export async function respond(petData, message) {
  const response = await fetch('YOUR_AI_API_ENDPOINT', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pet: petData, message })
  });
  return await response.json();
}
```

Update `ChatScreen.tsx` to use the service:

```javascript
import { respond } from '../services/ai';

const petResponse = await respond(pet, input);
```

### Monetization Setup

For production deployment:

1. **Ads**: Integrate AdMob (placeholder: `AdBanner.js`)
2. **In-App Purchases**: Use Expo In-App Purchases or RevenueCat
3. **Donations**: Integrate payment gateway (Stripe, PayPal, etc.)

## Data Storage

All data is stored locally using AsyncStorage:
- **Premium status**: '@premium'
- **Pet profile**: '@pet'
- **Memories**: '@memories'
- **Onboarding status**: '@onboarding_done'

For production, consider:
- Cloud backup integration
- Multi-device sync
- Data export/import features

## Future Enhancements

- [ ] Advanced AI personality matching
- [ ] Cloud sync and backup
- [ ] Photo albums for pets
- [ ] Share memories with family/friends
- [ ] Grief support resources
- [ ] Multiple pet profiles
- [ ] Voice messages
- [ ] Animated pet avatars
- [ ] Widget support
- [ ] Push notifications for daily reflection

## Notes

- This scaffold uses AsyncStorage for local data and mock AI chat responses.
- The app includes a complete onboarding flow and pluggable mock AI at `src/services/ai.js`.
- Replace the `AdBanner` placeholder in `src/components/AdBanner.js` with a real ad provider (AdMob) when ready.
- Premium features are locked behind a paywall UI but can be unlocked via Settings for testing.

## Tips

- For production icons and splash images, add properly sized assets to `assets/` and update `app.json`.
- Test the app on both iOS and Android to ensure consistent UX
- Consider adding analytics to track user engagement
- Implement proper error handling for production

---

Built with ❤️ for pet lovers everywhere
