import { Request, Response } from 'express'
import { chatCompletion } from '../services/openai'
import prisma from '../prisma'

const SYSTEM_PROMPT =
  'You are a quiz generator. Return ONLY a valid JSON array of quiz questions — no markdown fences, no explanation, just raw JSON. ' +
  'Each element must be: { "question": string, "options": [string, string, string, string], "answer": string } ' +
  'where "answer" is the exact text of the correct option.'

function stripFences(raw: string): string {
  return raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()
}

function parseQuestions(raw: string): { question: string; options: string[]; answer: string }[] {
  const cleaned = stripFences(raw)
  const parsed = JSON.parse(cleaned)
  if (!Array.isArray(parsed)) throw new Error('OpenAI did not return a JSON array')
  return parsed
}

export async function generateQuiz(req: Request, res: Response): Promise<void> {
  try {
    const { topic, difficulty, count } = req.body as {
      topic?: string
      difficulty?: string
      count?: number
    }

    if (!topic || !difficulty || !count) {
      res.status(400).json({ error: 'topic, difficulty, and count are required' })
      return
    }

    const validCounts = [5, 10, 15]
    if (!validCounts.includes(Number(count))) {
      res.status(400).json({ error: 'count must be 5, 10, or 15' })
      return
    }

    const userMessage = `Generate ${count} multiple-choice quiz questions about "${topic}" at ${difficulty} difficulty.`

    const raw = await chatCompletion(
      [{ role: 'user', content: userMessage }],
      SYSTEM_PROMPT
    )

    const questions = parseQuestions(raw)

    const quiz = await prisma.quiz.create({
      data: {
        topic,
        difficulty,
        questions: JSON.stringify(questions),
      },
    })

    res.status(201).json({ ...quiz, questions })
  } catch (err) {
    console.error('Quiz generate error:', err)
    res.status(500).json({ error: 'Failed to generate quiz' })
  }
}

export async function listQuizzes(_req: Request, res: Response): Promise<void> {
  try {
    const quizzes = await prisma.quiz.findMany({
      orderBy: { createdAt: 'desc' },
      include: { attempts: true },
    })

    const result = quizzes.map((q) => ({
      ...q,
      questions: JSON.parse(q.questions),
    }))

    res.json(result)
  } catch (err) {
    console.error('Quiz list error:', err)
    res.status(500).json({ error: 'Failed to fetch quizzes' })
  }
}

export async function getQuizById(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid id' })
      return
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { attempts: { orderBy: { attemptedAt: 'desc' } } },
    })

    if (!quiz) {
      res.status(404).json({ error: 'Quiz not found' })
      return
    }

    res.json({ ...quiz, questions: JSON.parse(quiz.questions) })
  } catch (err) {
    console.error('Quiz get error:', err)
    res.status(500).json({ error: 'Failed to fetch quiz' })
  }
}

export async function createAttempt(req: Request, res: Response): Promise<void> {
  try {
    const quizId = parseInt(req.params.id, 10)
    if (isNaN(quizId)) {
      res.status(400).json({ error: 'Invalid quiz id' })
      return
    }

    const { score, totalQuestions } = req.body as {
      score?: number
      totalQuestions?: number
    }

    if (score === undefined || totalQuestions === undefined) {
      res.status(400).json({ error: 'score and totalQuestions are required' })
      return
    }

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        score: Number(score),
        totalQuestions: Number(totalQuestions),
      },
    })

    res.status(201).json(attempt)
  } catch (err) {
    console.error('Quiz attempt error:', err)
    res.status(500).json({ error: 'Failed to record attempt' })
  }
}
