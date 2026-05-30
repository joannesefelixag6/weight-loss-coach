/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Navigation from './components/Navigation';
import AuthModal from './components/AuthModal';
import LandingPage from './components/LandingPage';
import OnboardingWizard from './components/OnboardingWizard';
import UserDashboard from './components/UserDashboard';
import BlogSection from './components/BlogSection';
import AdminPanel from './components/AdminPanel';
import { UserProfile, PersonalizedPlan } from './types';

// Let's create a premium pre-configured fallback plan representing Joan Felix's profile so she instantly sees gorgeous dashboards without being forced to onboard.
const defaultFallbackProfile: UserProfile = {
  name: 'Joan Felix',
  age: 32,
  gender: 'female',
  height: 168,
  currentWeight: 75,
  goalWeight: 63,
  activityLevel: 'moderately_active',
  dietRestrictions: ['Gluten-Free'],
  foodPreferences: '',
  fitnessExperience: 'beginner',
  workoutAvailability: '3-4',
  targetDate: '2026-09-30',
};

const defaultFallbackPlan: PersonalizedPlan = {
  dailyCalories: 1550,
  macroSplit: { protein: 35, carbs: 35, fats: 30 },
  waterGoalML: 2800,
  meals: [
    {
      id: 'm-1',
      mealType: 'Breakfast',
      name: 'High Protein Berries Oatmeal bowl',
      calories: 380,
      protein: 32,
      carbs: 42,
      fats: 8,
      recipeText: 'Assemble 50g rolled oats, 1 scoop whey/vegan protein, 80g raspberries, and 120ml organic low-fat almond milk. Mix thoroughly and cool overnight.',
      isCompleted: true,
    },
    {
      id: 'm-2',
      mealType: 'Lunch',
      name: 'Seared Salmon & Cucumber Quinoa Salad',
      calories: 520,
      protein: 42,
      carbs: 35,
      fats: 22,
      recipeText: 'Grill 155g wild salmon tail. Plate with 80g cooked organic quinoa, tossed cucumber cubes, fresh spinach leaves, and half a lemon splash squeeze.',
      isCompleted: false,
    },
    {
      id: 'm-3',
      mealType: 'Snack',
      name: 'Greek Yogurt & Walnuts Crunch',
      calories: 220,
      protein: 20,
      carbs: 12,
      fats: 10,
      recipeText: '200g Greek yogurt (0% fat) topped with 15g raw walnut halves and 1g organic Ceylon cinnamon swirl.',
      isCompleted: true,
    },
    {
      id: 'm-4',
      mealType: 'Dinner',
      name: 'Zesty Lemon Chicken & Grilled Asparagus',
      calories: 430,
      protein: 45,
      carbs: 28,
      fats: 12,
      recipeText: 'Bake 180g lean chicken breast marinated in crushed garlic cloves, fresh oregano, and lemon juice. Serve alongside 150g grilled garden asparagus rods.',
      isCompleted: false,
    },
  ],
  workouts: [
    {
      id: 'k-1',
      workoutName: 'Full Body Push',
      day: 'Monday Full Body Strength Push',
      duration: 45,
      exercises: [
        'Db Goblet Squat (3 sets x 12 reps)',
        'Incline Db Chest Press (3 sets x 10 reps)',
        'Reverse Lunges with load (3 sets x 12 reps each leg)',
        'Prone Plank core alignment (3 sets x 45 secs hold)',
      ],
      isCompleted: true,
    },
    {
      id: 'k-2',
      workoutName: 'Kinetic Pull',
      day: 'Wednesday Kinetic Posterior Pull',
      duration: 50,
      exercises: [
        'Db Romanian Deadlifts (3 sets x 10 reps)',
        'Neutral Grip Db Rows (3 sets x 12 reps)',
        'Hamstring curls holding ball (3 sets x 15 reps)',
        'Superman lumbar stabilizers (3 sets x 15 reps)',
      ],
      isCompleted: false,
    },
  ],
  habits: [
    { id: 'h-1', name: 'Hit 8,000 steps baseline', frequency: 'Daily', isCompleted: true },
    { id: 'h-2', name: 'Standard morning scale log', frequency: 'Daily', isCompleted: false },
    { id: 'h-3', name: 'Sleep 7+ hours cycle', frequency: 'Daily', isCompleted: true },
  ],
  groceryList: ['Oatmeal', 'Whey/vegan protein', 'Raspberries', 'Almond milk', 'Salmon tails', 'Quinoa', 'Greek Yogurt', 'Walnuts', 'Asparagus', 'Chicken breast'],
  coachingGuideline: 'Keep muscle protein synthesis active. Consume liquid water steady. Prioritize rest cycles.',
};

export default function App() {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [activeDashboardTab, setActiveDashboardTab] = useState<'overview' | 'weight' | 'nutrition' | 'workouts' | 'habits' | 'coach' | 'settings'>('overview');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Authentication user parameters
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPlan, setUserPlan] = useState<PersonalizedPlan | null>(null);

  // Authentication Dialog states
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const handleSetCurrentView = (view: string) => {
    if (view === 'dashboard') {
      setActiveDashboardTab('overview');
    }
    setCurrentView(view);
  };

  const handleAuthSuccess = (name: string) => {
    if (authMode === 'register') {
      setAuthOpen(false);
      setCurrentView('onboarding');
    } else {
      // Standard simulation: Load default fallback profiles immediately to prevent empty dashboards
      setUserProfile(defaultFallbackProfile);
      setUserPlan(defaultFallbackPlan);
      setIsLoggedIn(true);
      setAuthOpen(false);
      setCurrentView('dashboard');
    }
  };

  const handleOnboardingComplete = (profile: UserProfile, plan: PersonalizedPlan) => {
    setUserProfile(profile);
    setUserPlan(plan);
    setIsLoggedIn(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUserProfile(null);
    setUserPlan(null);
    setIsLoggedIn(false);
    setCurrentView('landing');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col text-slate-700 antialiased font-sans">
      {/* Sticky Top Header Navigation */}
      <Navigation
        currentView={currentView}
        setCurrentView={handleSetCurrentView}
        user={userProfile}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Primary View Routing switcher */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onStartFree={() => {
              if (userProfile) {
                handleSetCurrentView('dashboard');
              } else {
                handleOpenAuth('register');
              }
            }}
            onOpenAuth={handleOpenAuth}
            setCurrentView={handleSetCurrentView}
            user={userProfile}
            onNavigateToDashboard={(tab) => {
              setActiveDashboardTab(tab);
              setCurrentView('dashboard');
            }}
          />
        )}

        {currentView === 'blog' && <BlogSection />}

        {currentView === 'admin' && <AdminPanel />}

        {currentView === 'onboarding' && (
          <OnboardingWizard
            onComplete={handleOnboardingComplete}
            onCancel={() => handleSetCurrentView('landing')}
          />
        )}

        {currentView === 'dashboard' && userProfile && userPlan && (
          <UserDashboard
            user={userProfile}
            plan={userPlan}
            onUpdatePlan={setUserPlan}
            onUpdateProfile={setUserProfile}
            onLogout={handleLogout}
            activeTab={activeDashboardTab}
            onTabChange={setActiveDashboardTab}
          />
        )}
      </main>

      {/* Shared Simulated Authentication Modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
