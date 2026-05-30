/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Activity,
  Plus,
  Scale,
  Flame,
  Utensils,
  Dumbbell,
  Compass,
  CheckCircle2,
  Droplet,
  MessageSquare,
  Sparkles,
  Award,
  BookOpen,
  X,
  PlusCircle,
  HelpCircle,
  Settings,
  Send,
  Loader2,
} from 'lucide-react';
import { UserProfile, WeightLog, ChatMessage, PersonalizedPlan, Meal, WorkoutSession } from '../types';

interface UserDashboardProps {
  user: UserProfile;
  plan: PersonalizedPlan;
  onUpdatePlan: (updatedPlan: PersonalizedPlan) => void;
  onUpdateProfile: (updatedProfile: UserProfile) => void;
  onLogout: () => void;
  activeTab: 'overview' | 'weight' | 'nutrition' | 'workouts' | 'habits' | 'coach' | 'settings';
  onTabChange: (tab: 'overview' | 'weight' | 'nutrition' | 'workouts' | 'habits' | 'coach' | 'settings') => void;
}

export default function UserDashboard({
  user,
  plan,
  onUpdatePlan,
  onUpdateProfile,
  onLogout,
  activeTab,
  onTabChange,
}: UserDashboardProps) {
  // Interactive Weight Logging
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([
    { id: 'w-1', date: '2026-05-10', weight: user.currentWeight + 1.8 },
    { id: 'w-2', date: '2026-05-17', weight: user.currentWeight + 1.2 },
    { id: 'w-3', date: '2026-05-24', weight: user.currentWeight + 0.6 },
    { id: 'w-4', date: '2026-05-30', weight: user.currentWeight },
  ]);
  const [newLogWeight, setNewLogWeight] = useState(user.currentWeight);
  const [newLogNotes, setNewLogNotes] = useState('');

  // Interactive Water logging
  const [waterDrunkMl, setWaterDrunkMl] = useState(1250);

  // Chatbot State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'coach',
      text: `Hello ${user.name}! I am LeanAI, your personal weight loss coach. Based on your stats, your BMR suggests a safe deficit target of **${plan.dailyCalories} calories**. How can I help support your nutrition or fitness goals today?`,
      timestamp: '10:00',
      suggestions: [
        'How many calories should I eat?',
        'Create a 12-week fat loss plan.',
        'How much protein do I need?',
        'Why am I not losing weight?',
      ],
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleAddWeightLog = (e: React.FormEvent) => {
    e.preventDefault();
    const newLog: WeightLog = {
      id: `w-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      weight: Number(newLogWeight),
      notes: newLogNotes || 'Logged on dashboard dashboard',
    };
    setWeightLogs([...weightLogs, newLog]);
    setNewLogNotes('');

    // Dynamically update user current weight too
    onUpdateProfile({
      ...user,
      currentWeight: Number(newLogWeight),
    });
  };

  // Checklist utilities for meals & exercises
  const toggleMealCompleted = (mealId: string) => {
    const updatedMeals = plan.meals.map((m) =>
      m.id === mealId ? { ...m, isCompleted: !m.isCompleted } : m
    );
    onUpdatePlan({ ...plan, meals: updatedMeals });
  };

  const toggleWorkoutCompleted = (workoutId: string) => {
    const updatedWorkouts = plan.workouts.map((w) =>
      w.id === workoutId ? { ...w, isCompleted: !w.isCompleted } : w
    );
    onUpdatePlan({ ...plan, workouts: updatedWorkouts });
  };

  const toggleHabitCompleted = (habitId: string) => {
    const updatedHabits = plan.habits.map((h) =>
      h.id === habitId ? { ...h, isCompleted: !h.isCompleted } : h
    );
    onUpdatePlan({ ...plan, habits: updatedHabits });
  };

  const addWater = (amount: number) => {
    setWaterDrunkMl((prev) => Math.min(prev + amount, 6000));
  };

  const resetWater = () => {
    setWaterDrunkMl(0);
  };

  // Send message to Gemini coach
  const handleSendChatMessage = async (textToSend: string) => {
    if (!textToSend.trim() || chatLoading) return;
    const userMsg: ChatMessage = {
      id: `msg-u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    // Keep active viewpoint pinned to new messages
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 60);

    try {
      // POST conversational body including active user profile to make it truly smart
      const res = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg],
          userProfile: user,
        }),
      });

      if (!res.ok) throw new Error('API server errored');
      const data = await res.json();

      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-c-${Date.now()}`,
          sender: 'coach',
          text: data.text,
          suggestions: data.suggestions && Array.isArray(data.suggestions) ? data.suggestions : undefined,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error(err);
      // Construct dynamic fallback suggestions based on keywords to match local fallbacks
      const inputLower = textToSend.toLowerCase();
      let suggestionsList = [
        'How much protein do I need?',
        'Show lower body exercises',
        'Tell me about water weight',
        'Tips to overcome plateaus'
      ];
      if (inputLower.includes('protein') || inputLower.includes('eat') || inputLower.includes('recipe') || inputLower.includes('food')) {
        suggestionsList = [
          'High protein snack ideas',
          'Explain morning proteins',
          'Why does protein satiate?',
          'My custom calorie deficit'
        ];
      } else if (inputLower.includes('train') || inputLower.includes('workout') || inputLower.includes('gym') || inputLower.includes('exercise')) {
        suggestionsList = [
          'What is progressive overload?',
          'Rest days & recovery periods',
          'Cardio or weights for weight loss',
          'Custom exercises guide'
        ];
      } else if (inputLower.includes('water') || inputLower.includes('drink') || inputLower.includes('hydrate')) {
        suggestionsList = [
          'How water helps fat-burning',
          'Are sparkling sodas okay?',
          'Electrolyte custom balance',
          'How much fluid is healthy?'
        ];
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'coach',
          text: `I apologize, ${user.name || 'Champion'}. My remote live neural sync experienced a brief cellular timeout. \n\nLet’s remain fully focused on your active targets: track your caloric deficit logs, keep step counts over 8,500, and stay hydrated today!`,
          suggestions: suggestionsList,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setChatLoading(false);
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // Dashboard calculations
  const loggedMealsKcal = plan.meals
    .filter((m) => m.isCompleted)
    .reduce((sum, m) => sum + m.calories, 0);

  const caloriesRemaining = plan.dailyCalories - loggedMealsKcal;

  const proteinDrunk = plan.meals
    .filter((m) => m.isCompleted)
    .reduce((sum, m) => sum + m.protein, 0);

  const proteinGoalG = Math.round((plan.dailyCalories * (plan.macroSplit.protein / 100)) / 4);

  const completedWorkoutsPct = Math.round(
    (plan.workouts.filter((w) => w.isCompleted).length / plan.workouts.length) * 100
  ) || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800">
            {/* User card header */}
            <div className="flex items-center space-x-3 pb-5 border-b border-white/5">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-sans font-bold text-lg shadow-md shadow-emerald-500/20">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-sans font-bold text-sm text-slate-100 truncate max-w-[130px]">
                  {user.name}
                </h3>
                <span className="inline-block bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-emerald-500/15">
                  Pro Active Coaching
                </span>
              </div>
            </div>

            {/* Sidebar list items */}
            <div className="space-y-1.5 mt-5">
              {[
                { id: 'overview', label: 'Overview Panel', icon: Activity },
                { id: 'weight', label: 'Weight Tracking', icon: Scale },
                { id: 'nutrition', label: 'Nutrition & Meals', icon: Utensils },
                { id: 'workouts', label: 'Workout Protocols', icon: Dumbbell },
                { id: 'habits', label: 'Habit & Hydration', icon: Droplet },
                { id: 'coach', label: 'Consult AI Coach', icon: MessageSquare },
                { id: 'settings', label: 'My Settings', icon: Settings },
              ].map((item) => {
                const IconComp = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id as any)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      activeTab === item.id
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 text-center space-y-3">
            <span className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              Metabolic Adaptation
            </span>
            <div className="text-xl font-mono font-bold text-slate-800">
              Safe Diet Deficit
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Your RMR stays high due to steady carb/protein allocations. Your estimated metabolic adaptation barrier is currently safe.
            </p>
          </div>
        </div>

        {/* Core Content Area */}
        <div className="lg:col-span-3 space-y-8 min-h-[500px]">
          {/* TAB 1: OVERVIEW PANEL */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              {/* Top greeting stats summary */}
              <div>
                <h2 className="text-2xl font-sans font-extrabold text-slate-800 tracking-tight">
                  Dashboard Overview
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Keep active checklist logs to sync hydration curves and nutrient volumes.
                </p>
              </div>

              {/* Widgets Bento grids */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {/* Weight Current */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-2 select-none">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                    Current Weight
                  </span>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-3xl font-mono font-bold text-slate-800">
                      {user.currentWeight}
                    </span>
                    <span className="text-slate-400 text-xs font-semibold">kg</span>
                  </div>
                  <span className="block text-[10px] text-emerald-500 font-bold">
                    Goal: {user.goalWeight} kg
                  </span>
                </div>

                {/* Energy balance remaining */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-2 select-none">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                    Calories Budgets
                  </span>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-3xl font-mono font-bold text-slate-850">
                      {caloriesRemaining}
                    </span>
                    <span className="text-slate-450 text-xs">left</span>
                  </div>
                  <span className="block text-[10px] text-slate-400">
                    Logged: {loggedMealsKcal} kcal
                  </span>
                </div>

                {/* Protein Goal progress */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-2 select-none">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                    Proteins Target
                  </span>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-3xl font-mono font-bold text-slate-800">
                      {proteinDrunk}
                    </span>
                    <span className="text-slate-400 text-xs">/ {proteinGoalG}g</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full w-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{
                        width: `${Math.min((proteinDrunk / (proteinGoalG || 1)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Workout logs */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-2 select-none">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                    Strength Habits
                  </span>
                  <div className="flex items-baseline space-x-1.5">
                    <span className="text-3xl font-mono font-bold text-slate-800">
                      {completedWorkoutsPct}%
                    </span>
                    <span className="text-slate-400 text-xs">done</span>
                  </div>
                  <span className="block text-[10px] text-emerald-500 font-bold">
                    {plan.workouts.filter((w) => w.isCompleted).length} of {plan.workouts.length} completed
                  </span>
                </div>
              </div>

              {/* Bottom split: visual meals + trackers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Today's Food list checkboxes */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                    <h3 className="font-sans font-bold text-base text-slate-800">Today's Meal Checklist</h3>
                    <span className="text-indigo-600 font-semibold text-xs bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                      {plan.meals.filter((m) => m.isCompleted).length} / {plan.meals.length} checked
                    </span>
                  </div>

                  <div className="space-y-3">
                    {plan.meals.map((meal) => (
                      <div
                        key={meal.id}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                          meal.isCompleted
                            ? 'bg-emerald-50/40 border-emerald-100/50 text-slate-550'
                            : 'bg-slate-50/50 border-slate-205 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={meal.isCompleted || false}
                            onChange={() => toggleMealCompleted(meal.id)}
                            className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 mt-1 cursor-pointer"
                          />
                          <div>
                            <span className={`block font-bold text-sm ${meal.isCompleted ? 'line-through text-slate-400' : ''}`}>
                              {meal.name}
                            </span>
                            <span className="text-[11px] text-slate-400 uppercase font-mono font-bold">
                              {meal.mealType} • {meal.calories} kcal • {meal.protein}g protein
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hydration custom slider widget */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                    <h3 className="font-sans font-bold text-base text-slate-800 flex items-center space-x-1.5">
                      <Droplet className="w-5 h-5 text-sky-500" />
                      <span>Liquid Water Tracker</span>
                    </h3>
                    <button
                      onClick={resetWater}
                      className="text-slate-400 hover:text-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      Reset Daily
                    </button>
                  </div>

                  <div className="text-center py-6 bg-slate-50 rounded-2xl space-y-2 select-none">
                    <span className="block text-slate-400 text-[10px] uppercase font-bold text-slate-500">
                      Logged fluid hydration
                    </span>
                    <div className="flex justify-baseline justify-center items-baseline space-x-1">
                      <span className="text-4xl font-mono font-bold text-sky-850">
                        {waterDrunkMl}
                      </span>
                      <span className="text-sky-500 text-sm font-semibold">/ {plan.waterGoalML || 2500} mL</span>
                    </div>
                    <div className="h-2.5 bg-slate-200 rounded-full max-w-xs mx-auto overflow-hidden border border-white">
                      <div
                        className="h-full bg-gradient-to-r from-sky-400 to-sky-500 transition-all duration-300 rounded-full"
                        style={{
                          width: `${Math.min((waterDrunkMl / (plan.waterGoalML || 2500)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => addWater(250)}
                      className="py-2 bg-sky-50 hover:bg-sky-100/80 active:scale-95 text-sky-700 border border-sky-100 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      +250ml Glass
                    </button>
                    <button
                      onClick={() => addWater(500)}
                      className="py-2 bg-sky-50 hover:bg-sky-100/80 active:scale-95 text-sky-700 border border-sky-100 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      +500ml Shaker
                    </button>
                    <button
                      onClick={() => addWater(1000)}
                      className="py-2 bg-sky-100 hover:bg-sky-200 active:scale-95 text-sky-800 border border-sky-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      +1L Bottle
                    </button>
                  </div>
                </div>
              </div>

              {/* Achievement Badges Segment */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 select-none">
                <div className="flex items-center space-x-4 text-center sm:text-left flex-col sm:flex-row">
                  <div className="w-14 h-14 bg-white text-emerald-500 rounded-2xl flex items-center justify-center shadow-md shadow-emerald-500/5 mb-3 sm:mb-0">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-slate-800">Metabolic Master Badge Earned!</h4>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Completed 7 consecutive protein allocation benchmarks successfully. Keep burning!
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 bg-white text-slate-700 text-xs font-bold border rounded-lg shadow-sm">
                    🔥 4 Days Streak
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WEIGHT LOG TRACKER */}
          {activeTab === 'weight' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-2xl font-sans font-extrabold text-slate-800">Weight Tracking Logs</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Log your bodyweight standardized in morning environment to wash out daily fluid water variations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Logger Form */}
                <div className="md:col-span-1 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4 h-fit">
                  <h3 className="font-sans font-bold text-base text-slate-800">Add Morning Log</h3>
                  <form onSubmit={handleAddWeightLog} className="space-y-4">
                    <div>
                      <label className="block text-slate-605 font-semibold text-xs mb-1">Scale Weight (kg)</label>
                      <input
                        type="number"
                        step={0.1}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-205 rounded-xl outline-none font-bold text-slate-800 font-mono text-sm"
                        value={newLogWeight}
                        onChange={(e) => setNewLogWeight(Number(e.target.value))}
                      />
                    </div>

                    <div>
                      <label className="block text-slate-605 font-semibold text-xs mb-1">Notes / Satiety</label>
                      <input
                        type="text"
                        placeholder="e.g. Saturated sleep, low muscle soreness"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-205 rounded-xl outline-none text-xs"
                        value={newLogNotes}
                        onChange={(e) => setNewLogNotes(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Log Weight Point</span>
                    </button>
                  </form>
                </div>

                {/* Logs Listing trend */}
                <div className="md:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                  <div className="space-y-4 w-full">
                    <h3 className="font-sans font-bold text-base text-slate-800 border-b border-slate-50 pb-3">Weight History Trend</h3>
                    <div className="h-44 flex items-end justify-between px-4 pb-4 bg-slate-50/70 border border-slate-100 rounded-2xl select-none">
                      {weightLogs.map((log, index) => {
                        const maxW = Math.max(...weightLogs.map((l) => l.weight)) + 2;
                        const minW = Math.min(...weightLogs.map((l) => l.weight)) - 2;
                        const range = maxW - minW || 1;
                        const heightPct = ((log.weight - minW) / range) * 80 + 10;

                        return (
                          <div key={log.id} className="flex flex-col items-center flex-1 space-y-2">
                            <span className="font-mono text-[10px] font-bold text-slate-600 leading-none">
                              {log.weight}kg
                            </span>
                            <div
                              className="w-4 bg-emerald-400 rounded-t-md hover:bg-emerald-500 transition-all shadow-sm"
                              style={{ height: `${heightPct}px` }}
                            />
                            <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap">
                              {log.date.slice(5)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <p className="text-[11px] leading-relaxed text-slate-400 mt-6 md:mt-2">
                    * The AI coach averages these logs weekly to determine metabolic adaptations.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NUTRITION & DYNAMIC MEALS */}
          {activeTab === 'nutrition' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-2xl font-sans font-extrabold text-slate-800">Nutrition Plan & Recipes</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Enjoy these fiber-dense culinary plates customized to satisfy your satiety triggers.
                </p>
              </div>

              {/* Recipe card segments */}
              <div className="space-y-6">
                {plan.meals.map((meal) => (
                  <div key={meal.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-50 pb-3 gap-2">
                      <div className="flex items-center space-x-3">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-sans font-bold border border-emerald-100 rounded-lg shrink-0">
                          {meal.mealType}
                        </span>
                        <h4 className="font-sans font-bold text-lg text-slate-800">{meal.name}</h4>
                      </div>

                      {/* Nutrient statistics bubble */}
                      <div className="flex items-center space-x-4 text-xs font-mono font-semibold text-slate-500 select-none bg-slate-50 px-3 py-1 rounded-xl border border-slate-100 self-start">
                        <span>{meal.calories} kcal</span>
                        <span>•</span>
                        <span>{meal.protein}g P</span>
                        <span>•</span>
                        <span>{meal.carbs}g C</span>
                        <span>•</span>
                        <span>{meal.fats}g F</span>
                      </div>
                    </div>

                    <div className="text-slate-650 text-sm leading-relaxed space-y-2">
                      <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                        Cooking & Ingredients Guidelines
                      </span>
                      <p className="text-sm bg-slate-50 p-4 border border-slate-100 rounded-2xl leading-relaxed text-slate-700">
                        {meal.recipeText}
                      </p>
                    </div>

                    {/* Completion controller inside block */}
                    <button
                      onClick={() => toggleMealCompleted(meal.id)}
                      className={`flex items-center justify-center space-x-1.5 py-2.5 px-6 rounded-xl font-bold text-sm border self-start transition-all cursor-pointer ${
                        meal.isCompleted
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${meal.isCompleted ? 'text-emerald-500' : 'text-slate-400'}`} />
                      <span>{meal.isCompleted ? 'Meal Logged' : 'Log This Meal'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: WORKOUT PLANS */}
          {activeTab === 'workouts' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-2xl font-sans font-extrabold text-slate-800">Workout Protocols</h2>
                <p className="text-slate-500 text-sm mt-1">
                  Stimulate active kinetic lean tissue targets to safeguard metabolic rate capacity.
                </p>
              </div>

              {/* Workout cards listing */}
              <div className="space-y-6">
                {plan.workouts.map((work) => (
                  <div key={work.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-50 pb-3 gap-2">
                      <div className="flex items-center space-x-2">
                        <Dumbbell className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <span className="font-sans font-bold text-slate-800 text-base">{work.day}</span>
                      </div>
                      <span className="text-slate-500 text-xs font-mono font-bold bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        {work.duration} Minutes Duration
                      </span>
                    </div>

                    <div className="space-y-3">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                        Exercises & Progression Setup
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700">
                        {work.exercises.map((ex, i) => (
                          <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl font-medium">
                            {ex}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Workout completion */}
                    <button
                      onClick={() => toggleWorkoutCompleted(work.id)}
                      className={`flex items-center justify-center space-x-1.5 py-2 px-6 rounded-xl font-bold text-sm border self-start transition-all cursor-pointer ${
                        work.isCompleted
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${work.isCompleted ? 'text-emerald-500' : 'text-slate-400'}`} />
                      <span>{work.isCompleted ? 'Routine Completed' : 'Mark Completed'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: HABITS & HYDRATION CALENDAR */}
          {activeTab === 'habits' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-2xl font-sans font-extrabold text-slate-800">Habit Architecture</h2>
                <p className="text-slate-500 text-sm mt-1">Secure minor routine checkboxes to promote physiological consistency.</p>
              </div>

              {/* Grid of trackers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Checklist Column */}
                <div className="md:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="font-sans font-bold text-base text-slate-800 border-b border-slate-50 pb-3">Daily Habit Checklist</h3>
                  <div className="space-y-3">
                    {plan.habits.map((h) => (
                      <div
                        key={h.id}
                        onClick={() => toggleHabitCompleted(h.id)}
                        className={`flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 border rounded-2xl transition-all cursor-pointer select-none ${
                          h.isCompleted ? 'border-emerald-200 bg-emerald-50/30 text-slate-450' : 'border-slate-200 text-slate-705'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <CheckCircle2 className={`w-5 h-5 ${h.isCompleted ? 'text-emerald-500' : 'text-slate-300'}`} />
                          <span className={`font-sans font-bold text-sm ${h.isCompleted ? 'line-through text-slate-400' : ''}`}>
                            {h.name}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-450 text-[10px] font-bold border rounded-md">
                          {h.frequency}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info panels */}
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-indigo-100 p-6 rounded-3xl border border-indigo-950 flex flex-col justify-between h-48 select-none">
                    <span className="text-[10px] uppercase font-bold text-indigo-400">Biological Satiety tip</span>
                    <p className="text-xs text-indigo-200 leading-relaxed font-sans mt-2">
                      Skeletal lean preservation triggers continuous thermogenic burns even while sleeping. Make sure your protein leverage ratio stays above 30%.
                    </p>
                    <span className="block text-[9px] text-indigo-300">* Continuous AI monitor active</span>
                  </div>

                  <div className="bg-white border border-slate-100 p-6 rounded-3xl space-y-2 select-none text-xs">
                    <h4 className="font-sans font-bold text-slate-800">Metabolic Plateau Warning</h4>
                    <p className="text-slate-500 leading-relaxed">
                      If weight logs plateau for 14 continuous days, consult the AI Coach tab to automatically enable a structured 48-hour carbohydrate-dense refitting plan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: PREMIUM AI COACH CHAT WITH HISTORY & MEMORY */}
          {activeTab === 'coach' && (
            <div className="bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/40 relative flex flex-col h-[520px] sm:h-[580px] overflow-hidden antialiased">
              {/* Box Header containing meta memory info */}
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-white/5 select-none shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="bg-emerald-500 text-white p-1.5 rounded-xl">
                    <Sparkles className="w-5 h-5 fill-white/10" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-sm text-slate-100 flex items-center space-x-1">
                      <span>LeanAI Personal Coach</span>
                    </h4>
                    <span className="block text-[10px] text-emerald-400">
                      Coaching Mode Active • Personalized memory loaded
                    </span>
                  </div>
                </div>

                {/* Profile badge target indicator */}
                <div className="hidden sm:block text-right pr-2">
                  <span className="text-[10px] bg-white/10 text-emerald-300 border border-emerald-500/10 px-2 py-0.5 rounded-md text-xs">
                    Deficit Target: {plan.dailyCalories} kcal
                  </span>
                </div>
              </div>

              {/* Chat Thread Messages box */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm ${
                        msg.sender === 'user'
                          ? 'bg-slate-900 text-white rounded-tr-none shadow-sm'
                          : 'bg-white text-slate-800 rounded-tl-none border border-slate-150 shadow-sm'
                      }`}
                    >
                      {/* Message Content */}
                      <div className="leading-relaxed prose prose-sm text-slate-700 font-sans">
                        {renderMarkdown(msg.text, msg.sender === 'user')}
                      </div>

                      {/* Display clock timestamp */}
                      <span className="block text-[8px] text-right font-bold text-slate-400 mt-1 uppercase font-mono">
                        {msg.timestamp}
                      </span>

                      {/* Dynamic suggestion chips */}
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5 max-w-xl">
                          {msg.suggestions.map((sug) => (
                            <button
                              key={sug}
                              onClick={() => handleSendChatMessage(sug)}
                              className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 transition-colors text-slate-600 font-sans font-bold text-[10px] border rounded-lg cursor-pointer shrink-0"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Simulation loading bubble */}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-205 rounded-2xl rounded-tl-none p-4 flex items-center space-x-2 text-xs text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                      <span className="font-bold">LeanAI Coach is computing science inputs...</span>
                    </div>
                  </div>
                )}

                <div ref={scrollRef} />
              </div>

              {/* Chat Text area input controls */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChatMessage(chatInput);
                }}
                className="p-3 bg-white border-t border-slate-150 flex items-center gap-2 shrink-0"
              >
                <input
                  type="text"
                  placeholder="Ask Coach anything about nutrition, recipes, workout progression, sleep, or water..."
                  disabled={chatLoading}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 rounded-xl outline-none text-xs sm:text-sm transition-all"
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="p-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer disabled:opacity-50 inline-flex items-center justify-center shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 7: SETTINGS SCREEN */}
          {activeTab === 'settings' && (
            <div className="space-y-8 animate-fade-in select-none">
              <div>
                <h2 className="text-2xl font-sans font-extrabold text-slate-800">My Settings Configuration</h2>
                <p className="text-slate-500 text-sm mt-1">Configure profile thresholds, wearable linkages, and premium secrets.</p>
              </div>

              <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-700 font-semibold text-xs mb-1">Onboard Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-slate-800 font-bold text-sm outline-none cursor-not-allowed"
                      value={user.name}
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold text-xs mb-1">Email Account</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 bg-slate-50 border rounded-xl text-slate-800 font-bold text-sm outline-none cursor-not-allowed"
                      value="guest_learner@leanai.coach"
                      disabled
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 space-y-4">
                  <h4 className="font-bold text-sm text-slate-850">Connected Integrations</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 border rounded-xl bg-slate-50/50 flex flex-col justify-between">
                      <span className="block font-bold text-xs text-slate-700">Apple Health API</span>
                      <span className="block text-[10px] text-green-500 font-bold mt-1">● Synced</span>
                    </div>
                    <div className="p-3 border rounded-xl bg-slate-50/50 flex flex-col justify-between">
                      <span className="block font-bold text-xs text-slate-700">Fitbit Active Sync</span>
                      <span className="block text-[10px] text-green-500 font-bold mt-1">● Synced</span>
                    </div>
                    <div className="p-3 border rounded-xl bg-slate-50/50 flex flex-col justify-between">
                      <span className="block font-bold text-xs text-slate-700">Stripe Billing Portal</span>
                      <span className="block text-[10px] text-slate-400 font-bold mt-1">Click to manage</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 space-y-2 border-t border-slate-50">
                  <h4 className="font-bold text-sm text-slate-800">Platform Secrets Panel Variable Check</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Check if your workspace secrets hold `GEMINI_API_KEY`. It is currently injected server-side under normal operation policies.
                  </p>
                  <div className="p-3 bg-slate-50 border rounded-xl text-xs font-mono select-text flex justify-between items-center text-slate-650">
                    <span>Injected Secrets: SYSTEM_PROXY_GEMINI</span>
                    <span className="px-2 py-0.5 bg-green-50 border border-green-100 text-green-600 font-bold text-[10px] rounded-md">
                      ACTIVE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Custom Markdown rendering helpers
const renderMarkdown = (text: string, isUser: boolean) => {
  if (isUser) {
    return <p className="font-medium text-white">{text}</p>;
  }

  // Split lines
  const lines = text.split('\n');
  return (
    <div className="space-y-2 font-sans text-slate-700 leading-relaxed font-normal text-xs sm:text-sm">
      {lines.map((line, index) => {
        const trimmed = line.trim();

        // 1. Headers: ### or ## or #
        if (trimmed.startsWith('###')) {
          return (
            <h4 key={index} className="text-sm sm:text-base font-extrabold text-slate-900 mt-3 mb-1 flex items-center gap-1.5 border-b border-slate-100 pb-1">
              {parseBoldItalic(trimmed.replace(/^###\s*/, ''))}
            </h4>
          );
        }
        if (trimmed.startsWith('##')) {
          return (
            <h3 key={index} className="text-base sm:text-lg font-extrabold text-slate-900 mt-4 mb-1 flex items-center gap-1.5 border-b border-slate-100 pb-1">
              {parseBoldItalic(trimmed.replace(/^##\s*/, ''))}
            </h3>
          );
        }
        if (trimmed.startsWith('#')) {
          return (
            <h2 key={index} className="text-lg sm:text-xl font-extrabold text-slate-950 mt-4 mb-2">
              {parseBoldItalic(trimmed.replace(/^#\s*/, ''))}
            </h2>
          );
        }

        // 2. Unordered lists: * or -
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          const content = trimmed.replace(/^[\*\-•]\s*/, '');
          return (
            <div key={index} className="flex items-start gap-2 pl-2 my-1">
              <span className="text-emerald-500 font-extrabold shrink-0 mt-1 text-xs">•</span>
              <span className="text-slate-700 font-bold">{parseBoldItalic(content)}</span>
            </div>
          );
        }

        // 3. Numbered lists: 1. or 2.
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          const num = numMatch[1];
          const content = numMatch[2];
          return (
            <div key={index} className="flex items-start gap-2 pl-2 my-1">
              <span className="text-emerald-600 font-mono font-bold shrink-0 mt-0.5 text-xs">{num}.</span>
              <span className="text-slate-700 font-bold">{parseBoldItalic(content)}</span>
            </div>
          );
        }

        // 4. Regular paragraph
        if (trimmed === '') {
          return <div key={index} className="h-1" />;
        }

        return (
          <p key={index} className="font-medium text-slate-700 mb-1 leading-relaxed">
            {parseBoldItalic(line)}
          </p>
        );
      })}
    </div>
  );
};

// Inline helper to parse **bold** and *italic* tags and return React nodes
const parseBoldItalic = (text: string): React.ReactNode[] => {
  const boldParts = text.split(/(\*\*[^*]+\*\*)/g);
  return boldParts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={i} className="font-extrabold text-slate-900 bg-emerald-50/40 px-1 rounded-md border border-emerald-100/30">
          {parseItalicOnly(boldText)}
        </strong>
      );
    }
    return <span key={i}>{parseItalicOnly(part)}</span>;
  });
};

const parseItalicOnly = (text: string): React.ReactNode[] => {
  const italicParts = text.split(/(\*[^*]+\*)/g);
  return italicParts.map((part, i) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={i} className="font-medium italic text-slate-800">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

