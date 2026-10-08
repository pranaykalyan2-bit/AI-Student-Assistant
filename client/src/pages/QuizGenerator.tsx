import { useState } from 'react';
import { generateQuiz, submitAttempt } from '../api/quizApi';
import type { Quiz } from '../types';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const COUNTS = [5, 10, 15];

type Phase = 'form' | 'quiz' | 'result';

export default function QuizGenerator() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [phase, setPhase] = useState<Phase>('form');
  const [selected, setSelected] = useState<(string | null)[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [saving, setSaving] = useState(false);

  const topicError = !topic.trim() ? 'Topic is required' : '';

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (topicError) return;
    setLoading(true);
    setError('');
    try {
      const result = await generateQuiz({ topic, difficulty, count });
      setQuiz(result);
      setSelected(new Array(result.questions.length).fill(null));
      setSubmitted(false);
      setScore(0);
      setPhase('quiz');
    } catch {
      setError('Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!quiz) return;
    const correct = quiz.questions.reduce(
      (acc, q, i) => acc + (selected[i] === q.answer ? 1 : 0),
      0
    );
    setScore(correct);
    setSubmitted(true);
    setPhase('result');
    setSaving(true);
    try {
      await submitAttempt(quiz.id, correct, quiz.questions.length);
    } catch {
      // non-blocking — attempt save failure doesn't break the UX
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setQuiz(null);
    setPhase('form');
    setTopic('');
    setError('');
  }

  if (phase === 'form') {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quiz Generator</h1>
          <p className="text-sm text-slate-500 mt-0.5">Generate an AI-powered multiple-choice quiz</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <form onSubmit={handleGenerate} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Photosynthesis, World War II"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              {topicError && topic.length > 0 && <p className="text-xs text-red-500 mt-1">{topicError}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Questions</label>
                <select
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {COUNTS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading || !!topicError}
              className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >
              {loading ? 'Generating…' : 'Generate Quiz'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{quiz.topic}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {quiz.difficulty} · {quiz.questions.length} questions
            {phase === 'result' && (
              <span className="ml-2 font-semibold text-blue-700">
                Score: {score}/{quiz.questions.length} ({Math.round((score / quiz.questions.length) * 100)}%)
              </span>
            )}
          </p>
        </div>
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
        >
          New Quiz
        </button>
      </div>

      {saving && <p className="text-xs text-slate-400">Saving attempt…</p>}

      {quiz.questions.map((q, qi) => {
        const userAns = selected[qi];
        const correct = q.answer;
        return (
          <div key={qi} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <p className="text-sm font-semibold text-slate-800 mb-3">
              {qi + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt) => {
                let cls = 'flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm cursor-pointer transition-colors ';
                if (!submitted) {
                  cls += userAns === opt
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700';
                } else {
                  if (opt === correct) cls += 'border-green-400 bg-green-50 text-green-700 font-medium';
                  else if (opt === userAns && opt !== correct) cls += 'border-red-400 bg-red-50 text-red-700';
                  else cls += 'border-slate-200 text-slate-400';
                }
                return (
                  <label key={opt} className={cls}>
                    <input
                      type="radio"
                      name={`q-${qi}`}
                      value={opt}
                      checked={userAns === opt}
                      disabled={submitted}
                      onChange={() => {
                        const copy = [...selected];
                        copy[qi] = opt;
                        setSelected(copy);
                      }}
                      className="accent-blue-600"
                    />
                    {opt}
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={selected.some((s) => s === null)}
          className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-40 transition-colors"
        >
          Submit Quiz
        </button>
      )}

      {submitted && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center">
          <p className="text-lg font-bold text-blue-700">
            {score}/{quiz.questions.length} Correct — {Math.round((score / quiz.questions.length) * 100)}%
          </p>
          <button
            onClick={handleReset}
            className="mt-3 px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Try Another Quiz
          </button>
        </div>
      )}
    </div>
  );
}
