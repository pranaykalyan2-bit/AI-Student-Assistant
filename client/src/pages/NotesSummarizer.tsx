import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { summarizeText, summarizeFile } from '../api/summarizerApi';

type Mode = 'text' | 'file';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export default function NotesSummarizer() {
  const [mode, setMode] = useState<Mode>('text');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFileError('');
    if (!f) { setFile(null); return; }
    if (f.size > MAX_FILE_SIZE) {
      setFileError('File must be under 5 MB');
      setFile(null);
      return;
    }
    if (f.type !== 'application/pdf' && f.type !== 'text/plain') {
      setFileError('Only PDF and .txt files are accepted');
      setFile(null);
      return;
    }
    setFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSummary('');
    setLoading(true);
    try {
      let result: string;
      if (mode === 'file' && file) {
        result = await summarizeFile(file);
      } else if (mode === 'text' && text.trim()) {
        result = await summarizeText(text.trim());
      } else {
        setError(mode === 'text' ? 'Please enter some text to summarize.' : 'Please select a file.');
        setLoading(false);
        return;
      }
      setSummary(result);
    } catch {
      setError('Failed to summarize. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setText('');
    setFile(null);
    setFileError('');
    setSummary('');
    setError('');
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Notes Summarizer</h1>
        <p className="text-sm text-slate-500 mt-0.5">Paste your notes or upload a PDF/TXT file for an AI summary</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
        {/* Mode toggle */}
        <div className="flex gap-2">
          {(['text', 'file'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setError(''); setSummary(''); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === m
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {m === 'text' ? 'Paste Text' : 'Upload File'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {mode === 'text' ? (
            <div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your lecture notes, textbook passages, or study material here…"
                rows={10}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              />
            </div>
          ) : (
            <div>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-8 cursor-pointer hover:border-blue-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span className="text-sm text-slate-600 font-medium">
                  {file ? file.name : 'Click to upload PDF or TXT'}
                </span>
                <span className="text-xs text-slate-400 mt-1">Max 5 MB</span>
                <input
                  type="file"
                  accept=".pdf,.txt,application/pdf,text/plain"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {fileError && <p className="text-xs text-red-500 mt-1">{fileError}</p>}
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >
              {loading ? 'Summarizing…' : 'Summarize'}
            </button>
            {(text || file || summary) && (
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Summary */}
      {summary && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-3">Summary</h2>
          <div className="prose prose-sm max-w-none text-slate-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
