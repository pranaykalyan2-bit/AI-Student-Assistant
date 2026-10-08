import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generateStudyPlan } from '../api/studyPlanApi';
import type { StudyPlan } from '../types';

const PREP_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export default function StudyPlanGenerator() {
  const [subject, setSubject] = useState('');
  const [examDate, setExamDate] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState('2');
  const [prepLevel, setPrepLevel] = useState('Intermediate');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  // Validation
  const errors: Record<string, string> = {};
  if (!subject.trim()) errors.subject = 'Subject is required';
  if (!examDate) errors.examDate = 'Exam date is required';
  const hours = Number(hoursPerDay);
  if (!hoursPerDay || isNaN(hours) || hours < 1 || hours > 12)
    errors.hoursPerDay = 'Enter a number between 1 and 12';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (Object.keys(errors).length > 0) return;
    setLoading(true);
    setError('');
    setPlan(null);
    setSaved(false);
    try {
      const result = await generateStudyPlan({ subject, examDate, hoursPerDay: hours, prepLevel });
      setPlan(result);
      setSaved(true); // backend auto-saves on generate
    } catch {
      setError('Failed to generate study plan. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Study Plan Generator</h1>
        <p className="text-sm text-slate-500 mt-0.5">Generate a personalised week-by-week study plan</p>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Calculus, Organic Chemistry"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Exam Date */}
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Exam Date</label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.examDate && <p className="text-xs text-red-500 mt-1">{errors.examDate}</p>}
            </div>

            {/* Hours/day */}
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Hours per Day</label>
              <input
                type="number"
                min={1}
                max={12}
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.hoursPerDay && <p className="text-xs text-red-500 mt-1">{errors.hoursPerDay}</p>}
            </div>

            {/* Prep level */}
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Preparation Level</label>
              <select
                value={prepLevel}
                onChange={(e) => setPrepLevel(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {PREP_LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading || Object.keys(errors).length > 0}
            className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            {loading ? 'Generating…' : 'Generate Study Plan'}
          </button>
        </form>
      </div>

      {/* Result */}
      {plan && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">
              Study Plan — {plan.subject}
            </h2>
            {saved && (
              <span className="text-xs font-medium px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full">
                ✓ Saved
              </span>
            )}
          </div>
          <div className="prose prose-sm max-w-none text-slate-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{plan.planContent}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
