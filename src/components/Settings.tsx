import React, { useState, useEffect } from 'react';
import { ALL_SUBJECTS, BRANCH_SUBJECTS, BRANCH_NAMES } from '../data/subjects';
import { Branch } from '../types';
import { Sparkles, Compass, Check, Clock, BookOpen, ChevronRight, HelpCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { audio } from './AudioPlayer';

interface SettingsProps {
  initialBranch: Branch;
  initialHours: number;
  initialSelectedSubjectIds: string[];
  onGenerate: (branch: Branch, selectedSubjectIds: string[], availableHours: number) => void;
}

export default function Settings({
  initialBranch,
  initialHours,
  initialSelectedSubjectIds,
  onGenerate,
}: SettingsProps) {
  const [selectedBranch, setSelectedBranch] = useState<Branch>(initialBranch);
  const [selectedHours, setSelectedHours] = useState<number>(initialHours);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedSubjectIds);

  // Sync selected branch default subjects
  const handleBranchChange = (branch: Branch) => {
    audio.playClick();
    setSelectedBranch(branch);
    if (branch in BRANCH_SUBJECTS) {
      setSelectedIds(BRANCH_SUBJECTS[branch]);
    }
  };

  const handleToggleSubject = (id: string) => {
    audio.playClick();
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        // Prevent empty list
        if (prev.length <= 1) return prev;
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleGenerate = () => {
    audio.playSuccessChime();
    onGenerate(selectedBranch, selectedIds, selectedHours);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl text-white text-right" id="setup-settings-card">
      <div className="flex flex-col gap-6" id="settings-contents">
        {/* Step 1 Heading */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-5" id="settings-heading">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 font-sans">توليد الخطة الدراسية التلقائية</h3>
            <p className="text-xs text-slate-400">اختر فرعك الدراسي، المواد، ووقتك المتاح ليوزعها المنظم بذكاء</p>
          </div>
        </div>

        {/* Branch Selector Cards */}
        <div className="flex flex-col gap-2.5" id="branch-section">
          <label className="text-sm font-semibold text-slate-300 font-sans block mb-1">١. اختر الفرع الدراسي للسادس الإعدادي:</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3" id="branch-list-grid">
            {(Object.keys(BRANCH_NAMES) as Branch[]).map((br) => {
              const active = selectedBranch === br;
              return (
                <button
                  key={br}
                  onClick={() => handleBranchChange(br)}
                  className={`p-3.5 rounded-2xl border text-center font-sans font-bold text-sm transition-all transform active:scale-95 ${
                    active
                      ? 'bg-linear-to-b from-indigo-600 to-indigo-700 border-indigo-500 text-white shadow-lg shadow-indigo-600/15'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                  id={`branch-btn-${br}`}
                >
                  {BRANCH_NAMES[br]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Available hours controller */}
        <div className="flex flex-col gap-2.5 bg-slate-950/40 p-4 rounded-2xl border border-slate-850" id="hours-section">
          <div className="flex items-center justify-between" id="hours-header">
            <span className="text-xl font-black text-indigo-400 font-mono tracking-tight" id="hours-preview-text">
              {selectedHours} {selectedHours === 1 ? 'ساعة واحدة' : selectedHours === 2 ? 'ساعتين' : `${selectedHours} ساعات`}
            </span>
            <label className="text-sm font-semibold text-slate-300 font-sans">
              ٢. كم عدد الساعات المتفرغة للدراسة اليوم؟
            </label>
          </div>
          
          <input
            type="range"
            min="1"
            max="16"
            step="0.5"
            value={selectedHours}
            onChange={(e) => {
              audio.playClick();
              setSelectedHours(parseFloat(e.target.value));
            }}
            className="w-full accent-indigo-500 bg-slate-800 h-2 rounded-lg appearance-none cursor-pointer"
            id="hours-slider-input"
          />

          <div className="flex justify-between text-[11px] text-slate-500 font-mono" id="hours-marks">
            <span>١٦ ساعة 🧠</span>
            <span>١٢ ساعة</span>
            <span>٨ ساعات</span>
            <span>٤ ساعات</span>
            <span>ساعة واحدة ☕</span>
          </div>
        </div>

        {/* Choose specific subjects */}
        <div className="flex flex-col gap-2.5" id="subjects-selector-section">
          <label className="text-sm font-semibold text-slate-300 font-sans block">٣. حدد المواد التي تريد دراستها بالخطة اليوم:</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 px-1" id="subject-setup-checkboxes">
            {ALL_SUBJECTS.map((sub) => {
              const checked = selectedIds.includes(sub.id);
              return (
                <button
                  key={sub.id}
                  onClick={() => handleToggleSubject(sub.id)}
                  className={`p-3 rounded-xl border text-right font-sans text-xs font-semibold flex items-center justify-between gap-2 transition transform active:scale-95 ${
                    checked
                      ? 'bg-slate-800 border-indigo-500/40 text-slate-100'
                      : 'bg-slate-950/20 border-slate-900 text-slate-500 hover:text-slate-400'
                  }`}
                  id={`subject-toggle-${sub.id}`}
                >
                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center border transition ${
                      checked
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'border-slate-700 text-transparent'
                    }`}
                    id={`checkbox-box-${sub.id}`}
                  >
                    <Check className="w-3 h-3" />
                  </div>
                  <span>{sub.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Info panel explaining intelligent algorithm */}
        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs text-slate-400 flex items-start gap-3 leading-relaxed" id="algo-info-panel">
          <AlertCircle className="w-4.5 h-4.5 text-indigo-400 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1">
            <h4 className="font-bold text-slate-300 font-sans">كيف يحسب المنظم وقت الحصص تلقائياً؟</h4>
            <p>
              يستخدم المنظم الذكي خوارزمية السادسي الموزونة. تُقسّم الساعات تلقائياً حسب حجم المادة في المنهج الوزاري. على سبيل المثال، تحصل المواد العلمية كالرياضيات والفيزياء والكيمياء على نصيب أكبر بنسبة 40% مقارنة بالمواد الأقصر كالإسلامية والاقتصاد. يتم تقريب النتائج لضمان كفاءة وقت الدراسة والراحة.
            </p>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          className="w-full mt-2 py-4 bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-base font-extrabold rounded-2xl font-sans transition-all transform shadow-lg shadow-emerald-950/20 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          id="btn-generate-plans"
        >
          <Sparkles className="w-5 h-5 fill-slate-950" />
          <span>توليد جدول اليوم الدراسي المقترح 🚀</span>
        </button>
      </div>
    </div>
  );
}
