import React, { useState, useEffect, useMemo, Component, useRef } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  getDocs,
  orderBy,
  limit,
  addDoc,
  serverTimestamp,
  or,
  and,
  writeBatch,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Check, 
  X, 
  Trophy, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  Heart, 
  Droplets, 
  BookOpen, 
  Moon, 
  Sun,
  MessageCircle,
  Send,
  UserPlus,
  Search,
  Bell,
  Sparkles,
  Star,
  Eye,
  EyeOff,
  Facebook,
  User,
  ArrowLeft,
  Flame,
  Pencil,
  Clock,
  Calendar,
  Smile,
  Menu,
  Map,
  Globe,
  Share2,
  Backpack,
  UserMinus,
  TrendingUp,
} from 'lucide-react';
import { format, startOfToday, subDays, eachDayOfInterval, isSameDay, parseISO, addMinutes, startOfWeek, addDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { 
  auth, 
  db, 
  messaging,
  signInWithGoogle, 
  signInWithFacebook,
  logout, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInAnonymously,
  linkWithPopup,
  fetchSignInMethodsForEmail,
  GoogleAuthProvider
} from './firebase';
import { getToken } from 'firebase/messaging';
import { useAuth, useFirestoreCollection, OperationType, handleFirestoreError } from './hooks/useFirebase';
import { UserProfile, Habit, CheckIn, Message, Nudge } from './types';
import chiikawaImage from './Remove background project.png';
import { playClickSound, playSuccessSound, playNotificationSound, playHappySound, playEatSound } from './utils/sounds';

const characterThemes = {
  chiikawa: { 
    name: 'Chiikawa', 
    bg: 'bg-chibi-bg', 
    border: 'border-chibi-accent', 
    accent: 'bg-chibi-accent', 
    text: 'text-chibi-text',
    lightText: 'text-chibi-text/60',
    mutedText: 'text-[#ecc9cf]',
    buttonBg: 'bg-chibi-accent',
    buttonText: 'text-white',
    cardBg: 'bg-white',
    inputBg: 'bg-white',
    secondaryBg: 'bg-chibi-bg/50',
    mutedBg: 'bg-[#f4e2e5]',
    navActive: 'bg-[#ecc9cf]',
    navHover: 'bg-[#f4e2e5]',
    shadow: 'shadow-[#ecc9cf]/20',
    ring: 'focus:ring-[#f4e2e5]'
  },
  hachiware: { 
    name: 'Hachiware', 
    bg: 'bg-indigo-50', 
    border: 'border-indigo-200', 
    accent: 'bg-indigo-500', 
    text: 'text-indigo-600',
    lightText: 'text-indigo-400',
    mutedText: 'text-indigo-300',
    buttonBg: 'bg-indigo-500',
    buttonText: 'text-white',
    cardBg: 'bg-white',
    inputBg: 'bg-indigo-50/50',
    secondaryBg: 'bg-indigo-50/50',
    mutedBg: 'bg-indigo-50',
    navActive: 'bg-indigo-100',
    navHover: 'bg-indigo-50',
    shadow: 'shadow-indigo-100/20',
    ring: 'focus:ring-indigo-50'
  },
  usagi: { 
    name: 'Usagi', 
    bg: 'bg-yellow-50', 
    border: 'border-yellow-200', 
    accent: 'bg-yellow-500', 
    text: 'text-yellow-600',
    lightText: 'text-yellow-400',
    mutedText: 'text-yellow-300',
    buttonBg: 'bg-yellow-500',
    buttonText: 'text-white',
    cardBg: 'bg-white',
    inputBg: 'bg-yellow-50/50',
    secondaryBg: 'bg-yellow-50/50',
    mutedBg: 'bg-yellow-50',
    navActive: 'bg-yellow-100',
    navHover: 'bg-yellow-50',
    shadow: 'shadow-yellow-100/20',
    ring: 'focus:ring-yellow-50'
  }
};

const CHARACTER_IMAGES = {
  chiikawa: 'https://pngfre.com/wp-content/uploads/anime-260.png',
  hachiware: 'https://shadowverse.com/public/images/pc/collaboration/chiikawa/common/suy5yf2aa/skin_cha_main_2.png?202209160152',
  usagi: 'https://static.wikia.nocookie.net/a5b7f838-2194-495b-a8a0-9b68ee60caac/scale-to-width/755'
};

const AppleHoodSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md absolute top-0 left-0 pointer-events-none z-20" style={{ transform: 'scale(1.4) translateY(-10%)' }}>
    <path d="M 10 50 C 10 10, 90 10, 90 50 C 90 80, 70 95, 50 95 C 30 95, 10 80, 10 50 Z" fill="#ef4444" stroke="#7f1d1d" strokeWidth="4" />
    <path d="M 50 15 Q 60 5 70 10" fill="none" stroke="#15803d" strokeWidth="6" strokeLinecap="round" />
    <path d="M 50 15 Q 40 5 30 10" fill="none" stroke="#15803d" strokeWidth="6" strokeLinecap="round" />
    <circle cx="50" cy="50" r="35" fill="transparent" stroke="#fca5a5" strokeWidth="8" strokeDasharray="10 10" />
  </svg>
);

const ButterflyWingsSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md opacity-90 absolute top-0 left-0 pointer-events-none z-0" style={{ transform: 'scale(1.8) translateY(10%)' }}>
    <path d="M 50 50 Q 20 10 10 40 Q 0 70 30 80 Z" fill="#fde047" stroke="#ca8a04" strokeWidth="3" />
    <path d="M 50 50 Q 80 10 90 40 Q 100 70 70 80 Z" fill="#fde047" stroke="#ca8a04" strokeWidth="3" />
    <circle cx="25" cy="45" r="5" fill="#ca8a04" />
    <circle cx="75" cy="45" r="5" fill="#ca8a04" />
  </svg>
);

const MotorcycleSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg absolute top-0 left-0 pointer-events-none z-30" style={{ transform: 'scale(1.5) translateY(30%)' }}>
    <circle cx="25" cy="75" r="15" fill="#333" stroke="#111" strokeWidth="4" />
    <circle cx="25" cy="75" r="8" fill="#ccc" />
    <circle cx="75" cy="75" r="15" fill="#333" stroke="#111" strokeWidth="4" />
    <circle cx="75" cy="75" r="8" fill="#ccc" />
    <path d="M 25 75 L 40 45 L 70 45 L 85 75" fill="none" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 35 45 L 30 30 L 20 30" fill="none" stroke="#9ca3af" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M 65 45 L 70 35 L 85 35" fill="none" stroke="#9ca3af" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="45" y="40" width="20" height="10" fill="#111" rx="3" />
  </svg>
);

const BookStackHatSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md absolute top-0 left-0 pointer-events-none z-20" style={{ transform: 'scale(1.2) translateY(-40%)' }}>
    <rect x="25" y="60" width="50" height="15" fill="#fde047" stroke="#422006" strokeWidth="3" rx="2" />
    <rect x="25" y="60" width="50" height="5" fill="#fef08a" stroke="#422006" strokeWidth="1" rx="2" />
    <rect x="30" y="45" width="40" height="15" fill="#bae6fd" stroke="#422006" strokeWidth="3" rx="2" />
    <rect x="30" y="45" width="40" height="5" fill="#e0f2fe" stroke="#422006" strokeWidth="1" rx="2" />
    <path d="M 35 45 L 50 20 L 65 45 Z" fill="#fbcfe8" stroke="#422006" strokeWidth="3" strokeLinejoin="round" />
    <path d="M 35 45 L 50 20 L 55 45 Z" fill="#fce7f3" stroke="#422006" strokeWidth="1" strokeLinejoin="round" />
  </svg>
);

const GlassesSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm absolute top-0 left-0 pointer-events-none z-20" style={{ transform: 'scale(0.8) translateY(0%)' }}>
    <circle cx="35" cy="50" r="15" fill="none" stroke="#b45309" strokeWidth="6" />
    <circle cx="65" cy="50" r="15" fill="none" stroke="#b45309" strokeWidth="6" />
    <path d="M 48 50 Q 50 45 52 50" fill="none" stroke="#b45309" strokeWidth="6" strokeLinecap="round" />
    <path d="M 20 50 Q 10 45 5 40" fill="none" stroke="#b45309" strokeWidth="6" strokeLinecap="round" />
    <path d="M 80 50 Q 90 45 95 40" fill="none" stroke="#b45309" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

const StrawHatSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md absolute top-0 left-0 pointer-events-none z-20" style={{ transform: 'scale(1.0) translateY(-15%)' }}>
    <ellipse cx="50" cy="65" rx="45" ry="15" fill="#fde047" stroke="#422006" strokeWidth="3" />
    <path d="M 20 60 C 20 20, 80 20, 80 60 Z" fill="#fef08a" stroke="#422006" strokeWidth="3" />
    <path d="M 21 55 Q 50 65 79 55 L 80 60 Q 50 70 20 60 Z" fill="#4ade80" stroke="#422006" strokeWidth="2" />
    <g transform="translate(70, 45) scale(0.8)">
      <circle cx="0" cy="0" r="15" fill="#fbbf24" stroke="#422006" strokeWidth="2" />
      <circle cx="0" cy="0" r="5" fill="#422006" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
        <ellipse key={angle} cx="0" cy="-15" rx="4" ry="8" fill="#fef08a" stroke="#422006" strokeWidth="1" transform={`rotate(${angle})`} />
      ))}
    </g>
  </svg>
);

const SuitSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm absolute top-0 left-0 pointer-events-none z-20" style={{ transform: 'scale(0.85) translateY(45%)' }}>
    <path d="M 20 40 C 20 80, 80 80, 80 40 Z" fill="#4b5563" stroke="#1f2937" strokeWidth="3" />
    <path d="M 40 40 L 50 60 L 60 40 Z" fill="#ffffff" stroke="#1f2937" strokeWidth="2" />
    <path d="M 48 45 L 52 45 L 50 65 Z" fill="#1e3a8a" stroke="#1f2937" strokeWidth="1" />
    <path d="M 30 40 L 40 60 L 25 55 Z" fill="#374151" stroke="#1f2937" strokeWidth="2" />
    <path d="M 70 40 L 60 60 L 75 55 Z" fill="#374151" stroke="#1f2937" strokeWidth="2" />
  </svg>
);

const GuitarSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md absolute top-0 left-0 pointer-events-none z-30" style={{ transform: 'scale(1.3) translateY(20%) translateX(10%)' }}>
    <rect x="40" y="30" width="40" height="6" fill="#fcd34d" stroke="#422006" strokeWidth="2" transform="rotate(-20 40 30)" />
    <path d="M 20 60 C 10 40, 40 30, 50 50 C 60 70, 30 80, 20 60 Z" fill="#1f2937" stroke="#000000" strokeWidth="3" />
    <path d="M 25 55 C 20 45, 35 40, 40 50 C 45 60, 30 65, 25 55 Z" fill="#ffffff" stroke="#000000" strokeWidth="1" />
    <rect x="75" y="15" width="15" height="10" fill="#fcd34d" stroke="#422006" strokeWidth="2" transform="rotate(-20 75 15)" rx="2" />
  </svg>
);

const ITEM_COMPONENTS: Record<string, React.ReactNode> = {
  apple_hood: <AppleHoodSVG />,
  butterfly_wings: <ButterflyWingsSVG />,
  motorcycle: <MotorcycleSVG />,
  book_stack: <BookStackHatSVG />,
  glasses: <GlassesSVG />,
  straw_hat: <StrawHatSVG />,
  suit: <SuitSVG />,
  guitar: <GuitarSVG />,
};

const LayeredAvatar = ({ character, equippedHat, equippedFace, equippedClothing, equippedHand, equippedBack, equippedVehicle, isEating, className = "w-12 h-12" }: { character: string, equippedHat?: string, equippedFace?: string, equippedClothing?: string, equippedHand?: string, equippedBack?: string, equippedVehicle?: string, isEating?: boolean, className?: string }) => {
  return (
    <div className={`relative ${className}`}>
      {equippedBack && ITEM_COMPONENTS[equippedBack] && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          {ITEM_COMPONENTS[equippedBack]}
        </div>
      )}
      {equippedVehicle && ITEM_COMPONENTS[equippedVehicle] && (
        <div className="absolute inset-0 z-30 pointer-events-none">
          {ITEM_COMPONENTS[equippedVehicle]}
        </div>
      )}
      {equippedClothing && ITEM_COMPONENTS[equippedClothing] && (
        <div className="absolute inset-0 z-15 pointer-events-none">
          {ITEM_COMPONENTS[equippedClothing]}
        </div>
      )}
      <motion.img 
        animate={isEating ? {
          scale: [1, 1.2, 1, 1.2, 1],
          rotate: [0, -5, 5, -5, 0]
        } : { 
          y: [0, -5, 0],
          scale: [1, 1.05, 1]
        }}
        transition={isEating ? { duration: 0.5 } : { repeat: Infinity, duration: 3 }}
        src={CHARACTER_IMAGES[character as keyof typeof CHARACTER_IMAGES]} 
        className="w-full h-full object-contain relative z-10" 
        alt="Pet" 
        referrerPolicy="no-referrer"
      />
      {equippedFace && ITEM_COMPONENTS[equippedFace] && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {ITEM_COMPONENTS[equippedFace]}
        </div>
      )}
      {equippedHand && ITEM_COMPONENTS[equippedHand] && (
        <div className="absolute inset-0 z-25 pointer-events-none">
          {ITEM_COMPONENTS[equippedHand]}
        </div>
      )}
      {equippedHat && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {ITEM_COMPONENTS[equippedHat] || (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl">
              {equippedHat === 'party_hat' ? '🥳' : equippedHat === 'crown' ? '👑' : equippedHat}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const landingTheme = {
  name: 'Landing',
  bg: 'bg-sky-50',
  border: 'border-sky-200',
  accent: 'bg-sky-400',
  text: 'text-sky-600',
  lightText: 'text-sky-400',
  mutedText: 'text-sky-300',
  buttonBg: 'bg-sky-400',
  buttonText: 'text-white',
  cardBg: 'bg-white',
  inputBg: 'bg-sky-50/50',
  secondaryBg: 'bg-sky-50/50',
  mutedBg: 'bg-sky-50',
  navActive: 'bg-sky-100',
  navHover: 'bg-sky-50',
  shadow: 'shadow-sky-100/20',
  ring: 'focus:ring-sky-50'
};

// --- UI Components ---

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends Component<any, any> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "Something went wrong.";
      try {
        const parsedError = JSON.parse(this.state.error.message);
        errorMessage = `Firestore Error: ${parsedError.operationType} on ${parsedError.path} failed. ${parsedError.error}`;
      } catch (e) {
        errorMessage = this.state.error?.message || String(this.state.error);
      }

      return (
        <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-4 border-red-100 max-w-md w-full">
            <X size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-gray-800 mb-2">Oops!</h2>
            <p className="text-gray-600 mb-6 font-bold">{errorMessage}</p>
            <ChiikawaButton onClick={() => window.location.reload()} className="w-full bg-red-400 hover:bg-red-500 shadow-red-200">
              Reload App
            </ChiikawaButton>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

const GoogleLogo = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const FacebookLogo = () => (
  <Facebook className="w-6 h-6 text-[#1877F2]" fill="currentColor" />
);

const GuestLogo = () => (
  <User className="w-6 h-6 text-emerald-500" fill="currentColor" />
);

function FloatingDecoration({ children, className, delay = 0, duration = 3 }: { children: React.ReactNode, className?: string, delay?: number, duration?: number }) {
  return (
    <motion.div
      initial={{ y: 0, opacity: 0 }}
      animate={{ 
        y: [0, -20, 0],
        opacity: [0.4, 0.8, 0.4],
        scale: [1, 1.1, 1]
      }}
      transition={{ 
        duration, 
        repeat: Infinity, 
        delay,
        ease: "easeInOut" 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ChiikawaBackground({ theme }: { theme?: any }) {
  const accentColor = theme?.accent ? theme.accent.replace('bg-', '') : 'sky';
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Soft Gradients */}
      <div className={`absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-${accentColor}-100 rounded-full blur-[120px] opacity-60 animate-pulse`} />
      <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-pink-100 rounded-full blur-[120px] opacity-60 animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-yellow-50 rounded-full blur-[100px] opacity-40 animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Animated Clouds */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`cloud-${i}`}
          initial={{ x: -200, opacity: 0 }}
          animate={{ 
            x: ['100vw', '-20vw'],
            opacity: [0, 0.4, 0.4, 0]
          }}
          transition={{ 
            duration: 20 + i * 5, 
            repeat: Infinity, 
            ease: "linear",
            delay: i * 4
          }}
          className="absolute bg-white rounded-full blur-3xl"
          style={{ 
            top: `${10 + i * 15}%`, 
            width: `${200 + i * 50}px`, 
            height: `${80 + i * 20}px` 
          }}
        />
      ))}

      {/* Floating Bubbles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`bubble-${i}`}
          initial={{ y: '110vh', opacity: 0 }}
          animate={{ 
            y: '-10vh',
            opacity: [0, 0.3, 0],
            x: [0, Math.sin(i) * 50, 0]
          }}
          transition={{ 
            duration: 10 + Math.random() * 10, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: Math.random() * 10
          }}
          className="absolute w-8 h-8 rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-[2px]"
          style={{ left: `${Math.random() * 100}%` }}
        />
      ))}

      {/* Floating Icons */}
      <FloatingDecoration className="absolute top-[10%] left-[15%] text-yellow-300/40" delay={0} duration={6}>
        <Star size={64} fill="currentColor" />
      </FloatingDecoration>
      <FloatingDecoration className="absolute top-[25%] right-[10%] text-pink-300/40" delay={1.5} duration={7}>
        <Heart size={48} fill="currentColor" />
      </FloatingDecoration>
      <FloatingDecoration className="absolute bottom-[20%] left-[10%] text-yellow-300/40" delay={3} duration={5}>
        <Sparkles size={56} />
      </FloatingDecoration>
      <FloatingDecoration className="absolute bottom-[10%] right-[20%] text-yellow-200/40" delay={4.5} duration={8}>
        <Star size={40} fill="currentColor" />
      </FloatingDecoration>
      
      {/* Small Sparkles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.2, 0.5],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 2 + Math.random() * 3, 
            repeat: Infinity, 
            delay: Math.random() * 5 
          }}
          className="absolute text-yellow-300/60"
          style={{ 
            top: `${Math.random() * 100}%`, 
            left: `${Math.random() * 100}%` 
          }}
        >
          <Sparkles size={10 + Math.random() * 15} />
        </motion.div>
      ))}
    </div>
  );
}

const ChiikawaCard = ({ children, className = "", onClick, theme, style }: { children: React.ReactNode, className?: string, onClick?: () => void, key?: string | number, theme?: any, style?: React.CSSProperties }) => {
  const activeTheme = theme || characterThemes.chiikawa;
  return (
    <motion.div 
      whileHover={onClick ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`bg-white rounded-[2.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-4 ${activeTheme.border}/20 ${className}`}
      style={style}
    >
      {children}
    </motion.div>
  );
};

const ChiikawaButton = ({ children, onClick, variant = 'primary', className = "", disabled = false, theme }: { children: React.ReactNode, onClick?: () => void, variant?: 'primary' | 'secondary' | 'outline', className?: string, disabled?: boolean, theme?: any }) => {
  const activeTheme = theme || characterThemes.chiikawa;
  const variants = {
    primary: `${activeTheme.buttonBg} ${activeTheme.buttonText} hover:opacity-90 ${activeTheme.shadow}`,
    secondary: 'bg-indigo-400 text-white hover:bg-indigo-500 shadow-indigo-200',
    outline: `bg-white ${activeTheme.text} border-2 ${activeTheme.border} hover:${activeTheme.bg}`
  };

  const handleClick = () => {
    playClickSound();
    if (onClick) onClick();
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      disabled={disabled}
      className={`px-6 py-3 rounded-full font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
};

// --- Main App ---

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function LoadingScreen({ message, theme }: { message?: React.ReactNode, theme?: any }) {
  const activeTheme = theme || landingTheme;
  return (
    <div className={`min-h-screen ${activeTheme.bg} flex items-center justify-center flex-col gap-12 overflow-hidden`}>
      <div className="relative flex flex-col items-center" style={{ perspective: '1000px' }}>
        {/* Running Chiikawa with 3D rotation */}
        <motion.div 
          animate={{ 
            y: [0, -40, 0],
            rotateY: [-20, 20, -20],
            rotateX: [5, -5, 5]
          }} 
          transition={{ 
            repeat: Infinity, 
            duration: 0.8, 
            ease: "easeInOut" 
          }}
          className="w-40 h-40 flex items-center justify-center relative z-10"
        >
          <img 
            src="https://www.chiikawa.run/images/figure-1.png" 
            className="w-full h-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)]"
            alt="Running Chiikawa"
            referrerPolicy="no-referrer"
          />
        </motion.div>

        {/* 3D Ground Shadow */}
        <motion.div
          animate={{
            scale: [1, 0.6, 1],
            opacity: [0.3, 0.1, 0.3]
          }}
          transition={{
            repeat: Infinity,
            duration: 0.8,
            ease: "easeInOut"
          }}
          className="absolute -bottom-4 w-24 h-4 bg-black/10 rounded-[100%] blur-md"
        />
      </div>

      <div className="text-center">
        <div className={`${activeTheme.text} font-black text-xl animate-pulse tracking-widest uppercase whitespace-pre-line`}>
          {message || "Loading..."}
        </div>
        <div className="mt-2 flex justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
              className={`w-2 h-2 ${activeTheme.accent} rounded-full`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChiikawaLoader({ size = 16, className = "" }: { size?: number, className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <motion.div
        animate={{ 
          y: [0, -10, 0],
          rotateY: [-10, 10, -10]
        }}
        transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
        className="relative"
      >
        <img 
          src={CHARACTER_IMAGES.chiikawa} 
          style={{ width: size * 4, height: size * 4 }}
          className="object-contain drop-shadow-sm"
          alt="Loading..."
          referrerPolicy="no-referrer"
        />
        <motion.div
          animate={{ scale: [1, 0.6, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-full h-1 bg-black/10 rounded-full blur-[2px]"
        />
      </motion.div>
    </div>
  );
}

function CharacterSelectionScreen({ user, onComplete, onError }: { user: any, onComplete: () => void, onError: () => void }) {
  const [selected, setSelected] = useState<'chiikawa' | 'hachiware' | 'usagi'>('chiikawa');
  
  // Default theme for selection (Baby Blue)
  const theme = landingTheme;

  const characters = [
    { id: 'chiikawa', name: 'Chiikawa', img: CHARACTER_IMAGES.chiikawa, color: 'bg-pink-400', desc: 'Kind and brave!' },
    { id: 'hachiware', name: 'Hachiware', img: CHARACTER_IMAGES.hachiware, color: 'bg-indigo-400', desc: 'Smart and helpful!' },
    { id: 'usagi', name: 'Usagi', img: CHARACTER_IMAGES.usagi, color: 'bg-yellow-400', desc: 'Energetic and wild!' }
  ];

  const handleSelect = async () => {
    onComplete();
    
    // Determine initial display name based on provider or email
    let initialDisplayName = user.displayName;
    if (!initialDisplayName) {
      if (user.email) {
        // Use the part before @ in email
        initialDisplayName = user.email.split('@')[0];
      } else if (user.isAnonymous) {
        // Randomly assign a cute name for anonymous users
        const adjectives = ['Happy', 'Brave', 'Kind', 'Smart', 'Energetic', 'Sleepy', 'Hungry', 'Cute', 'Tiny'];
        const nouns = ['Buddy', 'Friend', 'Habit', 'Star', 'Pet', 'Chiikawa', 'Hachiware', 'Usagi'];
        const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
        const randomNum = Math.floor(Math.random() * 1000);
        initialDisplayName = `${randomAdj}${randomNoun}${randomNum}`;
      } else {
        initialDisplayName = `${selected.charAt(0).toUpperCase() + selected.slice(1)} Fan`;
      }
    }

    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: initialDisplayName,
      photoURL: user.photoURL || '',
      petExp: 0,
      petLevel: 1,
      character: selected
    };
    try {
      await setDoc(doc(db, 'users', user.uid), newProfile);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'users');
      onError();
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} flex flex-col items-center justify-center p-6 overflow-hidden relative`}>
      <ChiikawaBackground theme={theme} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white/90 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl border-4 border-white relative z-10 text-center"
      >
        <h2 className={`text-3xl font-black ${theme.text} mb-2`}>Choose Your Buddy!</h2>
        <p className="text-gray-400 font-bold mb-8">Who will help you build habits today?</p>

        <div className="flex gap-4 overflow-x-auto pb-6 px-2 snap-x no-scrollbar">
          {characters.map((char) => (
            <motion.button
              key={char.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { playClickSound(); setSelected(char.id as any); }}
              className={`flex-shrink-0 w-48 snap-center p-6 rounded-[2.5rem] border-4 transition-all flex flex-col items-center gap-4 ${
                selected === char.id 
                  ? `${theme.border} ${theme.bg} shadow-lg ${theme.shadow}` 
                  : `${theme.border}/10 bg-white hover:${theme.border}/20`
              }`}
            >
              <div className={`w-24 h-24 rounded-full ${char.color} p-2 flex items-center justify-center shadow-inner`}>
                <img 
                  src={char.img} 
                  alt={char.name} 
                  className="w-full h-full object-contain drop-shadow-md"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h3 className={`text-xl font-black ${selected === char.id ? theme.text : 'text-gray-400'}`}>
                  {char.name}
                </h3>
                <p className="text-xs font-bold text-gray-400">{char.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>

        <ChiikawaButton 
          onClick={handleSelect}
          className={`w-full py-4 text-lg mt-4 shadow-lg ${theme.shadow}`}
          theme={theme}
        >
          Let's Go!
        </ChiikawaButton>
      </motion.div>
    </div>
  );
}

// --- Custom Hooks ---
function useToday() {
  const [today, setToday] = useState(format(startOfToday(), 'yyyy-MM-dd'));
  
  useEffect(() => {
    const interval = setInterval(() => {
      const current = format(startOfToday(), 'yyyy-MM-dd');
      if (current !== today) {
        setToday(current);
      }
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [today]);

  return {
    today,
    yesterday: format(subDays(startOfToday(), 1), 'yyyy-MM-dd'),
    ninetyDaysAgo: format(subDays(startOfToday(), 90), 'yyyy-MM-dd')
  };
}

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'stats' | 'town' | 'buddy' | 'settings' | 'profile'>('dashboard');
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  const handleLinkAccount = async () => {
    if (!user) return;
    setIsLinking(true);
    try {
      const provider = new GoogleAuthProvider();
      await linkWithPopup(user, provider);
      showToast('Account linked successfully! 💖', 'success');
      setShowLogoutWarning(false);
    } catch (err: any) {
      console.error('Linking Error:', err);
      if (err.code === 'auth/credential-already-in-use') {
        showToast('This Google account is already linked to another user.', 'error');
      } else {
        showToast('Failed to link account: ' + err.message, 'error');
      }
    } finally {
      setIsLinking(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const { data: habits, loading: habitsLoading } = useFirestoreCollection<Habit>('habits', useMemo(() => user?.uid ? [where('userId', '==', user.uid)] : [], [user?.uid]), !!user);
  const { today, yesterday, ninetyDaysAgo } = useToday();
  const { data: allCheckins, loading: checkinsLoading } = useFirestoreCollection<CheckIn>('checkins', useMemo(() => user?.uid ? [where('userId', '==', user.uid)] : [], [user?.uid]), !!user);
  
  const checkins = useMemo(() => {
    return allCheckins.filter(c => c.date >= ninetyDaysAgo);
  }, [allCheckins, ninetyDaysAgo]);

  // --- Presence System ---
  useEffect(() => {
    if (!user) return;
    
    const updatePresence = async () => {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          lastActive: new Date().toISOString()
        });
      } catch (err) {
        // Ignore errors if profile doesn't exist yet
      }
    };

    updatePresence(); // Run immediately
    const interval = setInterval(updatePresence, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [user]);

  // --- Notification System ---
  useEffect(() => {
    if (!user || !notificationsEnabled || !('Notification' in window)) return;

    // Request permission if not granted
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(console.error);
    }

    // 1. Listen for Nudges
    const nudgeQuery = query(
      collection(db, 'nudges'), 
      where('toUid', '==', user.uid)
    );

    const now = new Date().toISOString();
    const unsubscribeNudges = onSnapshot(nudgeQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const nudge = change.doc.data() as Nudge;
          // Filter in memory to avoid index requirement
          if (nudge.createdAt <= now) return;
          
          playNotificationSound();
          if (Notification.permission === 'granted') {
            const title = 'Buddy Nudge! ✨';
            const options = {
              body: nudge.type === 'cheer' ? "Your buddy is cheering you on! Keep it up! 💖" : "Your buddy sent you a gentle reminder! 🌸",
              icon: '/favicon.ico',
              badge: '/favicon.ico'
            };

            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.ready.then(registration => {
                registration.showNotification(title, options);
              });
            } else {
              new Notification(title, options);
            }
          }
        }
      });
    });

    // 2. Listen for Buddy Requests (via profile changes)
    // This is already handled by the userProfile listener, but we can add a specific effect if we want a notification
    
    // 3. Habit Reminders (Local check every minute)
    const reminderInterval = setInterval(() => {
      const now = new Date();
      const currentTime = format(now, 'HH:mm');
      const timePlus30 = format(addMinutes(now, 30), 'HH:mm');
      const todayDay = format(now, 'EEE'); // Mon, Tue...

      habits.forEach(habit => {
        // Check for exact reminder time OR 30 minutes before habitTime
        const isReminderTime = habit.reminderTime === currentTime;
        const is30MinBefore = habit.habitTime === timePlus30;

        if (isReminderTime || is30MinBefore) {
          const isScheduledToday = habit.schedule.includes('Every Day') || habit.schedule.includes(todayDay);
          const isCompleted = checkins.some(c => c.habitId === habit.id && c.completed);

          if (isScheduledToday && !isCompleted) {
            playNotificationSound();
            if (Notification.permission === 'granted') {
              const title = is30MinBefore ? `Upcoming Habit: ${habit.name}` : `Habit Reminder: ${habit.name}`;
              const body = is30MinBefore 
                ? `Starts in 30 minutes! Get ready! 🌸` 
                : "Time to keep your streak alive! Your buddy is watching! 🐾";

              const options = {
                body,
                icon: '/favicon.ico',
                badge: '/favicon.ico'
              };

              // Try using service worker for more robust notifications
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then(registration => {
                  registration.showNotification(title, options);
                });
              } else {
                new Notification(title, options);
              }
            }
          }
        }
      });
    }, 60000);

    return () => {
      unsubscribeNudges();
      clearInterval(reminderInterval);
    };
  }, [user, notificationsEnabled, habits, checkins]);

  // --- FCM Token Registration ---
  useEffect(() => {
    if (!user || !notificationsEnabled || !messaging) return;

    const requestToken = async () => {
      try {
        const currentToken = await getToken(messaging, {
          vapidKey: 'BPAq3J2-z2abW1q7qyM-AIzaSyA48XCbWp2fxq--' // This is a placeholder, user needs their real VAPID key
        });
        if (currentToken) {
          await updateDoc(doc(db, 'users', user.uid), {
            fcmToken: currentToken
          });
        }
      } catch (err) {
        console.error('An error occurred while retrieving token. ', err);
      }
    };

    if (Notification.permission === 'granted') {
      requestToken();
    }
  }, [user, notificationsEnabled]);

  // Fetch user profile
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as UserProfile;
        
        // Initialize missing fields if necessary
        const needsUpdate = data.petExp === undefined || data.petLevel === undefined || !data.character;
        if (needsUpdate) {
          updateDoc(userDocRef, {
            petExp: data.petExp ?? 0,
            petLevel: data.petLevel ?? 1,
            character: data.character ?? 'chiikawa'
          }).catch(err => {
            handleFirestoreError(err, OperationType.UPDATE, 'users');
          });
        }
        setUserProfile(data);
        setIsNewUser(false);
        setIsCreatingProfile(false);
      } else {
        setIsNewUser(true);
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'users');
    });

    return unsubscribe;
  }, [user]);

  const currentTheme = (userProfile?.character && characterThemes[userProfile.character as keyof typeof characterThemes]) 
    ? characterThemes[userProfile.character as keyof typeof characterThemes] 
    : landingTheme;

  console.log("App render state:", { authLoading, userUid: user?.uid, hasProfile: !!userProfile });

  if (authLoading || (user && !userProfile && !isNewUser) || isCreatingProfile) {
    return <LoadingScreen theme={currentTheme} message={authLoading ? `checking the \n authentication` : isCreatingProfile ? "Creating your profile..." : "Loading your profile..."} />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (isNewUser && !userProfile) {
    return <CharacterSelectionScreen 
      user={user} 
      onComplete={() => setIsCreatingProfile(true)} 
      onError={() => setIsCreatingProfile(false)}
    />;
  }

  return (
    <div className={`min-h-screen ${currentTheme.bg} text-chibi-text font-sans pb-24`}>
      {/* Header */}
      <header className="p-6 flex justify-between items-center max-w-2xl mx-auto relative">
        <div>
          <h1 className="text-2xl font-black tracking-tight">
            <span className={currentTheme.text}>Chibi</span>
            <span className={currentTheme.name === 'Chiikawa' ? 'text-pink-400' : currentTheme.text}>Habits</span>
          </h1>
          <p className="text-gray-400 text-sm font-medium">Building micro-habits daily!</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { playClickSound(); setShowInventory(true); }}
            className={`w-10 h-10 rounded-2xl bg-white shadow-sm border-2 ${currentTheme.border} flex items-center justify-center ${currentTheme.text} hover:${currentTheme.bg} transition-all relative`}
          >
            <Backpack size={20} />
            {userProfile?.inventory && userProfile.inventory.length > 0 && (
              <span className={`absolute -top-1 -right-1 ${currentTheme.accent} text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center`}>
                {userProfile.inventory.length}
              </span>
            )}
          </button>

          <div className="relative">
            <button 
              onClick={() => { playClickSound(); setShowProfileMenu(!showProfileMenu); }}
              className={`w-10 h-10 rounded-2xl bg-white shadow-sm border-2 ${currentTheme.border} flex items-center justify-center ${currentTheme.text} hover:${currentTheme.bg} transition-all`}
            >
              <Menu size={20} />
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowProfileMenu(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={`absolute right-0 mt-2 w-48 bg-white rounded-[1.5rem] shadow-xl border-2 ${currentTheme.border}/20 p-2 z-50`}
                  >
                    <button 
                      onClick={() => {
                        playClickSound();
                        setActiveTab('profile');
                        setShowProfileMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl hover:${currentTheme.bg} ${currentTheme.text} font-bold transition-colors`}
                    >
                      <User size={18} className={currentTheme.text} />
                      <span>View Profile</span>
                    </button>
                    <div className="h-px bg-gray-100 my-1 mx-2" />
                    <button 
                      onClick={() => {
                        playClickSound();
                        setShowProfileMenu(false);
                        if (user?.isAnonymous) {
                          setShowLogoutWarning(true);
                        } else {
                          logout();
                        }
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-red-400 font-bold transition-colors"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <Dashboard 
              user={user} 
              userProfile={userProfile} 
              habits={habits} 
              checkins={checkins} 
              habitsLoading={habitsLoading || checkinsLoading} 
              setShowAddHabit={setShowAddHabit}
              showToast={showToast}
              today={today}
              yesterday={yesterday}
              theme={currentTheme}
            />
          )}
          {activeTab === 'stats' && <Stats user={user} theme={currentTheme} />}
          {activeTab === 'town' && <TownSquare user={user} userProfile={userProfile} showToast={showToast} theme={currentTheme} />}
          {activeTab === 'buddy' && <Buddy user={user} userProfile={userProfile} showToast={showToast} theme={currentTheme} />}
          {activeTab === 'settings' && <SettingsScreen user={user} userProfile={userProfile} notificationsEnabled={notificationsEnabled} setNotificationsEnabled={setNotificationsEnabled} showToast={showToast} theme={currentTheme} />}
          {activeTab === 'profile' && (
            <ProfileScreen 
              user={user} 
              userProfile={userProfile} 
              logout={logout} 
              linkWithPopup={linkWithPopup} 
              handleFirestoreError={handleFirestoreError} 
              showToast={showToast} 
              theme={currentTheme}
              showLogoutWarning={showLogoutWarning}
              setShowLogoutWarning={setShowLogoutWarning}
              isLinking={isLinking}
              handleLinkAccount={handleLinkAccount}
            />
          )}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t py-2 px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex justify-around items-center z-50" style={{ borderColor: currentTheme.name === 'Chiikawa' ? '#ecc9cf33' : currentTheme.name === 'Hachiware' ? '#c7d2fe33' : '#fef08a33' }}>
        <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<Heart size={24} />} label="Habits" theme={currentTheme} />
        <NavButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<BarChart3 size={24} />} label="Stats" theme={currentTheme} />
        <NavButton active={activeTab === 'town'} onClick={() => setActiveTab('town')} icon={<Map size={24} />} label="Town" theme={currentTheme} />
        <NavButton active={activeTab === 'buddy'} onClick={() => setActiveTab('buddy')} icon={<Users size={24} />} label="Buddy" theme={currentTheme} />
        <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Smile size={24} />} label="Pet" theme={currentTheme} />
      </nav>

      {/* Add Habit Modal */}
      <AnimatePresence>
        {showAddHabit && (
          <AddHabitModal 
            onClose={() => setShowAddHabit(false)} 
            userId={user.uid} 
            theme={currentTheme}
          />
        )}
      </AnimatePresence>

      {/* Inventory Panel */}
      <AnimatePresence>
        {showInventory && (
          <InventoryPanel 
            onClose={() => setShowInventory(false)} 
            userProfile={userProfile} 
            userId={user.uid} 
            showToast={showToast}
            theme={currentTheme}
          />
        )}
      </AnimatePresence>

      {/* Logout Warning Modal */}
      <AnimatePresence>
        {showLogoutWarning && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl border-4 ${currentTheme.border} text-center`}
            >
              <div className={`w-20 h-20 ${currentTheme.bg} rounded-3xl flex items-center justify-center mx-auto mb-6`}>
                <Sparkles size={40} className={currentTheme.text} />
              </div>
              <h3 className={`text-2xl font-black ${currentTheme.text} mb-2`}>Wait! Don't go!</h3>
              <p className="text-gray-500 font-bold mb-8 leading-relaxed">
                You are using a <span className={currentTheme.text}>Guest Account</span>. If you log out now, all your habits and progress will be <span className="text-red-500">lost forever</span>!
              </p>
              <div className="space-y-3">
                <ChiikawaButton 
                  onClick={handleLinkAccount}
                  disabled={isLinking}
                  theme={currentTheme}
                  className="w-full py-4"
                >
                  {isLinking ? 'Linking...' : 'Save Progress with Google'}
                </ChiikawaButton>
                <button 
                  onClick={() => { playClickSound(); logout(); }}
                  className="w-full py-4 text-sm font-black text-red-400 hover:text-red-500 transition-colors"
                >
                  Log out anyway (Delete progress)
                </button>
                <button 
                  onClick={() => { playClickSound(); setShowLogoutWarning(false); }}
                  className="w-full py-2 text-xs font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <ChiikawaToast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>

      {/* Floating Action Button removed as per user request to integrate it better into the habits page */}
    </div>
  );
}

// --- Screens ---

function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [authMethod, setAuthMethod] = useState<'none' | 'email' | 'forgot-password'>('none');

  // Default theme for login (Baby Blue)
  const theme = landingTheme;

  // Clear inputs and errors when switching screens
  useEffect(() => {
    setEmail('');
    setPassword('');
    setError(null);
    setSuccessMessage(null);
    setShowPassword(false);
  }, [authMethod, isSignUp]);

  const handleEmailAuth = async () => {
    playClickSound();
    setError(null);
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Invalid email format. Please check again.');
      return;
    }

    // Password validation (only for sign up)
    if (isSignUp) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;
      if (!passwordRegex.test(password)) {
        setError('Password must be at least 8 characters with uppercase, lowercase, number, and symbol (including .).');
        return;
      }
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      let message = 'Authentication failed. Please try again.';
      
      if (err.code === 'auth/invalid-credential') {
        message = isSignUp 
          ? 'This email is already registered or the credentials are invalid. Try logging in instead!'
          : 'Incorrect email or password. Please check your credentials and try again.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'This email is already registered. Try logging in instead!';
      } else if (err.code === 'auth/weak-password') {
        message = 'The password is too weak. Please choose a stronger one.';
      } else if (err.code === 'auth/operation-not-allowed') {
        message = 'Email/Password sign-in is not enabled in your Firebase Console. Please enable it under Authentication > Sign-in method.';
      } else if (err.code === 'auth/user-disabled') {
        message = 'This user account has been disabled.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Please try again later.';
      } else if (err.code === 'auth/unauthorized-domain') {
        message = 'This domain is not authorized in your Firebase Console. Please add the current URL to the "Authorized domains" list in Authentication > Settings.';
      } else if (err.message) {
        message = err.message;
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: () => Promise<any>) => {
    playClickSound();
    setError(null);
    setLoading(true);
    try {
      await provider();
    } catch (err: any) {
      console.error('Social Auth Error:', err);
      let message = 'Social login failed. Please try again.';
      if (err.code === 'auth/unauthorized-domain') {
        message = 'This domain is not authorized in your Firebase Console. Please add the current URL to the "Authorized domains" list in Authentication > Settings.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        message = 'The login window was closed. If you didn\'t close it, please check if your browser is blocking popups or third-party cookies!';
      } else if (err.code === 'auth/operation-not-allowed') {
        message = 'This sign-in method is not enabled in your Firebase Console. Please enable it under Authentication > Sign-in method.';
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        try {
          const methods = await fetchSignInMethodsForEmail(auth, err.customData?.email || email);
          const method = methods[0]?.includes('google') ? 'Google' : methods[0]?.includes('facebook') ? 'Facebook' : 'Email/Password';
          message = `An account already exists with this email using ${method}. Please sign in with ${method} instead!`;
        } catch {
          message = 'An account already exists with this email address but using a different sign-in method (e.g., Google or Email). Please sign in using your original method.';
        }
      } else if (err.message && err.message.includes('Invalid Scopes: email')) {
        message = 'Facebook Login error: The "email" permission is missing or invalid in your Meta App settings. Please go to your Meta Developer Dashboard > App Settings > Facebook Login > Permissions and ensure "email" is added.';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    playClickSound();
    setError(null);
    setLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (err: any) {
      console.error('Anonymous Auth Error:', err);
      let message = 'Guest login failed. Please try again.';
      if (err.code === 'auth/operation-not-allowed') {
        message = 'Anonymous sign-in is not enabled in your Firebase Console. Please enable it under Authentication > Sign-in method.';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    playClickSound();
    setError(null);
    if (!email.trim()) {
      setError('Please enter your email address first.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Invalid email format.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSuccessMessage('Reset link sent! Please check your email.');
      // Don't switch back immediately so they can read the message
    } catch (err: any) {
      console.error('Password Reset Error:', err);
      let message = 'Failed to send reset email. Please try again.';
      
      if (err.code === 'auth/user-not-found') {
        message = 'No account found with this email address. Please check your spelling or sign up instead.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'The email address is invalid.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Too many requests. Please try again later.';
      } else if (err.message) {
        message = err.message;
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} flex flex-col items-center justify-center p-6 text-center relative overflow-hidden`}>
      <ChiikawaBackground theme={theme} />
      
      <div className="max-w-[340px] w-full relative z-10">
        <AnimatePresence mode="wait">
          {authMethod === 'none' ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col items-center"
            >
              <h1 className={`text-5xl font-black ${theme.text} tracking-tight mb-0 pl-[1px]`}>
                Chibi<span className="text-pink-400">Habits</span>
              </h1>

              {/* Large Chiikawa Image */}
              <motion.div 
                animate={{ 
                  y: [0, -15, 0],
                  rotate: [-1, 1, -1]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut"
                }}
                className="w-72 h-48 mb-10 relative flex justify-center items-center"
              >
                <div className={`absolute inset-0 ${theme.accent}/10 blur-3xl rounded-full scale-150`} />
                <img 
                  src={chiikawaImage} 
                  className="w-full h-full object-contain drop-shadow-2xl relative z-10 scale-150 mb-[-36px]"
                  alt="Chiikawa"
                  referrerPolicy="no-referrer"
                />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -top-6 -right-6 text-yellow-400"
                >
                  <Sparkles size={48} />
                </motion.div>
              </motion.div>
              
              <p className="text-gray-500 font-bold text-base leading-relaxed mb-[42px] px-2">
                Improve your life via <span className={theme.text}>cute habits</span> with ChibiHabits. Build confidence and grow together.
              </p>

              <div className="flex flex-col gap-3 w-full">
                <ChiikawaButton 
                  onClick={() => { setAuthMethod('email'); setIsSignUp(false); }} 
                  className={`w-full py-4 text-lg shadow-lg ${theme.shadow}`}
                  theme={theme}
                >
                  Sign in
                </ChiikawaButton>
                <ChiikawaButton 
                  onClick={() => { setAuthMethod('email'); setIsSignUp(true); }} 
                  variant="outline" 
                  className={`w-full py-4 text-lg ${theme.bg}/50 backdrop-blur-sm`}
                  theme={theme}
                >
                  Create account
                </ChiikawaButton>
              </div>
            </motion.div>
          ) : authMethod === 'forgot-password' ? (
            <motion.div
              key="forgot-password"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl border-4 border-white">
                <div className="flex flex-col items-center mb-8">
                  <button 
                    onClick={() => { playClickSound(); setAuthMethod('email'); }}
                    className={`absolute left-4 top-4 p-2 ${theme.mutedText} hover:${theme.text} transition-colors`}
                  >
                    <ArrowLeft size={24} />
                  </button>
                  
                  <h2 className={`text-2xl font-black ${theme.text} mb-1`}>
                    Reset Password
                  </h2>
                  <p className="text-sm font-bold text-gray-400 px-4">
                    Enter your email to receive a password reset link.
                  </p>
                </div>

                <div className="space-y-6">
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 text-red-500 text-xs font-bold py-3 px-4 rounded-2xl border border-red-100"
                    >
                      {error}
                    </motion.div>
                  )}

                  {successMessage && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-emerald-50 text-emerald-600 text-xs font-bold py-3 px-4 rounded-2xl border border-emerald-100"
                    >
                      {successMessage}
                    </motion.div>
                  )}

                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(null); setSuccessMessage(null); }}
                    className={`w-full px-6 py-4 rounded-3xl border-2 ${theme.bg} focus:${theme.border} focus:ring-4 ${theme.ring} outline-none transition-all text-lg ${theme.inputBg}`}
                  />

                  <ChiikawaButton 
                    onClick={handleForgotPassword} 
                    className={`w-full py-4 shadow-lg ${theme.shadow}`}
                    disabled={loading}
                    theme={theme}
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </ChiikawaButton>

                  <button 
                    onClick={() => { playClickSound(); setAuthMethod('email'); }}
                    className={`text-sm font-bold ${theme.lightText} hover:underline w-full`}
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="auth-form"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl border-4 border-white">
                <div className="flex flex-col items-center mb-8">
                  <button 
                    onClick={() => { playClickSound(); setAuthMethod('none'); }}
                    className={`absolute left-4 top-4 p-2 ${theme.mutedText} hover:${theme.text} transition-colors`}
                  >
                    <X size={24} />
                  </button>
                  
                  <h2 className={`text-2xl font-black ${theme.text} mb-1`}>
                    {isSignUp ? 'Create an account' : 'Welcome Back'}
                  </h2>
                  <p className="text-sm font-bold text-gray-400">
                    {isSignUp ? (
                      <>Already have an account? <button onClick={() => { playClickSound(); setIsSignUp(false); }} className={`${theme.lightText} hover:underline`}>Login</button></>
                    ) : (
                      <>New to ChibiHabits? <button onClick={() => { playClickSound(); setIsSignUp(true); }} className={`${theme.lightText} hover:underline`}>Sign up</button></>
                    )}
                  </p>
                </div>

                <div className="space-y-4">
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 text-red-500 text-xs font-bold py-3 px-4 rounded-2xl border border-red-100 flex flex-col gap-2"
                    >
                      <span>{error}</span>
                      {(error.includes('logging in instead') || error.includes('registered')) && isSignUp && (
                        <button 
                          onClick={() => { playClickSound(); setIsSignUp(false); setError(null); }}
                          className={`${theme.text} hover:underline text-left text-[10px]`}
                        >
                          Switch to Login
                        </button>
                      )}
                      {error.includes('Incorrect email or password') && !isSignUp && (
                        <button 
                          onClick={() => { playClickSound(); setAuthMethod('forgot-password'); setError(null); }}
                          className={`${theme.text} hover:underline text-left text-[10px]`}
                        >
                          Forgot Password?
                        </button>
                      )}
                    </motion.div>
                  )}
                  
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(null); }}
                      className={`w-full px-6 py-4 rounded-3xl border-2 ${theme.bg} focus:${theme.border} focus:ring-4 ${theme.ring} outline-none transition-all text-lg ${theme.inputBg}`}
                    />
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(null); }}
                        className={`w-full px-6 py-4 rounded-3xl border-2 ${theme.bg} focus:${theme.border} focus:ring-4 ${theme.ring} outline-none transition-all text-lg pr-14 ${theme.inputBg}`}
                      />
                      <button
                        type="button"
                        onClick={() => { playClickSound(); setShowPassword(!showPassword); }}
                        className={`absolute right-5 top-1/2 -translate-y-1/2 ${theme.mutedText} hover:${theme.text} transition-colors`}
                      >
                        {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                      </button>
                    </div>
                  </div>

                  {!isSignUp && (
                    <div className="flex justify-between items-center px-2">
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-400 cursor-pointer">
                        <input type="checkbox" className={`rounded border-${theme.accent.split('-')[1]}-200 text-${theme.accent.split('-')[1]}-400 focus:ring-${theme.accent.split('-')[1]}-400`} />
                        Remember me
                      </label>
                      <button 
                        onClick={() => { playClickSound(); setAuthMethod('forgot-password'); }}
                        className={`text-xs font-bold ${theme.lightText} hover:underline`}
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  <ChiikawaButton 
                    onClick={handleEmailAuth} 
                    className={`w-full py-4 mt-2 shadow-lg ${theme.shadow}`}
                    disabled={loading}
                    theme={theme}
                  >
                    {loading ? 'Processing...' : (isSignUp ? 'Continue' : 'Log in')}
                  </ChiikawaButton>

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-100"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-4 text-gray-300 font-black tracking-widest">or {isSignUp ? 'sign up' : 'log in'} with</span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4">
                    <button 
                      onClick={() => { playClickSound(); handleSocialLogin(signInWithGoogle); }}
                      className={`p-4 rounded-2xl border-2 border-[#cfdbee] hover:${theme.border} hover:${theme.bg} transition-all group`}
                      disabled={loading}
                    >
                      <GoogleLogo />
                    </button>
                    <button 
                      onClick={() => { playClickSound(); handleSocialLogin(signInWithFacebook); }}
                      className={`p-4 rounded-2xl border-2 border-[#cfdbee] hover:${theme.border} hover:${theme.bg} transition-all group`}
                      disabled={loading}
                    >
                      <FacebookLogo />
                    </button>
                    <button 
                      onClick={() => { playClickSound(); handleAnonymousLogin(); }}
                      className={`p-4 rounded-2xl border-2 border-[#cfdbee] hover:${theme.border} hover:${theme.bg} transition-all group`}
                      disabled={loading}
                      title="Continue as Guest"
                    >
                      <GuestLogo />
                    </button>
                  </div>

                  {isSignUp && (
                    <p className="text-[10px] text-gray-400 font-bold leading-relaxed mt-6">
                      By clicking continue you agree to recognotes <br />
                      <button className={`${theme.mutedText} hover:underline`}>Terms of use</button> and <button className={`${theme.mutedText} hover:underline`}>Privacy policy</button>
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ChiikawaToast({ message, type, onClose }: { message: string, type: 'success' | 'error' | 'info', onClose: () => void }) {
  const bgColors = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-pink-500'
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: -20, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-full text-white font-black text-xs shadow-xl flex items-center gap-3 ${bgColors[type]}`}
    >
      {type === 'success' && <Check size={16} />}
      {type === 'error' && <X size={16} />}
      {type === 'info' && <Sparkles size={16} />}
      <span className="whitespace-nowrap">{message}</span>
    </motion.div>
  );
}

function NavButton({ active, onClick, icon, label, theme, className = '' }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, theme: any, className?: string }) {
  const handleClick = () => {
    playClickSound();
    onClick();
  };

  return (
    <button 
      onClick={handleClick}
      className={`flex flex-col items-center gap-0.5 px-2 py-1.5 transition-all relative rounded-2xl bg-white ${
        active 
          ? theme.text + ' ' + theme.navActive 
          : 'text-gray-400 hover:' + theme.navHover + ' hover:' + theme.text
      } ${className}`}
    >
      <div className={`${active ? 'scale-110' : 'scale-100'} transition-transform`}>
        {icon}
      </div>
      <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-tighter sm:tracking-widest">{label}</span>
    </button>
  );
}

function WeeklyView({ habits, checkins, onEdit, theme }: { habits: Habit[], checkins: CheckIn[], onEdit: (h: Habit) => void, theme: any }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = startOfToday();
  const startOfWeekDate = subDays(today, (today.getDay() + 6) % 7); // Monday

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(startOfWeekDate);
      date.setDate(date.getDate() + i);
      return format(date, 'yyyy-MM-dd');
    });
  }, [startOfWeekDate]);

  const checkInMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    checkins.forEach(c => {
      if (c.completed) {
        map[`${c.habitId}_${c.date}`] = true;
      }
    });
    return map;
  }, [checkins]);

  const filteredHabits = useMemo(() => {
    return habits.filter(h => {
      if (h.type === 'regular') return true;
      // For one-time tasks, only show if the date is within the current week
      return h.oneTimeDate && weekDays.includes(h.oneTimeDate);
    });
  }, [habits, weekDays]);

  return (
    <div className="space-y-6">
      {filteredHabits.map(habit => (
        <ChiikawaCard key={habit.id} className={`p-4 bg-white border-2 ${theme.border}/20 group`}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">{habit.icon}</span>
              <div>
                <p className={`font-black text-sm ${theme.text}`}>{habit.name}</p>
                <p className={`text-[8px] font-black ${theme.lightText} uppercase tracking-widest flex items-center gap-2`}>
                  <Clock size={8} />
                  {habit.habitTime} • {habit.type === 'one-time' ? `One-time (${habit.oneTimeDate})` : (habit.repeatType === 'daily' ? 'Daily' : habit.schedule?.join(', '))}
                </p>
              </div>
            </div>
            <button 
              onClick={() => onEdit(habit)}
              className={`p-1.5 ${theme.mutedText} hover:${theme.text} transition-all flex-shrink-0`}
            >
              <Pencil size={12} />
            </button>
          </div>
          <div className="flex justify-between">
            {days.map((day, i) => {
              const dateStr = weekDays[i];
              const isDone = checkInMap[`${habit.id}_${dateStr}`];
              
              // Check if scheduled for this day
              let isScheduled = false;
              if (habit.type === 'one-time') {
                isScheduled = habit.oneTimeDate === dateStr;
              } else {
                if (habit.repeatType === 'daily') {
                  isScheduled = true;
                } else {
                  isScheduled = habit.schedule?.includes(day) || false;
                }
              }

              return (
                <div key={day} className="flex flex-col items-center gap-2">
                  <span className={`text-[8px] font-black ${theme.mutedText} uppercase`}>{day}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isDone 
                      ? `${habit.color || theme.accent} text-white shadow-sm` 
                      : isScheduled 
                        ? `bg-white border-2 ${theme.border}/30 ${theme.mutedText}` 
                        : `${theme.secondaryBg} ${theme.mutedText}/30`
                  }`}>
                    {isDone ? (
                      <Check size={14} strokeWidth={4} />
                    ) : isScheduled ? (
                      <div className={`w-1.5 h-1.5 rounded-full ${theme.accent}/40`} />
                    ) : (
                      <div className="w-1 h-1 rounded-full bg-current opacity-20" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ChiikawaCard>
      ))}
    </div>
  );
}

function OverallView({ habits, checkins, onEdit, theme }: { habits: Habit[], checkins: CheckIn[], onEdit: (h: Habit) => void, theme: any }) {
  const checkInMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    checkins.forEach(c => {
      if (c.completed) {
        map[`${c.habitId}_${c.date}`] = true;
      }
    });
    return map;
  }, [checkins]);

  // Last 90 days
  const today = startOfToday();
  const dates = useMemo(() => {
    return Array.from({ length: 90 }).map((_, i) => {
      const date = subDays(today, 89 - i);
      return format(date, 'yyyy-MM-dd');
    });
  }, [today]);

  const regularHabits = useMemo(() => habits.filter(h => h.type === 'regular'), [habits]);
  const oneTimeTasks = useMemo(() => habits.filter(h => h.type === 'one-time'), [habits]);

  return (
    <div className="space-y-10">
      {/* Regular Habits Section */}
      {regularHabits.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className={`h-px flex-1 ${theme.border}/20`} />
            <h3 className={`text-[10px] font-black ${theme.mutedText} uppercase tracking-[0.2em]`}>Regular Habits</h3>
            <div className={`h-px flex-1 ${theme.border}/20`} />
          </div>
          {regularHabits.map(habit => (
            <ChiikawaCard key={habit.id} className={`p-5 bg-white border-4 ${theme.border}/10 shadow-xl ${theme.shadow} group`}>
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${theme.bg} flex items-center justify-center text-xl shadow-inner rounded-2xl`}>
                    {habit.icon}
                  </div>
                  <div>
                    <p className={`font-black text-base ${theme.text} leading-tight`}>{habit.name}</p>
                    <p className={`text-[8px] font-black ${theme.lightText} uppercase tracking-widest flex items-center gap-2 mt-1`}>
                      <Clock size={8} />
                      {habit.habitTime} • {habit.repeatType === 'daily' ? 'Everyday' : habit.schedule?.join(', ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-pink-400 uppercase tracking-tighter">90d Progress</span>
                    <span className={`text-lg font-black ${theme.text} leading-none`}>
                      {Math.round((dates.filter(d => checkInMap[`${habit.id}_${d}`]).length / 90) * 100)}%
                    </span>
                  </div>
                  <button 
                    onClick={() => onEdit(habit)}
                    className={`p-1.5 ${theme.mutedText} hover:${theme.text} transition-all flex-shrink-0`}
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {dates.map(date => {
                  const isDoneReal = checkInMap[`${habit.id}_${date}`];
                  return (
                    <div 
                      key={date} 
                      className={`w-3 h-3 rounded-full transition-all duration-500 ${isDoneReal ? theme.accent + ' shadow-lg' : theme.bg}`}
                      title={date}
                    />
                  );
                })}
              </div>
            </ChiikawaCard>
          ))}
        </div>
      )}

      {/* One-Time Tasks Section */}
      {oneTimeTasks.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className={`h-px flex-1 ${theme.border}/20`} />
            <h3 className={`text-[10px] font-black ${theme.mutedText} uppercase tracking-[0.2em]`}>One-Time Tasks</h3>
            <div className={`h-px flex-1 ${theme.border}/20`} />
          </div>
          <div className="grid gap-4">
            {oneTimeTasks.map(habit => {
              const isDone = checkInMap[`${habit.id}_${habit.oneTimeDate}`];
              return (
                <ChiikawaCard key={habit.id} className={`p-4 border-2 transition-all group ${isDone ? 'bg-emerald-50/30 border-emerald-100' : 'bg-white border-pink-50 shadow-lg shadow-pink-100/10'}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${isDone ? 'bg-emerald-100' : 'bg-pink-50 shadow-inner'}`}>
                        {habit.icon}
                      </div>
                      <div>
                        <p className={`font-black text-base leading-tight ${isDone ? 'text-emerald-900 line-through opacity-50' : 'text-indigo-900'}`}>
                          {habit.name}
                        </p>
                        <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                          <Calendar size={10} /> {habit.oneTimeDate} • <Clock size={10} /> {habit.habitTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {isDone ? (
                        <div className="w-8 h-8 bg-emerald-400 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                          <Check size={18} strokeWidth={4} />
                        </div>
                      ) : (
                        <div className="text-[10px] font-black text-pink-300 uppercase tracking-widest px-3 py-1 bg-pink-50 rounded-full">
                          Pending
                        </div>
                      )}
                      <button 
                        onClick={() => onEdit(habit)}
                        className="p-1.5 text-pink-200 hover:text-pink-500 transition-all flex-shrink-0"
                      >
                        <Pencil size={12} />
                      </button>
                    </div>
                  </div>
                </ChiikawaCard>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
function Dashboard({ user, userProfile, habits, checkins, habitsLoading, setShowAddHabit, showToast, today, yesterday, theme }: { user: any, userProfile: UserProfile | null, habits: Habit[], checkins: CheckIn[], habitsLoading: boolean, setShowAddHabit: (val: boolean) => void, showToast: (m: string, t?: any) => void, today: string, yesterday: string, theme: any }) {
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewTab, setViewTab] = useState<'today' | 'weekly' | 'overall'>('today');
  const [timeFilter, setTimeFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening'>('all');
  const currentDayName = format(startOfToday(), 'EEE'); // 'Mon', 'Tue', etc.

  const checkInMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    checkins.forEach(c => {
      if (c.date === today && c.completed) {
        map[c.habitId] = true;
      }
    });
    return map;
  }, [checkins, today]);

  useEffect(() => {
    if (!userProfile || habitsLoading) return;

    const checkDecay = async () => {
      const lastCheck = userProfile.lastDecayCheck;
      if (lastCheck !== today) {
        const yesterdayDayName = format(subDays(startOfToday(), 1), 'EEE');
        
        // Check if they missed any dailies yesterday
        const dailiesDueYesterday = habits.filter(h => {
          if (h.type !== 'regular') return false;
          if (h.repeatType === 'daily') return true;
          return h.schedule.includes(yesterdayDayName);
        });
        
        const checkinsYesterday = checkins.filter(c => c.date === yesterday && c.completed);
        
        const missedDailies = dailiesDueYesterday.length > checkinsYesterday.length;
        const inactive = checkinsYesterday.length === 0 && dailiesDueYesterday.length > 0;

        let newHappiness = userProfile.happiness ?? 100;
        let newHealth = userProfile.health ?? 100;

        if (missedDailies || inactive) {
          newHappiness = Math.max(0, newHappiness - 15);
          newHealth = Math.max(0, newHealth - 15);
        }

        try {
          await updateDoc(doc(db, 'users', user.uid), {
            lastDecayCheck: today,
            happiness: newHappiness,
            health: newHealth
          });
        } catch (err) {
          console.error("Failed to update decay", err);
        }
      }
    };

    checkDecay();
  }, [userProfile, habits, checkins, habitsLoading, today, user.uid]);

  const filteredHabits = useMemo(() => {
    let result = habits;
    
    // Filter by day of week for regular habits
    result = result.filter(h => {
      if (h.type === 'one-time') {
        // One-time tasks show on their selected date
        return h.oneTimeDate === today;
      }
      if (h.repeatType === 'daily') return true; // Daily habits always show
      return h.schedule.includes(currentDayName); // Weekly habits only show on scheduled days
    });

    if (timeFilter !== 'all') {
      result = result.filter(h => h.timeOfDay === timeFilter);
    }
    return result;
  }, [habits, timeFilter, currentDayName]);

  const todoHabits = useMemo(() => filteredHabits.filter(h => !checkInMap[h.id]), [filteredHabits, checkInMap]);
  const completedHabits = useMemo(() => filteredHabits.filter(h => checkInMap[h.id]), [filteredHabits, checkInMap]);

  if (habitsLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4">
        <ChiikawaLoader size={24} />
        <p className={`${theme.text} font-black tracking-widest uppercase text-sm`}>Fetching your habits...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 pb-24"
    >
      {/* Top Tabs */}
      <div 
        className={`flex bg-white p-1.5 rounded-2xl max-w-xs mx-auto border-2 ${theme.border}/20`}
      >
        {(['today', 'weekly', 'overall'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => { playClickSound(); setViewTab(tab); }}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              viewTab === tab 
                ? theme.accent + ' text-white shadow-lg' 
                : theme.text + ' hover:opacity-80'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Time Filters */}
      <div className="flex gap-2 w-full">
        {(['all', 'morning', 'afternoon', 'evening'] as const).map((f) => (
          <button
            key={f}
            onClick={() => { playClickSound(); setTimeFilter(f); }}
            className={`flex-1 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              timeFilter === f 
                ? theme.accent + ' text-white shadow-md' 
                : `bg-white ${theme.text} border-2 ${theme.border}/20 hover:${theme.border}/40`
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* New Habit Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => { playClickSound(); setShowAddHabit(true); }}
        className={`w-full bg-white border-4 ${theme.border} p-4 rounded-[2rem] shadow-sm flex items-center justify-center gap-3 group hover:opacity-90 transition-all`}
      >
        <div className={`w-10 h-10 ${theme.accent} text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <Plus size={24} />
        </div>
        <span className={`text-sm font-black ${theme.text} uppercase tracking-widest`}>Create New Habit</span>
      </motion.button>

      {viewTab === 'today' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dailies Column */}
          <div 
            className={`space-y-4 bg-white p-4 rounded-[2rem] border-2 ${theme.border}`}
          >
            <div className="flex items-center justify-between mb-2 px-2">
              <h2 className={`text-lg font-black ${theme.text}`}>Dailies</h2>
              <span className={`${theme.bg} ${theme.text} text-xs px-2 py-1 rounded-full font-bold`}>{todoHabits.filter(h => h.type === 'regular').length} remaining</span>
            </div>
            {todoHabits.filter(h => h.type === 'regular').map(habit => (
              <HabitItem 
                key={habit.id}
                habit={habit} 
                checked={false}
                userId={user.uid}
                userProfile={userProfile}
                onEdit={setEditingHabit}
                theme={theme}
              />
            ))}
            {completedHabits.filter(h => h.type === 'regular').length > 0 && (
              <div className={`pt-4 border-t-2 ${theme.border}/30 space-y-3`}>
                <h3 className={`text-xs font-black ${theme.lightText} uppercase tracking-widest px-2`}>Completed</h3>
                {completedHabits.filter(h => h.type === 'regular').map(habit => (
                  <HabitItem 
                    key={habit.id}
                    habit={habit} 
                    checked={true}
                    userId={user.uid}
                    userProfile={userProfile}
                    onEdit={setEditingHabit}
                    theme={theme}
                  />
                ))}
              </div>
            )}
            {todoHabits.filter(h => h.type === 'regular').length === 0 && completedHabits.filter(h => h.type === 'regular').length === 0 && (
              <div className={`text-center py-8 bg-white/50 rounded-3xl border-2 border-dashed ${theme.border}`}>
                <p className={`${theme.lightText} font-black uppercase tracking-widest text-[10px]`}>No dailies!</p>
              </div>
            )}
          </div>

          {/* To-Dos Column */}
          <div 
            className={`space-y-4 bg-white p-4 rounded-[2rem] border-2 ${theme.border}`}
          >
            <div className="flex items-center justify-between mb-2 px-2">
              <h2 className={`text-lg font-black ${theme.text}`}>To-Dos</h2>
              <span className={`${theme.bg} ${theme.text} text-xs px-2 py-1 rounded-full font-bold`}>{todoHabits.filter(h => h.type === 'one-time').length} remaining</span>
            </div>
            {todoHabits.filter(h => h.type === 'one-time').map(habit => (
              <HabitItem 
                key={habit.id}
                habit={habit} 
                checked={false}
                userId={user.uid}
                userProfile={userProfile}
                onEdit={setEditingHabit}
                theme={theme}
              />
            ))}
            {completedHabits.filter(h => h.type === 'one-time').length > 0 && (
              <div className={`pt-4 border-t-2 ${theme.border}/30 space-y-3`}>
                <h3 className={`text-xs font-black ${theme.lightText} uppercase tracking-widest px-2`}>Completed</h3>
                {completedHabits.filter(h => h.type === 'one-time').map(habit => (
                  <HabitItem 
                    key={habit.id}
                    habit={habit} 
                    checked={true}
                    userId={user.uid}
                    userProfile={userProfile}
                    onEdit={setEditingHabit}
                    theme={theme}
                  />
                ))}
              </div>
            )}
            {todoHabits.filter(h => h.type === 'one-time').length === 0 && completedHabits.filter(h => h.type === 'one-time').length === 0 && (
              <div className={`text-center py-8 bg-white/50 rounded-3xl border-2 border-dashed ${theme.border}`}>
                <p className={`${theme.lightText} font-black uppercase tracking-widest text-[10px]`}>No to-dos!</p>
              </div>
            )}
          </div>
        </div>
      ) : viewTab === 'weekly' ? (
        <WeeklyView habits={habits} checkins={checkins} onEdit={setEditingHabit} theme={theme} />
      ) : (
        <OverallView habits={habits} checkins={checkins} onEdit={setEditingHabit} theme={theme} />
      )}

      {/* Add Habit Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddHabitModal onClose={() => setIsAddModalOpen(false)} userId={user.uid} theme={theme} />
        )}
      </AnimatePresence>

      {/* Edit Habit Modal */}
      <AnimatePresence>
        {editingHabit && (
          <EditHabitModal 
            habit={editingHabit} 
            onClose={() => setEditingHabit(null)} 
            theme={theme}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PetStatusCard({ userProfile, userId, theme }: { userProfile: UserProfile | null, userId: string, theme: any }) {
  const character = (userProfile?.character as keyof typeof CHARACTER_IMAGES) || 'chiikawa';
  const level = userProfile?.petLevel || 1;
  const exp = userProfile?.petExp || 0;
  const treats = userProfile?.treats || 0;
  const happiness = userProfile?.happiness ?? 100;
  const energy = userProfile?.energy ?? 100;
  const health = userProfile?.health ?? 100;
  const coins = userProfile?.coins || 0;
  const equippedHat = userProfile?.equippedHat;
  const equippedFace = userProfile?.equippedFace;
  const equippedClothing = userProfile?.equippedClothing;
  const equippedHand = userProfile?.equippedHand;
  const equippedBack = userProfile?.equippedBack;
  const equippedVehicle = userProfile?.equippedVehicle;
  const equippedWallpaper = userProfile?.equippedWallpaper;

  const nextLevelExp = level * 50;
  const expProgress = (exp / nextLevelExp) * 100;

  const [hearts, setHearts] = useState<{ id: number, x: number }[]>([]);
  const [isEating, setIsEating] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState(userProfile?.displayName || '');

  const characterNames = {
    chiikawa: 'Chiikawa',
    hachiware: 'Hachiware',
    usagi: 'Usagi'
  };

  const handleSaveProfile = async () => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        displayName: editName
      });
      setShowEditProfile(false);
    } catch (err) {
      console.error("Failed to update profile", err);
    }
  };

  const handlePet = async () => {
    playHappySound();
    const newHeart = { id: Date.now(), x: Math.random() * 40 - 20 };
    setHearts(prev => [...prev, newHeart]);
    
    // Increase happiness slightly on pet
    if (happiness < 100) {
      try {
        await updateDoc(doc(db, 'users', userId), {
          happiness: Math.min(100, happiness + 2)
        });
      } catch (err) {
        // ignore
      }
    }

    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1000);
  };

  // Evolution visual logic
  let petScale = 1;
  let petFilter = 'none';
  if (level >= 20) {
    petScale = 1.3;
    petFilter = 'drop-shadow(0 0 10px rgba(250, 204, 21, 0.8))';
  } else if (level >= 10) {
    petScale = 1.15;
    petFilter = 'drop-shadow(0 0 5px rgba(56, 189, 248, 0.5))';
  } else if (level >= 5) {
    petScale = 1.05;
  }

  return (
    <ChiikawaCard className={`bg-white border-4 ${theme.border} p-4 relative overflow-hidden`}>
      {equippedWallpaper && (
        <div className="absolute inset-0 opacity-20 pointer-events-none text-6xl flex flex-wrap gap-4 justify-center items-center overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => <span key={i}>{equippedWallpaper}</span>)}
        </div>
      )}
      <div className="flex items-center gap-4 relative z-10">
        <div className="relative">
          <motion.div 
            whileTap={{ scale: 0.9 }}
            onClick={handlePet}
            className={`w-20 h-20 ${theme.bg}/80 backdrop-blur-sm rounded-[2rem] flex items-center justify-center border-4 ${theme.border} overflow-hidden cursor-pointer relative`}
          >
            <AnimatePresence>
              {hearts.map(heart => (
                <motion.div
                  key={heart.id}
                  initial={{ opacity: 1, y: 0, x: heart.x, scale: 0.5 }}
                  animate={{ opacity: 0, y: -40, scale: 1.5 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute text-pink-400 z-10 pointer-events-none"
                >
                  <Heart size={16} fill="currentColor" />
                </motion.div>
              ))}
            </AnimatePresence>
            <div className="relative" style={{ transform: `scale(${petScale})`, filter: petFilter }}>
              <LayeredAvatar 
                character={character} 
                equippedHat={equippedHat} 
                equippedFace={equippedFace}
                equippedClothing={equippedClothing}
                equippedHand={equippedHand}
                equippedBack={equippedBack} 
                equippedVehicle={equippedVehicle} 
                isEating={isEating} 
                className="w-12 h-12" 
              />
            </div>
          </motion.div>
          <div className={`absolute ${equippedVehicle ? '-bottom-6' : '-bottom-2'} -right-2 bg-yellow-400 text-white text-[10px] font-black px-2 py-1 rounded-full border-2 border-white shadow-sm transition-all`}>
            LVL {level}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-end mb-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-lg font-black ${theme.text}`}>{userProfile?.displayName || characterNames[character]}</h3>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-black text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">
                  {coins} 🪙
                </span>
                <span className="text-xs font-black text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">
                  {treats} 🍬
                </span>
              </div>
            </div>
            <span className={`text-[10px] font-black ${theme.lightText}`}>{exp}/{nextLevelExp} EXP</span>
          </div>
          
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${expProgress}%` }}
              className={`h-full ${theme.accent} rounded-full`}
            />
          </div>
          
          {/* Vitals */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-yellow-500 w-12">Happy</span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div animate={{ width: `${happiness}%` }} className="h-full bg-yellow-400 rounded-full" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-blue-500 w-12">Energy</span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div animate={{ width: `${energy}%` }} className="h-full bg-blue-400 rounded-full" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-red-500 w-12">Health</span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div animate={{ width: `${health}%` }} className="h-full bg-red-400 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditProfile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`bg-white p-6 rounded-3xl shadow-xl max-w-sm w-full border-4 ${theme.border}/20`}
            >
              <h2 className="text-xl font-black text-gray-800 mb-4">Edit Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Display Name</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={`w-full px-4 py-3 rounded-2xl border-2 ${theme.border}/20 focus:${theme.border} focus:outline-none font-bold text-gray-700`}
                    placeholder="Enter your name"
                    maxLength={20}
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowEditProfile(false)}
                    className="flex-1 py-3 rounded-2xl font-black text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveProfile}
                    className={`flex-1 py-3 rounded-2xl font-black text-white ${theme.buttonBg} hover:opacity-90 transition-colors`}
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ChiikawaCard>
  );
}

function InventoryPanel({ onClose, userProfile, userId, showToast, theme }: { onClose: () => void, userProfile: UserProfile | null, userId: string, showToast: (m: string, t?: any) => void, theme: any }) {
  const inventory = userProfile?.inventory || [];
  const equippedHat = userProfile?.equippedHat;
  const equippedFace = userProfile?.equippedFace;
  const equippedClothing = userProfile?.equippedClothing;
  const equippedHand = userProfile?.equippedHand;
  const equippedBack = userProfile?.equippedBack;
  const equippedVehicle = userProfile?.equippedVehicle;
  const equippedWallpaper = userProfile?.equippedWallpaper;

  const handleEquip = async (itemName: string) => {
    // We need to map item name back to icon/type
    const items = [
      { id: 'party_hat', name: 'Party Hat', icon: '🥳', type: 'hat' },
      { id: 'crown', name: 'Crown', icon: '👑', type: 'hat' },
      { id: 'apple_hood', name: 'Apple Hood', icon: '🍎', type: 'hat' },
      { id: 'butterfly_wings', name: 'Butterfly Wings', icon: '🦋', type: 'back' },
      { id: 'motorcycle', name: 'Motorcycle', icon: '🛵', type: 'vehicle' },
      { id: 'book_stack', name: 'Book Stack Hat', icon: '📚', type: 'hat' },
      { id: 'glasses', name: 'Glasses', icon: '👓', type: 'face' },
      { id: 'straw_hat', name: 'Straw Hat', icon: '👒', type: 'hat' },
      { id: 'suit', name: 'Suit', icon: '👔', type: 'clothing' },
      { id: 'guitar', name: 'Guitar', icon: '🎸', type: 'hand' },
      { id: 'stars', name: 'Starry Sky', icon: '⭐', type: 'wallpaper' },
    ];
    
    const item = items.find(i => i.name === itemName);
    if (!item) return;

    const updates: any = {};
    if (item.type === 'hat') {
      updates.equippedHat = equippedHat === item.id ? null : item.id;
    } else if (item.type === 'face') {
      updates.equippedFace = equippedFace === item.id ? null : item.id;
    } else if (item.type === 'clothing') {
      updates.equippedClothing = equippedClothing === item.id ? null : item.id;
    } else if (item.type === 'hand') {
      updates.equippedHand = equippedHand === item.id ? null : item.id;
    } else if (item.type === 'back') {
      updates.equippedBack = equippedBack === item.id ? null : item.id;
    } else if (item.type === 'vehicle') {
      updates.equippedVehicle = equippedVehicle === item.id ? null : item.id;
    } else if (item.type === 'wallpaper') {
      updates.equippedWallpaper = equippedWallpaper === item.icon ? null : item.icon;
    }

    try {
      await updateDoc(doc(db, 'users', userId), updates);
      playClickSound();
    } catch (err) {
      console.error("Failed to equip item", err);
    }
  };

  const handleOpenGift = async () => {
    // Remove one 'Gift Box' from inventory
    const newInventory = [...inventory];
    const giftIndex = newInventory.indexOf('Gift Box');
    if (giftIndex > -1) {
      newInventory.splice(giftIndex, 1);
    }

    // Random reward
    const rewards = [
      { type: 'coins', amount: 100, name: '100 Coins' },
      { type: 'treats', amount: 5, name: '5 Treats' },
      { type: 'item', item: 'Party Hat' }
    ];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];

    const updates: any = {
      inventory: newInventory
    };

    let alertMsg = '';

    if (reward.type === 'coins') {
      updates.coins = (userProfile?.coins || 0) + reward.amount;
      alertMsg = `You opened a Gift Box and found ${reward.name}!`;
    } else if (reward.type === 'treats') {
      updates.treats = (userProfile?.treats || 0) + reward.amount;
      alertMsg = `You opened a Gift Box and found ${reward.name}!`;
    } else if (reward.type === 'item') {
      if (!newInventory.includes(reward.item)) {
        updates.inventory.push(reward.item);
        alertMsg = `You opened a Gift Box and found a ${reward.item}!`;
      } else {
        updates.coins = (userProfile?.coins || 0) + 50;
        alertMsg = `You opened a Gift Box and found a ${reward.item}, but you already have it! You get 50 Coins instead.`;
      }
    }

    try {
      await updateDoc(doc(db, 'users', userId), updates);
      playSuccessSound();
      showToast(alertMsg, 'success');
    } catch (err) {
      console.error("Failed to open gift", err);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={onClose} />
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed top-0 right-0 bottom-0 w-80 bg-white shadow-2xl z-50 border-l-4 ${theme.border} flex flex-col`}
      >
            <div className={`p-6 border-b-2 ${theme.bg} flex items-center justify-between`}>
              <h2 className={`text-xl font-black ${theme.text} flex items-center gap-2`}>
                <Backpack className={theme.text} />
                Backpack
              </h2>
              <button onClick={onClose} className={`p-2 hover:${theme.bg} rounded-full transition-colors`}>
                <ArrowLeft size={20} className={theme.lightText} />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto space-y-3">
              {inventory.length === 0 ? (
                <p className={`text-center ${theme.lightText} font-bold mt-10`}>Your backpack is empty!</p>
              ) : (
                // Group inventory items
                Array.from(new Set(inventory)).map(itemName => {
                  const count = inventory.filter(i => i === itemName).length;
                  
                  const items = [
                    { id: 'party_hat', name: 'Party Hat', icon: '🥳', type: 'hat' },
                    { id: 'crown', name: 'Crown', icon: '👑', type: 'hat' },
                    { id: 'apple_hood', name: 'Apple Hood', icon: '🍎', type: 'hat' },
                    { id: 'butterfly_wings', name: 'Butterfly Wings', icon: '🦋', type: 'back' },
                    { id: 'motorcycle', name: 'Motorcycle', icon: '🛵', type: 'vehicle' },
                    { id: 'book_stack', name: 'Book Stack Hat', icon: '📚', type: 'hat' },
                    { id: 'glasses', name: 'Glasses', icon: '👓', type: 'face' },
                    { id: 'straw_hat', name: 'Straw Hat', icon: '👒', type: 'hat' },
                    { id: 'suit', name: 'Suit', icon: '👔', type: 'clothing' },
                    { id: 'guitar', name: 'Guitar', icon: '🎸', type: 'hand' },
                    { id: 'stars', name: 'Starry Sky', icon: '⭐', type: 'wallpaper' },
                  ];
                  const itemDef = items.find(i => i.name === itemName);
                  
                  if (itemName === 'Gift Box') {
                    return (
                      <div key="Gift Box" className={`flex items-center justify-between p-3 ${theme.bg} rounded-2xl border-2 ${theme.border}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🎁</span>
                          <div>
                            <p className="font-black text-sm text-pink-900">Gift Box x{count}</p>
                            <p className="text-[10px] font-bold text-pink-600">A mystery gift!</p>
                          </div>
                        </div>
                        <button onClick={handleOpenGift} className="text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-sm bg-pink-400 hover:bg-pink-500 text-white transition-colors">
                          Open
                        </button>
                      </div>
                    );
                  }

                  if (!itemDef) return null;

                  const isEquipped = (itemDef.type === 'hat' && equippedHat === itemDef.id) || 
                                     (itemDef.type === 'face' && equippedFace === itemDef.id) ||
                                     (itemDef.type === 'clothing' && equippedClothing === itemDef.id) ||
                                     (itemDef.type === 'hand' && equippedHand === itemDef.id) ||
                                     (itemDef.type === 'back' && equippedBack === itemDef.id) ||
                                     (itemDef.type === 'vehicle' && equippedVehicle === itemDef.id) ||
                                     (itemDef.type === 'wallpaper' && equippedWallpaper === itemDef.icon);

                  return (
                    <div key={itemName} className={`flex items-center justify-between p-3 ${theme.bg} rounded-2xl border-2 ${theme.border}/20`}>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{itemDef.icon}</span>
                        <div>
                          <p className={`font-black text-sm ${theme.text}`}>{itemName}</p>
                          <p className={`text-[10px] font-bold ${theme.lightText} capitalize`}>{itemDef.type}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleEquip(itemName)}
                        className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-sm transition-colors ${
                          isEquipped ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' : `${theme.accent} hover:opacity-90 text-white`
                        }`}
                      >
                        {isEquipped ? 'Unequip' : 'Equip'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
      </motion.div>
    </>
  );
}

function ShopCard({ userProfile, userId, theme }: { userProfile: UserProfile | null, userId: string, theme: any }) {
  const coins = userProfile?.coins || 0;
  const energy = userProfile?.energy ?? 100;
  const health = userProfile?.health ?? 100;
  const happiness = userProfile?.happiness ?? 100;
  const equippedHat = userProfile?.equippedHat;
  const equippedFace = userProfile?.equippedFace;
  const equippedClothing = userProfile?.equippedClothing;
  const equippedHand = userProfile?.equippedHand;
  const equippedBack = userProfile?.equippedBack;
  const equippedVehicle = userProfile?.equippedVehicle;
  const equippedWallpaper = userProfile?.equippedWallpaper;

  const items = [
    { id: 'apple', name: 'Apple', icon: '🍎', cost: 50, desc: '+20 Energy, +10 Health', type: 'food' },
    { id: 'toy', name: 'Squeaky Toy', icon: '🧸', cost: 50, desc: '+20 Happiness', type: 'food' },
    { id: 'party_hat', name: 'Party Hat', icon: '🥳', cost: 200, desc: 'Equippable Hat', type: 'hat' },
    { id: 'crown', name: 'Crown', icon: '👑', cost: 500, desc: 'Equippable Hat', type: 'hat' },
    { id: 'apple_hood', name: 'Apple Hood', icon: '🍎', cost: 300, desc: 'Equippable Headpiece', type: 'hat' },
    { id: 'butterfly_wings', name: 'Butterfly Wings', icon: '🦋', cost: 400, desc: 'Equippable Back Item', type: 'back' },
    { id: 'motorcycle', name: 'Motorcycle', icon: '🛵', cost: 800, desc: 'Equippable Vehicle', type: 'vehicle' },
    { id: 'book_stack', name: 'Book Stack Hat', icon: '📚', cost: 250, desc: 'Equippable Hat', type: 'hat' },
    { id: 'glasses', name: 'Glasses', icon: '👓', cost: 150, desc: 'Equippable Face Item', type: 'face' },
    { id: 'straw_hat', name: 'Straw Hat', icon: '👒', cost: 200, desc: 'Equippable Hat', type: 'hat' },
    { id: 'suit', name: 'Suit', icon: '👔', cost: 600, desc: 'Equippable Clothing', type: 'clothing' },
    { id: 'guitar', name: 'Guitar', icon: '🎸', cost: 700, desc: 'Equippable Hand Item', type: 'hand' },
    { id: 'stars', name: 'Starry Sky', icon: '⭐', cost: 300, desc: 'Wallpaper', type: 'wallpaper' },
  ];

  const handleBuy = async (item: typeof items[0]) => {
    if (coins < item.cost) return;

    playClickSound();

    const updates: any = {
      coins: coins - item.cost
    };

    if (item.type === 'food') {
      playEatSound();
      if (item.id === 'apple') {
        updates.energy = Math.min(100, energy + 20);
        updates.health = Math.min(100, health + 10);
      } else if (item.id === 'toy') {
        updates.happiness = Math.min(100, happiness + 20);
      }
    } else if (['hat', 'face', 'clothing', 'hand', 'back', 'vehicle', 'wallpaper'].includes(item.type)) {
      const currentInventory = userProfile?.inventory || [];
      if (!currentInventory.includes(item.name)) {
        updates.inventory = [...currentInventory, item.name];
      } else {
        // Already own it, don't charge
        return;
      }
    }

    try {
      await updateDoc(doc(db, 'users', userId), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'users');
    }
  };

  return (
    <ChiikawaCard className={`bg-white border-4 ${theme.border} p-6`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-black ${theme.text}`}>Item Shop</h3>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-black text-yellow-500 ${theme.bg} px-3 py-1 rounded-full border ${theme.border}/30`}>
            {coins} 🪙
          </span>
        </div>
      </div>
      <div className="space-y-3">
        {items.map(item => {
          const isOwned = (userProfile?.inventory || []).includes(item.name);
          
          return (
            <div key={item.id} className={`flex items-center justify-between p-3 ${theme.secondaryBg}/50 rounded-2xl border-2 ${theme.border}/30 hover:${theme.secondaryBg} transition-colors`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className={`font-black text-sm ${theme.text} leading-tight`}>{item.name}</p>
                  <p className={`text-[10px] font-bold ${theme.lightText}`}>{item.desc}</p>
                </div>
              </div>
              <button
                onClick={() => handleBuy(item)}
                disabled={(coins < item.cost && item.type !== 'food') || isOwned}
                className={`text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-sm transition-colors ${
                  isOwned 
                    ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                    : coins >= item.cost 
                      ? `${theme.buttonBg} ${theme.buttonText} hover:opacity-90` 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isOwned ? 'Owned' : `${item.cost} 🪙`}
              </button>
            </div>
          );
        })}
      </div>
    </ChiikawaCard>
  );
}

interface HabitItemProps {
  habit: Habit;
  checked: boolean;
  userId: string;
  userProfile: UserProfile | null;
  onEdit: (habit: Habit) => void;
  theme: any;
  key?: string;
}

  function HabitItem({ habit, checked, userId, userProfile, onEdit, theme }: HabitItemProps) {
  const [showRewardAnim, setShowRewardAnim] = useState(false);
  const [rewardText, setRewardText] = useState({ exp: 0, coins: 0 });
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleCheck = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    const today = format(startOfToday(), 'yyyy-MM-dd');
    const yesterday = format(subDays(startOfToday(), 1), 'yyyy-MM-dd');
    const checkInId = `${userId}_${habit.id}_${today}`;
    
    try {
      if (checked) {
        await deleteDoc(doc(db, 'checkins', checkInId));
        
        // Deduct rewards to prevent farming
        const streakBonus = (habit.streak || 0) >= 3 ? 5 : 0;
        const lostExp = 10 + streakBonus;
        const lostCoins = 10 + streakBonus;

        await updateDoc(doc(db, 'users', userId), {
          petExp: Math.max(0, (userProfile?.petExp || 0) - lostExp),
          coins: Math.max(0, (userProfile?.coins || 0) - lostCoins),
          treats: Math.max(0, (userProfile?.treats || 0) - 1)
        });

        // Reset streak if unchecked today
        if (habit.lastCheckInDate === today) {
          await updateDoc(doc(db, 'habits', habit.id), {
            streak: Math.max(0, (habit.streak || 1) - 1),
            lastCheckInDate: yesterday
          });
        }
      } else {
        // Streak Logic
        let newStreak = 1;
        if (habit.lastCheckInDate === yesterday) {
          newStreak = (habit.streak || 0) + 1;
        } else if (habit.lastCheckInDate === today) {
          newStreak = habit.streak || 1;
        }

        // Calculate Rewards
        const streakBonus = newStreak >= 3 ? 5 : 0;
        const gainedExp = 10 + streakBonus;
        const gainedCoins = 10 + streakBonus;

        setRewardText({ exp: gainedExp, coins: gainedCoins });
        playSuccessSound();
        setShowRewardAnim(true);
        setTimeout(() => setShowRewardAnim(false), 2000);

        await setDoc(doc(db, 'checkins', checkInId), {
          id: checkInId,
          habitId: habit.id,
          userId,
          date: today,
          completed: true
        });

        await updateDoc(doc(db, 'habits', habit.id), {
          streak: newStreak,
          lastCheckInDate: today
        });

        // Reward EXP, Coins, and Treats
        const currentExp = userProfile?.petExp || 0;
        const currentLevel = userProfile?.petLevel || 1;
        const currentTreats = userProfile?.treats || 0;
        const currentCoins = userProfile?.coins || 0;
        
        let newExp = currentExp + gainedExp;
        let newLevel = currentLevel;
        let nextLevelExp = newLevel * 50;

        while (newExp >= nextLevelExp) {
          newExp -= nextLevelExp;
          newLevel += 1;
          nextLevelExp = newLevel * 50;
        }

        await updateDoc(doc(db, 'users', userId), {
          petExp: newExp,
          petLevel: newLevel,
          treats: currentTreats + 1,
          coins: currentCoins + gainedCoins,
          lastHabitLoggedAt: new Date().toISOString(),
          lastHabitName: habit.name,
          mahjongToken: 1
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'checkins');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.98 }}
      className="relative"
    >
      <AnimatePresence>
        {showRewardAnim && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -40, scale: 1.2 }}
            exit={{ opacity: 0 }}
            className="absolute right-4 top-0 pointer-events-none flex flex-col items-end z-10"
          >
            <span className={`${theme.text} font-black text-sm drop-shadow-md`}>+{rewardText.exp} EXP</span>
            <span className="text-yellow-500 font-black text-sm drop-shadow-md">+{rewardText.coins} 🪙</span>
            <span className="text-pink-500 font-black text-sm drop-shadow-md">+1 🍬</span>
          </motion.div>
        )}
      </AnimatePresence>
      <div
        onClick={toggleCheck}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleCheck(); }}
        className={`w-full flex items-center justify-between p-4 rounded-[1.5rem] cursor-pointer transition-all duration-300 ${
          checked 
            ? `${theme.secondaryBg} opacity-60` 
            : `${habit.color || theme.bg} shadow-sm hover:shadow-md`
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="text-2xl">
            {habit.icon || '✨'}
          </div>
          <div className="text-left">
            <p className={`font-black text-sm ${checked ? theme.lightText + ' line-through' : theme.text}`}>
              {habit.name}
            </p>
            <p className={`text-[8px] font-black ${theme.lightText} uppercase tracking-widest flex items-center gap-2 mt-0.5`}>
              <Clock size={8} />
              {habit.habitTime} • {habit.type === 'one-time' ? 'One-time' : (habit.repeatType === 'daily' ? 'Daily' : habit.schedule?.join(', '))}
              {habit.streak > 0 && !checked && (
                <span className="flex items-center gap-1 text-orange-400">
                  <Flame size={8} fill="currentColor" />
                  {habit.streak}d
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {checked ? (
            <div className="w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center text-white shadow-sm shadow-emerald-100">
              <Check size={14} strokeWidth={4} />
            </div>
          ) : (
            <div className={`w-6 h-6 rounded-full border-2 ${theme.border}/30`} />
          )}
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              playClickSound();
              onEdit(habit);
            }}
            className={`p-1 ${theme.mutedText} hover:${theme.text} transition-colors flex-shrink-0`}
          >
            <Pencil size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function AddHabitModal({ onClose, userId, theme }: { onClose: () => void, userId: string, theme: any }) {
  const [type, setType] = useState<'regular' | 'one-time'>('regular');
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🏃');
  const [color, setColor] = useState(theme.bg);
  const [repeatType, setRepeatType] = useState<'daily' | 'weekly'>('daily');
  const [schedule, setSchedule] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  const [habitTime, setHabitTime] = useState('09:00');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'all-day'>('all-day');
  const [endType, setEndType] = useState<'date' | 'days' | 'never'>('never');
  const [endDate, setEndDate] = useState('');
  const [endDays, setEndDays] = useState(30);
  const [isReminderEnabled, setIsReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [isShared, setIsShared] = useState(false);
  const [oneTimeDate, setOneTimeDate] = useState(format(startOfToday(), 'yyyy-MM-dd'));

  const categories = [
    { name: 'Exercise', icon: '🏃' },
    { name: 'Study', icon: '📖' },
    { name: 'Cook', icon: '🍳' },
    { name: 'Life', icon: '🏠' },
    { name: 'Health', icon: '🍎' },
    { name: 'Work', icon: '💻' },
    { name: 'Zen', icon: '🧘' },
    { name: 'Hobby', icon: '🎨' },
    { name: 'Social', icon: '💬' },
    { name: 'Sleep', icon: '💤' },
  ];

  const colors = [
    'bg-red-100', 'bg-orange-100', 'bg-yellow-100', 'bg-emerald-100', theme.bg, 'bg-indigo-100', 'bg-purple-100', 'bg-pink-100'
  ];

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const toggleDay = (day: string) => {
    setSchedule(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const getTimeOfDayFromTime = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    return 'evening';
  };

  const handleAdd = async () => {
    playClickSound();
    if (!name.trim()) return;
    const id = Math.random().toString(36).substring(2, 11);
    
    // For daily habits, schedule is always all days
    const finalSchedule = repeatType === 'daily' ? days : schedule;
    const finalTimeOfDay = getTimeOfDayFromTime(habitTime);
    const finalReminderTime = ((type === 'one-time' || repeatType === 'daily') && isReminderEnabled) ? habitTime : reminderTime;

    try {
      await setDoc(doc(db, 'habits', id), {
        id,
        userId,
        name,
        icon,
        color,
        type,
        repeatType: type === 'one-time' ? 'daily' : repeatType,
        schedule: type === 'one-time' ? days : finalSchedule,
        habitTime,
        timeOfDay: finalTimeOfDay,
        endType: type === 'one-time' ? 'never' : endType,
        endDate: (type === 'one-time' || !endDate) ? null : endDate,
        endDays: (type === 'one-time' || !endDays) ? null : endDays,
        oneTimeDate: type === 'one-time' ? oneTimeDate : null,
        isReminderEnabled,
        reminderTime: isReminderEnabled ? finalReminderTime : null,
        isShared: type === 'one-time' ? false : isShared,
        streak: 0,
        createdAt: new Date().toISOString()
      });
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'habits');
    }
  };

  return (
    <div className={`fixed inset-0 ${theme.bg}/40 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-4 overflow-y-auto`}>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className={`${theme.cardBg} w-full max-w-md rounded-[3rem] p-6 shadow-2xl my-auto no-scrollbar`}
      >
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => { playClickSound(); onClose(); }} className={`p-2 ${theme.lightText} hover:${theme.text}`}>
            <X size={24} />
          </button>
          <h3 className={`text-lg font-black ${theme.text}`}>Create New Habit</h3>
          <div className="w-10" />
        </div>

        <div className="space-y-6">
          {/* Type Tabs */}
          <div className={`flex ${theme.secondaryBg} p-1 rounded-2xl`}>
            {(['regular', 'one-time'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  type === t 
                    ? `${theme.buttonBg} ${theme.buttonText} shadow-md` 
                    : `${theme.lightText} hover:${theme.text}`
                }`}
              >
                {t === 'regular' ? 'Regular Habit' : 'One-Time Task'}
              </button>
            ))}
          </div>

          {/* Habit Name */}
          <div>
            <label className={`block text-[10px] font-black ${theme.lightText} uppercase tracking-widest mb-2`}>Habit Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Habit Name"
              className={`w-full ${theme.secondaryBg} border-none rounded-2xl p-4 font-bold ${theme.text} focus:ring-2 ${theme.ring} outline-none placeholder:${theme.mutedText}`}
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className={`block text-[10px] font-black ${theme.lightText} uppercase tracking-widest mb-3`}>Category</label>
            <div className="grid grid-cols-5 gap-3">
              {categories.map(cat => (
                <button 
                  key={cat.name} 
                  onClick={() => setIcon(cat.icon)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all ${icon === cat.icon ? `${theme.accent} text-white scale-105 shadow-lg ${theme.shadow}` : 'bg-gray-50/50 hover:bg-gray-100'}`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className={`text-[8px] font-black uppercase tracking-tighter ${icon === cat.icon ? 'text-white' : 'text-gray-400'}`}>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className={`block text-[10px] font-black ${theme.lightText} uppercase tracking-widest mb-2`}>Color</label>
            <div className="grid grid-cols-8 gap-2">
              {colors.map(c => (
                <button 
                  key={c} 
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full ${c} border-2 transition-all flex items-center justify-center ${color === c ? `${theme.border} scale-110` : 'border-white'}`}
                >
                  {color === c && <Check size={12} className={theme.text} />}
                </button>
              ))}
            </div>
          </div>

          {/* Repeat Settings - Only for Regular Habits */}
          {type === 'regular' ? (
            <div>
              <label className={`block text-[10px] font-black ${theme.lightText} uppercase tracking-widest mb-2`}>Repeat</label>
              <div className={`flex ${theme.bg} p-1 rounded-2xl mb-4`}>
                {(['daily', 'weekly'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRepeatType(r)}
                    className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      repeatType === r 
                        ? `${theme.buttonBg} ${theme.buttonText} shadow-sm` 
                        : `${theme.lightText} hover:${theme.text}`
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {repeatType === 'weekly' && (
                <div className="space-y-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-black ${theme.text} uppercase tracking-widest`}>On these days:</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black ${theme.lightText} uppercase tracking-widest`}>All week</span>
                      <input 
                        type="checkbox" 
                        checked={schedule.length === 7} 
                        onChange={(e) => setSchedule(e.target.checked ? days : [])}
                        className={`w-4 h-4 rounded border-${theme.border.replace('border-', '')}/30 ${theme.text} focus:${theme.ring}`}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    {days.map(day => (
                      <button 
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${schedule.includes(day) ? `${theme.buttonBg} ${theme.buttonText}` : `${theme.bg} ${theme.lightText}`}`}
                      >
                        {day[0]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Date Selection for One-Time Tasks */
            <div>
              <label className={`block text-[10px] font-black ${theme.lightText} uppercase tracking-widest mb-2`}>Select Date</label>
              <input 
                type="date" 
                value={oneTimeDate}
                onChange={(e) => setOneTimeDate(e.target.value)}
                className={`w-full ${theme.secondaryBg} border-none rounded-2xl p-4 font-bold ${theme.text} focus:ring-2 ${theme.ring} outline-none`}
              />
            </div>
          )}

          {/* Habit Time */}
          <div>
            <label className={`block text-[10px] font-black ${theme.lightText} uppercase tracking-widest mb-2`}>Select Time</label>
            <input 
              type="time" 
              value={habitTime}
              onChange={(e) => setHabitTime(e.target.value)}
              className={`w-full ${theme.secondaryBg} border-none rounded-2xl p-4 font-bold ${theme.text} focus:ring-2 ${theme.ring} outline-none`}
            />
          </div>

          {/* End Habit - Only for Regular Habits */}
          {type === 'regular' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className={`text-[10px] font-black ${theme.text} uppercase tracking-widest`}>End Habit on</label>
                <button 
                  onClick={() => setEndType(prev => prev === 'never' ? 'date' : 'never')}
                  className={`w-10 h-5 rounded-full transition-all relative ${endType !== 'never' ? theme.buttonBg : theme.bg}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${endType !== 'never' ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              {endType !== 'never' && (
                <div className="space-y-3">
                  <div className={`flex ${theme.bg} p-1 rounded-2xl`}>
                    {(['date', 'days'] as const).map((et) => (
                      <button
                        key={et}
                        onClick={() => setEndType(et)}
                        className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          endType === et 
                            ? `${theme.buttonBg} ${theme.buttonText} shadow-sm` 
                            : `${theme.lightText} hover:${theme.text}`
                        }`}
                      >
                        {et}
                      </button>
                    ))}
                  </div>
                  {endType === 'date' ? (
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={`w-full ${theme.secondaryBg} border-none rounded-xl p-3 text-xs font-bold ${theme.text} focus:ring-2 ${theme.ring} outline-none`}
                    />
                  ) : (
                    <div className={`flex items-center gap-3 ${theme.secondaryBg} rounded-xl p-3`}>
                      <input 
                        type="number" 
                        value={endDays}
                        onChange={(e) => setEndDays(parseInt(e.target.value) || 0)}
                        className={`w-16 bg-transparent border-none text-xs font-bold ${theme.text} focus:ring-0 outline-none`}
                      />
                      <span className={`text-[10px] font-black ${theme.lightText} uppercase tracking-widest`}>Days</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Reminder */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className={`text-[10px] font-black ${theme.text} uppercase tracking-widest`}>Set Reminder</label>
              <button 
                onClick={() => setIsReminderEnabled(!isReminderEnabled)}
                className={`w-10 h-5 rounded-full transition-all relative ${isReminderEnabled ? theme.buttonBg : theme.bg}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isReminderEnabled ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            {isReminderEnabled && type === 'regular' && repeatType !== 'daily' && (
              <input 
                type="time" 
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className={`w-full ${theme.secondaryBg} border-none rounded-2xl p-4 font-bold ${theme.text} focus:ring-2 ${theme.ring} outline-none`}
              />
            )}
            {isReminderEnabled && (type === 'one-time' || (type === 'regular' && repeatType === 'daily')) && (
              <div className={`${theme.secondaryBg} rounded-2xl p-4 text-xs font-bold ${theme.lightText} italic`}>
                Reminder set for {habitTime}
              </div>
            )}
          </div>

          {/* Share Toggle - Only for Regular Habits */}
          {type === 'regular' && (
            <div className={`flex items-center justify-between p-4 ${theme.bg} rounded-2xl`}>
              <div>
                <h4 className={`text-sm font-black ${theme.text}`}>Share with Buddies</h4>
                <p className={`text-[10px] font-bold ${theme.lightText}`}>Buddies can see your progress on this habit</p>
              </div>
              <button 
                onClick={() => setIsShared(!isShared)}
                className={`w-12 h-6 rounded-full transition-all relative ${isShared ? theme.accent : 'bg-gray-200'}`}
              >
                <motion.div 
                  animate={{ x: isShared ? 24 : 4 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                />
              </button>
            </div>
          )}

          <button 
            onClick={handleAdd}
            className={`w-full ${theme.buttonBg} ${theme.buttonText} py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg ${theme.shadow} hover:opacity-90 transition-all`}
          >
            Save
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function EditHabitModal({ habit, onClose, theme }: { habit: Habit, onClose: () => void, theme: any }) {
  const [type, setType] = useState<'regular' | 'one-time'>(habit.type || 'regular');
  const [name, setName] = useState(habit.name);
  const [icon, setIcon] = useState(habit.icon);
  const [color, setColor] = useState(habit.color);
  const [repeatType, setRepeatType] = useState<'daily' | 'weekly'>(habit.repeatType as any || 'daily');
  const [schedule, setSchedule] = useState<string[]>(habit.schedule || []);
  const [habitTime, setHabitTime] = useState(habit.habitTime || '09:00');
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'all-day'>(habit.timeOfDay || 'all-day');
  const [endType, setEndType] = useState<'date' | 'days' | 'never'>(habit.endType || 'never');
  const [endDate, setEndDate] = useState(habit.endDate || '');
  const [endDays, setEndDays] = useState(habit.endDays || 30);
  const [isReminderEnabled, setIsReminderEnabled] = useState(habit.isReminderEnabled || false);
  const [reminderTime, setReminderTime] = useState(habit.reminderTime || '09:00');
  const [isShared, setIsShared] = useState(habit.isShared || false);
  const [oneTimeDate, setOneTimeDate] = useState(habit.oneTimeDate || format(startOfToday(), 'yyyy-MM-dd'));
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const categories = [
    { name: 'Exercise', icon: '🏃' },
    { name: 'Study', icon: '📖' },
    { name: 'Cook', icon: '🍳' },
    { name: 'Life', icon: '🏠' },
    { name: 'Health', icon: '🍎' },
    { name: 'Work', icon: '💻' },
    { name: 'Zen', icon: '🧘' },
    { name: 'Hobby', icon: '🎨' },
    { name: 'Social', icon: '💬' },
    { name: 'Sleep', icon: '💤' },
  ];

  const colors = [
    'bg-red-100', 'bg-orange-100', 'bg-yellow-100', 'bg-emerald-100', theme.bg, 'bg-indigo-100', 'bg-purple-100', 'bg-pink-100'
  ];

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const toggleDay = (day: string) => {
    setSchedule(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const getTimeOfDayFromTime = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    return 'evening';
  };

  const handleUpdate = async () => {
    playClickSound();
    if (!name.trim()) return;

    // For daily habits, schedule is always all days
    const finalSchedule = repeatType === 'daily' ? days : schedule;
    const finalTimeOfDay = getTimeOfDayFromTime(habitTime);
    const finalReminderTime = ((type === 'one-time' || repeatType === 'daily') && isReminderEnabled) ? habitTime : reminderTime;

    try {
      await updateDoc(doc(db, 'habits', habit.id), {
        name,
        icon,
        color,
        type,
        repeatType: type === 'one-time' ? 'daily' : repeatType,
        schedule: type === 'one-time' ? days : finalSchedule,
        habitTime,
        timeOfDay: finalTimeOfDay,
        endType: type === 'one-time' ? 'never' : endType,
        endDate: (type === 'one-time' || !endDate) ? null : endDate,
        endDays: (type === 'one-time' || !endDays) ? null : endDays,
        oneTimeDate: type === 'one-time' ? oneTimeDate : null,
        isReminderEnabled,
        reminderTime: isReminderEnabled ? finalReminderTime : null,
        isShared: type === 'one-time' ? false : isShared,
      });
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'habits');
    }
  };

  const handleDelete = async () => {
    playClickSound();
    try {
      await deleteDoc(doc(db, 'habits', habit.id));
      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'habits');
    }
  };

  return (
    <div className={`fixed inset-0 ${theme.bg}/40 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-4 overflow-y-auto`}>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className={`${theme.cardBg} w-full max-w-md rounded-[3rem] p-6 shadow-2xl my-auto no-scrollbar relative`}
      >
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`absolute inset-0 z-[110] ${theme.cardBg}/95 backdrop-blur-sm rounded-[3rem] flex items-center justify-center p-8 text-center`}
            >
              <div className="space-y-6">
                <div>
                  <h4 className={`text-xl font-black ${theme.text} mb-2`}>Delete Habit?</h4>
                  <p className={`text-sm font-medium ${theme.lightText}`}>Are you sure you want to delete this habit? This action cannot be undone.</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className={`flex-1 py-3 rounded-2xl ${theme.bg} ${theme.lightText} font-black uppercase tracking-widest text-xs hover:opacity-80 transition-all`}
                  >
                    No, Keep it
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-red-100 hover:bg-red-600 transition-all"
                  >
                    Yes, Delete
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex justify-between items-center mb-6">
          <button onClick={onClose} className={`p-2 ${theme.lightText} hover:${theme.text}`}>
            <X size={24} />
          </button>
          <h3 className={`text-lg font-black ${theme.text}`}>Edit Habit</h3>
          <div className="w-10" /> {/* Spacer to keep title centered */}
        </div>

        <div className="space-y-6">
          {/* Type Tabs */}
          <div className={`flex ${theme.bg} p-1 rounded-2xl`}>
            {(['regular', 'one-time'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  type === t 
                    ? `${theme.buttonBg} ${theme.buttonText} shadow-md` 
                    : `${theme.lightText} hover:${theme.text}`
                }`}
              >
                {t === 'regular' ? 'Regular Habit' : 'One-Time Task'}
              </button>
            ))}
          </div>

          {/* Habit Name */}
          <div>
            <label className={`block text-[10px] font-black ${theme.lightText} uppercase tracking-widest mb-2`}>Habit Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Habit Name"
              className={`w-full ${theme.secondaryBg} border-none rounded-2xl p-4 font-bold ${theme.text} focus:ring-2 ${theme.ring} outline-none placeholder:${theme.mutedText}`}
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className={`block text-[10px] font-black ${theme.lightText} uppercase tracking-widest mb-3`}>Category</label>
            <div className="grid grid-cols-5 gap-3">
              {categories.map(cat => (
                <button 
                  key={cat.name} 
                  onClick={() => setIcon(cat.icon)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all ${icon === cat.icon ? `${theme.accent} text-white scale-105 shadow-lg ${theme.shadow}` : 'bg-gray-50/50 hover:bg-gray-100'}`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className={`text-[8px] font-black uppercase tracking-tighter ${icon === cat.icon ? 'text-white' : 'text-gray-400'}`}>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className={`block text-[10px] font-black ${theme.lightText} uppercase tracking-widest mb-2`}>Color</label>
            <div className="grid grid-cols-8 gap-2">
              {colors.map(c => (
                <button 
                  key={c} 
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full ${c} border-2 transition-all flex items-center justify-center ${color === c ? `${theme.border} scale-110` : 'border-white'}`}
                >
                  {color === c && <Check size={12} className={theme.text} />}
                </button>
              ))}
            </div>
          </div>

          {/* Repeat Settings - Only for Regular Habits */}
          {type === 'regular' ? (
            <div>
              <label className={`block text-[10px] font-black ${theme.lightText} uppercase tracking-widest mb-2`}>Repeat</label>
              <div className={`flex ${theme.bg} p-1 rounded-2xl mb-4`}>
                {(['daily', 'weekly'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRepeatType(r)}
                    className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      repeatType === r 
                        ? `${theme.buttonBg} ${theme.buttonText} shadow-sm` 
                        : `${theme.lightText} hover:${theme.text}`
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {repeatType === 'weekly' && (
                <div className="space-y-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-black ${theme.text} uppercase tracking-widest`}>On these days:</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black ${theme.lightText} uppercase tracking-widest`}>All week</span>
                      <input 
                        type="checkbox" 
                        checked={schedule.length === 7} 
                        onChange={(e) => setSchedule(e.target.checked ? days : [])}
                        className={`w-4 h-4 rounded border-${theme.border.replace('border-', '')}/30 ${theme.text} focus:${theme.ring}`}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    {days.map(day => (
                      <button 
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${schedule.includes(day) ? `${theme.buttonBg} ${theme.buttonText}` : `${theme.bg} ${theme.lightText}`}`}
                      >
                        {day[0]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Date Selection for One-Time Tasks */
            <div>
              <label className={`block text-[10px] font-black ${theme.lightText} uppercase tracking-widest mb-2`}>Select Date</label>
              <input 
                type="date" 
                value={oneTimeDate}
                onChange={(e) => setOneTimeDate(e.target.value)}
                className={`w-full ${theme.secondaryBg} border-none rounded-2xl p-4 font-bold ${theme.text} focus:ring-2 ${theme.ring} outline-none`}
              />
            </div>
          )}

          {/* Habit Time */}
          <div>
            <label className={`block text-[10px] font-black ${theme.lightText} uppercase tracking-widest mb-2`}>Select Time</label>
            <input 
              type="time" 
              value={habitTime}
              onChange={(e) => setHabitTime(e.target.value)}
              className={`w-full ${theme.secondaryBg} border-none rounded-2xl p-4 font-bold ${theme.text} focus:ring-2 ${theme.ring} outline-none`}
            />
          </div>

          {/* End Habit - Only for Regular Habits */}
          {type === 'regular' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className={`text-[10px] font-black ${theme.text} uppercase tracking-widest`}>End Habit on</label>
                <button 
                  onClick={() => setEndType(prev => prev === 'never' ? 'date' : 'never')}
                  className={`w-10 h-5 rounded-full transition-all relative ${endType !== 'never' ? theme.buttonBg : theme.bg}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${endType !== 'never' ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
              {endType !== 'never' && (
                <div className="space-y-3">
                  <div className={`flex ${theme.bg} p-1 rounded-2xl`}>
                    {(['date', 'days'] as const).map((et) => (
                      <button
                        key={et}
                        onClick={() => setEndType(et)}
                        className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          endType === et 
                            ? `${theme.buttonBg} ${theme.buttonText} shadow-sm` 
                            : `${theme.lightText} hover:${theme.text}`
                        }`}
                      >
                        {et}
                      </button>
                    ))}
                  </div>
                  {endType === 'date' ? (
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={`w-full ${theme.secondaryBg} border-none rounded-xl p-3 text-xs font-bold ${theme.text} focus:ring-2 ${theme.ring} outline-none`}
                    />
                  ) : (
                    <div className={`flex items-center gap-3 ${theme.secondaryBg} rounded-xl p-3`}>
                      <input 
                        type="number" 
                        value={endDays}
                        onChange={(e) => setEndDays(parseInt(e.target.value) || 0)}
                        className={`w-16 bg-transparent border-none text-xs font-bold ${theme.text} focus:ring-0 outline-none`}
                      />
                      <span className={`text-[10px] font-black ${theme.lightText} uppercase tracking-widest`}>Days</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Reminder */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className={`text-[10px] font-black ${theme.text} uppercase tracking-widest`}>Set Reminder</label>
              <button 
                onClick={() => setIsReminderEnabled(!isReminderEnabled)}
                className={`w-10 h-5 rounded-full transition-all relative ${isReminderEnabled ? theme.buttonBg : theme.bg}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isReminderEnabled ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            {isReminderEnabled && type === 'regular' && repeatType !== 'daily' && (
              <input 
                type="time" 
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className={`w-full ${theme.secondaryBg} border-none rounded-2xl p-4 font-bold ${theme.text} focus:ring-2 ${theme.ring} outline-none`}
              />
            )}
            {isReminderEnabled && (type === 'one-time' || (type === 'regular' && repeatType === 'daily')) && (
              <div className={`${theme.secondaryBg} rounded-2xl p-4 text-xs font-bold ${theme.lightText} italic`}>
                Reminder set for {habitTime}
              </div>
            )}
          </div>

          {/* Share Toggle - Only for Regular Habits */}
          {type === 'regular' && (
            <div className={`flex items-center justify-between p-4 ${theme.bg} rounded-2xl`}>
              <div>
                <h4 className={`text-sm font-black ${theme.text}`}>Share with Buddies</h4>
                <p className={`text-[10px] font-bold ${theme.lightText}`}>Buddies can see your progress on this habit</p>
              </div>
              <button 
                onClick={() => setIsShared(!isShared)}
                className={`w-12 h-6 rounded-full transition-all relative ${isShared ? theme.accent : 'bg-gray-200'}`}
              >
                <motion.div 
                  animate={{ x: isShared ? 24 : 4 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                />
              </button>
            </div>
          )}

          <button 
            onClick={handleUpdate}
            className={`w-full ${theme.buttonBg} ${theme.buttonText} py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg ${theme.shadow} hover:opacity-90 transition-all`}
          >
            Update
          </button>

          <button 
            onClick={() => { playClickSound(); setShowDeleteConfirm(true); }}
            className="w-full py-2 text-xs font-black text-red-400 hover:text-red-500 uppercase tracking-widest transition-all"
          >
            Delete Habit
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Stats({ user, theme }: { user: any, theme: any }) {
  const { data: habits } = useFirestoreCollection<Habit>('habits', useMemo(() => user?.uid ? [where('userId', '==', user.uid)] : [], [user?.uid]), !!user);
  const { data: allCheckins } = useFirestoreCollection<CheckIn>('checkins', useMemo(() => user?.uid ? [where('userId', '==', user.uid)] : [], [user?.uid]), !!user);

  const last7Days = useMemo(() => {
    const today = new Date();
    const start = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const end = addDays(start, 6); // Sunday
    
    return eachDayOfInterval({
      start,
      end
    }).map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const count = allCheckins.filter(c => c.date === dateStr && c.completed).length;
      return {
        name: format(date, 'EEE'),
        count
      };
    });
  }, [allCheckins]);

  const regularHabits = useMemo(() => habits.filter(h => h.type === 'regular'), [habits]);
  const oneTimeTasks = useMemo(() => habits.filter(h => h.type === 'one-time'), [habits]);

  const habitStats = useMemo(() => {
    return regularHabits.map(h => {
      const count = allCheckins.filter(c => c.habitId === h.id && c.completed).length;
      return {
        id: h.id,
        name: h.name,
        icon: h.icon,
        count,
        streak: h.streak || 0,
        color: h.color
      };
    });
  }, [regularHabits, allCheckins]);

  const taskStats = useMemo(() => {
    return oneTimeTasks.map(h => {
      const count = allCheckins.filter(c => c.habitId === h.id && c.completed).length;
      return {
        id: h.id,
        name: h.name,
        icon: h.icon,
        count,
        date: h.oneTimeDate,
        color: h.color
      };
    });
  }, [oneTimeTasks, allCheckins]);

  const totalTaskCompletions = useMemo(() => {
    const taskIds = new Set(oneTimeTasks.map(t => t.id));
    return allCheckins.filter(c => taskIds.has(c.habitId) && c.completed).length;
  }, [oneTimeTasks, allCheckins]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8 pb-10"
    >
      <div className={`bg-white p-6 rounded-[2rem] border-4 ${theme.border} shadow-xl ${theme.shadow}`}>
        <div className="flex items-center gap-4 mb-2">
          <div className={`w-12 h-12 ${theme.bg} rounded-2xl flex items-center justify-center`}>
            <TrendingUp className={theme.text} size={24} />
          </div>
          <div>
            <h2 className={`text-2xl font-black ${theme.text}`}>Your Progress</h2>
            <p className={`text-xs font-bold ${theme.lightText} uppercase tracking-widest`}>Tracking your journey</p>
          </div>
        </div>
      </div>

      <ChiikawaCard className={`h-64 px-2 bg-white border-4 ${theme.border}`}>
        <h3 className={`text-sm font-black ${theme.lightText} uppercase tracking-widest mb-4 ml-3 mt-[-12px] mr-0`}>Weekly Progress (Mon-Sun)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={last7Days} margin={{ left: -25, right: 0, top: 10, bottom: 0 }} style={{ border: 'none', outline: 'none' }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#9CA3AF' }} />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 700, fill: '#9CA3AF' }}
              allowDecimals={false}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 700 }}
              cursor={{ fill: '#F0F9FF', radius: 10 }}
            />
            <Bar dataKey="count" fill={theme.name === 'Chiikawa' ? '#ecc9cf' : theme.name === 'Hachiware' ? '#6366f1' : '#eab308'} radius={[10, 10, 10, 10]} barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </ChiikawaCard>

      <div className="grid grid-cols-2 gap-4">
        <ChiikawaCard className={`${theme.mutedBg} ${theme.border} border-2 p-4`}>
          <p className={`text-[10px] font-black ${theme.mutedText} uppercase tracking-widest mb-1`}>Regular Habits</p>
          <p className={`text-3xl font-black ${theme.text}`}>{regularHabits.length}</p>
        </ChiikawaCard>
        <ChiikawaCard className={`${theme.bg} ${theme.border} border-2 p-4`}>
          <p className={`text-[10px] font-black ${theme.mutedText} uppercase tracking-widest mb-1`}>One-Time Tasks</p>
          <p className={`text-3xl font-black ${theme.text}`}>{oneTimeTasks.length}</p>
        </ChiikawaCard>
        <ChiikawaCard className={`${theme.bg} ${theme.border} border-2 p-4`}>
          <p className={`text-[10px] font-black ${theme.mutedText} uppercase tracking-widest mb-1`}>Habit Done</p>
          <p className={`text-3xl font-black ${theme.text}`}>{allCheckins.length - totalTaskCompletions}</p>
        </ChiikawaCard>
        <ChiikawaCard className={`${theme.bg} ${theme.border} border-2 p-4`}>
          <p className={`text-[10px] font-black ${theme.mutedText} uppercase tracking-widest mb-1`}>Tasks Done</p>
          <p className={`text-3xl font-black ${theme.text}`}>{totalTaskCompletions}</p>
        </ChiikawaCard>
      </div>

      <section className="space-y-10">
        {/* Habit Insights */}
        <div>
          <h3 className={`text-sm font-black ${theme.lightText} uppercase tracking-widest mb-6 flex items-center gap-2`}>
            <div className={`w-1.5 h-1.5 rounded-full ${theme.accent}`} />
            Habit Insights
          </h3>
          <div className="space-y-4">
            {habitStats.map(stat => (
              <div key={stat.id}>
                <ChiikawaCard className={`p-4 bg-white border-2 ${theme.border}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center text-xl`}>
                        {stat.icon}
                      </div>
                      <div>
                        <p className={`font-black ${theme.text}`}>{stat.name}</p>
                        <p className={`text-[10px] font-black ${theme.lightText} uppercase tracking-widest`}>{stat.count} total completions</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-orange-50 text-orange-500 px-3 py-1 rounded-full">
                      <Flame size={14} fill="currentColor" />
                      <span className="text-xs font-black">{stat.streak}</span>
                    </div>
                  </div>
                  <div className={`h-2 ${theme.bg} rounded-full overflow-hidden`}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((stat.count / 30) * 100, 100)}%` }}
                      className={`h-full ${theme.accent} rounded-full`}
                    />
                  </div>
                </ChiikawaCard>
              </div>
            ))}
          </div>
        </div>

        {/* Task Insights */}
        {taskStats.length > 0 && (
          <div>
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${theme.accent}`} />
              One-Time Task Stats
            </h3>
            <div className="grid gap-4">
              {taskStats.map(stat => (
                <ChiikawaCard key={stat.id} className={`p-4 flex items-center justify-between bg-white border-2 ${theme.border}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center text-xl`}>
                      {stat.icon}
                    </div>
                    <div>
                      <p className={`font-black ${theme.text}`}>{stat.name}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Date: {stat.date}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${stat.count > 0 ? 'bg-emerald-100 text-emerald-600' : `${theme.bg} ${theme.text}`}`}>
                    {stat.count > 0 ? 'Completed' : 'Pending'}
                  </div>
                </ChiikawaCard>
              ))}
            </div>
          </div>
        )}
      </section>
    </motion.div>
  );
}

function AppleTree({ user, userProfile, activeUsers, showToast }: any) {
  const [isGameActive, setIsGameActive] = useState(false);
  const [apples, setApples] = useState<{id: number, x: number, y: number, type: 'apple' | 'bomb'}[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);

  const startGame = async () => {
    if (isGameActive) return;

    // Automatically move the user to the park if they click the tree
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        townX: 20,
        townY: 80
      });
    } catch (e) {
      console.error("Failed to move user to park", e);
    }
    
    setIsGameActive(true);
    setScore(0);
    setTimeLeft(15);
    setApples([]);
  };

  useEffect(() => {
    if (!isGameActive) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    const spawner = setInterval(() => {
      const isBomb = Math.random() > 0.8; // 20% chance for a bomb
      setApples(prev => [...prev, { id: Date.now(), x: Math.random() * 80 + 10, y: -10, type: isBomb ? 'bomb' : 'apple' }]);
    }, 800); // Slower spawn rate

    return () => {
      clearInterval(timer);
      clearInterval(spawner);
    };
  }, [isGameActive]);

  useEffect(() => {
    if (isGameActive && timeLeft <= 0) {
      endGame();
    }
  }, [isGameActive, timeLeft]);

  useEffect(() => {
    if (!isGameActive) return;
    const faller = setInterval(() => {
      setApples(prev => prev.map(a => ({ ...a, y: a.y + 2.5 })).filter(a => a.y < 120)); // Fall slower
    }, 50);
    return () => clearInterval(faller);
  }, [isGameActive]);

  const endGame = async (hitBomb: boolean = false) => {
    setIsGameActive(false);
    setApples([]);
    
    if (hitBomb) {
      showToast("BOOM! You clicked a bomb! Game Over.", "error");
      return;
    }

    if (score > 0) {
      const coinsEarned = score * 5;
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          coins: (userProfile?.coins || 0) + coinsEarned
        });
        showToast(`Game Over! You caught ${score} apples and earned ${coinsEarned} 🪙!`, 'success');
      } catch (err) {
        console.error(err);
      }
    } else {
      showToast("Game Over! You didn't catch any apples.");
    }
  };

  const catchItem = (id: number, type: 'apple' | 'bomb', e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (type === 'bomb') {
      endGame(true);
    } else {
      playEatSound();
      setApples(prev => prev.filter(a => a.id !== id));
      setScore(prev => prev + 1);
    }
  };

  return (
    <>
      <button 
        onClick={(e) => { e.stopPropagation(); startGame(); }}
        className="relative z-10 hover:scale-110 transition-transform group"
      >
        <span className="text-6xl drop-shadow-lg">🌳</span>
        {!isGameActive && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-lg text-[8px] font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
            Apple Catch!
          </div>
        )}
      </button>

      {isGameActive && (
        <div className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-center">
          <div className="absolute top-10 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-3xl border-4 border-red-200 shadow-xl flex items-center gap-6 pointer-events-auto">
            <div className="text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Time</p>
              <p className="text-3xl font-black text-red-500">{timeLeft}s</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Score</p>
              <p className="text-3xl font-black text-green-500">{score}</p>
            </div>
          </div>

          {apples.map(item => (
            <button
              key={item.id}
              onPointerDown={(e) => catchItem(item.id, item.type, e)}
              className="absolute text-5xl pointer-events-auto hover:scale-125 transition-transform touch-none select-none"
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
            >
              {item.type === 'bomb' ? '💣' : '🍎'}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

function TownSquare({ user, userProfile, showToast, theme }: { user: any, userProfile: UserProfile | null, showToast: (m: string, t?: any) => void, theme: any }) {
  const [activeUsers, setActiveUsers] = useState<UserProfile[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Query users who have been active in the last 5 minutes
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const q = query(
      collection(db, 'users'),
      where('lastActive', '>', fiveMinsAgo)
    );
    
    const unsub = onSnapshot(q, (snap) => {
      const users = snap.docs.map(d => d.data() as UserProfile);
      // Sort locally to avoid needing a composite index
      users.sort((a, b) => (b.lastActive || '').localeCompare(a.lastActive || ''));
      setActiveUsers(users);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'users');
    });
    
    return () => unsub();
  }, []);

  // Update own position randomly every 10-20 seconds if idle
  useEffect(() => {
    if (!user || !userProfile) return;
    
    const moveRandomly = async () => {
      // Only move if we aren't currently doing an action
      if (userProfile.townAction && userProfile.townAction !== 'idle') {
        const actionTime = new Date(userProfile.townActionAt || 0).getTime();
        if (Date.now() - actionTime < 5000) return; // Wait for action to finish
      }

      const newX = Math.floor(Math.random() * 80) + 10; // 10% to 90%
      const newY = Math.floor(Math.random() * 60) + 20; // 20% to 80% (leave room for header)
      
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          townX: newX,
          townY: newY,
          townAction: 'idle',
          townActionAt: new Date().toISOString()
        });
      } catch (err) {
        // Ignore
      }
    };

    // Initial placement if no coordinates
    if (!userProfile.townX || !userProfile.townY) {
      moveRandomly();
    }

    const interval = setInterval(moveRandomly, Math.random() * 10000 + 10000);
    return () => clearInterval(interval);
  }, [user, userProfile?.townAction, userProfile?.townActionAt]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4 pb-24"
    >
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between bg-white/80 backdrop-blur-md p-3 sm:p-4 rounded-3xl shadow-sm border ${theme.border} relative z-20 gap-3`}>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 ${theme.bg} rounded-xl flex items-center justify-center shrink-0`}>
            <Globe className={theme.text} size={18} />
          </div>
          <div>
            <h2 className={`text-lg sm:text-2xl font-black ${theme.text}`}>Town Square</h2>
            <p className={`text-[10px] sm:text-xs font-bold ${theme.lightText}`}>See who's building habits right now!</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-auto shrink-0">
          <button 
            onClick={() => {
              navigator.clipboard.writeText(window.location.origin);
              showToast("Invite link copied to clipboard! 💖", 'success');
            }}
            className={`text-[9px] sm:text-xs font-black text-white ${theme.buttonBg} hover:opacity-90 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-sm transition-colors flex items-center gap-1`}
          >
            <Share2 size={10} />
            Invite
          </button>
          <span className={`text-[9px] sm:text-xs font-black ${theme.text} ${theme.bg} px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border ${theme.border} flex items-center gap-1 sm:gap-1.5`}>
            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${theme.buttonBg} animate-pulse`} />
            {activeUsers.length} Online
          </span>
        </div>
      </div>

      {/* Active Users Horizontal List */}
      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
        {activeUsers.map(u => (
          <motion.div 
            key={u.uid} 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-1 shrink-0"
          >
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white border-2 ${theme.border}/20 flex items-center justify-center overflow-hidden shadow-sm relative`}>
               <LayeredAvatar 
                 character={u.character || 'chiikawa'} 
                 equippedHat={u.equippedHat} 
                 equippedFace={u.equippedFace}
                 equippedClothing={u.equippedClothing}
                 equippedHand={u.equippedHand}
                 equippedBack={u.equippedBack} 
                 equippedVehicle={u.equippedVehicle} 
                 className="w-7 h-7 sm:w-8 sm:h-8" 
               />
               {u.uid === user.uid && (
                 <div className={`absolute top-0 right-0 w-2 h-2 ${theme.accent} rounded-full border border-white`} />
               )}
            </div>
            <span className="text-[8px] font-black text-gray-500 max-w-[40px] sm:max-w-[48px] truncate">{u.displayName}</span>
          </motion.div>
        ))}
      </div>
      
      <div 
        ref={containerRef}
        onClick={(e) => {
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          
          // Don't move if clicking on a UI element (like a button or avatar)
          if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.group')) {
            return;
          }
          
          updateDoc(doc(db, 'users', user.uid), {
            townX: Math.max(5, Math.min(95, x)), // clamp to 5-95%
            townY: Math.max(5, Math.min(95, y)),
            townAction: 'idle',
            townActionAt: new Date().toISOString()
          }).catch(console.error);
        }}
        className={`relative w-full h-[50vh] sm:h-[60vh] min-h-[350px] sm:min-h-[400px] ${theme.bg} rounded-[2rem] border-4 border-white shadow-inner overflow-hidden cursor-crosshair`}
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%),
            linear-gradient(to bottom, #e0f2fe 0%, #bae6fd 100%)
          `
        }}
      >
        {/* Environment Decor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/40 rounded-full blur-xl pointer-events-none" />
        
        {/* Park Zone */}
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-green-100/50 rounded-tr-full border-t-4 border-r-4 border-white/50 flex flex-col items-center justify-center pointer-events-auto">
          <span className="text-green-600/30 font-black text-xl rotate-[-15deg] pointer-events-none absolute">Park</span>
          <AppleTree user={user} userProfile={userProfile} activeUsers={activeUsers} showToast={showToast} />
        </div>
        
        {/* Cafe Zone */}
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-orange-100/50 rounded-bl-full border-b-4 border-l-4 border-white/50 flex flex-col items-center justify-center">
          <span className="text-orange-600/30 font-black text-xl rotate-[15deg] pointer-events-none absolute">Cafe</span>
          <MahjongTable currentUser={user} currentUserProfile={userProfile} activeUsers={activeUsers} theme={theme} />
        </div>

        {/* Central Fountain (Visual only) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-blue-200/50 rounded-full border-4 border-white/80 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 bg-blue-300/50 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-blue-400/50 rounded-full animate-ping" />
          </div>
        </div>

        <AnimatePresence>
          {activeUsers.map(u => (
            <TownSquareAvatar 
              key={u.uid} 
              userProfile={u} 
              isMe={u.uid === user.uid} 
              currentUserUid={user.uid}
              currentUserProfile={userProfile}
              showToast={showToast}
              theme={theme}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function MahjongTable({ currentUser, currentUserProfile, activeUsers, theme }: { currentUser: any, currentUserProfile: UserProfile | null, activeUsers: UserProfile[], theme: any }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showReward, setShowReward] = useState(false);

  // Check if I have completed a habit today
  const today = new Date().toISOString().split('T')[0];
  const myLastHabitDate = currentUserProfile?.lastHabitLoggedAt ? new Date(currentUserProfile.lastHabitLoggedAt).toISOString().split('T')[0] : null;
  const iHaveCompletedHabit = myLastHabitDate === today;
  const hasToken = (currentUserProfile?.mahjongToken || 0) > 0;

  // Check if any buddy nearby has completed a habit today
  const myX = currentUserProfile?.townX || 50;
  const myY = currentUserProfile?.townY || 50;
  
  const eligibleBuddies = activeUsers.filter(u => {
    if (u.uid === currentUser.uid) return false;
    const buddyLastHabitDate = u.lastHabitLoggedAt ? new Date(u.lastHabitLoggedAt).toISOString().split('T')[0] : null;
    const buddyCompletedHabit = buddyLastHabitDate === today;
    const buddyX = u.townX || 50;
    const buddyY = u.townY || 50;
    const isNear = Math.sqrt(Math.pow(buddyX - myX, 2) + Math.pow(buddyY - myY, 2)) < 30; // wider radius for table
    return buddyCompletedHabit && isNear;
  });

  const canPlay = iHaveCompletedHabit && hasToken && eligibleBuddies.length > 0;

  const handlePlay = async () => {
    if (!canPlay) return;
    
    setIsPlaying(true);
    playSuccessSound();
    
    // Simulate game
    setTimeout(async () => {
      setIsPlaying(false);
      setShowReward(true);
      
      try {
        // Grant Co-op Streak Bonus and deduct token
        await updateDoc(doc(db, 'users', currentUser.uid), {
          coopStreak: (currentUserProfile?.coopStreak || 0) + 1,
          coins: (currentUserProfile?.coins || 0) + 20,
          mahjongToken: 0
        });
        
        // Grant to the first eligible buddy too
        if (eligibleBuddies[0]) {
          await updateDoc(doc(db, 'users', eligibleBuddies[0].uid), {
            coopStreak: (eligibleBuddies[0].coopStreak || 0) + 1,
            coins: (eligibleBuddies[0].coins || 0) + 20,
            townAction: 'cheered', // make them sparkle
            townActionAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error("Failed to grant coop reward", err);
      }
      
      setTimeout(() => setShowReward(false), 3000);
    }, 2000);
  };

  return (
    <div className="relative z-20 mt-4 ml-4">
      <button 
        onClick={handlePlay}
        disabled={!canPlay || isPlaying}
        className={`relative w-20 h-20 rounded-xl border-4 shadow-lg flex items-center justify-center transition-all ${canPlay && !isPlaying ? `bg-green-100 ${theme.border} hover:scale-105 cursor-pointer` : `bg-gray-100 ${theme.border} opacity-80 cursor-not-allowed`}`}
      >
        <span className="text-4xl">🀄</span>
        
        {/* Status Indicator */}
        {!isPlaying && (
          <div className={`absolute -bottom-3 bg-white px-2 py-0.5 rounded-full border ${theme.border}/40 shadow-sm whitespace-nowrap`}>
            <p className="text-[8px] font-black text-gray-600">
              {canPlay ? 'Play Co-op!' : 'Need Buddy + Habit'}
            </p>
          </div>
        )}
      </button>

      {/* Playing Animation */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          >
            <div className="flex gap-2 text-2xl animate-bounce">
              <span>🀄</span>
              <span>🀄</span>
            </div>
          </motion.div>
        )}

        {/* Reward Animation */}
        {showReward && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: -30 }}
            exit={{ opacity: 0 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 bg-yellow-100 px-3 py-1 rounded-full border-2 border-yellow-400 shadow-lg whitespace-nowrap z-30"
          >
            <p className="text-xs font-black text-yellow-600 flex items-center gap-1">
              <Sparkles size={12} />
              Co-op Bonus! +20 🪙
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TownSquareAvatar({ userProfile, isMe, currentUserUid, currentUserProfile, showToast, theme }: { userProfile: UserProfile, isMe: boolean, currentUserUid: string, currentUserProfile: UserProfile | null, showToast: (m: string, t?: any) => void, theme: any, key?: string }) {
  const character = (userProfile.character as keyof typeof CHARACTER_IMAGES) || 'chiikawa';
  const level = userProfile.petLevel || 1;
  const equippedHat = userProfile.equippedHat;
  const equippedFace = userProfile.equippedFace;
  const equippedClothing = userProfile.equippedClothing;
  const equippedHand = userProfile.equippedHand;
  const equippedBack = userProfile.equippedBack;
  const equippedVehicle = userProfile.equippedVehicle;
  
  const [showMenu, setShowMenu] = useState(false);
  const [showHabitBubble, setShowHabitBubble] = useState(false);
  const [showWave, setShowWave] = useState(false);
  const [showCheer, setShowCheer] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [showGift, setShowGift] = useState(false);
  
  const x = userProfile.townX || 50;
  const y = userProfile.townY || 50;

  const myX = currentUserProfile?.townX || 50;
  const myY = currentUserProfile?.townY || 50;
  
  // Proximity detection (within ~15% distance)
  const isNear = !isMe && Math.sqrt(Math.pow(x - myX, 2) + Math.pow(y - myY, 2)) < 15;

  // Handle Habit Bubble
  useEffect(() => {
    if (userProfile.lastHabitLoggedAt && userProfile.lastHabitName) {
      const loggedAt = new Date(userProfile.lastHabitLoggedAt).getTime();
      const now = Date.now();
      if (now - loggedAt < 10000) {
        setShowHabitBubble(true);
        const timer = setTimeout(() => setShowHabitBubble(false), 10000 - (now - loggedAt));
        return () => clearTimeout(timer);
      }
    }
  }, [userProfile.lastHabitLoggedAt, userProfile.lastHabitName]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Handle Actions
  useEffect(() => {
    if (userProfile.townAction && userProfile.townActionAt) {
      const actionTime = new Date(userProfile.townActionAt).getTime();
      const now = Date.now();
      if (now - actionTime < 5000) {
        if (userProfile.townAction === 'wave') {
          setShowWave(true);
          setTimeout(() => setShowWave(false), 3000);
        } else if (userProfile.townAction === 'cheered') {
          setShowCheer(true);
          setTimeout(() => setShowCheer(false), 3000);
        } else if (userProfile.townAction === 'nudge') {
          setShowNudge(true);
          setTimeout(() => setShowNudge(false), 3000);
        } else if (userProfile.townAction === 'gift') {
          setShowGift(true);
          setTimeout(() => setShowGift(false), 3000);
          if (isMe && userProfile.townActionTarget) {
            setToastMessage(`You received a gift from ${userProfile.townActionTarget}!`);
            setTimeout(() => setToastMessage(null), 5000);
          }
        }
      }
    }
  }, [userProfile.townAction, userProfile.townActionAt, isMe, userProfile.townActionTarget]);

  const handleAction = async (action: 'wave' | 'cheer' | 'nudge' | 'gift') => {
    setShowMenu(false);
    try {
      if (action === 'wave') {
        await updateDoc(doc(db, 'users', currentUserUid), {
          townAction: 'wave',
          townActionAt: new Date().toISOString()
        });
      } else if (action === 'cheer') {
        await updateDoc(doc(db, 'users', userProfile.uid), {
          townAction: 'cheered',
          townActionAt: new Date().toISOString(),
          coins: (userProfile.coins || 0) + 5
        });
        playSuccessSound();
      } else if (action === 'nudge') {
        await updateDoc(doc(db, 'users', userProfile.uid), {
          townAction: 'nudge',
          townActionAt: new Date().toISOString(),
        });
      } else if (action === 'gift') {
        if ((currentUserProfile?.coins || 0) >= 50) {
          // Deduct from me
          await updateDoc(doc(db, 'users', currentUserUid), {
            coins: (currentUserProfile?.coins || 0) - 50
          });
          // Give to them
          const currentInventory = userProfile.inventory || [];
          await updateDoc(doc(db, 'users', userProfile.uid), {
            townAction: 'gift',
            townActionAt: new Date().toISOString(),
            townActionTarget: currentUserProfile?.displayName || 'Someone', // repurpose as sender name
            inventory: [...currentInventory, 'Gift Box']
          });
          playSuccessSound();
        } else {
          showToast("Not enough coins!", 'error');
        }
      }
    } catch (err) {
      console.error("Failed to perform action", err);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        left: `${x}%`,
        top: `${y}%`,
      }}
      transition={{ 
        type: "spring", 
        stiffness: 50, 
        damping: 15,
        left: { duration: 2 },
        top: { duration: 2 }
      }}
      className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && isMe && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 bg-pink-100 border-2 border-pink-400 text-pink-800 px-6 py-3 rounded-full shadow-xl z-50 font-black flex items-center gap-2"
          >
            <span>🎁</span>
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interaction Menu */}
      <AnimatePresence>
        {showMenu && !isMe && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`absolute ${y < 20 ? 'top-16' : '-top-16'} ${x > 80 ? 'right-0' : x < 20 ? 'left-0' : 'left-1/2 -translate-x-1/2'} bg-white px-2 py-1.5 rounded-2xl shadow-xl border-2 ${theme.border}/20 flex gap-2 z-30`}
          >
            <button 
              onClick={() => handleAction('wave')}
              className={`p-2 hover:${theme.bg} rounded-xl transition-colors`}
              title="Wave"
            >
              👋
            </button>
            <button 
              onClick={() => handleAction('cheer')}
              className="p-2 hover:bg-yellow-50 rounded-xl transition-colors"
              title="Cheer (+5 Coins)"
            >
              ✨
            </button>
            <button 
              onClick={() => handleAction('nudge')}
              className={`p-2 hover:${theme.secondaryBg} rounded-xl transition-colors`}
              title="Nudge"
            >
              ✈️
            </button>
            <button 
              onClick={() => handleAction('gift')}
              className={`p-2 hover:${theme.bg} rounded-xl transition-colors`}
              title="Gift (Costs 50 Coins)"
            >
              🎁
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bubbles & Effects */}
      <AnimatePresence>
        {showHabitBubble && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`absolute -top-12 left-1/2 -translate-x-1/2 bg-white px-3 py-2 rounded-2xl shadow-lg border-2 ${theme.border}/20 whitespace-nowrap z-20 flex flex-col items-center`}
          >
            <p className={`text-[10px] font-black ${theme.text} flex items-center gap-1`}>
              <Sparkles size={12} />
              I just finished a habit!
            </p>
            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white`} />
          </motion.div>
        )}
        
        {showWave && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -10, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`absolute -top-10 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-2xl shadow-lg border-2 ${theme.border}/20 z-20`}
          >
            <span className="text-xl animate-wave inline-block">👋</span>
          </motion.div>
        )}

        {showCheer && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.5, y: -20 }}
            exit={{ opacity: 0 }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
          >
            <span className="text-3xl drop-shadow-lg">✨</span>
          </motion.div>
        )}

        {showNudge && (
          <motion.div 
            initial={{ opacity: 0, x: -20, y: 20 }}
            animate={{ opacity: 1, x: 20, y: -20 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
          >
            <span className="text-2xl drop-shadow-lg">✈️</span>
          </motion.div>
        )}

        {showGift && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, y: 0 }}
            animate={{ opacity: 1, scale: 1.2, y: -30 }}
            exit={{ opacity: 0 }}
            className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
          >
            <span className="text-3xl drop-shadow-lg">🎁</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Avatar */}
      <div 
        className="relative cursor-pointer group"
        onClick={() => !isMe && setShowMenu(!showMenu)}
      >
        <motion.div
          animate={{ 
            y: [0, -5, 0],
            rotate: [0, -2, 2, 0]
          }}
          transition={{ 
            duration: 2 + Math.random(), 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`relative ${showHabitBubble ? 'animate-bounce' : ''}`}
        >
          <div className={`relative rounded-full ${isNear ? `ring-4 ${theme.ring} ring-opacity-50 animate-pulse` : ''}`}>
            <LayeredAvatar 
              character={character} 
              equippedHat={equippedHat} 
              equippedFace={equippedFace}
              equippedClothing={equippedClothing}
              equippedHand={equippedHand}
              equippedBack={equippedBack} 
              equippedVehicle={equippedVehicle} 
              className="w-16 h-16 group-hover:scale-110 transition-transform" 
            />
          </div>
          <div className={`absolute ${equippedVehicle ? '-bottom-6' : '-bottom-2'} -right-2 bg-yellow-400 text-white text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-white shadow-sm z-10 transition-all`}>
            LVL {level}
          </div>
        </motion.div>
        
        <div className={`absolute ${equippedVehicle ? '-bottom-10' : '-bottom-6'} left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm border ${theme.border}/30 whitespace-nowrap transition-all z-20`}>
          <p className="text-[10px] font-black text-gray-800 text-center">
            {userProfile.displayName || 'Anonymous'}
            {isMe && <span className={`${theme.text} ml-1 opacity-60`}>(You)</span>}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function Buddy({ user, userProfile, showToast, theme }: { user: any, userProfile: UserProfile | null, showToast: (m: string, t?: any) => void, theme: any }) {
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBuddyId, setSelectedBuddyId] = useState<string | null>(null);

  const { data: friendsProfiles } = useFirestoreCollection<UserProfile>('users', useMemo(() => 
    (userProfile?.friends?.length || 0) > 0 ? [where('uid', 'in', userProfile!.friends!.slice(0, 10))] : []
  , [userProfile?.friends]), !!userProfile?.friends?.length);

  const { data: incomingRequestsProfiles } = useFirestoreCollection<UserProfile>('users', useMemo(() => 
    (userProfile?.buddyRequestsReceived?.length || 0) > 0 ? [where('uid', 'in', userProfile!.buddyRequestsReceived!.slice(0, 10))] : []
  , [userProfile?.buddyRequestsReceived]), !!userProfile?.buddyRequestsReceived?.length);

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('email', '==', searchEmail.trim()), limit(1));
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(doc => doc.data() as UserProfile).filter(u => u.uid !== user.uid);
      setSearchResults(results);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'users');
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async (targetUid: string) => {
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'users', user.uid), { buddyRequestsSent: arrayUnion(targetUid) });
      batch.update(doc(db, 'users', targetUid), { buddyRequestsReceived: arrayUnion(user.uid) });
      await batch.commit();
      showToast("Buddy request sent! ✨", 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'users');
    }
  };

  const acceptRequest = async (targetUid: string) => {
    try {
      const batch = writeBatch(db);
      
      // Update current user
      batch.update(doc(db, 'users', user.uid), { 
        buddyId: targetUid, 
        friends: arrayUnion(targetUid),
        buddyRequestsReceived: arrayRemove(targetUid) 
      });
      
      // Update target user
      batch.update(doc(db, 'users', targetUid), { 
        buddyId: user.uid, 
        friends: arrayUnion(user.uid),
        buddyRequestsSent: arrayRemove(user.uid) 
      });
      
      await batch.commit();
      showToast("Buddy request accepted! 💖", 'success');
      setSelectedBuddyId(targetUid);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'users');
    }
  };

  const declineRequest = async (targetUid: string) => {
    try {
      await updateDoc(doc(db, 'users', user.uid), { 
        buddyRequestsReceived: arrayRemove(targetUid) 
      });
      await updateDoc(doc(db, 'users', targetUid), { 
        buddyRequestsSent: arrayRemove(user.uid) 
      });
      showToast("Buddy request declined.", 'info');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'users');
    }
  };

  const unfriend = async (targetUid: string) => {
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'users', user.uid), { 
        friends: arrayRemove(targetUid),
        buddyId: userProfile?.buddyId === targetUid ? null : userProfile?.buddyId
      });
      batch.update(doc(db, 'users', targetUid), { 
        friends: arrayRemove(user.uid),
        buddyId: null // We don't know their current buddyId easily without fetching, but if they were our buddy, it's us.
      });
      await batch.commit();
      setSelectedBuddyId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'users');
    }
  };

  if (selectedBuddyId) {
    return <BuddyChat user={user} buddyId={selectedBuddyId} userProfile={userProfile} onBack={() => setSelectedBuddyId(null)} onUnfriend={() => unfriend(selectedBuddyId)} showToast={showToast} theme={theme} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className={`bg-white p-6 rounded-[2rem] border-4 ${theme.border} shadow-xl ${theme.shadow}`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 ${theme.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
            <Users className={theme.text} size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className={`text-xl sm:text-2xl font-black ${theme.text} leading-tight mb-1`}>Accountability Buddies</h2>
            <div className="flex items-center justify-between gap-2">
              <p className={`text-[10px] sm:text-xs font-bold ${theme.lightText} uppercase tracking-widest`}>Better together</p>
              <div className={`${theme.bg} ${theme.text} px-3 py-1 rounded-full text-[10px] font-black whitespace-nowrap shadow-sm border ${theme.border}/20 -mr-[10px]`}>
                {userProfile?.friends?.length || 0} Buddies
              </div>
            </div>
          </div>
        </div>
      </div>

      {incomingRequestsProfiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Incoming Requests</h3>
          {incomingRequestsProfiles.map(profile => (
            <ChiikawaCard 
              key={profile.uid} 
              className={`bg-white border-2 ${theme.border}/30`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img src={profile.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.uid}`} className="w-12 h-12 rounded-2xl" alt="" />
                  <div>
                    <p className="font-black text-gray-800">{profile.displayName}</p>
                    <p className="text-xs font-bold text-yellow-600">Wants to be your buddy!</p>
                  </div>
                </div>
                <div className="flex gap-2 sm:justify-end">
                  <ChiikawaButton onClick={() => acceptRequest(profile.uid)} className="flex-1 sm:flex-none py-2 px-4 text-xs">Accept</ChiikawaButton>
                  <ChiikawaButton onClick={() => declineRequest(profile.uid)} variant="outline" className="flex-1 sm:flex-none py-2 px-4 text-xs">Decline</ChiikawaButton>
                </div>
              </div>
            </ChiikawaCard>
          ))}
        </div>
      )}

      {friendsProfiles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest">Your Buddies</h3>
          <div className="grid grid-cols-1 gap-4">
            {friendsProfiles.map(buddy => (
              <ChiikawaCard 
                key={buddy.uid} 
                className={`hover:border-${theme.border.replace('border-', '')}/40 cursor-pointer transition-colors group bg-white border-2 ${theme.border}/20`}
                onClick={() => setSelectedBuddyId(buddy.uid)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img src={buddy.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${buddy.uid}`} className="w-14 h-14 rounded-2xl" alt="" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full" />
                    </div>
                    <div>
                      <p className={`font-black ${theme.text} text-lg`}>{buddy.displayName}</p>
                      <p className={`text-xs font-bold ${theme.lightText} uppercase tracking-widest`}>Level {buddy.petLevel || 1} • {buddy.character || 'chiikawa'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className={`text-[10px] font-black ${theme.lightText} uppercase`}>Happiness</p>
                      <p className={`font-black ${theme.text}`}>{buddy.happiness ?? 100}%</p>
                    </div>
                    <div className={`p-3 ${theme.bg} ${theme.text} rounded-2xl group-hover:${theme.accent} group-hover:text-white transition-colors`}>
                      <MessageCircle size={20} />
                    </div>
                  </div>
                </div>
              </ChiikawaCard>
            ))}
          </div>
        </div>
      )}

      <ChiikawaCard 
        className={`bg-white border-4 ${theme.border}`}
      >
        <h3 className={`text-sm font-black ${theme.lightText} uppercase tracking-widest mb-4`}>Find New Buddies</h3>
        <div className="relative mb-6">
          <input 
            type="email" 
            placeholder="Friend's email..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            className={`w-full bg-gray-50 border-none rounded-2xl p-4 pr-14 font-bold focus:ring-2 ${theme.ring} outline-none`}
          />
          <button 
            onClick={() => { playClickSound(); handleSearch(); }}
            className={`absolute right-2 top-2 bottom-2 px-3 ${theme.accent} text-white rounded-xl shadow-lg ${theme.shadow} hover:opacity-90 transition-colors`}
          >
            <Search size={20} />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <ChiikawaLoader size={16} />
            <p className={`text-xs font-black ${theme.mutedText} mt-2 uppercase tracking-widest`}>Searching...</p>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-4">
            {searchResults.map(result => {
              const isFriend = userProfile?.friends?.includes(result.uid);
              const isSent = userProfile?.buddyRequestsSent?.includes(result.uid);
              const isReceived = userProfile?.buddyRequestsReceived?.includes(result.uid);

              return (
                <div key={result.uid} className="flex items-center justify-between p-4 bg-gray-50 rounded-3xl gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={result.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${result.uid}`} className="w-10 h-10 rounded-xl flex-shrink-0" alt="" />
                    <div className="min-w-0">
                      <p className="font-black text-gray-800 truncate">{result.displayName}</p>
                      <p className="text-[10px] text-gray-400 truncate">{result.email}</p>
                    </div>
                  </div>
                  {isFriend ? (
                    <span className="text-[10px] font-black text-green-500 bg-green-50 px-2 py-1 rounded-full flex-shrink-0">Buddy</span>
                  ) : isReceived ? (
                    <ChiikawaButton onClick={() => acceptRequest(result.uid)} className="py-1.5 px-3 text-[10px] flex-shrink-0">Accept</ChiikawaButton>
                  ) : (
                    <div className="flex flex-col items-end gap-1">
                      <ChiikawaButton 
                        onClick={() => sendRequest(result.uid)}
                        className="py-1.5 px-3 text-[10px] flex-shrink-0"
                        variant={isSent ? "outline" : "primary"}
                      >
                        {isSent ? 'Resend' : 'Add'}
                      </ChiikawaButton>
                      {isSent && <span className={`text-[8px] font-black ${theme.text} uppercase tracking-tighter`}>Request Sent</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : searchEmail && !loading && (
          <p className="text-center text-gray-400 font-bold py-4">No users found with that email.</p>
        )}
      </ChiikawaCard>

      <ChiikawaCard 
        className={`${theme.secondaryBg} ${theme.border}`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 ${theme.bg} rounded-2xl flex items-center justify-center`}>
            <Users className={theme.text} />
          </div>
          <div>
            <p className={`font-black ${theme.text}`}>Why have buddies?</p>
            <p className={`text-xs font-bold ${theme.lightText} leading-relaxed`}>
              Users with buddies are 65% more likely to complete their habits! Having multiple buddies increases your accountability network.
            </p>
          </div>
        </div>
      </ChiikawaCard>
    </motion.div>
  );
}

function BuddyChat({ user, buddyId, userProfile, onBack, onUnfriend, showToast, theme }: { user: any, buddyId: string, userProfile: UserProfile | null, onBack: () => void, onUnfriend: () => void, showToast: (m: string, t?: any) => void, theme: any }) {
  const [buddyProfile, setBuddyProfile] = useState<UserProfile | null>(null);
  const [message, setMessage] = useState('');
  const [nudgeLoading, setNudgeLoading] = useState(false);
  const [giftLoading, setGiftLoading] = useState(false);
  const [showUnfriendConfirm, setShowUnfriendConfirm] = useState(false);
  const today = format(startOfToday(), 'yyyy-MM-dd');

  const { data: rawMessages } = useFirestoreCollection<Message>('messages', useMemo(() => (user?.uid && buddyId) ? [
    where('fromUid', 'in', [user?.uid, buddyId])
  ] : [], [user?.uid, buddyId]), !!user && !!buddyId);

  const messages = useMemo(() => {
    return rawMessages
      .filter(m => (m.fromUid === user?.uid && m.toUid === buddyId) || (m.fromUid === buddyId && m.toUid === user?.uid))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [rawMessages, user?.uid, buddyId]);

  const { data: buddyHabits } = useFirestoreCollection<Habit>('habits', useMemo(() => buddyId ? [where('userId', '==', buddyId), where('isShared', '==', true)] : [], [buddyId]), !!user && !!buddyId);
  const { data: allBuddyCheckins } = useFirestoreCollection<CheckIn>('checkins', useMemo(() => buddyId ? [where('userId', '==', buddyId)] : [], [buddyId]), !!user && !!buddyId);
  const buddyCheckins = useMemo(() => allBuddyCheckins.filter(c => c.date === today), [allBuddyCheckins, today]);

  useEffect(() => {
    if (!buddyId) return;
    const unsub = onSnapshot(doc(db, 'users', buddyId), (snap) => {
      if (snap.exists()) setBuddyProfile(snap.data() as UserProfile);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'users');
    });
    
    // Permanent Chat: Removed ephemeral cleanup
    return () => {
      unsub();
    };
  }, [buddyId, user.uid]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    const id = Math.random().toString(36).substring(2, 11);
    try {
      await setDoc(doc(db, 'messages', id), {
        id,
        fromUid: user.uid,
        toUid: buddyId,
        text: message,
        createdAt: new Date().toISOString()
      });
      setMessage('');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'messages');
    }
  };

  const sendNudge = async () => {
    if (!buddyId || nudgeLoading) return;
    
    // Rate limiting: 5 nudges per day
    const nudgesSentToday = userProfile?.nudgesSentToday || 0;
    const lastNudgeAt = userProfile?.lastNudgeSentAt;
    const todayStr = format(startOfToday(), 'yyyy-MM-dd');
    
    if (lastNudgeAt && format(new Date(lastNudgeAt), 'yyyy-MM-dd') === todayStr && nudgesSentToday >= 5) {
      showToast("You've reached your nudge limit for today!", 'info');
      return;
    }

    setNudgeLoading(true);
    try {
      const nudgeId = Math.random().toString(36).substring(2, 11);
      await setDoc(doc(db, 'nudges', nudgeId), {
        id: nudgeId,
        fromUid: user.uid,
        toUid: buddyId,
        type: 'encouragement',
        createdAt: new Date().toISOString(),
        read: false
      });

      const newNudgeCount = (lastNudgeAt && format(new Date(lastNudgeAt), 'yyyy-MM-dd') === todayStr) 
        ? nudgesSentToday + 1 
        : 1;

      await updateDoc(doc(db, 'users', user.uid), {
        nudgesSentToday: newNudgeCount,
        lastNudgeSentAt: new Date().toISOString()
      });

      showToast("Nudge sent! 💖", 'success');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'nudges');
    } finally {
      setNudgeLoading(false);
    }
  };

  const sendGift = async () => {
    if (!userProfile || (userProfile.coins || 0) < 50 || !buddyProfile || giftLoading) {
      showToast("You need 50 coins to send a gift!", 'error');
      return;
    }
    setGiftLoading(true);
    try {
      playSuccessSound();
      await updateDoc(doc(db, 'users', user.uid), {
        coins: (userProfile.coins || 0) - 50
      });
      await updateDoc(doc(db, 'users', buddyId), {
        treats: (buddyProfile.treats || 0) + 1
      });
      
      const id = Math.random().toString(36).substring(2, 11);
      await setDoc(doc(db, 'messages', id), {
        id,
        fromUid: user.uid,
        toUid: buddyId,
        text: "🎁 I sent you a Tasty Treat for your buddy!",
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'users');
    } finally {
      setGiftLoading(false);
    }
  };

  const buddyProgress = buddyHabits.length > 0 ? (buddyCheckins.length / buddyHabits.length) * 100 : 0;
  
  // Calculate Sync Stats
  const { data: myCheckins } = useFirestoreCollection<CheckIn>('checkins', useMemo(() => user?.uid ? [where('userId', '==', user.uid), where('date', '==', today)] : [], [user?.uid, today]), !!user);
  const mySharedHabits = useFirestoreCollection<Habit>('habits', useMemo(() => user?.uid ? [where('userId', '==', user.uid), where('isShared', '==', true)] : [], [user?.uid]), !!user).data;
  
  const bothCompletedToday = useMemo(() => {
    if (mySharedHabits.length === 0 || buddyHabits.length === 0) return false;
    const iDone = mySharedHabits.every(h => myCheckins.some(c => c.habitId === h.id));
    const buddyDone = buddyHabits.every(h => buddyCheckins.some(c => c.habitId === h.id));
    return iDone && buddyDone;
  }, [mySharedHabits, buddyHabits, myCheckins, buddyCheckins]);

  // --- Buddy Sync Stats ---
  const [syncStats, setSyncStats] = useState({ syncRate: 0, daysBothCompleted: 0 });

  useEffect(() => {
    if (!user?.uid || !buddyId) return;

    const fetchSyncStats = async () => {
      const last7Days = eachDayOfInterval({
        start: subDays(new Date(), 6),
        end: new Date()
      }).map(d => format(d, 'yyyy-MM-dd'));

      try {
        // Fetch my checkins for last 7 days
        const myQ = query(collection(db, 'checkins'), where('userId', '==', user.uid), where('date', 'in', last7Days));
        const mySnap = await getDocs(myQ);
        const myHistory = mySnap.docs.map(d => d.data() as CheckIn);

        // Fetch buddy checkins for last 7 days
        const buddyQ = query(collection(db, 'checkins'), where('userId', '==', buddyId), where('date', 'in', last7Days));
        const buddySnap = await getDocs(buddyQ);
        const buddyHistory = buddySnap.docs.map(d => d.data() as CheckIn);

        let bothCompletedCount = 0;
        last7Days.forEach(date => {
          const iCompletedAll = mySharedHabits.length > 0 && mySharedHabits.every(h => myHistory.some(c => c.habitId === h.id && c.date === date));
          const buddyCompletedAll = buddyHabits.length > 0 && buddyHabits.every(h => buddyHistory.some(c => c.habitId === h.id && c.date === date));
          if (iCompletedAll && buddyCompletedAll) bothCompletedCount++;
        });

        setSyncStats({
          syncRate: Math.round((bothCompletedCount / 7) * 100),
          daysBothCompleted: bothCompletedCount
        });
      } catch (err) {
        console.error("Error fetching sync stats:", err);
      }
    };

    fetchSyncStats();
  }, [user?.uid, buddyId, mySharedHabits, buddyHabits]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className={`flex items-center gap-2 text-gray-400 hover:${theme.text} transition-colors font-black text-xs uppercase tracking-widest`}
        >
          <ArrowLeft size={16} />
          Back to Buddies
        </button>
        <button 
          onClick={() => setShowUnfriendConfirm(true)}
          className="flex items-center gap-2 text-red-400 hover:text-red-500 transition-colors font-black text-[10px] uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full border border-red-100"
        >
          <UserMinus size={14} />
          Unfriend
        </button>
      </div>

      <AnimatePresence>
        {showUnfriendConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-indigo-900/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white w-full max-w-sm rounded-[3rem] p-8 text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <X className="text-red-500" size={40} />
              </div>
              <h3 className="text-2xl font-black text-gray-800 mb-2">Unfriend Buddy?</h3>
              <p className="text-gray-500 font-bold text-sm mb-8">
                Are you sure you want to unfriend {buddyProfile?.displayName || 'this buddy'}? Your shared progress will no longer be visible to each other.
              </p>
              <div className="flex flex-col gap-3">
                <ChiikawaButton 
                  onClick={() => { playClickSound(); onUnfriend(); }}
                  className="w-full py-4 bg-red-500 text-white hover:bg-red-600"
                >
                  Yes, Unfriend
                </ChiikawaButton>
                <ChiikawaButton 
                  onClick={() => { playClickSound(); setShowUnfriendConfirm(false); }}
                  variant="outline"
                  className="w-full py-4"
                >
                  Cancel
                </ChiikawaButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={buddyProfile?.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${buddyId}`} className={`w-16 h-16 rounded-2xl border-4 ${theme.border} shadow-sm`} alt="" />
            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-white text-[10px] font-black px-2 py-1 rounded-full border-2 border-white shadow-sm">
              LVL {buddyProfile?.petLevel || 1}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-800">{buddyProfile?.displayName || 'Your Buddy'}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-black ${theme.text} ${theme.bg} px-2 py-0.5 rounded-full border ${theme.border}`}>
                {buddyProfile?.character || 'chiikawa'}
              </span>
              <span className="text-[10px] font-black text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">
                {buddyProfile?.happiness ?? 100}% Happy
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={sendGift}
            disabled={giftLoading || (userProfile?.coins || 0) < 50}
            className="flex-1 sm:flex-none p-3 bg-pink-100 text-pink-500 rounded-2xl hover:bg-pink-200 transition-colors flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send a treat for 50 coins"
          >
            <span>🎁 Gift (50🪙)</span>
          </button>
          <button 
            onClick={sendNudge}
            disabled={nudgeLoading}
            className="flex-1 sm:flex-none p-3 bg-orange-100 text-orange-500 rounded-2xl hover:bg-orange-200 transition-colors flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest"
          >
            <Send size={18} className="-rotate-45" />
            {nudgeLoading ? 'Sending...' : 'Nudge'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <ChiikawaCard className={`${theme.bg} border-${theme.border.replace('border-', '')}/30`}>
          <h3 className={`text-xs font-black ${theme.text} opacity-60 uppercase tracking-widest mb-4`}>Buddy's Progress</h3>
          <div className="flex items-end justify-between mb-2">
            <span className={`text-3xl font-black ${theme.text}`}>{Math.round(buddyProgress)}%</span>
            <span className={`text-xs font-bold ${theme.lightText}`}>{buddyCheckins.length}/{buddyHabits.length} Shared Habits</span>
          </div>
          <div className={`h-3 ${theme.mutedBg} rounded-full overflow-hidden mb-4`}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${buddyProgress}%` }}
              className={`h-full ${theme.accent}`}
            />
          </div>
          {bothCompletedToday && (
            <div className="bg-green-100 text-green-600 p-2 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest">
              <Sparkles size={14} />
              Both Completed Today!
            </div>
          )}
        </ChiikawaCard>

        <ChiikawaCard className={`${theme.bg} border-${theme.border.replace('border-', '')}/30`}>
          <h3 className={`text-xs font-black ${theme.text} opacity-60 uppercase tracking-widest mb-2`}>Co-op Quest: 7-Day Sync</h3>
          <p className={`text-[10px] font-bold ${theme.lightText} mb-4`}>Complete all shared habits together to build your sync streak!</p>
          <div className="flex items-end justify-between mb-2">
            <span className={`text-3xl font-black ${theme.text}`}>{syncStats.daysBothCompleted}/7</span>
            <span className={`text-xs font-bold ${theme.lightText}`}>Days Synced</span>
          </div>
          <div className="flex gap-1 mb-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className={`flex-1 h-2 rounded-full ${i < syncStats.daysBothCompleted ? theme.accent : theme.mutedBg}`} />
            ))}
          </div>
          {syncStats.daysBothCompleted === 7 && (
            <div className="bg-yellow-200 text-yellow-700 p-2 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest mt-2">
              <Sparkles size={14} />
              Perfect Week!
            </div>
          )}
        </ChiikawaCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChiikawaCard className="flex flex-col h-[400px]">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Chat</h3>
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-hide">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="text-4xl mb-4">💬</div>
                  <p className="text-sm font-bold text-gray-400">Start the conversation! Send some encouragement to your buddy.</p>
                </div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.fromUid === user.uid ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-3xl font-bold text-sm ${msg.fromUid === user.uid ? `${theme.buttonBg} ${theme.buttonText} rounded-tr-none` : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="relative">
              <input 
                type="text" 
                placeholder="Send encouragement..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                className={`w-full bg-gray-50 border-none rounded-2xl p-4 pr-14 font-bold focus:ring-2 ${theme.ring} outline-none`}
              />
              <button 
                onClick={sendMessage}
                className={`absolute right-2 top-2 bottom-2 px-3 ${theme.buttonBg} ${theme.buttonText} rounded-xl shadow-lg ${theme.shadow} hover:opacity-90 transition-colors`}
              >
                <Send size={20} />
              </button>
            </div>
          </ChiikawaCard>
        </div>
        
        <div className="lg:col-span-1">
          <ChiikawaCard>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Shared Habits</h3>
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-2 scrollbar-hide">
              {buddyHabits.length === 0 ? (
                <p className="text-xs font-bold text-gray-400 italic">No shared habits yet.</p>
              ) : (
                buddyHabits.map(h => {
                  const isDone = buddyCheckins.some(c => c.habitId === h.id);
                  return (
                    <div key={h.id} className={`flex items-center justify-between p-3 ${theme.secondaryBg}/30 rounded-2xl`}>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{h.icon}</span>
                        <span className={`font-bold ${theme.text} text-sm`}>{h.name}</span>
                      </div>
                      {isDone ? (
                        <div className="bg-green-100 text-green-600 p-1 rounded-lg">
                          <Check size={14} strokeWidth={4} />
                        </div>
                      ) : (
                        <div className={`w-6 h-6 border-2 ${theme.border}/30 rounded-lg`} />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </ChiikawaCard>
        </div>
      </div>
    </motion.div>
  );
}

function BuddyQuickView({ buddyId, theme }: { buddyId: string, theme: any }) {
  const [buddyProfile, setBuddyProfile] = useState<UserProfile | null>(null);
  const today = format(startOfToday(), 'yyyy-MM-dd');
  const { data: buddyHabits } = useFirestoreCollection<Habit>('habits', useMemo(() => buddyId ? [where('userId', '==', buddyId), where('isShared', '==', true)] : [], [buddyId]), !!buddyId);
  const { data: allBuddyCheckins } = useFirestoreCollection<CheckIn>('checkins', useMemo(() => buddyId ? [where('userId', '==', buddyId)] : [], [buddyId]), !!buddyId);
  const buddyCheckins = useMemo(() => allBuddyCheckins.filter(c => c.date === today), [allBuddyCheckins, today]);

  useEffect(() => {
    if (!buddyId) return;
    getDoc(doc(db, 'users', buddyId)).then(snap => {
      if (snap.exists()) setBuddyProfile(snap.data() as UserProfile);
    }).catch(err => {
      handleFirestoreError(err, OperationType.GET, 'users');
    });
  }, [buddyId]);

  const progress = buddyHabits.length > 0 ? (buddyCheckins.length / buddyHabits.length) * 100 : 0;

  return (
    <ChiikawaCard className={`${theme.secondaryBg} ${theme.border}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <img src={buddyProfile?.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${buddyId}`} className="w-10 h-10 rounded-xl" alt="" />
          <div>
            <p className="font-black text-gray-800">{buddyProfile?.displayName}'s Progress</p>
            <p className={`text-[10px] font-black ${theme.lightText} uppercase tracking-widest`}>Your Buddy • {buddyHabits.length} Shared Habits</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-lg font-black ${theme.text}`}>{Math.round(progress)}%</p>
        </div>
      </div>
      <div className="h-2 bg-white rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className={`h-full ${theme.buttonBg}`}
        />
      </div>
    </ChiikawaCard>
  );
}

function ProfileScreen({ 
  user, 
  userProfile, 
  logout, 
  linkWithPopup, 
  handleFirestoreError, 
  showToast, 
  theme,
  showLogoutWarning,
  setShowLogoutWarning,
  isLinking,
  handleLinkAccount
}: { 
  user: any, 
  userProfile: UserProfile | null, 
  logout: () => void, 
  linkWithPopup: any, 
  handleFirestoreError: any, 
  showToast: (m: string, t?: any) => void, 
  theme: any,
  showLogoutWarning: boolean,
  setShowLogoutWarning: (val: boolean) => void,
  isLinking: boolean,
  handleLinkAccount: () => Promise<void>
}) {
  const handleLogoutClick = () => {
    if (user?.isAnonymous) {
      setShowLogoutWarning(true);
    } else {
      logout();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8 pb-20"
    >
      <h2 className={`text-2xl font-black ${theme.text}`}>User Profile</h2>

      <ChiikawaCard className={`bg-white border-4 ${theme.border} p-8`}>
        <div className="flex flex-col items-center text-center gap-6">
          <div className="relative">
            <img 
              src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.uid}`} 
              className={`w-32 h-32 rounded-[3rem] border-4 ${theme.border} shadow-lg`} 
              alt="Profile" 
            />
            <div className={`absolute -bottom-2 -right-2 ${theme.buttonBg} text-white p-2 rounded-full border-4 border-white shadow-lg`}>
              <User size={20} />
            </div>
          </div>

          <div>
            <h3 className={`text-3xl font-black ${theme.text} mb-1`}>{userProfile?.displayName}</h3>
            <p className={`${theme.lightText} font-bold`}>{user.email}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            <div className={`${theme.bg} p-4 rounded-3xl border-2 ${theme.border}`}>
              <p className={`text-[10px] font-black ${theme.lightText} uppercase tracking-widest mb-1`}>PET</p>
              <p className={`font-black ${theme.text} capitalize`}>{userProfile?.character || 'Chiikawa'}</p>
            </div>
            <div className={`${theme.bg} p-4 rounded-3xl border-2 ${theme.border}`}>
              <p className={`text-[10px] font-black ${theme.lightText} uppercase tracking-widest mb-1`}>Pet Level</p>
              <p className={`font-black ${theme.text}`}>LVL {userProfile?.petLevel || 1}</p>
            </div>
          </div>
        </div>
      </ChiikawaCard>

      {user?.isAnonymous && (
        <ChiikawaCard className={`${theme.secondaryBg} ${theme.border} p-6`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 ${theme.bg} rounded-2xl flex items-center justify-center`}>
              <Sparkles className={theme.text} />
            </div>
            <div>
              <p className={`font-black ${theme.text}`}>Guest Account</p>
              <p className={`text-xs font-bold ${theme.lightText}`}>Save your progress forever!</p>
            </div>
          </div>
          <ChiikawaButton 
            onClick={handleLinkAccount} 
            disabled={isLinking}
            theme={theme}
            className="w-full py-3"
          >
            {isLinking ? 'Linking...' : 'Link Google Account'}
          </ChiikawaButton>
        </ChiikawaCard>
      )}

      <div className="space-y-4">
        <ChiikawaButton 
          variant="outline" 
          onClick={handleLogoutClick} 
          className="w-full flex items-center justify-center gap-2 py-4 border-red-100 text-red-400 hover:bg-red-50"
        >
          <span>Logout</span>
        </ChiikawaButton>
      </div>

    </motion.div>
  );
}

function SettingsScreen({ user, userProfile, notificationsEnabled, setNotificationsEnabled, showToast, theme }: { user: any, userProfile: UserProfile | null, notificationsEnabled: boolean, setNotificationsEnabled: (val: boolean) => void, showToast: (m: string, t?: any) => void, theme: any }) {
  const updateCharacter = async (char: 'chiikawa' | 'hachiware' | 'usagi') => {
    try {
      await updateDoc(doc(db, 'users', user.uid), { character: char });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'users');
    }
  };

  const character = (userProfile?.character as keyof typeof CHARACTER_IMAGES) || 'chiikawa';
  const level = userProfile?.petLevel || 1;
  const exp = userProfile?.petExp || 0;
  const nextLevelExp = 100;
  const expProgress = (exp / nextLevelExp) * 100;

  const characterNames = {
    chiikawa: 'Chiikawa',
    hachiware: 'Hachiware',
    usagi: 'Usagi'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8 pb-20"
    >
      <div className={`bg-white p-6 rounded-[2rem] border-4 ${theme.border} shadow-xl ${theme.shadow}`}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${theme.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
              <Heart className={theme.text} size={24} />
            </div>
            <div>
              <h2 className={`text-xl sm:text-2xl font-black ${theme.text} leading-tight`}>Pet Profile</h2>
              <p className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">Your cute companion</p>
            </div>
          </div>
          <div className={`w-[70px] h-[49px] flex flex-col items-center justify-center ${theme.bg} rounded-2xl border-2 ${theme.border} shadow-sm flex-shrink-0`}>
            <Star size={14} className="text-yellow-400 fill-yellow-400 mb-0.5" />
            <div className="flex items-baseline gap-0.5 leading-none">
              <span className={`text-[10px] font-black ${theme.text}`}>{exp}</span>
              <span className={`text-[8px] font-bold ${theme.lightText} uppercase tracking-tighter`}>pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Buddy & Rewards Section removed as per user request */}
      <div className="space-y-6">
        <PetStatusCard userProfile={userProfile} userId={user.uid} theme={theme} />
        <ShopCard userProfile={userProfile} userId={user.uid} theme={theme} />
      </div>

      <ChiikawaCard className={`bg-white border-4 ${theme.border} p-6`}>
        <div className="mb-4">
          <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Switch Your Pet</label>
          <div className="grid grid-cols-3 gap-3">
            {(['chiikawa', 'hachiware', 'usagi'] as const).map(char => (
              <button 
                key={char}
                onClick={() => updateCharacter(char)}
                className={`p-3 rounded-[1.5rem] border-4 transition-all flex flex-col items-center gap-1 ${userProfile?.character === char ? `${theme.border} ${theme.bg} scale-105` : `${theme.border}/10 bg-white hover:${theme.border}/20`}`}
              >
                <div className="w-10 h-10 flex items-center justify-center">
                  <img 
                    src={CHARACTER_IMAGES[char]} 
                    className="w-full h-full object-contain" 
                    alt={char}
                    referrerPolicy="no-referrer"
                  />
                </div>
                <p className="text-[10px] font-black capitalize">{char}</p>
              </button>
            ))}
          </div>
        </div>
      </ChiikawaCard>

      <ChiikawaCard className={`bg-white border-4 ${theme.border} p-6`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-gray-400">Push Notifications</h3>
            <p className="text-[10px] font-bold text-gray-400">Get reminders for habits and buddy nudges</p>
          </div>
          <button 
            onClick={() => {
              playClickSound();
              if (!notificationsEnabled && 'Notification' in window) {
                Notification.requestPermission().then(permission => {
                  if (permission === 'granted') setNotificationsEnabled(true);
                });
              } else {
                setNotificationsEnabled(!notificationsEnabled);
              }
            }}
            className={`w-12 h-6 rounded-full transition-all relative ${notificationsEnabled ? theme.buttonBg : 'bg-gray-200'}`}
          >
            <motion.div 
              animate={{ x: notificationsEnabled ? 24 : 4 }}
              className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
            />
          </button>
        </div>
      </ChiikawaCard>

    </motion.div>
  );
}
