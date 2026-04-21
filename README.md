# 🐾 ChibiHabits

**ChibiHabits** is an adorable, gamified habit tracker designed to help you build better routines with the help of cute companions. Inspired by "Chiikawa," the app transforms habit building into a social adventure where you care for pets, earn rewards, and support your buddies.

## ✨ Features

- **Gamified Habit Tracking**: Earn EXP for your pet and coins for yourself by completing daily and one-time tasks.
- **Pet Care & Evolution**: Level up your pet (Chiikawa, Hachiware, or Usagi). Watch them grow and thrive as you stay consistent.
- **Buddy System**: Link up with a friend! Nudge them when they're falling behind and celebrate milestones together.
- **The Town Square**: See your friends' avatars in a live virtual town, wave to them, and see what habits they're currently working on.
- **Item Shop**: Spend your hard-earned coins on cute accessories and furniture for your character.

## 🛠 Tech Stack

- **Frontend**: React (Web) / React Native & Expo (Mobile)
- **Styling**: Tailwind CSS / NativeWind
- **Backend**: Firebase (Firestore, Authentication, Analytics, Messaging)
- **Animations**: Framer Motion / Moti
- **Icons**: Lucide React

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- Firebase CLI (`npm install -g firebase-tools`)

### Setup
1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/chibihabits.git
   cd chibihabits
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Firebase Setup**:
   - Create a project at [Firebase Console](https://console.firebase.google.com/).
   - Enable **Firestore**, **Authentication** (Google, Email), and **Hosting**.
   - Copy your Firebase config into `firebase-applet-config.json`.
   - For web push notifications, add `VITE_FIREBASE_VAPID_KEY` to your `.env.local` file (from Firebase Console -> Cloud Messaging -> Web Push certificates).

4. **Run the app**:
   ```bash
   npm run dev
   ```

## 📦 Deployment

### Web (Firebase Hosting)
```bash
npm run build
firebase deploy
```

### Mobile (Expo)
To build for iOS and Android:
1. Initialize EAS: `eas build:configure`
2. Build: `eas build --platform all`

## 🛡 Security
Security rules are predefined in `firestore.rules`. These include:
- **Identity Protection**: Users can only modify their own data.
- **Buddy Privacy**: Only linked buddies can see each other's shared habits.
- **Input Validation**: Strict schema enforcement to prevent database poisoning.

## 📜 License
MIT License - feel free to use and remix!
