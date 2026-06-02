import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X, Bell, Moon, Sun, CheckCircle, Volume2, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { audio } from './AudioPlayer';

interface TimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectName: string;
  allocatedMinutes: number;
  onAddActiveMinutes: (mins: number) => void;
}

export default function TimerModal({
  isOpen,
  onClose,
  subjectName,
  allocatedMinutes,
  onAddActiveMinutes,
}: TimerModalProps) {
  // Configurable study session length
  const [sessionLength, setSessionLength] = useState(25); // default 25 mins Pomodoro
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioIntervalRef = useRef<number | null>(null);

  // Total seconds of the current block
  const totalSeconds = sessionLength * 60;

  // Sync timer length with preset changes
  useEffect(() => {
    resetTimer(sessionLength);
  }, [sessionLength]);

  // Sync if allocatedMinutes is loaded first
  useEffect(() => {
    if (allocatedMinutes > 0) {
      const defaultLen = Math.min(Math.max(allocatedMinutes, 10), 90);
      setSessionLength(defaultLen);
      setSecondsLeft(defaultLen * 60);
    }
  }, [allocatedMinutes]);

  // Timer tick effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleSessionEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isBreak]);

  const handleSessionEnd = () => {
    setIsRunning(false);
    audio.playSuccessChime();

    if (!isBreak) {
      // Completed study block
      onAddActiveMinutes(sessionLength);
      setCompletedSessions((prev) => prev + 1);
      // Switch to break state
      setIsBreak(true);
      const breakLen = sessionLength >= 50 ? 10 : 5;
      setSessionLength(breakLen);
      setSecondsLeft(breakLen * 60);
    } else {
      // Finished break
      setIsBreak(false);
      const studyLen = Math.min(Math.max(allocatedMinutes, 10), 90) || 25;
      setSessionLength(studyLen);
      setSecondsLeft(studyLen * 60);
    }
  };

  const toggleStart = () => {
    audio.playClick();
    setIsRunning(!isRunning);
  };

  const resetTimer = (newLength: number = sessionLength) => {
    audio.playClick();
    setIsRunning(false);
    setSecondsLeft(newLength * 60);
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Circular progress math
  const progressPercent = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0;
  const strokeDashoffset = 2 * Math.PI * 90 * (progressPercent / 100);

  // Close modal with sound click
  const handleClose = () => {
    audio.playClick();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md" id="timer-modal-overlay">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative text-white flex flex-col items-center"
        id="timer-modal-card"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute left-6 top-6 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition"
          title="إغلاق الداش"
          id="timer-close-btn"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="text-center mt-2 mb-4 w-full flex flex-col items-center gap-1.5" id="timer-header">
          <span className="text-xs font-mono tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-400/20">
            {isBreak ? '☕ استراحة المحارب' : '📚 جلسة التركيز العميق'}
          </span>
          <h3 className="text-xl font-extrabold text-slate-100 mt-1 font-sans">
            منظم الدراسة: {subjectName}
          </h3>
          <p className="text-xs text-slate-400">
            {isBreak
              ? 'خذ نفساً عميقاً، استرح وجدد نشاطك لإكمال هدف اليوم'
              : `الهدف الموصى به: ${allocatedMinutes} دقيقة مخصصة`}
          </p>
        </div>

        {/* Circular SVG Timer */}
        <div className="relative my-6 flex items-center justify-center w-60 h-60" id="circular-timer-container">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="120"
              cy="120"
              r="90"
              stroke="#1e293b"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Active Indicator progress */}
            <motion.circle
              cx="120"
              cy="120"
              r="90"
              stroke={isBreak ? '#10b981' : '#f43f5e'}
              strokeWidth="9"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 90}
              animate={{ strokeDashoffset }}
              transition={{ ease: 'linear', duration: 0.2 }}
              strokeLinecap="round"
            />
          </svg>

          {/* Time digits */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1" id="time-digits-inner">
            <span className="text-4xl font-black font-mono tracking-tighter text-slate-50">
              {formatTime(secondsLeft)}
            </span>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
              <Timer className="w-3.5 h-3.5 text-indigo-400" />
              <span>جلسة #{completedSessions + 1}</span>
            </div>
          </div>
        </div>

        {/* Presets Button Bar */}
        <div className="flex items-center justify-center gap-2 mb-6 bg-slate-950/60 p-1.5 rounded-full border border-slate-800/80" id="timer-presets-row">
          <button
            onClick={() => {
              setIsBreak(false);
              setSessionLength(15);
            }}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
              sessionLength === 15 && !isBreak
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            id="preset-15m"
          >
            ١٥ د
          </button>
          <button
            onClick={() => {
              setIsBreak(false);
              setSessionLength(25);
            }}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
              sessionLength === 25 && !isBreak
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            id="preset-25m"
          >
            ٢٥ د (بومودورو)
          </button>
          <button
            onClick={() => {
              setIsBreak(false);
              setSessionLength(50);
            }}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
              sessionLength === 50 && !isBreak
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
            id="preset-50m"
          >
            ٥٠ د
          </button>
          <button
            onClick={() => {
              setIsBreak(true);
              setSessionLength(5);
            }}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
              sessionLength === 5 && isBreak
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
            id="preset-break-5"
          >
            راحة ☕
          </button>
        </div>

        {/* Controls Action Panel */}
        <div className="flex items-center gap-4 w-full justify-center border-t border-slate-800 pt-5 mt-1" id="timer-control-buttons">
          <button
            onClick={() => resetTimer(sessionLength)}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl transition shadow-inner active:scale-95"
            title="إعادة تعيين المؤقت"
            id="timer-reset-action"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleStart}
            className={`px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 transition shadow-lg active:scale-95 ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/10'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25'
            }`}
            id="timer-play-pause-action"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>إيقاف مؤقت</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>ابدأ جلسة التركيز</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              audio.playClick();
              // Manually credit study session directly
              const creditAmount = Math.round(sessionLength * 0.5); // Add partial if they click done earlier!
              onAddActiveMinutes(sessionLength);
              setCompletedSessions((prev) => prev + 1);
              resetTimer(sessionLength);
            }}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 rounded-2xl transition hover:border-emerald-500/20 active:scale-95 border border-transparent"
            title="أنجزت الجلسة الآن"
            id="timer-instant-credit"
          >
            <CheckCircle className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
