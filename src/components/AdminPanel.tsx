/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DollarSign, Users, Award, Database, Download, Check, ShieldAlert, Sparkles, Send, Trash2 } from 'lucide-react';
import { AdminMetrics } from '../types';

export default function AdminPanel() {
  const [metrics, setMetrics] = useState<AdminMetrics>({
    totalUsers: 54224,
    monthlyRevenueUSD: 184550,
    activeSubscriptions: {
      freeCount: 42100,
      proCount: 9424,
      premiumCount: 2700,
    },
    aiTokensCount: 1650304,
    averageWeightLostKg: 6.8,
    recentLogs: [
      { id: 'log-1', userEmail: 'joanfelixag6@gmail.com', action: 'Customized Caloric plan created', timestamp: '3 mins ago' },
      { id: 'log-2', userEmail: 'james_reid@arch.io', action: 'Trial renewed to Pro tier', timestamp: '12 mins ago' },
      { id: 'log-3', userEmail: 'sarah_mkt@co.com', action: 'Weight target index logged: 65.2kg', timestamp: '24 mins ago' },
      { id: 'log-4', userEmail: 'michael77@tech.edu', action: 'Interactive BMI calculation logged', timestamp: '1 hour ago' },
      { id: 'log-5', userEmail: 'tony_p@gmail.com', action: '2FA authentication completed', timestamp: '2 hours ago' },
    ],
  });

  const [testimonials, setTestimonials] = useState([
    { id: 't-1', name: 'James R.', age: '34', loss: '26 lbs', state: 'Active' },
    { id: 't-2', name: 'Sarah K.', age: '29', loss: '22 lbs', state: 'Active' },
    { id: 't-3', name: 'Michael T.', age: '42', loss: '35 lbs', state: 'Active' },
  ]);

  const [blogDrafts, setBlogDrafts] = useState([
    { id: 'b-1', title: 'Why Cheat Meals Can Accelerate Fat-burning Hormones', category: 'Nutrition', author: 'Sabrina Delgado, RD' },
    { id: 'b-2', title: 'The Hypertrophy Equation: Sets and Reps Needed to Retain Tone', category: 'Fitness', author: 'Marcus Thorne, CSCS' },
  ]);

  const [newBlogTitle, setNewBlogTitle] = useState('');
  const [newBlogCategory, setNewBlogCategory] = useState('Nutrition');

  const [exported, setExported] = useState(false);

  const handleCreateBlogDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlogTitle.trim()) return;
    setBlogDrafts([
      ...blogDrafts,
      {
        id: `b-${Date.now()}`,
        title: newBlogTitle,
        category: newBlogCategory,
        author: 'Chief Metabolic Consultant',
      },
    ]);
    setNewBlogTitle('');
    // Trigger system action feedback
    const newLog = {
      id: `log-${Date.now()}`,
      userEmail: 'admin@leanai.coach',
      action: `Created draft: "${newBlogTitle.slice(0, 25)}..."`,
      timestamp: 'Just now',
    };
    setMetrics({
      ...metrics,
      recentLogs: [newLog, ...metrics.recentLogs.slice(0, 4)],
    });
  };

  const handleDeleteTestimonial = (id: string) => {
    setTestimonials(testimonials.filter((t) => t.id !== id));
  };

  const triggerExport = () => {
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 space-y-10">
      {/* Admin Title Copy */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center space-x-1 px-2.5 py-0.5 bg-slate-150 inline-flex rounded-md text-slate-800 text-[10px] font-sans font-bold uppercase tracking-wider mb-2">
            <Award className="w-3 h-3 text-emerald-500" />
            <span>Master System Console</span>
          </div>
          <h1 className="text-3xl font-sans font-extrabold text-slate-800 tracking-tight leading-none">LeanAI Administrator Room</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Track user registries, sitemap diagnostics, financial billing charts, and premium Gemini AI tokens.
          </p>
        </div>

        <button
          onClick={triggerExport}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 font-bold text-xs sm:text-sm text-white rounded-xl shadow-md shadow-emerald-500/10 cursor-pointer self-start"
        >
          {exported ? (
            <>
              <Check className="w-4 h-4 text-white" />
              <span>Report Exported</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-white" />
              <span>Export CSV Report</span>
            </>
          )}
        </button>
      </div>

      {/* Analytics Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat 1 */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100/50 flex flex-col items-center justify-center text-emerald-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-slate-400 text-xs font-semibold tracking-wide uppercase font-sans">Active Registries</span>
            <span className="font-mono text-2xl font-bold text-slate-750">{(metrics.totalUsers).toLocaleString()}</span>
            <span className="block text-[10px] text-emerald-500 font-bold mt-0.5">+14% Growth</span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100/50 flex flex-col items-center justify-center text-teal-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-slate-400 text-xs font-semibold tracking-wide uppercase font-sans">Monthly Revenue</span>
            <span className="font-mono text-2xl font-bold text-slate-750">
              ${metrics.monthlyRevenueUSD.toLocaleString()}
            </span>
            <span className="block text-[10px] text-teal-500 font-bold mt-0.5">Recurring SaaS</span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100/50 flex flex-col items-center justify-center text-amber-600">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-slate-400 text-xs font-semibold tracking-wide uppercase font-sans">Gemini Tokens</span>
            <span className="font-mono text-2xl font-bold text-slate-750">
              {metrics.aiTokensCount.toLocaleString()}
            </span>
            <span className="block text-[10px] text-slate-500 font-mono mt-0.5">API limit: 98% safe</span>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100/50 flex flex-col items-center justify-center text-rose-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-slate-400 text-xs font-semibold tracking-wide uppercase font-sans">Avg Weight Lost</span>
            <span className="font-mono text-2xl font-bold text-slate-750">{metrics.averageWeightLostKg} kg</span>
            <span className="block text-[10px] text-slate-500 font-bold mt-0.5">Per Client active</span>
          </div>
        </div>
      </div>

      {/* Main split sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left side: blog drafts & logs monitor */}
        <div className="lg:col-span-2 space-y-8">
          {/* Post publishing form */}
          <div className="bg-white border border-slate-150 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <h3 className="font-sans font-bold text-lg text-slate-800">Publish Article Stream</h3>
            </div>

            <form onSubmit={handleCreateBlogDraft} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Article Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Science behind fast lipid oxidation breaks"
                    value={newBlogTitle}
                    onChange={(e) => setNewBlogTitle(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-205 rounded-xl text-slate-850 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                  <select
                    value={newBlogCategory}
                    onChange={(e) => setNewBlogCategory(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-205 rounded-xl text-slate-850 text-sm outline-none font-semibold text-slate-700"
                  >
                    <option value="Nutrition">Nutrition</option>
                    <option value="Weight Loss">Weight Loss</option>
                    <option value="Fitness">Fitness</option>
                    <option value="AI Coaching">AI Coaching</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4 text-white" />
                <span>Publish Draft Now</span>
              </button>
            </form>

            <div className="pt-4 space-y-3">
              <span className="block text-slate-400 text-xs font-bold uppercase tracking-wider font-sans">
                Active Articles Stream ({blogDrafts.length})
              </span>
              <div className="divide-y divide-slate-100">
                {blogDrafts.map((draft) => (
                  <div key={draft.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                    <span className="font-semibold text-slate-850 truncate">{draft.title}</span>
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-550 border border-slate-200 rounded-md font-medium shrink-0">
                      {draft.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Testimonials compiler */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="font-sans font-bold text-lg text-slate-800 border-b border-slate-50 pb-3">
              Client Transformations & Testimonials Manager
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase">
                    <th className="py-3">Name</th>
                    <th className="py-3">Metrics</th>
                    <th className="py-3">Sitemap flag</th>
                    <th className="py-3 text-right">Options</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {testimonials.map((t) => (
                    <tr key={t.id} className="text-slate-700">
                      <td className="py-3.5 font-bold text-slate-800">{t.name}</td>
                      <td className="py-3.5 font-mono text-slate-600">{t.loss} in {t.age} yrs</td>
                      <td className="py-3.5">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-100 rounded-md">
                          {t.state}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteTestimonial(t.id)}
                          className="p-1.5 bg-slate-50 hover:bg-red-50 hover:text-red-500 rounded-lg text-slate-450 border border-slate-200 hover:border-red-200 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right side: telemetry logs log stream */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4 font-mono select-none">
            <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
              <Database className="w-5 h-5 text-emerald-400" />
              <h3 className="font-sans font-bold text-base text-slate-200">Interactive Telemetry</h3>
            </div>

            <div className="space-y-4 text-xs">
              {metrics.recentLogs.map((log) => (
                <div key={log.id} className="space-y-1 bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-emerald-400 tracking-wider truncate mr-2">{log.userEmail}</span>
                    <span className="text-slate-500 shrink-0">{log.timestamp}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed font-sans">{log.action}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-white/5 text-[10px] text-slate-500 leading-relaxed font-sans">
              * Live WebSocket secure link is operating properly. Logs automatically update upon client interaction checkpoints.
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-3 font-sans">
            <h4 className="font-bold text-sm text-slate-800">SEO Map & Schema Markup</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              We generated structural JSON-LD schemas representing a "HealthClub" and "SaaSBrand" directly within the index template to establish premium indexing.
            </p>
            <div className="p-2.5 bg-white border border-slate-100 rounded-xl space-y-1 text-[11px]">
              <span className="block font-bold font-mono text-slate-700">Robots.txt status:</span>
              <span className="text-green-600 font-bold font-mono">● LIVE / ALLOW / ALL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
