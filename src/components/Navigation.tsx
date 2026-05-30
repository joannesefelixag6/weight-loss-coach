/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Sparkles, Menu, X, User } from 'lucide-react';
import { UserProfile } from '../types';

interface NavigationProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  user: UserProfile | null;
  onLogout: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export default function Navigation({
  currentView,
  setCurrentView,
  user,
  onLogout,
  onOpenAuth,
}: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (view: string) => {
    setMobileMenuOpen(false);
    if (view.startsWith('#')) {
      setCurrentView('landing');
      setTimeout(() => {
        const id = view.slice(1);
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      setCurrentView(view);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav
      id="main-navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div
            id="nav-logo"
            onClick={() => handleNavClick('landing')}
            className="flex items-center space-x-2 cursor-pointer group"
          >
            <div className="bg-emerald-500 text-white p-1.5 rounded-xl shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 fill-white/10" />
            </div>
            <span className="font-sans font-bold text-xl tracking-tight text-slate-800">
              Lean<span className="text-emerald-500">AI</span> Coach
            </span>
          </div>

          {/* Desktop Menu */}
          <div id="desktop-menu" className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleNavClick('#features')}
              className="text-slate-600 hover:text-emerald-500 font-medium text-sm transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              onClick={() => handleNavClick('#how-it-works')}
              className="text-slate-600 hover:text-emerald-500 font-medium text-sm transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => handleNavClick('#tools')}
              className="text-slate-600 hover:text-emerald-500 font-medium text-sm transition-colors cursor-pointer"
            >
              Tools
            </button>
            <button
              onClick={() => handleNavClick('#success-stories')}
              className="text-slate-600 hover:text-emerald-500 font-medium text-sm transition-colors cursor-pointer"
            >
              Success Stories
            </button>
            <button
              onClick={() => handleNavClick('#pricing')}
              className="text-slate-600 hover:text-emerald-500 font-medium text-sm transition-colors cursor-pointer"
            >
              Pricing
            </button>
            <button
              onClick={() => handleNavClick('blog')}
              className={`font-medium text-sm transition-colors cursor-pointer ${
                currentView === 'blog' ? 'text-emerald-500' : 'text-slate-600 hover:text-emerald-500'
              }`}
            >
              Blog
            </button>
          </div>

          {/* Auth & CTAs */}
          <div id="desktop-auth-actions" className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleNavClick('dashboard')}
                  className="flex items-center space-x-1 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl font-medium text-sm text-slate-700 transition-all border border-slate-200"
                >
                  <User className="w-4 h-4 text-emerald-500" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={onLogout}
                  className="text-slate-500 hover:text-red-500 text-sm font-medium transition-colors"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => onOpenAuth('login')}
                  className="text-slate-600 hover:text-emerald-500 font-semibold text-sm transition-colors cursor-pointer px-3 py-2"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNavClick('onboarding')}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] shadow-sm hover:shadow-md cursor-pointer"
                >
                  Start Free
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Icon */}
          <div className="md:hidden flex items-center space-x-3">
            {user && (
              <button
                onClick={() => handleNavClick('dashboard')}
                className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-xl"
              >
                <User className="w-5 h-5 text-slate-700" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-700 hover:text-emerald-500 p-1 bg-slate-50 rounded-lg transition-colors border border-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-drawer-menu"
          className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 shadow-xl overflow-hidden transition-all duration-300 py-4 px-6 space-y-4"
        >
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => handleNavClick('#features')}
              className="text-left text-slate-700 hover:text-emerald-500 text-base font-semibold py-1.5 transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => handleNavClick('#how-it-works')}
              className="text-left text-slate-700 hover:text-emerald-500 text-base font-semibold py-1.5 transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => handleNavClick('#tools')}
              className="text-left text-slate-700 hover:text-emerald-500 text-base font-semibold py-1.5 transition-colors"
            >
              Tools
            </button>
            <button
              onClick={() => handleNavClick('#success-stories')}
              className="text-left text-slate-700 hover:text-emerald-500 text-base font-semibold py-1.5 transition-colors"
            >
              Success Stories
            </button>
            <button
              onClick={() => handleNavClick('#pricing')}
              className="text-left text-slate-700 hover:text-emerald-500 text-base font-semibold py-1.5 transition-colors"
            >
              Pricing
            </button>
            <button
              onClick={() => handleNavClick('blog')}
              className="text-left text-slate-700 hover:text-emerald-500 text-base font-semibold py-1.5 transition-colors"
            >
              Blog
            </button>
          </div>

          <hr className="border-slate-100" />

          <div className="flex items-center space-x-3 pt-2">
            {user ? (
              <button
                onClick={onLogout}
                className="w-full text-center py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-semibold transition-all"
              >
                Log Out
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('login');
                  }}
                  className="flex-1 text-center py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-all"
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNavClick('onboarding')}
                  className="flex-1 text-center py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-all"
                >
                  Start Free
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
