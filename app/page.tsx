"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useHabits, getTodayDateString } from "@/hooks/useHabits";
import { Habit, HABIT_COLORS, HABIT_ICONS } from "@/types/habit";

// Icon component mapping
const IconComponent = ({ icon, className }: { icon: string; className?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    check: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
    dumbbell: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16M6 6h12v12H6z" /></svg>,
    book: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    water: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
    sleep: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
    walk: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1c0-2.21-3.413-3.628-6-3.628z" /></svg>,
    meditate: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
    code: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
    music: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>,
    food: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
    heart: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
    star: <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  };
  return icons[icon] || icons.check;
};

export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const { habits, loading: habitsLoading, addHabit, deleteHabit, toggleHabitCompletion } = useHabits();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [newHabit, setNewHabit] = useState({ name: "", description: "", color: HABIT_COLORS[0].value, icon: "check" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = getTodayDateString();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Once the initial fetch is done, turn this off permanently
    if (!habitsLoading) {
      setIsInitialLoad(false);
    }
  }, [habitsLoading]);
  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };
  const [isSyncing, setIsSyncing] = useState(false);
  const [localHabits, setLocalHabits] = useState<Habit[]>([]);
  useEffect(() => {
    if (!isSyncing) {
      setLocalHabits(habits);
    }
  }, [habits, isSyncing]);
  // ✅ END OF ADDITION


  const habitsToUse = localHabits;
  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.name.trim()) return;

    setIsSubmitting(true);
    try {
      await addHabit(newHabit);
      setShowModal(false);
      setNewHabit({ name: "", description: "", color: HABIT_COLORS[0].value, icon: "check" });
    } catch (error) {
      console.error("Error adding habit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  

const handleToggleHabit = async (habitId:string) => {
  if (isSyncing) return;
  setIsSyncing(true);

  setLocalHabits(prev =>
    prev.map(h =>
      h.id === habitId
        ? {
            ...h,
            completedDates: h.completedDates.includes(today)
              ? h.completedDates.filter(d => d !== today)
              : [...h.completedDates, today]
          }
        : h
    )
  );

  await toggleHabitCompletion(habitId, today);

  setTimeout(() => setIsSyncing(false), 300);
};

  const handleDeleteHabit = async (habitId: string) => {
    if (confirm("Are you sure you want to delete this habit?")) {
      await deleteHabit(habitId);
    }
  };

  if (authLoading || (habitsLoading && isInitialLoad)) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
    </div>
  );
}

  if (!user) return null;

  // Calculate stats
  const totalHabits = habitsToUse.length;
  const completedToday = habitsToUse.filter(h => h.completedDates.includes(today)).length;
  const totalStreaks = habitsToUse.reduce((acc, h) => acc + h.currentStreak, 0);
  const longestStreak = Math.max(...habitsToUse.map(h => h.longestStreak), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-300 via-rose-400 to-pink-500">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center">
             <img src="/cute-bee-design.png" alt="" />
            </div>
            <h1 className="text-xl font-bold text-white">
              Tracker<span className="text-yellow-400">Jacker</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              {user.photoURL && (
                <img src={user.photoURL} alt={user.displayName || "User"} className="w-8 h-8 rounded-full" />
              )}
              <span className="text-slate-300 text-sm hidden sm:block">{user.displayName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-bold">Total Habits</p>
                <p className="text-2xl font-bold text-white">{totalHabits}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-bold">Completed Today</p>
                <p className="text-2xl font-bold text-white">{completedToday}/{totalHabits}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-bold">Active Streaks</p>
                <p className="text-2xl font-bold text-white">{totalStreaks}</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-bold">Best Streak</p>
                <p className="text-2xl font-bold text-white">{longestStreak}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Habits Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">My Habits</h2>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-2.5 px-5 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Habit</span>
          </button>
        </div>

        {/* Monthly Calendar */}
        <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">Activity Calendar</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-white font-medium min-w-[120px] text-center">
                {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-slate-400 text-sm font-medium py-2">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {(() => {
              const year = currentMonth.getFullYear();
              const month = currentMonth.getMonth();
              const firstDay = new Date(year, month, 1);
              const lastDay = new Date(year, month + 1, 0);
              const startingDay = firstDay.getDay();
              const totalDays = lastDay.getDate();
              
              const days = [];
              
              // Empty cells for days before the first of the month
              for (let i = 0; i < startingDay; i++) {
                days.push(<div key={`empty-${i}`} className="h-10"></div>);
              }
              
              // Days of the month
              for (let day = 1; day <= totalDays; day++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const isToday = dateStr === today;
                const completedCount = habitsToUse.filter(h => h.completedDates.includes(dateStr)).length;
                const totalHabitsCount = habitsToUse.length;
                const completionRate = totalHabitsCount > 0 ? completedCount / totalHabitsCount : 0;
                
                // Determine shade based on completion
                  let bgClass = "bg-slate-700/40";
                  let borderClass = "border-slate-600";
                  let shadowClass = "";
                  let animationClass = "";
                  let popClass = "";

                if (completionRate === 1 && totalHabitsCount > 0) {
                  bgClass = "bg-green-400";
                  borderClass = "border-green-300";
                  shadowClass = "shadow-[0_0_14px_rgba(74,222,128,1),0_0_24px_rgba(74,222,128,0.8)]";
                  animationClass = "animate-[glow_1.8s_ease-in-out_infinite]";
                  popClass = "animate-[pop_0.25s_ease-out]";
                } else if (completionRate >= 0.5) {
                  bgClass = "bg-green-400/60";
                  borderClass = "border-green-400/60";
                  shadowClass = "shadow-[0_0_10px_rgba(74,222,128,0.6)]";
                } else if (completionRate > 0) {
                  bgClass = "bg-green-400/30";
                  borderClass = "border-green-400/40";
                  shadowClass = "shadow-[0_0_6px_rgba(74,222,128,0.4)]";
                }
                
                days.push(
                  <div
                    key={day}
                    className={`h-10 rounded-lg border ${bgClass} ${borderClass} ${shadowClass} ${animationClass} ${popClass}
                    flex items-center justify-center text-sm font-medium
                    transition-all duration-300 ease-out
                    hover:scale-105 active:scale-95 will-change-transform`}
                    title={`${dateStr}: ${completedCount}/${totalHabitsCount} habits completed`}
                  >
                    <span className={isToday ? "text-white" : "text-slate-300"}>{day}</span>
                  </div>
                );
              }
              
              return days;
            })()}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-slate-700/50">

  {/* No activity */}
  <div className="flex items-center gap-2">
    <div className="w-4 h-4 rounded bg-slate-700/40 border border-slate-600"></div>
    <span className="text-white text-sm">No activity</span>
  </div>

  {/* Partial */}
  <div className="flex items-center gap-2">
    <div className="w-4 h-4 rounded bg-green-400/30 border border-green-400/40 
                    shadow-[0_0_6px_rgba(74,222,128,0.4)]">
    </div>
    <span className="text-white text-sm">Partial</span>
  </div>

  {/* Half (subtle glow) */}
  <div className="flex items-center gap-2">
    <div className="w-4 h-4 rounded bg-green-400/60 border border-green-400/60 
                    shadow-[0_0_10px_rgba(74,222,128,0.6)]">
    </div>
    <span className="text-white text-sm">Half</span>
  </div>

  {/* Complete (animated glow) */}
  <div className="flex items-center gap-2">
    <div className="w-4 h-4 rounded bg-green-400 border border-green-300 
                    animate-[glow_1.8s_ease-in-out_infinite]">
    </div>
    <span className="text-white text-sm">Complete</span>
  </div>

</div>
        </div>

        {/* Habits List */}
        {habits.length === 0 ? (
          <div className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-12 border border-slate-700/50 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No habits yet</h3>
            <p className="text-slate-400 mb-6">Start building powerful habits today!</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-2.5 px-5 rounded-xl transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create your first habit</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {habitsToUse.map((habit) => {
              const isCompletedToday = habit.completedDates.includes(today);
              return (
                <div
                  key={habit.id}
                  className="bg-slate-800/40 backdrop-blur-xl rounded-2xl p-5 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleHabit(habit.id)}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                        isCompletedToday
                          ? "bg-green-500 text-white"
                          : "bg-slate-700/50 text-slate-400 hover:bg-slate-600/50"
                      }`}
                    >
                      {isCompletedToday ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <IconComponent icon={habit.icon} className="w-6 h-6" />
                      )}
                    </button>

                    {/* Habit Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-white truncate">{habit.name}</h3>
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: habit.color }}
                        ></span>
                      </div>
                      {habit.description && (
                        <p className="text-slate-400 text-sm truncate">{habit.description}</p>
                      )}
                    </div>

                    {/* Streak */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-orange-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                          </svg>
                          <span className="font-bold">{habit.currentStreak}</span>
                        </div>
                        <p className="text-slate-500 text-xs">day streak</p>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={() => handleDeleteHabit(habit.id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add Habit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-slate-800/90 backdrop-blur-xl rounded-3xl p-6 w-full max-w-md border border-slate-700/50 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Create New Habit</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddHabit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Habit Name</label>
                <input
                  type="text"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                  placeholder="e.g., Exercise, Read, Meditate"
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description (optional)</label>
                <input
                  type="text"
                  value={newHabit.description}
                  onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                  placeholder="Add a description..."
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl py-3 px-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                />
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {HABIT_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setNewHabit({ ...newHabit, color: color.value })}
                      className={`w-8 h-8 rounded-lg transition-all duration-200 ${
                        newHabit.color === color.value
                          ? "ring-2 ring-white ring-offset-2 ring-offset-slate-800"
                          : "hover:scale-110"
                      }`}
                      style={{ backgroundColor: color.value }}
                    />
                  ))}
                </div>
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {HABIT_ICONS.map((icon) => (
                    <button
                      key={icon.value}
                      type="button"
                      onClick={() => setNewHabit({ ...newHabit, icon: icon.value })}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                        newHabit.icon === icon.value
                          ? "bg-purple-500 text-white"
                          : "bg-slate-700/50 text-slate-400 hover:bg-slate-600/50"
                      }`}
                    >
                      <IconComponent icon={icon.value} className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 px-5 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating..." : "Create Habit"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
