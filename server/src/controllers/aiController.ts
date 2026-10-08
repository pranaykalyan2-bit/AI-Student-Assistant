import { Request, Response } from 'express'
import { chatCompletion } from '../services/openai'

const SYSTEM_PROMPT =
  'You are a clear, patient academic tutor for college students. Explain concepts simply and thoroughly.'

export async function chat(req: Request, res: Response): Promise<void> {
  try {
    const { messages } = req.body as {
      messages?: { role: 'user' | 'assistant'; content: string }[]
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'messages array is required' })
      return
    }

    const reply = await chatCompletion(messages, SYSTEM_PROMPT)
    res.json({ reply })
  } catch (err) {
    console.error('AI chat error:', err)
    res.status(500).json({ error: 'Failed to get AI response' })
  }
}
