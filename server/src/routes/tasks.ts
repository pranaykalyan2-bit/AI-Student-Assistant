import { Router } from 'express'
import { createTask, updateTask, deleteTask } from '../controllers/tasksController'

const router = Router()

router.post('/', createTask)
router.patch('/:id', updateTask)
router.delete('/:id', deleteTask)

export default router
