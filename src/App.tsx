import React, { useState, useEffect } from 'react';
import { Branch, DailySchedule, DayStreak, SelectedSubject } from './types';
import { ALL_SUBJECTS, BRANCH_SUBJECTS, BRANCH_NAMES } from './data/subjects';
import Settings from './components/Settings';
import SubjectProgress from './components/SubjectProgress';
import StreakCalendar from './components/StreakCalendar';
import QuoteBanner from './components/QuoteBanner';
import { audio } from './components/AudioPlayer';
import { 
  BookOpen, Sparkles, Clock, Flame, Trophy, Calendar, 
  RotateCcw, CheckCircle2, ListTodo, Award, Share2, Heart, RefreshCw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentBranch, setCurrentBranch] = useState<Branch>('scientific_biology');
  const [currentHours, setCurrentHours] = useState<number>(5);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>(BRANCH_SUBJECTS.scientific_biology);
  const [dailySchedule, setDailySchedule] = useState<DailySchedule | null>(null);
  const [streakState, setStreakState] = useState<DayStreak>({
    history: {},
    currentStreak: 0,
    longestStreak: 0,
  });

  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
  };

  // 1. Initial State Loading from LocalStorage
  useEffect(() => {
    try {
      const storedSchedule = localStorage.getItem('munazim_sadees_schedule_v2');
      const storedStreak = localStorage.getItem('munazim_sadees_streak_v2');
      const storedBranch = localStorage.getItem('munazim_sadees_branch');
      const storedHours = localStorage.getItem('munazim_sadees_hours');
      const storedIds = localStorage.getItem('munazim_sadees_subject_ids');

      if (storedSchedule) {
        const parsed = JSON.parse(storedSchedule) as DailySchedule;
        // Only load if it matches today's date, otherwise keep config or reset for a fresh brand-new day!
        if (parsed.date === getTodayDateString()) {
          setDailySchedule(parsed);
        } else {
          // It's a new day! Keep the configuration but let them click generate
          localStorage.removeItem('munazim_sadees_schedule_v2');
        }
      }

      if (storedStreak) {
        setStreakState(JSON.parse(storedStreak));
      }

      if (storedBranch) setCurrentBranch(storedBranch as Branch);
      if (storedHours) setCurrentHours(parseFloat(storedHours));
      if (storedIds) setSelectedSubjectIds(JSON.parse(storedIds));
    } catch (e) {
      console.warn("Could not load from localStorage", e);
    }
  }, []);

  // 2. Generate daily automated schedule
  const handleGenerateSchedule = (branch: Branch, subjectIds: string[], hours: number) => {
    setCurrentBranch(branch);
    setSelectedSubjectIds(subjectIds);
    setCurrentHours(hours);

    // Save configurations
    localStorage.setItem('munazim_sadees_branch', branch);
    localStorage.setItem('munazim_sadees_hours', hours.toString());
    localStorage.setItem('munazim_sadees_subject_ids', JSON.stringify(subjectIds));

    // Calculate distributed minutes based on weighting formula
    const totalMinutes = hours * 60;
    const selectedConfigs = ALL_SUBJECTS.filter((s) => subjectIds.includes(s.id));
    const totalWeight = selectedConfigs.reduce((acc, curr) => acc + curr.weight, 0);

    if (totalWeight === 0) return;

    let distributed: SelectedSubject[] = selectedConfigs.map((config) => {
      const proportion = config.weight / totalWeight;
      let allocated = proportion * totalMinutes;

      // Round to closest 5 minutes
      allocated = Math.round(allocated / 5) * 5;
      if (allocated < 15) allocated = 15; // Minimum session block is 15 minutes!

      return {
        id: config.id,
        name: config.name,
        allocatedMinutes: allocated,
        completed: false,
        notes: '',
        timeSpent: 0,
      };
    });

    // Solve drifting difference by adjusting the largest / first subject allocation
    const sumResult = distributed.reduce((acc, s) => acc + s.allocatedMinutes, 0);
    const diff = totalMinutes - sumResult;

    if (diff !== 0 && distributed.length > 0) {
      distributed[0].allocatedMinutes = Math.max(15, distributed[0].allocatedMinutes + diff);
    }

    const newSchedule: DailySchedule = {
      date: getTodayDateString(),
      availableHours: hours,
      subjects: distributed,
    };

    setDailySchedule(newSchedule);
    localStorage.setItem('munazim_sadees_schedule_v2', JSON.stringify(newSchedule));
  };

  // 3. Subject Complete and state handling
  const handleToggleComplete = (id: string) => {
    if (!dailySchedule) return;

    const updatedSubjects = dailySchedule.subjects.map((sub) => {
      if (sub.id === id) {
        return { ...sub, completed: !sub.completed };
      }
      return sub;
    });

    const isAllFinished = updatedSubjects.every((s) => s.completed);
    const todayStr = getTodayDateString();

    const updatedSchedule: DailySchedule = {
      ...dailySchedule,
      subjects: updatedSubjects,
      completedAt: isAllFinished ? new Date().toISOString() : undefined,
    };

    setDailySchedule(updatedSchedule);
    localStorage.setItem('munazim_sadees_schedule_v2', JSON.stringify(updatedSchedule));

    // Handle Streak Updates
    let updatedHistory = { ...streakState.history };
    if (isAllFinished) {
      updatedHistory[todayStr] = true;
      setCelebrationOpen(true);
      audio.playSuccessChime();
    } else {
      delete updatedHistory[todayStr];
    }

    // Re-verify streak chains
    const streakResult = recalculateStreaks(updatedHistory);
    const nextStreakState: DayStreak = {
      history: updatedHistory,
      currentStreak: streakResult.currentStreak,
      longestStreak: streakResult.longestStreak,
      lastCompletedDate: isAllFinished ? todayStr : streakState.lastCompletedDate,
    };

    setStreakState(nextStreakState);
    localStorage.setItem('munazim_sadees_streak_v2', JSON.stringify(nextStreakState));
  };

  // 4. Update individual subject notes
  const handleUpdateNotes = (id: string, notes: string) => {
    if (!dailySchedule) return;

    const updatedSubjects = dailySchedule.subjects.map((sub) => {
      if (sub.id === id) {
        return { ...sub, notes };
      }
      return sub;
    });

    const updatedSchedule = { ...dailySchedule, subjects: updatedSubjects };
    setDailySchedule(updatedSchedule);
    localStorage.setItem('munazim_sadees_schedule_v2', JSON.stringify(updatedSchedule));
  };

  // 5. Add focused minutes completed via the Study Timer stopwatch
  const handleAddMinutesCompleted = (id: string, minutes: number) => {
    if (!dailySchedule) return;

    const updatedSubjects = dailySchedule.subjects.map((sub) => {
      if (sub.id === id) {
        const currentSpent = sub.timeSpent || 0;
        const targetPercent = Math.min(minutes, sub.allocatedMinutes);
        return { 
          ...sub, 
          timeSpent: currentSpent + minutes,
          // If they did at least 80% of recommended time, auto-tick completed as well!
          completed: (currentSpent + minutes) >= sub.allocatedMinutes * 0.8 ? true : sub.completed,
        };
      }
      return sub;
    });

    // Check if everything is marked as complete
    const isAllFinished = updatedSubjects.every((s) => s.completed);
    const todayStr = getTodayDateString();

    const updatedSchedule: DailySchedule = {
      ...dailySchedule,
      subjects: updatedSubjects,
      completedAt: isAllFinished ? new Date().toISOString() : undefined,
    };

    setDailySchedule(updatedSchedule);
    localStorage.setItem('munazim_sadees_schedule_v2', JSON.stringify(updatedSchedule));

    // Handle Streak Updates
    let updatedHistory = { ...streakState.history };
    if (isAllFinished) {
      updatedHistory[todayStr] = true;
      setCelebrationOpen(true);
      audio.playSuccessChime();
    }

    const streakResult = recalculateStreaks(updatedHistory);
    const nextStreakState: DayStreak = {
      history: updatedHistory,
      currentStreak: streakResult.currentStreak,
      longestStreak: streakResult.longestStreak,
      lastCompletedDate: isAllFinished ? todayStr : streakState.lastCompletedDate,
    };

    setStreakState(nextStreakState);
    localStorage.setItem('munazim_sadees_streak_v2', JSON.stringify(nextStreakState));
  };

  // 6. Recalculate streak values from date keys history map
  const recalculateStreaks = (history: { [key: string]: boolean }) => {
    const dates = Object.keys(history).filter((d) => history[d]).sort();
    if (dates.length === 0) return { currentStreak: 0, longestStreak: 0 };

    let currentStreak = 0;
    const todayStr = getTodayDateString();
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Calc active consecutive stream ending today or yesterday
    if (history[todayStr]) {
      currentStreak = 1;
      let checkDate = yesterday;
      while (true) {
        const checkStr = checkDate.toISOString().split('T')[0];
        if (history[checkStr]) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    } else if (history[yesterdayStr]) {
      currentStreak = 1;
      let checkDate = new Date(yesterday);
      checkDate.setDate(checkDate.getDate() - 1);
      while (true) {
        const checkStr = checkDate.toISOString().split('T')[0];
        if (history[checkStr]) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calc absolute longest consecutive sequence
    let maxStreak = 0;
    let tempStreak = 0;
    let expectedDate: string | null = null;

    dates.forEach((dStr) => {
      if (expectedDate === null) {
        tempStreak = 1;
      } else {
        const d = new Date(dStr);
        const exp = new Date(expectedDate);
        // Compare values
        if (dStr === expectedDate) {
          tempStreak++;
        } else {
          maxStreak = Math.max(maxStreak, tempStreak);
          tempStreak = 1;
        }
      }
      // Set expected date as consecutive tomorrow
      const nextD = new Date(dStr);
      nextD.setDate(nextD.getDate() + 1);
      expectedDate = nextD.toISOString().split('T')[0];
    });

    maxStreak = Math.max(maxStreak, tempStreak, currentStreak);

    return { currentStreak, longestStreak: maxStreak };
  };

  // 7. Reset schedule to re-input parameters
  const handleResetSchedule = () => {
    audio.playClick();
    if (window.confirm('هل أنت متأكد من رغبتك في إعادة تنظيم اليوم؟ سيفقد المنظم تقدم حصص دراسة اليوم الحالي.')) {
      setDailySchedule(null);
      localStorage.removeItem('munazim_sadees_schedule_v2');
    }
  };

  // 8. Copy shareable Iraqi statistics text
  const handleCopyShare = () => {
    audio.playClick();
    if (!dailySchedule) return;

    const totalMinutes = dailySchedule.subjects.reduce((sc, sub) => sc + sub.allocatedMinutes, 0);
    const completedMins = dailySchedule.subjects.reduce((sc, sub) => sc + (sub.timeSpent || 0), 0);
    const subjectsDone = dailySchedule.subjects.filter((s) => s.completed).length;

    const shareText = `📚 منظم السادس - جدول اليوم الذكي 🚀

أنا أنجزت اليوم دراسة في الصف السادس الإعدادي:
🔥 الساعات المقترحة للدراسة اليوم: ${dailySchedule.availableHours} ساعة
🧬 نسبة إكمال المنهج اليومي: ${Math.round((subjectsDone / dailySchedule.subjects.length) * 100)}% (${subjectsDone}/${dailySchedule.subjects.length} من المواد)
⏱️ إجمالي دقائق التركيز المسجلة: ${completedMins} دقيقة من أصل ${totalMinutes} دقيقة!
🔥 سلسلة الالتزام الحالية: ${streakState.currentStreak} أيام على التوالي!

قم بتوليد وجدولة أوقاتك للامتحانات مجاناً عبر منظم السادس الذكي. سادس فلوة وتعدي! 💪`;

    navigator.clipboard.writeText(shareText);
    setCopyStatus('تم نسخ البشارة بنجاح! انسخها بكروب التليكرام لزملائك 🚀');
    setTimeout(() => setCopyStatus(null), 5000);
  };

  // Pre-calculate stats
  const totalCount = dailySchedule?.subjects.length || 0;
  const completedCount = dailySchedule?.subjects.filter((s) => s.completed).length || 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Localized date header
  const getIraqiFormattedDate = () => {
    return new Date().toLocaleDateString('ar-IQ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500/30 select-none pb-12" id="app-root">
      {/* Decorative top grid */}
      <div className="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(to_bottom,rgba(99,102,241,0.05),transparent)] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-5xl mx-auto px-4 md:px-6 pt-6 flex flex-col gap-6" id="app-main-layout">
        
        {/* Main top header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/40 p-4 md:p-6 rounded-3xl border border-slate-900/60" id="main-app-header">
          <div className="flex items-center gap-3.5 text-right" id="app-branding">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-mono border border-indigo-400/20 px-2 py-0.5 rounded-full font-bold">
                  سادس إعدادي لعام ٢٠٢٦
                </span>
                <span className="text-rose-400 text-[10px] bg-rose-500/10 px-2 py-0.5 rounded-full font-bold border border-rose-400/10">
                  وزاري 👑
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-100 tracking-tight font-sans mt-0.5">
                مُنظِّم السَّادس <span className="text-indigo-400">الذكي</span>
              </h1>
            </div>
          </div>

          <div className="text-center md:text-left text-xs text-slate-400 font-mono border-t md:border-t-0 border-slate-800/60 pt-3 md:pt-0 w-full md:w-auto" id="date-display-bar">
            <span className="bg-slate-950/40 px-3.5 py-1.5 rounded-xl border border-slate-800 font-bold block md:inline-block">
               Iraqi Standard Time: {getIraqiFormattedDate()} 🗓️
            </span>
          </div>
        </header>

        {/* Motivational Quotes Banner Slider */}
        <QuoteBanner />

        {/* Dynamic Inner Layout Frame */}
        <div id="dynamic-content-frame">
          <AnimatePresence mode="wait">
            {!dailySchedule ? (
              <motion.div
                key="setup-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                id="setup-view"
              >
                <Settings
                  initialBranch={currentBranch}
                  initialHours={currentHours}
                  initialSelectedSubjectIds={selectedSubjectIds}
                  onGenerate={handleGenerateSchedule}
                />
              </motion.div>
            ) : (
              <motion.div
                key="dashboard-view"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-6"
                id="dashboard-view"
              >
                {/* Active Dashboard Sticky Utilities */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-3xl" id="dashboard-actions-navbar">
                  
                  {/* Share accomplishments block */}
                  <div className="flex items-center gap-2 w-full md:w-auto justify-end md:justify-start" id="dashboard-subject-brand">
                    <span className="text-xs bg-slate-950/60 text-slate-300 px-3 py-1.5 rounded-xl border border-slate-800 font-sans">
                      الفرع الحالي: <span className="font-bold text-white">{BRANCH_NAMES[currentBranch]}</span>
                    </span>
                    <span className="text-xs bg-slate-950/60 text-indigo-300 px-3 py-1.5 rounded-xl border border-slate-800 font-sans">
                      أهداف اليوم: <span className="font-bold text-white">{dailySchedule.subjects.length} مواضيع</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto justify-start md:justify-end" id="dashboard-action-buttons">
                    {/* Reset table */}
                    <button
                      onClick={handleResetSchedule}
                      className="px-4 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold hover:border-slate-700/60 transition border border-slate-900 flex items-center gap-1.5 cursor-pointer"
                      title="إعادة ضبط الجدول لتغيير الأوقات"
                      id="reset-schedule-top-btn"
                    >
                      <RotateCcw className="w-4 h-4 text-rose-400" />
                      <span>توليد جدول جديد</span>
                    </button>

                    {/* Copy state statistics button */}
                    <button
                      onClick={handleCopyShare}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                      id="share-accomplishments-btn"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>انشر المعدل وبشر زملائك 📢</span>
                    </button>
                  </div>
                </div>

                {/* Toast Notification for copying status */}
                {copyStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs text-center rounded-xl font-medium shadow-md font-sans"
                    id="share-status-toast"
                  >
                    {copyStatus}
                  </motion.div>
                )}

                {/* Dashboard grid core layouts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-grid-core">
                  {/* Left stats and streak segment */}
                  <div className="lg:col-span-1 flex flex-col gap-6" id="dashboard-sidebar">
                    <StreakCalendar streak={streakState} />

                    {/* Fun statistics widget card */}
                    <div className="bg-slate-900/65 border border-slate-800 p-5 rounded-3xl text-right flex flex-col gap-4 text-white" id="fun-stats-widget">
                      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                        <Award className="w-5 h-5 text-amber-400" />
                        <h4 className="text-sm font-extrabold font-sans">تحليل الكفاءة السادسيّة 📈</h4>
                      </div>

                      <div className="grid grid-cols-2 gap-3" id="stats-numbers-subgrid">
                        <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-850">
                          <span className="block text-gray-400 text-[10px] font-sans">إجمالي ساعات السعي</span>
                          <span className="text-xl font-black text-slate-100 font-mono mt-0.5 block">
                            {dailySchedule.availableHours} س
                          </span>
                        </div>
                        <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-850">
                          <span className="block text-gray-400 text-[10px] font-sans">إكمال جدول اليوم</span>
                          <span className="text-xl font-black text-slate-100 font-mono mt-0.5 block">
                            {progressPercent}%
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed font-sans">
                        مرحى! دراستك بانتظام وبساعات ثابتة يومياً هي العامل الرئيسي للقبول في كليات الطب والهندسة والعلوم بالعراق! التزم بقاعدة تصفير المواد يومياً لتكون من أوائل المحافظة. 🏆
                      </p>
                    </div>
                  </div>

                  {/* Complete Subject Checklist Grid Column */}
                  <div className="lg:col-span-2" id="dashboard-core-subjects">
                    <div className="flex items-center justify-between mb-3 text-right" id="checklist-intro-bar">
                      <h3 className="text-base font-bold text-slate-200 font-sans flex items-center gap-2">
                        <ListTodo className="w-4.5 h-4.5 text-indigo-400" />
                        <span>منهجك وجدولك المطلوب لليوم:</span>
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">
                        حدد المواضيع التي تكملها لرفع رصيدك
                      </span>
                    </div>

                    <SubjectProgress
                      subjects={dailySchedule.subjects}
                      onToggleComplete={handleToggleComplete}
                      onUpdateNotes={handleUpdateNotes}
                      onAddMinutesCompleted={handleAddMinutesCompleted}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Celebration Overlay Modal */}
        <AnimatePresence>
          {celebrationOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm" id="celebration-overlay">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-md bg-slate-900 border-2 border-emerald-500/30 rounded-3xl p-6 shadow-2xl relative text-white text-center flex flex-col items-center gap-4"
                id="celebration-modal"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                  <Flame className="w-9 h-9 fill-current animate-bounce" />
                </div>

                <div className="flex flex-col gap-1.5" id="celebration-titles">
                  <span className="text-xs font-mono font-bold text-amber-500 uppercase tracking-widest">إنجاز حديدي بطل! 🔥</span>
                  <h3 className="text-xl font-black text-slate-100 font-sans">
                    لقد صفّرت جدول السادس بالكامل اليوم! 🎉
                  </h3>
                  <p className="text-sm text-slate-400 px-2 leading-relaxed">
                    ما شاء الله عليك! قليل الي يملكون همّتك والتزامك هسة. لقد عزّزت من فرصة دخولك الكلية والمعهد الذي تحلم به اليوم بخطوة جبارة!
                  </p>
                </div>

                {/* Current accumulated stats */}
                <div className="w-full bg-slate-950/50 border border-slate-800 p-4 rounded-2xl flex items-center justify-around font-mono" id="celebration-stat-row">
                  <div>
                    <span className="block text-[10px] text-slate-500">سلسلة اليوم 🔥</span>
                    <span className="text-lg font-black text-rose-400">{streakState.currentStreak} أيام متواصلة</span>
                  </div>
                  <div className="w-[1px] h-8 bg-slate-800" />
                  <div>
                    <span className="block text-[10px] text-slate-500">تم تصفير 📚</span>
                    <span className="text-lg font-black text-emerald-400">{completedCount}/{totalCount} مادة</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full" id="celebration-modal-actions">
                  <button
                    onClick={() => {
                      audio.playClick();
                      setCelebrationOpen(false);
                    }}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    id="celebration-close-action"
                  >
                    أكمل سعيي ✏️
                  </button>
                  <button
                    onClick={() => {
                      setCelebrationOpen(false);
                      handleCopyShare();
                    }}
                    className="flex-1 py-3 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black rounded-xl transition shadow-lg shadow-emerald-950/20 cursor-pointer"
                    id="celebration-share-action"
                  >
                    انشر بكروب التليكرام 📱
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Footer info brand */}
        <footer className="mt-12 text-center text-slate-600 text-xs font-sans flex flex-col items-center gap-1.5 border-t border-slate-900 pt-6" id="app-footer-brand">
          <p className="flex items-center gap-1.5">
            صُمِّم بحب لدعم الطلاب العراقيين في مرحلة السادس الإعدادي <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600 animate-pulse" />
          </p>
          <p className="text-[10px] font-mono text-slate-700">
            منظم السادس الذكي © ٢٠٢٦ - منظم وجدول دراسي تفاعلي
          </p>
        </footer>
      </div>
    </div>
  );
}
