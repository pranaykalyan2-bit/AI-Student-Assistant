import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuizById, submitAttempt } from '../api/quizApi';
import type { Quiz } from '../types';

type Phase = 'quiz' | 'result';

export default function QuizDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [phase, setPhase] = useState<Phase>('quiz');
  const [selected, setSelected] = useState<(string | null)[]>([]);
  const [score, setScore] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getQuizById(Number(id))
      .then((q) => {
        setQuiz(q);
        setSelected(new Array(q.questions.length).fill(null));
      })
      .catch(() => setError('Quiz not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit() {
    if (!quiz) return;
    const correct = quiz.questions.reduce(
      (acc, q, i) => acc + (selected[i] === q.answer ? 1 : 0),
      0
    );
    setScore(correct);
    setPhase('result');
    setSaving(true);
    try {
      await submitAttempt(quiz.id, correct, quiz.questions.length);
      // Refresh attempt history
      const updated = await getQuizById(quiz.id);
      setQuiz(updated);
    } catch {
      // non-blocking
    } finally {
      setSaving(false);
    }
  }

  function handleRetry() {
    if (!quiz) return;
    setSelected(new Array(quiz.questions.length).fill(null));
    setScore(0);
    setPhase('quiz');
  }

  if (loading) {
    return <div className="text-slate-500 text-sm p-4">Loading quiz…</div>;
  }
  if (error || !quiz) {
    return (
      <div className="text-red-600 text-sm p-4">
        {error || 'Quiz not found.'}
        <button onClick={() => navigate('/quiz')} className="ml-3 underline text-blue-600">Back</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
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
          onClick={() => navigate('/quiz')}
          className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
        >
          ← Back
        </button>
      </div>

      {saving && <p className="text-xs text-slate-400">Saving attempt…</p>}

      {/* Questions */}
      {quiz.questions.map((q, qi) => {
        const userAns = selected[qi];
        const correct = q.answer;
        const submitted = phase === 'result';
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

      {/* Submit / result */}
      {phase === 'quiz' && (
        <button
          onClick={handleSubmit}
          disabled={selected.some((s) => s === null)}
          className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-40 transition-colors"
        >
          Submit Quiz
        </button>
      )}

      {phase === 'result' && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center">
            <p className="text-lg font-bold text-blue-700">
              {score}/{quiz.questions.length} Correct — {Math.round((score / quiz.questions.length) * 100)}%
            </p>
            <button
              onClick={handleRetry}
              className="mt-3 px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Re-attempt
            </button>
          </div>

          {/* Attempt history */}
          {quiz.attempts.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Attempt History</h2>
              <div className="space-y-2">
                {quiz.attempts.map((a, i) => (
                  <div key={a.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      #{quiz.attempts.length - i} · {new Date(a.attemptedAt).toLocaleDateString()}
                    </span>
                    <span className="font-semibold text-slate-800">
                      {a.score}/{a.totalQuestions} ({Math.round((a.score / a.totalQuestions) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
