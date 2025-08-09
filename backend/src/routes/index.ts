import { Router } from 'express';
import patientsRouter from './patients';
import doctorsRouter from './doctors';
import emergencyRouter from './emergency';
import adminRouter from './admin';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ ok: true });
});

router.use('/patients', patientsRouter);
router.use('/doctors', doctorsRouter);
router.use('/emergency', emergencyRouter);
router.use('/admin', adminRouter);

export default router;