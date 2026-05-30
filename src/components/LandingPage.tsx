/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  MessageSquare,
  Scale,
  Flame,
  Utensils,
  Dumbbell,
  Clock,
  CheckCircle,
  TrendingDown,
  ShieldCheck,
  Star,
  Users,
  Compass,
  DollarSign,
  Plus,
  Minus,
  HelpCircle,
  ArrowDownRight,
  ChevronRight,
  Droplet,
} from 'lucide-react';
import InteractiveTools from './InteractiveTools';
import { FAQs, SuccessStories } from '../data';
import { UserProfile } from '../types';

interface LandingPageProps {
  onStartFree: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  setCurrentView: (view: string) => void;
  user: UserProfile | null;
  onNavigateToDashboard?: (tab: 'overview' | 'weight' | 'nutrition' | 'workouts' | 'habits' | 'coach' | 'settings') => void;
}

export default function LandingPage({
  onStartFree,
  onOpenAuth,
  setCurrentView,
  user,
  onNavigateToDashboard,
}: LandingPageProps) {
  // Frequently Asked Questions toggle states
  const [expandedFAQIndex, setExpandedFAQIndex] = useState<number | null>(null);

  // Controlled tools active tab
  const [activeToolTab, setActiveToolTab] = useState<'bmi' | 'calorie' | 'macro' | 'water' | 'fat' | 'goal'>('bmi');

  // Suggested prompt answers as part of the live conversational chat preview
  const [previewMessages, setPreviewMessages] = useState<Array<{ sender: 'user' | 'coach'; text: string }>>([
    {
      sender: 'coach',
      text: "Hi! I am LeanAI, your personal coach. Ask me any question about your fitness or nutrition targets below, or tap one of the suggested prompts on the right!",
    }
  ]);
  const [prepInput, setPrepInput] = useState('');
  const [prepLoading, setPrepLoading] = useState(false);

  // Preset prompts inside Interactive Chat section
  const suggestedPrompts = [
    {
      q: 'How many calories should I eat?',
      a: 'To lose weight safely, we calculate your Basal Metabolic Rate (the energy your body uses just to stay alive) and your daily activity level. To lose fat steadily and keep your muscles strong, we recommend eating about 300 to 500 calories less than your daily maintenance level. For most active adults, this keeps you energetic while losing weight.',
    },
    {
      q: 'Can I lose weight without exercise?',
      a: 'Yes, you can absolutely lose weight through nutritional changes alone. However, doing light exercises or strength training tells your body to keep its muscles strong and healthy. This ensures that the weight you lose comes almost entirely from body fat, which keeps your metabolism high and active.',
    },
    {
      q: 'Create a 12-week fat loss plan.',
      a: 'A great 12-week plan has 3 steps: \n\n1. Weeks 1-4: Build consistency in your daily calories and start an active habit (like hitting step targets).\n2. Weeks 5-8: Optimize protein intake to stay full and gradually increase workout intensity.\n3. Weeks 9-12: Focus on recovering well, maintaining your new weight, and keeping your energy high.',
    },
    {
      q: 'How much protein do I need?',
      a: 'We recommend eating about 1.6 to 2.2 grams of protein for every kilogram of your body weight (around 0.8 to 1 gram per pound). Eating enough protein helps you feel full longer, keeps your metabolism active, and supports your muscle recovery after physical activities.',
    },
    {
      q: 'Why am I not losing weight?',
      a: 'A temporary pause in weight loss is very normal and is usually caused by body water weight changes, minor changes in daily steps, or slight differences in portion tracking. Your body is still burning fat behind the scenes. Focus on weekly averages rather than daily scale changes.',
    },
  ];

  const handlePromptClick = (p: typeof suggestedPrompts[0]) => {
    if (prepLoadingCustom) return;
    
    // Add user message to history
    setPreviewMessages(prev => [
      ...prev,
      { sender: 'user', text: p.q }
    ]);
    
    // Typing simulation
    setPrepLoadingCustom(true);
    let charIndex = 0;
    const textToType = p.a;
    let typedText = '';
    
    // Add coach empty bubble first to append typing animation
    setPreviewMessages(prev => [
      ...prev,
      { sender: 'coach', text: '' }
    ]);

    const timer = setInterval(() => {
      if (charIndex < textToType.length) {
        typedText += textToType.substring(charIndex, charIndex + 2);
        setPreviewMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.sender === 'coach') {
            last.text = typedText;
          }
          return updated;
        });
        charIndex += 2;
      } else {
        clearInterval(timer);
        setPrepLoadingCustom(false);
      }
    }, 15);
  };

  const [prepLoadingCustom, setPrepLoadingCustom] = useState(false);

  const handleSendCustomQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prepInput.trim() || prepLoadingCustom) return;

    const userText = prepInput;
    setPreviewMessages(prev => [
      ...prev,
      { sender: 'user', text: userText }
    ]);
    setPrepInput('');
    setPrepLoadingCustom(true);

    try {
      const res = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...previewMessages.map(m => ({ sender: m.sender, text: m.text })),
            { sender: 'user', text: userText }
          ]
        })
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      
      setPreviewMessages(prev => [
        ...prev,
        { sender: 'coach', text: data.text || 'I apologize, I had a brief connection timeout. Please try again!' }
      ]);
    } catch (err) {
      console.error(err);
      // Fallback
      setPreviewMessages(prev => [
        ...prev,
        {
          sender: 'coach',
          text: "I want to make sure you get the best feedback. To get fully custom AI responses, make sure your Gemini API Key is active in your Settings or simply register for a free account to load your personalized plan!"
        }
      ]);
    } finally {
      setPrepLoadingCustom(false);
    }
  };

  const toggleFAQ = (index: number) => {
    setExpandedFAQIndex(expandedFAQIndex === index ? null : index);
  };

  const handleFeatureClick = (title: string) => {
    switch (title) {
      case 'AI Weight Loss Coach':
        if (user && onNavigateToDashboard) {
          onNavigateToDashboard('coach');
        } else {
          const el = document.getElementById('coach-ask-section');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
              const inputEl = el.querySelector('input') as HTMLInputElement | null;
              inputEl?.focus();
            }, 800);
          }
        }
        break;

      case 'Meal Planning':
      case 'Nutrition Analysis':
      case 'Smart Grocery Lists':
        if (user && onNavigateToDashboard) {
          onNavigateToDashboard('nutrition');
        } else {
          onOpenAuth('register');
        }
        break;

      case 'Calorie Calculator':
        {
          setActiveToolTab('calorie');
          const el = document.getElementById('tools');
          el?.scrollIntoView({ behavior: 'smooth' });
        }
        break;

      case 'Macro Calculator':
        {
          setActiveToolTab('macro');
          const el = document.getElementById('tools');
          el?.scrollIntoView({ behavior: 'smooth' });
        }
        break;

      case 'Workout Generator':
        if (user && onNavigateToDashboard) {
          onNavigateToDashboard('workouts');
        } else {
          onOpenAuth('register');
        }
        break;

      case 'Progress Tracking':
        if (user && onNavigateToDashboard) {
          onNavigateToDashboard('weight');
        } else {
          setActiveToolTab('goal');
          const el = document.getElementById('tools');
          el?.scrollIntoView({ behavior: 'smooth' });
        }
        break;

      case 'Habit Builder':
        if (user && onNavigateToDashboard) {
          onNavigateToDashboard('habits');
        } else {
          onOpenAuth('register');
        }
        break;

      case 'Water Tracker':
        {
          setActiveToolTab('water');
          const el = document.getElementById('tools');
          el?.scrollIntoView({ behavior: 'smooth' });
        }
        break;

      case 'Body Fat Estimator':
        {
          setActiveToolTab('fat');
          const el = document.getElementById('tools');
          el?.scrollIntoView({ behavior: 'smooth' });
        }
        break;

      case 'Motivation System':
        if (user && onNavigateToDashboard) {
          onNavigateToDashboard('overview');
        } else {
          onOpenAuth('register');
        }
        break;

      default:
        break;
    }
  };

  const handleStepClick = (title: string) => {
    switch (title) {
      case 'Set Goal':
        if (user && onNavigateToDashboard) {
          onNavigateToDashboard('settings');
        } else {
          setCurrentView('onboarding');
        }
        break;
      case 'Chat With AI':
        if (user && onNavigateToDashboard) {
          onNavigateToDashboard('coach');
        } else {
          const el = document.getElementById('coach-ask-section');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
              const inputEl = el.querySelector('input') as HTMLInputElement | null;
              inputEl?.focus();
            }, 800);
          }
        }
        break;
      case 'Receive Plan':
        if (user && onNavigateToDashboard) {
          onNavigateToDashboard('overview');
        } else {
          setCurrentView('onboarding');
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="bg-white overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-24 sm:pt-32 pb-20 md:pb-28 bg-gradient-to-b from-emerald-50/40 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-center">
            {/* Left Col copywriting */}
            <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-600">
                <Sparkles className="w-4 h-4 fill-emerald-100/35" />
                <span className="text-xs font-bold uppercase tracking-wider font-sans">
                  AI-Powered Weight Loss Coach
                </span>
              </div>

              <h1 className="font-sans font-extrabold text-4xl sm:text-5xl lg:text-5xl text-slate-800 tracking-tight leading-none">
                Lose Weight Smarter with Your Personal{' '}
                <span className="text-emerald-500 relative">AI Coach</span>
              </h1>

              <p className="text-slate-500 font-sans text-sm sm:text-base leading-relaxed max-w-md mx-auto lg:mx-0">
                Get personalized, science-backed answers about nutrition, calories, meal planning, workouts, metabolic adaptations, and healthy metrics instantly.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 select-none">
                <button
                  onClick={onStartFree}
                  className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-sm font-bold flex items-center justify-center space-x-2 transition-all hover:scale-102 shadow-md cursor-pointer"
                >
                  <span>Start Free</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('coach-ask-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl text-sm font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                  <span>Chat With AI Coach</span>
                </button>
              </div>

              {/* Stats ticker items */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6 pt-6 border-t border-slate-100 max-w-sm mx-auto lg:mx-0 text-left">
                <div>
                  <h4 className="text-xl sm:text-2xl font-mono font-bold text-slate-800">500,000+</h4>
                  <p className="text-slate-400 text-xs">Questions Answered</p>
                </div>
                <div>
                  <h4 className="text-xl sm:text-2xl font-mono font-bold text-slate-800">50,000+</h4>
                  <p className="text-slate-400 text-xs">Active Weight Loss Users</p>
                </div>
                <div>
                  <h4 className="text-xl sm:text-2xl font-mono font-bold text-slate-800">24/7 PM</h4>
                  <p className="text-slate-400 text-xs">AI Support & Guidance</p>
                </div>
                <div>
                  <h4 className="text-xl sm:text-2xl font-mono font-bold text-emerald-500">100%</h4>
                  <p className="text-slate-400 text-xs">Personalized Calculations</p>
                </div>
              </div>
            </div>

            {/* Right Col Visual Mockup Dashboard frame */}
            <div className="lg:col-span-7 relative">
              {/* Outer grid shadow overlays */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-teal-400/5 blur-3xl rounded-3xl -z-10" />

              <div className="bg-slate-900 rounded-3xl p-3 sm:p-5 shadow-2xl border border-slate-850 overflow-hidden transform hover:scale-[1.01] transition-transform duration-500">
                {/* Header title bar */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 text-slate-400 text-[10px] font-bold tracking-wider font-mono">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 bg-red-400/80 rounded-full" />
                    <span className="w-2.5 h-2.5 bg-yellow-400/80 rounded-full" />
                    <span className="w-2.5 h-2.5 bg-green-400/80 rounded-full" />
                  </div>
                  <span className="text-slate-450 uppercase">LeanAI Client Dashboard Preview</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Metric 1 */}
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-1">
                    <span className="block text-[9px] text-slate-400 uppercase font-bold">Current Weight</span>
                    <span className="block text-2xl font-mono font-bold text-white leading-none">72.4kg</span>
                    <span className="block text-[8px] text-emerald-400 font-semibold">-0.3kg vs last month</span>
                  </div>

                  {/* Metric 2 */}
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-1">
                    <span className="block text-[9px] text-slate-400 uppercase font-bold">Goal Weight</span>
                    <span className="block text-2xl font-mono font-bold text-white leading-none">65.0kg</span>
                    <span className="block text-[8px] text-slate-500">7.4kg to go</span>
                  </div>

                  {/* Metric 3 */}
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-1">
                    <span className="block text-[9px] text-emerald-400 uppercase font-bold">Calories Remaining</span>
                    <span className="block text-2xl font-mono font-bold text-emerald-400 leading-none">1,650</span>
                    <span className="block text-[8px] text-slate-400">Target kcal</span>
                  </div>
                </div>

                {/* Graph chart visualizer */}
                <div className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-4 h-40 flex items-end justify-between px-6 pb-2">
                  <div className="flex flex-col items-center flex-1 space-y-1">
                    <span className="text-[8px] font-mono font-bold text-slate-400">74.2kg</span>
                    <div className="w-3 bg-slate-700 h-28 rounded-t-sm" />
                    <span className="text-[8px] text-slate-500">May 1</span>
                  </div>
                  <div className="flex flex-col items-center flex-1 space-y-1">
                    <span className="text-[8px] font-mono font-bold text-slate-400">73.6kg</span>
                    <div className="w-3 bg-slate-700 h-24 rounded-t-sm" />
                    <span className="text-[8px] text-slate-500">May 8</span>
                  </div>
                  <div className="flex flex-col items-center flex-1 space-y-1">
                    <span className="text-[8px] font-mono font-bold text-slate-400">72.9kg</span>
                    <div className="w-3 bg-slate-700 h-16 rounded-t-sm" />
                    <span className="text-[8px] text-slate-500">May 15</span>
                  </div>
                  <div className="flex flex-col items-center flex-1 space-y-1">
                    <span className="text-[8px] font-mono font-bold text-emerald-400">72.4kg</span>
                    <div className="w-3 bg-emerald-500 h-12 rounded-t-sm shadow-md" />
                    <span className="text-[8px] text-slate-500 font-bold">May 30</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 font-semibold px-2">
                  <span>● Metabolic Adaptation Safe</span>
                  <span>Active coaching session running...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ASK ANYTHING ABOUT WEIGHT LOSS - INTERACTIVE CHAT PREVIEW */}
      <section id="coach-ask-section" className="py-20 md:py-24 border-y border-slate-50 bg-slate-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left copywriting info */}
            <div className="lg:col-span-5 space-y-5 text-center lg:text-left">
              <span className="text-emerald-600 font-extrabold text-xs tracking-wider uppercase font-sans">
                AI ASSISTANT CHAT MOCK
              </span>
              <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-slate-800 tracking-tight leading-none">
                Ask Anything About Weight Loss
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto lg:mx-0">
                Click any scientific prompts on the right panel to test how LeanAI Coach analyzes calculations and provides immediate, highly detailed feedback.
              </p>

              <button
                onClick={onStartFree}
                className="inline-flex items-center space-x-1.5 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 group text-white rounded-xl text-sm font-bold transition-all hover:scale-102 cursor-pointer shadow-md shadow-emerald-500/10"
              >
                <span>Start Chatting Now</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Right Chatbot box layout */}
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Chat threads */}
              <div className="md:col-span-7 bg-white rounded-2xl border border-slate-150 h-[420px] flex flex-col justify-between overflow-hidden shadow-xl shadow-slate-100">
                <div className="bg-slate-900 text-white p-3.5 flex items-center space-x-2 text-xs font-bold leading-none select-none">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-slate-100 font-sans">LeanAI Coach Chat preview</span>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
                  {previewMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-slate-900 text-white rounded-tr-none font-medium'
                            : 'bg-white text-slate-700 rounded-tl-none border border-slate-150 shadow-sm'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                      </div>
                    </div>
                  ))}
                  {prepLoadingCustom && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-slate-150 rounded-2xl rounded-tl-none px-3.5 py-2.5 text-xs text-slate-500 flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                        <span>LeanAI Coach typing...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Text input area for the chat preview */}
                <form onSubmit={handleSendCustomQuestion} className="p-2 bg-slate-900 border-t border-white/5 flex items-center space-x-1.5 shrink-0">
                  <input
                    type="text"
                    value={prepInput}
                    onChange={(e) => setPrepInput(e.target.value)}
                    placeholder="Ask about calories, workouts, water..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={prepLoadingCustom || !prepInput.trim()}
                    className="p-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-45 text-white rounded-lg transition-all cursor-pointer flex items-center justify-center shrink-0"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {/* Recommended prompt list clickable */}
              <div className="md:col-span-5 space-y-2 select-none">
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                  Try asking:
                </span>
                {suggestedPrompts.map((p) => (
                  <button
                    key={p.q}
                    onClick={() => handlePromptClick(p)}
                    className="w-full text-left p-3 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-650 hover:border-slate-350 hover:bg-slate-50/30 transition-all cursor-pointer flex items-center justify-between gap-2"
                  >
                    <span>{p.q}</span>
                    <ChevronRight className="w-4 h-4 opacity-60 text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PREMIUM FEATURES bento section */}
      <section id="features" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <span className="text-xs tracking-wider font-extrabold uppercase text-emerald-600 block font-sans">
            POWERFUL FEATURES
          </span>
          <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-slate-800 tracking-tight leading-none">
            Everything You Need to Reach Your Goal
          </h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Our premium, scientifically structured tools replace costly nutritionists and trainers with active, supportive metrics.
          </p>
        </div>

        {/* 12 Grids layout */}
        <div id="features-bento-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {[
            { t: 'AI Weight Loss Coach', desc: 'Personalized guidance based on your goals, habits, and progress updates.', icon: MessageSquare, c: 'text-emerald-500 bg-emerald-50' },
            { t: 'Meal Planning', desc: 'Generate customized healthy meal plans in seconds complete with macros.', icon: Utensils, c: 'text-indigo-500 bg-indigo-50' },
            { t: 'Calorie Calculator', desc: 'Calculate daily calorie needs instantly using Mifflin-St Jeor formulas.', icon: Flame, c: 'text-amber-500 bg-amber-50' },
            { t: 'Macro Calculator', desc: 'Configure customized protein, carb, and healthy fats targets.', icon: Sparkles, c: 'text-teal-500 bg-teal-50' },
            { t: 'Workout Generator', desc: 'Get load progressive workouts built for home or commercial gyms.', icon: Dumbbell, c: 'text-rose-500 bg-rose-50' },
            { t: 'Progress Tracking', desc: 'Monitor scale averages, measurements, and body fat calculations.', icon: Scale, c: 'text-violet-500 bg-violet-50' },
            { t: 'Nutrition Analysis', desc: 'Instantly unpack ingredient profiles to maximize micronutrient density.', icon: CheckCircle, c: 'text-blue-500 bg-blue-50' },
            { t: 'Habit Builder', desc: 'Map out clean hydration triggers, step limits, and structured sleep schedules.', icon: Clock, c: 'text-orange-500 bg-orange-50' },
            { t: 'Water Tracker', desc: 'Easily log dynamic hydrous intakes depending on workout volume.', icon: Droplet, c: 'text-sky-500 bg-sky-50' },
            { t: 'Body Fat Estimator', desc: 'Circumference body metrics calculation to assess adipose reductions.', icon: Compass, c: 'text-fuchsia-500 bg-fuchsia-50' },
            { t: 'Smart Grocery Lists', desc: 'Aggregate shopping schedules directly filtered by dietary limits.', icon: ShieldCheck, c: 'text-emerald-600 bg-emerald-100/50' },
            { t: 'Motivation System', desc: 'Receive proactive encouraging prompts and earn metabolic streak badges.', icon: Star, c: 'text-yellow-600 bg-yellow-50' },
          ].map((feat, i) => {
            const Icon = feat.icon;
            
            // Determine call to action text based on auth status and feature type
            let actionLabel = 'Unlock feature';
            if (user) {
              actionLabel = 'Open dashboard';
            } else if (['Calorie Calculator', 'Macro Calculator', 'Water Tracker', 'Body Fat Estimator'].includes(feat.t)) {
              actionLabel = 'Try free tool';
            } else if (feat.t === 'AI Weight Loss Coach') {
              actionLabel = 'Try chat preview';
            } else if (feat.t === 'Progress Tracking') {
              actionLabel = 'Try goal planner';
            }

            return (
              <button
                key={i}
                type="button"
                onClick={() => handleFeatureClick(feat.t)}
                className="w-full text-left bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-lg hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between hover:scale-[1.02] cursor-pointer group relative overflow-hidden"
              >
                {/* Glow overlay inside card */}
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="space-y-4 relative z-10 w-full flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${feat.c} group-hover:scale-105 transition-transform duration-300`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-sans font-bold text-slate-800 text-sm sm:text-base leading-snug group-hover:text-emerald-600 transition-colors">
                        {feat.t}
                      </h4>
                      <p className="text-slate-500 text-xs sm:text-sm mt-1.5 leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-3 flex items-center text-xs font-bold text-emerald-500 group-hover:translate-x-1.5 transition-transform duration-300 select-none">
                    <span>{actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1 inline-block" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 md:py-24 border-t border-slate-50 bg-slate-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-600 block">
              THREE SIMPLE STEPS
            </span>
            <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-slate-800 tracking-tight leading-none font-sans">
              Three Simple Steps
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm max-w-sm mx-auto">
              How LeanAI personalizes metabolic goals to yield consistent results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { s: 'Step 1', t: 'Set Goal', desc: 'Choose weight goals, food limits, and workout experience metrics during onboarding.', icon: Compass, c: 'text-indigo-500 bg-indigo-50 border border-indigo-100', action: 'Start onboarding' },
              { s: 'Step 2', t: 'Chat With AI', desc: 'Inquire with the Personal Coach 24/7 about plateaus, recipes, rest days or dynamic calorie caps.', icon: MessageSquare, c: 'text-emerald-500 bg-emerald-50 border border-emerald-100', action: 'Try messaging' },
              { s: 'Step 3', t: 'Receive Plan', desc: 'Instantly download customized macro schedules, weekly checklists and grocer items.', icon: CheckCircle, c: 'text-teal-500 bg-teal-50 border border-teal-100', action: 'Generate details' },
            ].map((step, i) => {
              const IconComp = step.icon;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleStepClick(step.t)}
                  className="w-full text-center space-y-4 bg-white hover:bg-slate-50/55 rounded-3xl border border-slate-100 hover:border-emerald-300 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer group flex flex-col items-center justify-between"
                >
                  <div className="space-y-4 w-full flex flex-col items-center">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${step.c} group-hover:scale-105 transition-transform duration-300`}>
                      <IconComp className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-emerald-600 font-sans font-extrabold text-[10px] tracking-wider uppercase">
                        {step.s}
                      </span>
                      <h3 className="font-sans font-extrabold text-lg text-slate-800 mt-1 max-w-xs mx-auto group-hover:text-emerald-600 transition-colors">{step.t}</h3>
                      <p className="text-slate-500 text-xs sm:text-sm mt-2 leading-relaxed max-w-xs mx-auto">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 flex items-center text-xs font-bold text-emerald-500 group-hover:translate-x-0.5 transition-transform duration-300 select-none">
                    <span>{step.action}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. SUCCESS STORIES */}
      <section id="success-stories" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          <div className="lg:col-span-4 space-y-4 text-center lg:text-left">
            <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-600 block">
              REAL TRANSFORMATIONS
            </span>
            <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-slate-800 tracking-tight leading-none">
              Why Users Love LeanAI Coach
            </h2>
            <p className="text-slate-500 text-sm max-w-sm mx-auto lg:mx-0 leading-relaxed">
              Read true physical breakthroughs logged by clients who conquered their metabolic adapting limits.
            </p>
          </div>

          {/* Core transform cards list */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {SuccessStories.map((story) => (
              <div
                key={story.name}
                className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-1 text-yellow-500">
                    {[...Array(story.rating)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-650 text-xs sm:text-sm leading-relaxed italic">
                    "{story.testimonial}"
                  </p>
                </div>

                <div className="flex items-center space-x-3 pt-3 border-t border-slate-50">
                  <img
                    src={story.image}
                    alt={story.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-100"
                  />
                  <div>
                    <h4 className="text-slate-800 font-sans font-bold text-xs">{story.name}</h4>
                    <p className="text-slate-400 text-[10px] font-semibold">
                      {story.tag} • <strong className="text-emerald-500 font-extrabold">-{story.weightLost}</strong>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE TOOLS SEGMENT */}
      <section id="tools" className="py-20 md:py-24 border-t border-slate-50 bg-slate-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-emerald-600 font-extrabold text-xs tracking-wider uppercase font-sans block">
              FREE HEALTH CALCULATORS
            </span>
            <h2 className="font-sans font-extrabold text-3xl sm:text-5xl text-slate-800 tracking-tight leading-tight">
              Test Our Instant Calculators
            </h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Our calculations work immediately. Check your BMI, daily calorie caps, safe liquid targets, or macro schedules below.
            </p>
          </div>

          <InteractiveTools activeTab={activeToolTab} onChangeTab={setActiveToolTab} />
        </div>
      </section>

      {/* 7. PREMIUM MEMBERSHIP SECTION & COMPARISON TABLE */}
      <section id="pricing" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-600 block">
            AFFORDABLE SaaS TIERS
          </span>
          <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-slate-800 tracking-tight leading-none font-sans">
            Start Your Transformation Free
          </h2>
          <p className="text-slate-500 text-sm">
            Unlock master calorie planners, unlimited coach threads, and grocery tools.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {/* Card 1: Free */}
          <div className="bg-slate-50 border border-slate-150 rounded-3xl p-6 sm:p-8 flex flex-col justify-between gap-6 hover:scale-[1.01] transition-all">
            <div className="space-y-4">
              <div>
                <h4 className="font-sans font-bold text-lg text-slate-800">Basic Tier</h4>
                <p className="text-slate-450 text-xs mt-0.5">Perfect for starting calculations</p>
              </div>
              <div className="flex items-baseline space-x-1 font-mono text-slate-800">
                <span className="text-4xl font-sans font-extrabold">$0</span>
                <span className="text-slate-400 text-xs font-semibold uppercase">Free forever</span>
              </div>
              <hr className="border-slate-150" />
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Interactive BMI Calculator</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Calorie calculations (mifflin method)</span>
                </li>
                <li className="flex items-center space-x-2 text-slate-400 font-medium">
                  <span className="w-4 text-center mr-1">&#10005;</span>
                  <span>Personal AI Plan Generation</span>
                </li>
              </ul>
            </div>
            <button
              onClick={onStartFree}
              className="w-full py-2.5 border border-slate-250 hover:bg-slate-100 rounded-xl font-bold text-xs sm:text-sm text-slate-700 transition-colors cursor-pointer"
            >
              Start Free Training
            </button>
          </div>

          {/* Card 2: Pro (Recommended) */}
          <div className="bg-white border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 flex flex-col justify-between gap-6 relative shadow-xl hover:scale-[1.01] transition-all">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-white text-[10px] uppercase tracking-widest font-extrabold rounded-full shadow-md shrink-0">
              Highly Recommended
            </span>

            <div className="space-y-4">
              <div>
                <h4 className="font-sans font-bold text-lg text-slate-800">Coach Pro Pass</h4>
                <p className="text-slate-450 text-xs mt-0.5">Full personalized plan mapping</p>
              </div>
              <div className="flex items-baseline space-x-1 font-mono text-slate-850">
                <span className="text-4xl font-sans font-extrabold">$19</span>
                <span className="text-slate-400 text-xs font-semibold">/ month</span>
              </div>
              <hr className="border-slate-150" />
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>100% Custom Nutrition & Workout Plan</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Unlimited 24/7 AI Coach message logs</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Grocery items list auto generator</span>
                </li>
              </ul>
            </div>
            <button
              onClick={onStartFree}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/10 transition-colors cursor-pointer"
            >
              Claim 7-day Free Trial
            </button>
          </div>

          {/* Card 3: Premium */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col justify-between gap-6 hover:scale-[1.01] transition-all text-white shadow-xl">
            <div className="space-y-4">
              <div>
                <h4 className="font-sans font-bold text-lg text-slate-100">Coach Elite Premium</h4>
                <p className="text-slate-500 text-xs mt-0.5">Metabolic medical oversight checks</p>
              </div>
              <div className="flex items-baseline space-x-1 font-mono text-slate-100">
                <span className="text-4xl font-sans font-extrabold">$39</span>
                <span className="text-slate-500 text-xs font-semibold">/ month</span>
              </div>
              <hr className="border-slate-800" />
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>All Coach Pro features included</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Wearable hardware continuous API checks</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Priority fast GPU model responses</span>
                </li>
              </ul>
            </div>
            <button
              onClick={onStartFree}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 rounded-xl font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Upgrade Elite
            </button>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white border border-slate-150 rounded-3xl p-4 sm:p-8 shadow-sm overflow-x-auto">
          <h3 className="font-sans font-bold text-base sm:text-lg text-slate-850 mb-6">Compare Premium Sizing Specs</h3>
          <table className="w-full text-left font-sans border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-150 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3">Features & Metrics</th>
                <th className="py-3">Basic Team</th>
                <th className="py-3 text-emerald-600 font-extrabold">Pro Tier</th>
                <th className="py-3">Elite Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { f: 'Daily Calorie Mifflin calculations', b: 'Included', p: 'Included', e: 'Included' },
                { f: 'Personalized Meal schedules', b: 'Read-only', p: 'AI Generated', e: 'AI Generated' },
                { f: 'Workout cycles generation', b: 'Dummy list', p: '100% Adaptive', e: '100% Adaptive' },
                { f: 'AI Coach continuous message logs', b: '3 / Day Limit', p: 'Unlimited 24/7', e: 'Unlimited 24/7' },
                { f: 'Wearable Apple Health API hooks', b: 'Not available', p: 'Included', e: 'Included' },
                { f: 'Priority GPU prompt speed', b: 'Standard queue', p: 'Fast Lane', e: 'Instantaneous response' },
              ].map((row, index) => (
                <tr key={index} className="text-slate-650 hover:bg-slate-50/20 text-xs sm:text-sm font-medium">
                  <td className="py-3.5 font-bold text-slate-800">{row.f}</td>
                  <td className="py-3.5 text-slate-450">{row.b}</td>
                  <td className="py-3.5 font-bold text-emerald-600">{row.p}</td>
                  <td className="py-3.5 text-indigo-700 font-semibold">{row.e}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 8. EXPANDABLE FAQ ACCORDION - MINIMUM 20 ENTRIES */}
      <section className="py-20 md:py-24 border-t border-slate-50 bg-slate-50/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-600 block">
              HAVE QUESTIONS?
            </span>
            <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-slate-800 tracking-tight leading-none font-sans">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 text-sm">
              Discover how our underlying metabolic calculations preserve lean tissue weight sustainably.
            </p>
          </div>

          <div className="space-y-4">
            {FAQs.map((faq, index) => {
              const isExpanded = expandedFAQIndex === index;
              return (
                <div
                  key={index}
                  className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-center justify-between p-5 text-left font-sans font-bold text-slate-800 text-xs sm:text-sm hover:bg-slate-50/50 transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <span className="text-slate-400 hover:text-slate-700 shrink-0 select-none">
                      {isExpanded ? <Minus className="w-4 h-4 text-emerald-500" /> : <Plus className="w-4 h-4" />}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="p-5 pt-1 border-t border-slate-50 text-slate-550 text-xs sm:text-sm leading-relaxed bg-slate-50/20">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA CONVERSION FOOTER */}
      <section className="py-16 md:py-24 bg-slate-900 text-white relative overflow-hidden select-none">
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-teal-500/5 blur-3xl -z-10" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="bg-white/10 text-emerald-400 border border-emerald-500/10 px-3 py-1 inline-flex rounded-full text-[10px] font-sans font-bold uppercase tracking-wider">
            Join the Smarter Way to Lose Weight
          </div>
          <h2 className="font-sans font-extrabold text-3xl sm:text-5xl tracking-tight leading-none">
            Start Your Weight Loss Journey Today
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            Let LeanAI Coach calculate your metabolic offsets, design high-protein dietary recipes, and provide continuous 24/7 accountability.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onStartFree}
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-2xl transition-all hover:scale-102 shadow-lg shadow-emerald-500/15 cursor-pointer"
            >
              Start Free Testing
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('coach-ask-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-sm rounded-2xl transition-all cursor-pointer"
            >
              Talk To AI Coach
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER COOPERATIVE SYSTEM BYPASS LOGIN */}
      <footer className="bg-white border-t border-slate-100 py-12 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 bg-emerald-500 text-white rounded-lg">
                <Sparkles className="w-4 h-4 fill-white/10" />
              </span>
              <span className="font-sans font-bold text-base text-slate-800">LeanAI Coach</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed max-w-xs">
              Scientific calorie deficit modeling fuzed with responsive generative intelligence. Real results without food restriction.
            </p>
          </div>

          <div>
            <h4 className="font-sans font-bold text-slate-800 text-xs uppercase mb-3">Product Menu</h4>
            <ul className="space-y-2 text-xs text-slate-500 font-semibold">
              <li className="hover:text-emerald-500 cursor-pointer" onClick={() => setCurrentView('landing')}>Home View</li>
              <li className="hover:text-emerald-500 cursor-pointer" onClick={() => setCurrentView('blog')}>SEO Articles</li>
              {user ? (
                <li className="hover:text-emerald-500 cursor-pointer" onClick={() => {
                  if (onNavigateToDashboard) {
                    onNavigateToDashboard('overview');
                  } else {
                    setCurrentView('dashboard');
                  }
                }}>Go to Dashboard</li>
              ) : (
                <li className="hover:text-emerald-500 cursor-pointer" onClick={() => onOpenAuth('login')}>Client Log In</li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-sans font-bold text-slate-800 text-xs uppercase mb-3">Health Indices</h4>
            <ul className="space-y-2 text-xs text-slate-500 font-semibold">
              <li className="hover:text-emerald-500 cursor-pointer" onClick={() => {
                setCurrentView('landing');
                setTimeout(() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' }), 100);
              }}>BMI Calc</li>
              <li className="hover:text-emerald-500 cursor-pointer" onClick={() => {
                setCurrentView('landing');
                setTimeout(() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' }), 100);
              }}>Body Fat Calc</li>
              <li className="hover:text-emerald-500 cursor-pointer" onClick={() => {
                setCurrentView('landing');
                setTimeout(() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' }), 100);
              }}>Energy Planner</li>
            </ul>
          </div>

          <div>
            <h4 className="font-sans font-bold text-slate-800 text-xs uppercase mb-3">Control Gate</h4>
            <ul className="space-y-2 text-xs text-slate-500 font-semibold">
              <li
                onClick={() => setCurrentView('admin')}
                className="hover:text-indigo-500 cursor-pointer font-bold text-slate-650 flex items-center space-x-1"
              >
                <span>● Administrator login</span>
              </li>
              <li className="text-[10px] text-slate-400 font-normal">
                Bypass authorization code: LeanAI-Core
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-50 pt-6 mt-8 flex flex-col sm:flex-row justify-between text-[11px] text-slate-400 gap-4">
          <span>&copy; {new Date().getFullYear()} LeanAI Coach Inc. All Rights Reserved.</span>
          <div className="flex space-x-4">
            <span className="hover:underline cursor-pointer">Sitemap</span>
            <span className="hover:underline cursor-pointer">Robots.txt verified</span>
            <span className="hover:underline cursor-pointer">WCAG AA Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
