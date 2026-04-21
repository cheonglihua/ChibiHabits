export interface UserProfile {
  uid: string;
  email: string;
  emailLower?: string;
  displayName?: string;
  photoURL?: string;
  buddyId?: string; // Current mutual buddy
  friends?: string[]; // List of buddy UIDs
  buddyRequestsSent?: string[];
  buddyRequestsReceived?: string[];
  character?: 'chiikawa' | 'hachiware' | 'usagi';
  petExp?: number;
  petLevel?: number;
  treats?: number;
  happiness?: number; // 0-100
  energy?: number; // 0-100
  health?: number; // 0-100
  coins?: number;
  equippedHat?: string;
  equippedFace?: string;
  equippedClothing?: string;
  equippedHand?: string;
  equippedBack?: string;
  equippedVehicle?: string;
  equippedWallpaper?: string;
  lastDecayCheck?: string; // YYYY-MM-DD
  nudgesSentToday?: number;
  lastNudgeSentAt?: string;
  lastActive?: string; // ISO timestamp
  lastHabitLoggedAt?: string; // ISO timestamp
  lastHabitName?: string;
  townX?: number;
  townY?: number;
  townAction?: 'wave' | 'cheer' | 'habit' | 'idle' | 'cheered' | 'nudge' | 'gift' | 'mahjong';
  townActionAt?: string;
  townActionTarget?: string; // UID of the target user
  coopStreak?: number;
  inventory?: string[];
  mahjongToken?: number;
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  createdAt: string;
  schedule: string[]; // ['Mon', 'Tue', ...] or ['Every Day']
  reminderTime?: string; // HH:mm
  isReminderEnabled?: boolean;
  category?: string;
  isShared: boolean;
  streak: number;
  lastCheckInDate?: string; // YYYY-MM-DD
  type: 'regular' | 'one-time';
  repeatType: 'daily' | 'weekly';
  habitTime?: string; // HH:mm
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'all-day';
  endDate?: string;
  endType?: 'date' | 'days' | 'never';
  endDays?: number;
  skippedDates?: string[]; // YYYY-MM-DD
  oneTimeDate?: string; // YYYY-MM-DD for one-time tasks
}

export interface CheckIn {
  id: string;
  habitId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
}

export interface Message {
  id: string;
  fromUid: string;
  toUid: string;
  text: string;
  createdAt: string;
}

export interface Nudge {
  id: string;
  fromUid: string;
  toUid: string;
  createdAt: string;
  type: 'cheer' | 'reminder';
}
