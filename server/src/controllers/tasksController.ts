import { Request, Response } from 'express'
import prisma from '../prisma'

export async function createTask(req: Request, res: Response): Promise<void> {
  try {
    const { title, studyPlanId } = req.body as { title?: string; studyPlanId?: number }

    if (!title || title.trim().length === 0) {
      res.status(400).json({ error: 'title is required' })
      return
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        studyPlanId: studyPlanId ? Number(studyPlanId) : undefined,
      },
    })

    res.status(201).json(task)
  } catch (err) {
    console.error('Task create error:', err)
    res.status(500).json({ error: 'Failed to create task' })
  }
}

export async function updateTask(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid id' })
      return
    }

    const { done, title } = req.body as { done?: boolean; title?: string }

    if (done === undefined && title === undefined) {
      res.status(400).json({ error: 'Provide done or title to update' })
      return
    }

    const data: { done?: boolean; title?: string } = {}
    if (done !== undefined) data.done = Boolean(done)
    if (title !== undefined) data.title = title.trim()

    const task = await prisma.task.update({ where: { id }, data })
    res.json(task)
  } catch (err) {
    console.error('Task update error:', err)
    res.status(500).json({ error: 'Failed to update task' })
  }
}

export async function deleteTask(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid id' })
      return
    }
    await prisma.task.delete({ where: { id } })
    res.status(204).send()
  } catch (err) {
    console.error('Task delete error:', err)
    res.status(500).json({ error: 'Failed to delete task' })
  }
}
