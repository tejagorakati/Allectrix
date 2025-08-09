import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { signToken } from '../utils/jwt';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  totp: z.string().optional(),
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { email, password } = parsed.data;

  const doctor = await prisma.doctor.findUnique({ where: { email } });
  if (!doctor || !doctor.isActive) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, doctor.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  // TODO: validate TOTP if totpSecret present

  const token = signToken({ sub: doctor.id, role: 'doctor' }, '1d');
  res.json({ token, doctor: { id: doctor.id, fullName: doctor.fullName, email: doctor.email } });
});

const lookupSchema = z.object({
  cardId: z.string().optional(),
  healthCardId: z.string().optional(),
});

router.post('/patient/lookup', async (req, res) => {
  const parsed = lookupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { cardId, healthCardId } = parsed.data;
  const id = cardId || healthCardId;
  if (!id) return res.status(400).json({ error: 'cardId required' });

  const card = await prisma.healthCard.findUnique({ where: { cardId: id }, include: { user: true } });
  if (!card) return res.status(404).json({ error: 'Not found' });

  if (card.status !== 'ACTIVE') return res.status(403).json({ error: 'Card not active' });

  const user = card.user;
  res.json({
    user: {
      id: user.id,
      fullName: user.fullName,
      bloodGroup: user.bloodGroup,
      allergies: user.allergiesJson,
      chronicDiseases: user.chronicDiseasesJson,
    },
  });
});

const recordSchema = z.object({
  userId: z.string(),
  recordType: z.enum(['DIAGNOSIS', 'PRESCRIPTION', 'TEST_RESULT', 'NOTE']),
  title: z.string(),
  notes: z.string().optional(),
  dataJson: z.any().optional(),
});

router.post('/records', async (req, res) => {
  const parsed = recordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  // In MVP, skip auth middleware and assume doctorId passed (to be replaced by JWT)
  const doctorId = req.headers['x-doctor-id'];
  if (!doctorId || typeof doctorId !== 'string') return res.status(401).json({ error: 'Missing doctor context' });

  const record = await prisma.medicalRecord.create({
    data: {
      userId: parsed.data.userId,
      doctorId,
      recordType: parsed.data.recordType,
      title: parsed.data.title,
      notes: parsed.data.notes || null,
      dataJson: parsed.data.dataJson as any,
    },
  });

  res.status(201).json({ recordId: record.id });
});

export default router;