import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config()

import aiRouter from './routes/ai'
import studyPlanRouter from './routes/studyPlan'
import quizRouter from './routes/quiz'
import summarizerRouter from './routes/summarizer'
import dashboardRouter from './routes/dashboard'
import tasksRouter from './routes/tasks'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// API routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api/ai', aiRouter)
app.use('/api/study-plan', studyPlanRouter)
app.use('/api/quiz', quizRouter)
app.use('/api/summarizer', summarizerRouter)
app.use('/api/dashboard', dashboardRouter)
app.use('/api/tasks', tasksRouter)

// Serve built React frontend from ../client/dist
const clientDist = path.join(__dirname, '../../client/dist')
app.use(express.static(clientDist))

// All non-API routes return index.html (React Router handles them)
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

export default app
