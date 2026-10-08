import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboard } from '../api/dashboardApi';
import { createTask, updateTask, deleteTask } from '../api/tasksApi';
import type { DashboardData, Task } from '../types';

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTask, setNewTask] = useState('');
  const [addingTask, setAddingTask] = useState(false);

  async function load() {
    try {
      const d = await getDashboard();
      setData(d);
    } catch {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim() || addingTask) return;
    setAddingTask(true);
    try {
      const task = await createTask(newTask.trim());
      setData((d) => d ? { ...d, tasks: [task, ...d.tasks], stats: { ...d.stats, totalTasks: d.stats.totalTasks + 1 } } : d);
      setNewTask('');
    } catch { /* ignore */ } finally {
      setAddingTask(false);
    }
  }

  async function handleToggle(task: Task) {
    try {
      const updated = await updateTask(task.id, { done: !task.done });
      setData((d) => {
        if (!d) return d;
        const tasks = d.tasks.map((t) => t.id === updated.id ? updated : t);
        const tasksCompleted = tasks.filter((t) => t.done).length;
        return { ...d, tasks, stats: { ...d.stats, tasksCompleted } };
      });
    } catch { /* ignore */ }
  }

  async function handleDelete(id: number) {
    try {
      await deleteTask(id);
      setData((d) => {
        if (!d) return d;
        const tasks = d.tasks.filter((t) => t.id !== id);
        return { ...d, tasks, stats: { ...d.stats, totalTasks: d.stats.totalTasks - 1, tasksCompleted: tasks.filter((t) => t.done).length } };
      });
    } catch { /* ignore */ }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
        Loading dashboard…
      </div>
    );
  }

  if (error) {
    return <p className="text-red-600 text-sm p-4">{error}</p>;
  }

  if (!data) return null;

  const { stats, recentStudyPlans, recentQuizzes, tasks } = data;

  const statCards = [
    { label: 'Study Plans', value: stats.totalStudyPlans, color: 'bg-blue-50 text-blue-700 border-blue-100' },
    { label: 'Quizzes Taken', value: stats.totalQuizzes, color: 'bg-purple-50 text-purple-700 border-purple-100' },
    { label: 'Avg Quiz Score', value: `${stats.averageScore}%`, color: 'bg-green-50 text-green-700 border-green-100' },
    { label: 'Tasks Done', value: `${stats.tasksCompleted}/${stats.totalTasks}`, color: 'bg-orange-50 text-orange-700 border-orange-100' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Your study progress at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className={`rounded-2xl border p-5 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm font-medium mt-1 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Study Plans */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Recent Study Plans</h2>
          {recentStudyPlans.length === 0 ? (
            <p className="text-sm text-slate-400">No study plans yet. <button onClick={() => navigate('/study-plan')} className="text-blue-600 underline">Create one</button></p>
          ) : (
            <ul className="space-y-3">
              {recentStudyPlans.map((p) => (
                <li key={p.id} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{p.subject}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Exam: {new Date(p.examDate).toLocaleDateString()} · {p.prepLevel} · {p.hoursPerDay}h/day
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Quizzes */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Recent Quizzes</h2>
          {recentQuizzes.length === 0 ? (
            <p className="text-sm text-slate-400">No quizzes yet. <button onClick={() => navigate('/quiz')} className="text-blue-600 underline">Generate one</button></p>
          ) : (
            <ul className="space-y-3">
              {recentQuizzes.map((q) => {
                const best = q.attempts.length > 0
                  ? Math.max(...q.attempts.map((a) => Math.round((a.score / a.totalQuestions) * 100)))
                  : null;
                return (
                  <li key={q.id} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{q.topic}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{q.difficulty} · {q.questions.length} questions</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {best !== null && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                          Best: {best}%
                        </span>
                      )}
                      <button
                        onClick={() => navigate(`/quiz/${q.id}`)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      >
                        Re-attempt
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Tasks */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-4">Tasks</h2>

        {/* Add task */}
        <form onSubmit={handleAddTask} className="flex gap-3 mb-4">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task…"
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newTask.trim() || addingTask}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            Add
          </button>
        </form>

        {tasks.length === 0 ? (
          <p className="text-sm text-slate-400">No tasks yet. Add one above.</p>
        ) : (
          <ul className="space-y-2">
            {tasks.map((task) => (
              <li key={task.id} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => handleToggle(task)}
                  className="w-4 h-4 accent-blue-600 cursor-pointer shrink-0"
                />
                <span className={`flex-1 text-sm ${task.done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                  {task.title}
                </span>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="text-slate-300 hover:text-red-500 transition-colors shrink-0"
                  aria-label="Delete task"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
