import React, { useState, useEffect } from 'react';
import { MOTIVATIONAL_QUOTES } from '../data/subjects';
import { MotivationalQuote } from '../types';
import { Sparkles, Trophy, BookOpen, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function QuoteBanner() {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [greeting, setGreeting] = useState('أهلاً بك يا بطل');

  useEffect(() => {
    // Determine greeting based on current Iraqi local time
    const hr = new Date().getHours();
    if (hr >= 4 && hr < 12) {
      setGreeting('صباح الهمّة والنشاط يا بطل السادس ☀️');
    } else if (hr >= 12 && hr < 17) {
      setGreeting('مساء السعي والمثابرة يا مبدع 🌟');
    } else {
      setGreeting('مساء العزيمة والتركيز والامتياز 🌙');
    }

    // Auto rotate quotes every 25 seconds
    const interval = setInterval(() => {
      handleNext();
    }, 25000);
    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
  };

  const handlePrev = () => {
    setQuoteIndex((prev) => (prev - 1 + MOTIVATIONAL_QUOTES.length) % MOTIVATIONAL_QUOTES.length);
  };

  const currentQuote: MotivationalQuote = MOTIVATIONAL_QUOTES[quoteIndex];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'motivation':
        return <Trophy className="w-5 h-5 text-amber-500" id="quote-trophy-icon" />;
      case 'iraqi_phrase':
        return <Sparkles className="w-5 h-5 text-emerald-500" id="quote-sparkles-icon" />;
      case 'study_tip':
      default:
        return <BookOpen className="w-5 h-5 text-blue-500" id="quote-book-icon" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'motivation':
        return 'شعلة نجاح 📈';
      case 'iraqi_phrase':
        return 'من لهجتنا العراقية 🇮🇶';
      case 'study_tip':
      default:
        return 'نصيحة سادسيّة ذكية 💡';
    }
  };

  return (
    <div className="w-full bg-linear-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden border border-slate-700/60" id="quote-banner-container">
      {/* Absolute ambient blobs */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-4">
        {/* Header Greeting */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4" id="quote-banner-header">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-indigo-300 font-mono tracking-wider">لوحة شحن الهمة والسعي</span>
            <h2 className="text-lg md:text-xl font-bold bg-linear-to-r from-teal-300 to-emerald-400 bg-clip-text text-transparent font-sans">
              {greeting}
            </h2>
          </div>
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/10 text-xs text-slate-300">
            {getCategoryIcon(currentQuote.category)}
            <span>{getCategoryLabel(currentQuote.category)}</span>
          </div>
        </div>

        {/* Content Slider with AnimatePresence */}
        <div className="min-h-[96px] flex items-center justify-center py-2" id="quote-slider-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={quoteIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full flex items-start gap-4"
              id="quote-animated-body"
            >
              <Quote className="w-8 h-8 text-indigo-400/30 shrink-0 transform scale-x-[-1]" id="quote-svg-symbol" />
              <div className="flex flex-col gap-1.5">
                <p className="text-base md:text-lg text-slate-100 leading-relaxed font-sans text-right">
                  {currentQuote.text}
                </p>
                {currentQuote.author && (
                  <span className="text-xs text-slate-400 self-end">
                    — {currentQuote.author}
                  </span>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controller Indicators */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-slate-400 text-xs" id="quote-banner-actions">
          <span>{quoteIndex + 1} من {MOTIVATIONAL_QUOTES.length}</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              className="p-1 px-2 hover:bg-white/10 hover:text-white rounded-lg transition"
              title="السابق"
              id="quote-prev-btn"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="flex gap-1" id="quote-dots-indicator">
              {MOTIVATIONAL_QUOTES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuoteIndex(idx)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === quoteIndex ? 'bg-emerald-400 w-3' : 'bg-white/20 hover:bg-white/40'
                  }`}
                  id={`quote-dot-btn-${idx}`}
                />
              ))}
            </div>
            <button
              onClick={handleNext}
              className="p-1 px-2 hover:bg-white/10 hover:text-white rounded-lg transition"
              title="التالي"
              id="quote-next-btn"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
