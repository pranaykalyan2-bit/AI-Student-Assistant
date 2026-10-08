import { Request, Response } from 'express'
import { chatCompletion } from '../services/openai'
import prisma from '../prisma'

const SYSTEM_PROMPT =
  'You are an expert academic coach. Generate a structured, week-by-week study plan for a college student. ' +
  'Break the plan into clear weekly sections with daily topics and goals. Be specific and practical.'

export async function generateStudyPlan(req: Request, res: Response): Promise<void> {
  try {
    const { subject, examDate, hoursPerDay, prepLevel } = req.body as {
      subject?: string
      examDate?: string
      hoursPerDay?: number
      prepLevel?: string
    }

    if (!subject || !examDate || !hoursPerDay || !prepLevel) {
      res.status(400).json({ error: 'subject, examDate, hoursPerDay, and prepLevel are required' })
      return
    }

    const userMessage = `Create a study plan for the following:
- Subject: ${subject}
- Exam Date: ${examDate}
- Hours available per day: ${hoursPerDay}
- Preparation level: ${prepLevel}

Generate a detailed week-by-week study plan.`

    const planContent = await chatCompletion(
      [{ role: 'user', content: userMessage }],
      SYSTEM_PROMPT
    )

    const studyPlan = await prisma.studyPlan.create({
      data: {
        subject,
        examDate,
        hoursPerDay: Number(hoursPerDay),
        prepLevel,
        planContent,
      },
    })

    res.status(201).json(studyPlan)
  } catch (err) {
    console.error('Study plan generate error:', err)
    res.status(500).json({ error: 'Failed to generate study plan' })
  }
}

export async function listStudyPlans(_req: Request, res: Response): Promise<void> {
  try {
    const plans = await prisma.studyPlan.findMany({
      orderBy: { createdAt: 'desc' },
    })
    res.json(plans)
  } catch (err) {
    console.error('Study plan list error:', err)
    res.status(500).json({ error: 'Failed to fetch study plans' })
  }
}

export async function deleteStudyPlan(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid id' })
      return
    }
    await prisma.studyPlan.delete({ where: { id } })
    res.status(204).send()
  } catch (err) {
    console.error('Study plan delete error:', err)
    res.status(500).json({ error: 'Failed to delete study plan' })
  }
}
