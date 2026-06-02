import React from 'react';
import { DayStreak } from '../types';
import { Flame, Star, Trophy, Calendar, Sparkles, Heart } from 'lucide-react';
import { motion } from 'motion/react';

interface StreakCalendarProps {
  streak: DayStreak;
}

export default function StreakCalendar({ streak }: StreakCalendarProps) {
  const current = streak?.currentStreak || 0;
  const longest = streak?.longestStreak || 0;

  // Let's generate a list of the last 7 calendar days to show beautiful checkmarks or fire icons
  const generateLastWeek = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const isStr = d.toISOString().split('T')[0];
      const match = !!streak?.history?.[isStr];
      const name = d.toLocaleDateString('ar-IQ', { weekday: 'short' });
      days.push({
        dateStr: isStr,
        dayName: name,
        label: d.getDate(),
        isCompleted: match,
        isToday: i === 0,
      });
    }
    return days;
  };

  const weekDays = generateLastWeek();

  // Custom encouraging message based on streak count
  const getStreakMessage = (count: number) => {
    if (count === 0) return 'ابدأ اليوم خطوة السعي وباشر بملئ جدولك! 🚀';
    if (count === 1) return 'بداية نارية بطل! استمر غداً لتقوية عزيمتك 🔥';
    if (count < 3) return 'رائع جداً! صرت ملتزم ليومين متتاليين، المعدل بانتظارك 😉';
    if (count < 5) return 'يا بطل! التزامك حديدي وخطواتك نحو حلمك ثابتة هسة 🌟';
    return 'ما شاء الله! همّة لا تُقهر وعزيمة حديدية تليق بطلاب المائة! 👑';
  };

  return (
    <div className="bg-slate-900/65 border border-slate-800 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden" id="streak-panel-card">
      <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col gap-5 relative z-10" id="streak-content-holder">
        {/* Streak Stats Header */}
        <div className="flex items-center justify-between text-right" id="streak-header-info">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-slate-300">
              <Flame className="w-5 h-5 text-rose-500 fill-rose-500 animate-pulse" id="streak-flame-icon" />
              <span className="text-sm font-bold text-slate-200">عزيمة الدراسة المتواصلة</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {getStreakMessage(current)}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/60 p-2.5 rounded-2xl border border-slate-850" id="streak-count-bubbles">
            <div className="text-center px-2">
              <span className="block text-xl font-black text-rose-400 font-mono" id="current-streak-val">
                {current}
              </span>
              <span className="text-[10px] text-slate-400">سلسلة اليوم</span>
            </div>
            <div className="w-[1px] h-8 bg-slate-800" />
            <div className="text-center px-2">
              <span className="block text-xl font-black text-amber-400 font-mono" id="longest-streak-val">
                {longest}
              </span>
              <span className="text-[10px] text-slate-400">الأعلى🔥</span>
            </div>
          </div>
        </div>

        {/* 7 Days Grid */}
        <div className="grid grid-cols-7 gap-2.5 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/60" id="streak-seven-days">
          {weekDays.map((wd, idx) => (
            <div
              key={idx}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition ${
                wd.isToday
                  ? 'bg-indigo-950/80 border-indigo-500/50 shadow-indigo-500/10 shadow-sm'
                  : 'border-transparent'
              }`}
              id={`streak-day-cell-${idx}`}
            >
              <span className="text-[10px] text-slate-400 mb-1 font-sans">{wd.dayName}</span>
              
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-mono font-bold text-sm transition ${
                  wd.isCompleted
                    ? 'bg-linear-to-br from-rose-500 to-amber-500 text-white shadow-md shadow-rose-500/20'
                    : wd.isToday
                    ? 'bg-slate-800 text-indigo-300 border border-indigo-400/30'
                    : 'bg-slate-800/40 text-slate-500'
                }`}
                id={`streak-day-circle-${idx}`}
              >
                {wd.isCompleted ? (
                  <Flame className="w-5 h-5 fill-current text-white" />
                ) : (
                  <span>{wd.label}</span>
                )}
              </div>

              {wd.isToday && (
                <span className="text-[9px] text-indigo-300 font-bold mt-1.5 bg-indigo-500/25 px-1.5 py-0.5 rounded-md font-sans">
                  اليوم
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Supporting Wisdom Footer */}
        <div className="flex items-center gap-2 bg-slate-950/60 p-3 rounded-2xl text-xs text-slate-300 border border-slate-800/50" id="streak-tips-card">
          <Trophy className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="leading-relaxed">
            التزامك لمدة <span className="font-bold text-white">٧ أيام متتالية</span> يكافئك بزيادة تلقائية في نقاط التركيز، ويسهل عليك استرجاع المادة بالوزاري أسرع بمرتين!
          </p>
        </div>
      </div>
    </div>
  );
}
