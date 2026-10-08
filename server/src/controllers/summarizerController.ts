import { Request, Response } from 'express'
import multer from 'multer'
import { chatCompletion } from '../services/openai'
import { extractText } from '../services/fileParser'

const SYSTEM_PROMPT =
  'You are a helpful study assistant. Summarize the following notes into clear, concise bullet points ' +
  'that a college student can quickly review and understand.'

const storage = multer.memoryStorage()

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'text/plain') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF and plain-text files are accepted'))
    }
  },
})

export async function summarize(req: Request, res: Response): Promise<void> {
  try {
    let text: string | undefined

    if (req.file) {
      text = await extractText(req.file.buffer, req.file.mimetype)
    } else {
      text = (req.body as { text?: string }).text
    }

    if (!text || text.trim().length === 0) {
      res.status(400).json({ error: 'Provide either a file upload or a non-empty text field' })
      return
    }

    const summary = await chatCompletion(
      [{ role: 'user', content: text }],
      SYSTEM_PROMPT
    )

    res.json({ summary })
  } catch (err) {
    console.error('Summarizer error:', err)
    res.status(500).json({ error: 'Failed to summarize' })
  }
}
