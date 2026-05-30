/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Search, ChevronLeft, Calendar, Clock, BookOpen, Share2, Check, Sparkles } from 'lucide-react';
import { BlogPost } from '../types';
import { BlogPosts } from '../data';

export default function BlogSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [readingPost, setReadingPost] = useState<BlogPost | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const categories = ['All', 'Weight Loss', 'Nutrition', 'Fitness', 'Meal Planning', 'Recipes', 'Healthy Habits', 'Motivation', 'AI Coaching'];

  // Filter logic
  const filteredPosts = BlogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleCopyLink = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {readingPost ? (
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
          {/* Back button */}
          <button
            onClick={() => {
              setReadingPost(null);
              window.scrollTo({ top: 0 });
            }}
            className="flex items-center space-x-1.5 text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to All Articles</span>
          </button>

          {/* Heading meta */}
          <div className="space-y-4">
            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-bold rounded-lg uppercase tracking-wide">
              {readingPost.category}
            </span>
            <h1 className="font-sans font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight leading-tight">
              {readingPost.title}
            </h1>
            <p className="text-slate-500 font-medium text-base sm:text-lg leading-relaxed">
              {readingPost.summary}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-y border-slate-100 py-4 mt-6">
              {/* Author */}
              <div className="flex items-center space-x-3">
                <img
                  src={readingPost.author.avatar}
                  alt={readingPost.author.name}
                  className="w-11 h-11 rounded-full object-cover border border-slate-100"
                />
                <div>
                  <h4 className="text-slate-800 font-sans font-bold text-sm">{readingPost.author.name}</h4>
                  <p className="text-slate-400 text-xs font-semibold">{readingPost.author.role}</p>
                </div>
              </div>

              {/* Time stats */}
              <div className="flex items-center space-x-4 text-xs text-slate-400 font-semibold">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{readingPost.date}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{readingPost.readTime}</span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center space-x-1.5 p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-600 border border-slate-200"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Share'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Feature Image */}
          <div className="relative rounded-3xl overflow-hidden h-64 sm:h-[400px] shadow-lg border border-slate-100/50">
            <img src={readingPost.image} alt={readingPost.title} className="w-full h-full object-cover" />
          </div>

          {/* Article HTML Content parsed through style */}
          <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-6">
            {readingPost.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={index} className="text-xl sm:text-2xl font-bold font-sans text-slate-900 mt-8 mb-4">
                    {paragraph.slice(3)}
                  </h2>
                );
              }
              if (paragraph.startsWith('### ')) {
                return (
                  <h3 key={index} className="text-lg font-bold font-sans text-slate-900 mt-6 mb-3">
                    {paragraph.slice(4)}
                  </h3>
                );
              }
              if (paragraph.startsWith('* ')) {
                return (
                  <ul key={index} className="list-disc pl-5 space-y-2">
                    {paragraph.split('\n').map((li, i) => (
                      <li key={i}>{li.slice(2)}</li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={index} className="text-sm sm:text-base leading-relaxed">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-6 border-t border-slate-100">
            {readingPost.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-605 text-xs font-bold rounded-lg font-sans">
                #{tag}
              </span>
            ))}
          </div>

          {/* Suggest coaching */}
          <div className="bg-gradient-to-r from-emerald-50 to-green-50/50 rounded-3xl p-6 sm:p-8 border border-emerald-100/60 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="font-sans font-bold text-lg text-slate-800">Ready to personalize these topics?</h3>
              <p className="text-slate-500 text-xs sm:text-sm">
                LeanAI Coach will automatically ingest calorie, metabolic, and protein leverages to plan your lifestyle.
              </p>
            </div>
            <button
              onClick={() => {
                setReadingPost(null);
                const el = document.getElementById('main-navigation');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-semibold whitespace-nowrap shadow-md cursor-pointer"
            >
              Consult My Coach
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Header Copy */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs uppercase font-extrabold tracking-wider font-sans">LeanAI Blog Hub</span>
            </div>
            <h1 className="font-sans font-extrabold text-3xl sm:text-5xl text-slate-800 tracking-tight leading-none">
              Science-Backed Weight Loss Insights
            </h1>
            <p className="text-slate-500 text-sm sm:text-base max-w-lg mx-auto">
              Read actionable guidelines written by clinical biochemists, performance coaches and dietitians.
            </p>
          </div>

          {/* Search bar & Categories Row */}
          <div className="space-y-6">
            <div className="max-w-md mx-auto relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                placeholder="Search articles, keywords, metabolism plateaus..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-205 rounded-xl text-slate-850 text-sm outline-none shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            {/* Category selection scroll bar */}
            <div className="flex overflow-x-auto pb-2 gap-1.5 max-w-4xl mx-auto select-none no-scrollbar justify-start sm:justify-center">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-xl whitespace-nowrap border transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cards listing */}
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => {
                    setReadingPost(post);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="bg-white rounded-3xl border border-slate-100 shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-4 left-4 px-2.5 py-1 bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-sans font-bold uppercase rounded-lg tracking-wider border border-white/50 shadow-sm z-10">
                      {post.category}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-sans font-bold text-lg text-slate-800 leading-snug group-hover:text-emerald-500 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-slate-500 text-xs sm:text-sm line-clamp-3">
                        {post.summary}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400 font-semibold gap-2">
                      <div className="flex items-center space-x-2">
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="text-slate-600">{post.author.name}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-slate-400 font-mono text-[10px]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 p-8 border border-dashed border-slate-200 bg-slate-50/50 rounded-3xl max-w-md mx-auto space-y-3">
              <span className="inline-block p-3 bg-slate-100 text-slate-405 rounded-full">
                <Search className="w-6 h-6 animate-pulse" />
              </span>
              <h3 className="font-sans font-bold text-slate-700">No articles match your criteria</h3>
              <p className="text-slate-400 text-xs sm:text-sm max-w-sm mx-auto">
                Try modifying your query or select a different health category from the navigation list.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
