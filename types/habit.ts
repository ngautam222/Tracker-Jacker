export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  createdAt: Date;
  currentStreak: number;
  longestStreak: number;
  completedDates: string[]; // Array of date strings in YYYY-MM-DD format
  reminderTime?: string; // HH:mm format
  reminderEnabled: boolean;
}

export interface HabitCompletion {
  habitId: string;
  date: string; // YYYY-MM-DD
}

export const HABIT_COLORS = [
  { name: "Purple", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f97316" },
  { name: "Yellow", value: "#eab308" },
  { name: "Green", value: "#22c55e" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Rose", value: "#f43f5e" },
];

export const HABIT_ICONS = [
  { name: "Check", value: "check" },
  { name: "Dumbbell", value: "dumbbell" },
  { name: "Book", value: "book" },
  { name: "Water", value: "water" },
  { name: "Sleep", value: "sleep" },
  { name: "Walk", value: "walk" },
  { name: "Meditate", value: "meditate" },
  { name: "Code", value: "code" },
  { name: "Music", value: "music" },
  { name: "Food", value: "food" },
  { name: "Heart", value: "heart" },
  { name: "Star", value: "star" },
];