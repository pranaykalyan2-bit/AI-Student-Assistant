import { Router } from 'express'
import {
  generateStudyPlan,
  listStudyPlans,
  deleteStudyPlan,
} from '../controllers/studyPlanController'

const router = Router()

router.post('/generate', generateStudyPlan)
router.get('/', listStudyPlans)
router.delete('/:id', deleteStudyPlan)

export default router
