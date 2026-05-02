"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Habit, HabitCompletion } from "@/types/habit";

export function useHabits() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch habits from Firestore
  const fetchHabits = useCallback(async () => {
    if (!user) {
      setHabits([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const habitsRef = collection(db, "habits");
      const q = query(habitsRef, where("userId", "==", user.uid));
      
      const querySnapshot = await getDocs(q);
      const habitsData: Habit[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        habitsData.push({
          id: doc.id,
          userId: data.userId,
          name: data.name,
          description: data.description,
          color: data.color,
          icon: data.icon,
          category: data.category || "other",
          createdAt: data.createdAt?.toDate() || new Date(),
          currentStreak: calculateStreak(data.completedDates || []),
          longestStreak: data.longestStreak || 0,
          completedDates: data.completedDates || [],
          reminderTime: data.reminderTime,
          reminderEnabled: data.reminderEnabled || false,
        });
      });
      
      setHabits(habitsData);
      setError(null);
    } catch (err) {
      console.error("Error fetching habits:", err);
      setError("Failed to fetch habits");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch habits when user changes
  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  // Add a new habit
  const addHabit = async (habitData: {
    name: string;
    description?: string;
    color: string;
    icon: string;
    category?: string; 
    reminderTime?: string;
    reminderEnabled?: boolean;
  }) => {
    if (!user) throw new Error("User not authenticated");

    try {
      const habitsRef = collection(db, "habits");
      const docRef = await addDoc(habitsRef, {
        userId: user.uid,
        name: habitData.name,
        description: habitData.description || "",
        color: habitData.color,
        icon: habitData.icon,
        category: habitData.category || "other", 
        createdAt: serverTimestamp(),
        currentStreak: 0,
        longestStreak: 0,
        completedDates: [],
        reminderTime: habitData.reminderTime || null,
        reminderEnabled: habitData.reminderEnabled || false,
      });

      await fetchHabits();
      return docRef.id;
    } catch (err) {
      console.error("Error adding habit:", err);
      throw new Error("Failed to add habit");
    }
  };

  // Update a habit
  const updateHabit = async (habitId: string, updates: Partial<Habit>) => {
    try {
      const habitRef = doc(db, "habits", habitId);
      await updateDoc(habitRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
      await fetchHabits();
    } catch (err) {
      console.error("Error updating habit:", err);
      throw new Error("Failed to update habit");
    }
  };

  // Delete a habit
  const deleteHabit = async (habitId: string) => {
    try {
      const habitRef = doc(db, "habits", habitId);
      await deleteDoc(habitRef);
      await fetchHabits();
    } catch (err) {
      console.error("Error deleting habit:", err);
      throw new Error("Failed to delete habit");
    }
  };

  // Toggle habit completion for a specific date
  const toggleHabitCompletion = async (habitId: string, date: string) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const isCompleted = habit.completedDates.includes(date);
    let newCompletedDates: string[];
    let newStreak: number;
    let newLongestStreak: number;

    if (isCompleted) {
      // Remove completion
      newCompletedDates = habit.completedDates.filter(d => d !== date);
      newStreak = calculateStreak(newCompletedDates);
      newLongestStreak = Math.max(habit.longestStreak, newStreak);
    } else {
      // Add completion
      newCompletedDates = [...habit.completedDates, date].sort();
      newStreak = calculateStreak(newCompletedDates);
      newLongestStreak = Math.max(habit.longestStreak, newStreak);
    }

    await updateHabit(habitId, {
      completedDates: newCompletedDates,
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
    });
  };

  return {
    habits,
    loading,
    error,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitCompletion,
    refetch: fetchHabits,
  };
}

// Helper function for New York timezone formatting
function formatNewYorkDate(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";

  return `${year}-${month}-${day}`;
}

// Helper function to calculate streak
function calculateStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;

  const sortedDates = [...completedDates].sort().reverse();
  const today = getTodayDateString();
  const yesterday = getDateString(new Date(Date.now() - 86400000));

  // Check if the most recent completion is today or yesterday
  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0;
  }

  let streak = 1;
  for (let i = 0; i < sortedDates.length - 1; i++) {
    const current = new Date(sortedDates[i]);
    const next = new Date(sortedDates[i + 1]);
    const diffDays = Math.round((current.getTime() - next.getTime()) / 86400000);

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

// Get today's date string in EST
export function getTodayDateString(): string {
  return formatNewYorkDate(new Date());
}

// Get date string for a specific date in EST
export function getDateString(date: Date): string {
  return formatNewYorkDate(date);
}