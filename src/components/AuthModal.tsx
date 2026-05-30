/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Lock, ShieldCheck, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (profileName: string) => void;
  initialMode?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'verify'>(initialMode);

  const switchMode = (newMode: 'login' | 'register' | 'forgot' | 'verify') => {
    setMode(newMode);
    setAuthError('');
    setAuthSuccess('');
  };
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  if (!isOpen) return null;

  const handleSocialLogin = (platform: 'google' | 'apple') => {
    setAuthLoading(true);
    setAuthError('');
    setTimeout(() => {
      setAuthLoading(false);
      onSuccess(platform === 'google' ? 'Google User' : 'Apple User');
      onClose();
    }, 1200);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    setAuthSuccess('');

    if (mode === 'login') {
      if (!email.includes('@') || password.length < 5) {
        setAuthError('Please enter a valid email and 5+ character password.');
        setAuthLoading(false);
        return;
      }
      setTimeout(() => {
        setAuthLoading(false);
        // Advance to 2FA verification step for pro-grade experience
        switchMode('verify');
      }, 1000);
    } else if (mode === 'register') {
      if (!name || !email.includes('@') || password.length < 5) {
        setAuthError('Please fill out all fields completely.');
        setAuthLoading(false);
        return;
      }
      setTimeout(() => {
        setAuthLoading(false);
        switchMode('verify');
      }, 1000);
    } else if (mode === 'forgot') {
      if (!email.includes('@')) {
        setAuthError('Please enter your valid registered email.');
        setAuthLoading(false);
        return;
      }
      setTimeout(() => {
        setAuthLoading(false);
        setAuthSuccess(`A password reset link has been dispatched to ${email}`);
        switchMode('login');
      }, 1000);
    }
  };

  const codeChange = (index: number, val: string) => {
    if (val.length > 1) return;
    const newCode = [...verificationCode];
    newCode[index] = val;
    setVerificationCode(newCode);

    // Jump forward
    if (val && index < 5) {
      const nextInput = document.getElementById(`code-in-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handle2FAVerify = () => {
    setAuthLoading(true);
    setTimeout(() => {
      setAuthLoading(false);
      onSuccess(name || email.split('@')[0] || 'Premium Leaner');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transition-all flex flex-col p-6 sm:p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors"
        >
          &times;
        </button>

        {mode === 'verify' ? (
          <div className="flex flex-col text-center mt-2">
            <div className="mx-auto w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-4 border border-emerald-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-sans font-bold text-xl text-slate-800">Two-Factor Auth</h3>
            <p className="text-slate-500 text-sm mt-1.5 px-3">
              We have dispatched a 6-digit confirmation code. Please enter it below.
            </p>

            <div className="flex justify-center space-x-2 my-6">
              {verificationCode.map((char, index) => (
                <input
                  key={index}
                  id={`code-in-${index}`}
                  type="text"
                  maxLength={1}
                  className="w-11 sm:w-12 h-12 text-center text-lg font-bold text-slate-800 border border-slate-200 bg-slate-50/50 rounded-xl focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
                  value={char}
                  onChange={(e) => codeChange(index, e.target.value)}
                />
              ))}
            </div>

            <button
              onClick={handle2FAVerify}
              disabled={authLoading}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-semibold text-sm transition-all flex items-center justify-center space-x-2"
            >
              {authLoading ? 'Verifying Account...' : 'Confirm Authentication'}
              {!authLoading && <ArrowRight className="w-4 h-4 ml-1" />}
            </button>

            <button
              onClick={() => switchMode('login')}
              className="text-slate-500 hover:text-slate-800 text-xs font-semibold mt-4 transition-colors"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-center space-x-2 mb-2">
              <div className="bg-emerald-150 text-emerald-600 p-1 rounded-lg">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-sans font-bold text-sm tracking-wide text-emerald-600 uppercase">
                LeanAI Gate
              </span>
            </div>
            <h2 className="font-sans font-bold text-2xl text-slate-800">
              {mode === 'login'
                ? 'Welcome Back'
                : mode === 'register'
                ? 'Create LeanAI Account'
                : 'Reset Password'}
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              {mode === 'login'
                ? 'Empower your metabolism with smarter decisions.'
                : mode === 'register'
                ? 'Get curated nutrition and custom strength workouts.'
                : 'Enter your email to reclaim full access.'}
            </p>

            {authError && (
              <div className="mt-4 p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl text-xs sm:text-sm font-medium">
                {authError}
              </div>
            )}

            {authSuccess && (
              <div className="mt-4 p-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-xs sm:text-sm font-medium">
                {authSuccess}
              </div>
            )}

            {/* Social Oauth Buttons */}
            {mode !== 'forgot' && (
              <div className="grid grid-cols-2 gap-3 my-5">
                <button
                  onClick={() => handleSocialLogin('google')}
                  disabled={authLoading}
                  className="flex items-center justify-center space-x-2 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-semibold text-xs sm:text-sm text-slate-700 disabled:opacity-50"
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                  <span>Google</span>
                </button>
                <button
                  onClick={() => handleSocialLogin('apple')}
                  disabled={authLoading}
                  className="flex items-center justify-center space-x-2 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-semibold text-xs sm:text-sm text-slate-700 disabled:opacity-50"
                >
                  <svg className="w-4 h-4 fill-slate-800" viewBox="0 0 24 24">
                    <path d="M12.2 2C9.4 2 7 3.8 5.7 6.4 4.5 8.9 4.3 12 5.5 14.5c1.4 3 4.5 5 7.9 5 2.1 0 3.8-.7 4.9-1.9 1-1.1 1.5-2.7 1.4-4.5 0-4.6-3.8-8.1-7.5-8.1z" />
                  </svg>
                  <span>Apple</span>
                </button>
              </div>
            )}

            {mode !== 'forgot' && (
              <div className="relative flex items-center justify-center my-4">
                <hr className="w-full border-slate-100" />
                <span className="absolute px-3 bg-white text-slate-400 text-xs uppercase font-semibold">
                  Or use Email
                </span>
              </div>
            )}

            {/* Email form */}
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-slate-700 font-semibold text-xs mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50/30 rounded-xl focus:border-emerald-500 focus:bg-white outline-none text-sm transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold text-xs mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="name@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-slate-50/30 rounded-xl focus:border-emerald-500 focus:bg-white outline-none text-sm transition-all"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-slate-700 font-semibold text-xs">
                      Password
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                    onClick={() => switchMode('forgot')}
                        className="text-emerald-600 hover:text-emerald-700 text-xs font-semibold"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 border border-slate-200 bg-slate-50/30 rounded-xl focus:border-emerald-500 focus:bg-white outline-none text-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-98 text-white rounded-xl font-semibold text-sm transition-all duration-150 shadow-md shadow-emerald-500/10 flex items-center justify-center space-x-2"
              >
                {authLoading ? (
                  <span>Connecting Securely...</span>
                ) : (
                  <>
                    <span>
                      {mode === 'login'
                        ? 'Log In'
                        : mode === 'register'
                        ? 'Confirm Registry'
                        : 'Dispatch Link'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle Mode Footer */}
            <div className="mt-6 text-center">
              {mode === 'login' ? (
                <p className="text-slate-500 text-xs sm:text-sm">
                  New to LeanAI Coach?{' '}
                  <button
                    onClick={() => switchMode('register')}
                    className="text-emerald-600 font-bold hover:underline"
                  >
                    Join Free
                  </button>
                </p>
              ) : (
                <p className="text-slate-500 text-xs sm:text-sm">
                  Already have an account?{' '}
                  <button
                    onClick={() => switchMode('login')}
                    className="text-emerald-600 font-bold hover:underline"
                  >
                    Log In
                  </button>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
