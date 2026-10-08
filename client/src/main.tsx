import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'

import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import AcademicAssistant from './pages/AcademicAssistant'
import StudyPlanGenerator from './pages/StudyPlanGenerator'
import QuizGenerator from './pages/QuizGenerator'
import QuizDetail from './pages/QuizDetail'
import NotesSummarizer from './pages/NotesSummarizer'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/assistant" element={<AcademicAssistant />} />
          <Route path="/study-plan" element={<StudyPlanGenerator />} />
          <Route path="/quiz" element={<QuizGenerator />} />
          <Route path="/quiz/:id" element={<QuizDetail />} />
          <Route path="/summarizer" element={<NotesSummarizer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
