import { Router } from 'express'
import {
  generateQuiz,
  listQuizzes,
  getQuizById,
  createAttempt,
} from '../controllers/quizController'

const router = Router()

router.post('/generate', generateQuiz)
router.get('/', listQuizzes)
router.get('/:id', getQuizById)
router.post('/:id/attempt', createAttempt)

export default router
