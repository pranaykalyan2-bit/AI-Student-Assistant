import { Router, Request, Response } from 'express'
import prisma from '../prisma'

const router = Router()

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalStudyPlans, totalQuizzes, attempts, tasksAll, recentStudyPlans, recentQuizzes] =
      await Promise.all([
        prisma.studyPlan.count(),
        prisma.quiz.count(),
        prisma.quizAttempt.findMany(),
        prisma.task.findMany({ orderBy: { createdAt: 'desc' } }),
        prisma.studyPlan.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
        prisma.quiz.findMany({
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { attempts: { orderBy: { attemptedAt: 'desc' } } },
        }),
      ])

    const averageScore =
      attempts.length === 0
        ? 0
        : attempts.reduce((sum, a) => sum + (a.score / a.totalQuestions) * 100, 0) /
          attempts.length

    const tasksCompleted = tasksAll.filter((t) => t.done).length

    res.json({
      stats: {
        totalStudyPlans,
        totalQuizzes,
        averageScore: Math.round(averageScore * 10) / 10,
        tasksCompleted,
        totalTasks: tasksAll.length,
      },
      recentStudyPlans,
      recentQuizzes: recentQuizzes.map((q) => ({
        ...q,
        questions: JSON.parse(q.questions),
      })),
      tasks: tasksAll,
    })
  } catch (err) {
    console.error('Dashboard error:', err)
    res.status(500).json({ error: 'Failed to load dashboard' })
  }
})

export default router
