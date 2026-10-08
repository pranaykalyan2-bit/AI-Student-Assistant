import { Router } from 'express'
import { upload, summarize } from '../controllers/summarizerController'

const router = Router()

router.post('/summarize', upload.single('file'), summarize)

export default router
