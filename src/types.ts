/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// User Onboarding Profile definition
export interface UserProfile {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'non-binary';
  height: number; // in cm
  currentWeight: number; // in kg
  goalWeight: number; // in kg
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active';
  foodPreferences: string;
  dietRestrictions: string[];
  fitnessExperience: 'beginner' | 'intermediate' | 'advanced';
  workoutAvailability: '1-2' | '3-4' | '5+'; // days per week
  targetDate: string; // e.g., '2026-09-30'
}

// User Weight Log definition
export interface WeightLog {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // in kg
  bodyFat?: number; // optional %
  waterPercentage?: number; // optional %
  notes?: string;
}

// Meal details in MealPlan
export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fats: number; // in grams
  recipeText: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  isCompleted?: boolean;
}

// Workout details in Exercise Plan
export interface WorkoutSession {
  id: string;
  day: string; // e.g., 'Day 1: Upper Body Boost'
  workoutName: string;
  duration: number; // minutes
  exercises: string[]; // e.g., ["Push-ups: 3 sets of 12 reps", ...]
  isCompleted?: boolean;
}

// Full Personalized Health & Fitness Plan
export interface PersonalizedPlan {
  dailyCalories: number;
  macroSplit: {
    protein: number; // percentage (e.g. 30)
    carbs: number; // percentage (e.g. 40)
    fats: number; // percentage (e.g. 30)
  };
  meals: Meal[];
  workouts: WorkoutSession[];
  groceryList: string[];
  habits: { id: string; name: string; frequency: string; isCompleted?: boolean }[];
  coachingGuideline: string;
  waterGoalML: number;
}

// Chat Message format
export interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string; // HH:MM
  suggestions?: string[];
  isLoading?: boolean;
}

// Blog Post representation
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: 'Weight Loss' | 'Nutrition' | 'Fitness' | 'Meal Planning' | 'Recipes' | 'Healthy Habits' | 'Motivation' | 'AI Coaching';
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  date: string;
  readTime: string;
  image: string;
  tags: string[];
}

// Admin Dashboard stats
export interface AdminMetrics {
  totalUsers: number;
  monthlyRevenueUSD: number;
  activeSubscriptions: {
    freeCount: number;
    proCount: number;
    premiumCount: number;
  };
  aiTokensCount: number;
  averageWeightLostKg: number;
  recentLogs: Array<{
    id: string;
    userEmail: string;
    action: string;
    timestamp: string;
  }>;
}

// Form validation feedback interface
export interface CalculatorResult {
  title: string;
  value: string | number;
  unit?: string;
  statusText?: string;
  statusColor?: string; // e.g. green, orange, red
  description: string;
}
