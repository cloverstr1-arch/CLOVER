import React, { useState } from 'react';
import { SelectedSubject } from '../types';
import { Check, CheckCircle2, Circle, Clock, Edit3, Save, Sparkles, MessageSquare, Star, Trophy, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ALL_SUBJECTS } from '../data/subjects';
import TimerModal from './TimerModal';
import { audio } from './AudioPlayer';

interface SubjectProgressProps {
  subjects: SelectedSubject[];
  onToggleComplete: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onAddMinutesCompleted: (id: string, minutes: number) => void;
}

export default function SubjectProgress({
  subjects,
  onToggleComplete,
  onUpdateNotes,
  onAddMinutesCompleted,
}: SubjectProgressProps) {
  const [activeTimerId, setActiveTimerId] = useState<string | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState('');

  // Find the color and details of the current subject from ALL_SUBJECTS static dataset
  const getSubjectColor = (id: string) => {
    const config = ALL_SUBJECTS.find((s) => s.id === id);
    return config?.color || 'from-indigo-600 to-indigo-700';
  };

  // Human friendly formatting of study duration
  const formatMinutes = (mins: number) => {
    if (mins < 60) return `${mins} دقيقة`;
    const hrs = Math.floor(mins / 60);
    const leftMins = Math.round(mins % 60);
    if (leftMins === 0) {
      return hrs === 1 ? 'ساعة كاملة' : hrs === 2 ? 'ساعتين' : `${hrs} ساعات`;
    }
    return `${hrs} ${hrs === 1 ? 'ساعة' : 'ساعات'} و ${leftMins} د`;
  };

  const handleStartTimer = (id: string) => {
    audio.playClick();
    setActiveTimerId(id);
  };

  const activeSubject = subjects.find((s) => s.id === activeTimerId);

  const handleSaveNotes = (id: string) => {
    audio.playClick();
    onUpdateNotes(id, tempNotes);
    setEditingNotesId(null);
  };

  const startEditingNotes = (id: string, currentNotes: string) => {
    audio.playClick();
    setEditingNotesId(id);
    setTempNotes(currentNotes || '');
  };

  // Calculate overall performance
  const completedCount = subjects.filter((s) => s.completed).length;
  const totalCount = subjects.length;
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Total study focus stats
  const totalAllocatedMinutes = subjects.reduce((acc, curr) => acc + curr.allocatedMinutes, 0);
  const totalCompletedFocusMinutes = subjects.reduce((acc, curr) => acc + (curr.timeSpent || 0), 0);

  return (
    <div className="flex flex-col gap-6" id="subject-progress-container">
      {/* Top Completion Tracker Widget */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden" id="overall-completion-widget">
        <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-right self-start md:self-auto">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 font-sans">
              <Trophy className="w-7 h-7" id="trophy-progress-icon" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-mono">طموح المعدل العالي</span>
              <h3 className="text-lg font-black text-slate-100 font-sans mt-0.5">
                معدل إنجاز خطة اليوم: {percentComplete}%
              </h3>
              <p className="text-xs text-slate-400">
                أنجزت {completedCount} من أصل {totalCount} مواضيع مطلوبة لليوم السادسي
              </p>
            </div>
          </div>

          <div className="w-full md:w-48 flex flex-col gap-1.5 shrink-0" id="progress-bar-stack">
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>{Math.min(totalCompletedFocusMinutes, totalAllocatedMinutes)} د / {totalAllocatedMinutes} د</span>
              <span>مؤشر التركيز 🔥</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/30">
              <motion.div
                className="h-full bg-linear-to-r from-emerald-400 to-teal-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(percentComplete || 5, 100)}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Subjects study blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="subjects-grid">
        {subjects.map((sub, idx) => {
          const isNoteOpen = editingNotesId === sub.id;
          const bgGradient = getSubjectColor(sub.id);

          return (
            <motion.div
              layout
              key={sub.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`relative overflow-hidden rounded-3xl border transition-all ${
                sub.completed
                  ? 'bg-slate-900/40 border-slate-800 line-through text-slate-400'
                  : 'bg-slate-900 border-slate-800 text-white shadow-md hover:border-slate-700'
              }`}
              id={`subject-card-${sub.id}`}
            >
              {/* Highlight bar of subject color schema */}
              <div className={`absolute top-0 right-0 left-0 h-1.5 bg-linear-to-r ${bgGradient}`} />

              <div className="p-5 flex flex-col gap-4">
                {/* Subject Title Row */}
                <div className="flex items-start justify-between gap-2" id={`sub-header-${sub.id}`}>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        audio.playClick();
                        onToggleComplete(sub.id);
                        if (!sub.completed) {
                          audio.playSuccessChime();
                        }
                      }}
                      className="transition transform active:scale-90 shrink-0"
                      title={sub.completed ? 'وضع معلق' : 'تحديد كمنجز'}
                      id={`chk-subject-${sub.id}`}
                    >
                      {sub.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-950/25" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-slate-600 hover:border-indigo-400 flex items-center justify-center text-transparent hover:text-indigo-400/50 transition">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </button>

                    <div className="text-right">
                      <h4 className={`text-base font-extrabold font-sans tracking-tight transition ${
                        sub.completed ? 'text-slate-500 line-through font-normal' : 'text-slate-100'
                      }`}>
                        {sub.name}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>المدة: {formatMinutes(sub.allocatedMinutes)}</span>
                        {sub.timeSpent && sub.timeSpent > 0 ? (
                          <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1 py-0.5 rounded-sm mr-1">
                            ركّزت: {sub.timeSpent} د
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {/* Focus Study Stopwatch Launcher */}
                  {!sub.completed && (
                    <button
                      onClick={() => handleStartTimer(sub.id)}
                      className="p-2.5 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-2xl transition shadow-xs active:scale-95 shrink-0 flex items-center gap-1"
                      title="مؤقت التركيز"
                      id={`timer-launcher-${sub.id}`}
                    >
                      <Clock className="w-4 h-4 animate-pulse" />
                      <span className="text-xs font-semibold">ابدأ</span>
                    </button>
                  )}
                </div>

                {/* Sub-Notes Indicator */}
                <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800/80 text-right text-xs" id={`sub-notes-${sub.id}`}>
                  {isNoteOpen ? (
                    <div className="flex flex-col gap-2">
                      <textarea
                        value={tempNotes}
                        onChange={(e) => setTempNotes(e.target.value)}
                        placeholder="ماذا ستدرس في هذا الجزء؟ (مثال: المسائل الوراثية، قطع الإنكليزي)"
                        className="w-full bg-slate-900 border border-slate-700/60 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-hidden focus:border-indigo-500"
                        rows={2}
                        id={`note-textarea-${sub.id}`}
                      />
                      <button
                        onClick={() => handleSaveNotes(sub.id)}
                        className="self-end px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1.5 transition font-sans hover:shadow-md"
                        id={`note-save-${sub.id}`}
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>حفظ التلخيص</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <p className={`italic truncate ${sub.notes ? 'text-slate-300' : 'text-slate-500'}`}>
                        {sub.notes || 'لا يوجد ملاحظات دراسية مضافة لليوم..'}
                      </p>
                      <button
                        onClick={() => startEditingNotes(sub.id, sub.notes || '')}
                        className="p-1 text-slate-400 hover:text-indigo-400 rounded-md transition shrink-0"
                        title="تعديل الملاحظات"
                        id={`note-edit-${sub.id}`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Floating Focus Timer Overlay Modal */}
      <AnimatePresence>
        {activeTimerId && activeSubject && (
          <TimerModal
            isOpen={true}
            onClose={() => {
              setActiveTimerId(null);
            }}
            subjectName={activeSubject.name}
            allocatedMinutes={activeSubject.allocatedMinutes}
            onAddActiveMinutes={(mins) => {
              onAddMinutesCompleted(activeSubject.id, mins);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
