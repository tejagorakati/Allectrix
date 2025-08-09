import { Router } from 'express';
import { z } from 'zod';
import multer from 'multer';
import { prisma } from '../utils/prisma';
import bcrypt from 'bcryptjs';
import { issueHealthCard } from '../services/cardService';

const router = Router();
const upload = multer({ dest: 'uploads/' });

const registrationSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().min(6).optional(),
  dateOfBirth: z.string(),
  password: z.string().min(6).optional(),
  bloodGroup: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  chronicDiseases: z.array(z.string()).optional(),
});

router.post('/register', upload.array('files', 10), async (req, res) => {
  try {
    const parsed = registrationSchema.safeParse({
      ...req.body,
      allergies: req.body.allergies ? JSON.parse(req.body.allergies) : undefined,
      chronicDiseases: req.body.chronicDiseases ? JSON.parse(req.body.chronicDiseases) : undefined,
    });
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const { fullName, email, phone, dateOfBirth, password, bloodGroup, allergies, chronicDiseases } = parsed.data;

    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
    if (existing) return res.status(409).json({ error: 'User already exists' });

    const passwordHash = password ? await bcrypt.hash(password, 10) : null;

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        dateOfBirth: new Date(dateOfBirth),
        passwordHash,
        bloodGroup: bloodGroup || null,
        allergiesJson: allergies ? JSON.parse(JSON.stringify(allergies)) : null,
        chronicDiseasesJson: chronicDiseases ? JSON.parse(JSON.stringify(chronicDiseases)) : null,
      },
    });

    // Files are uploaded to uploads/; associate as a record (optional MVP)
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const record = await prisma.medicalRecord.create({
        data: {
          userId: user.id,
          recordType: 'NOTE',
          title: 'Uploaded medical files',
          notes: 'Initial documents at registration',
        },
      });
      for (const f of req.files as Express.Multer.File[]) {
        await prisma.recordFile.create({
          data: {
            recordId: record.id,
            filePath: f.path,
            fileName: f.originalname,
            mimeType: f.mimetype,
            sizeBytes: f.size,
          },
        });
      }
    }

    const card = await issueHealthCard(user.id);

    return res.status(201).json({ userId: user.id, cardId: card.cardId, qrCodeData: card.qrCodeData });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/report-lost', async (req, res) => {
  const schema = z.object({ cardId: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { cardId } = parsed.data;
  const card = await prisma.healthCard.findUnique({ where: { cardId } });
  if (!card) return res.status(404).json({ error: 'Card not found' });

  const updated = await prisma.healthCard.update({
    where: { cardId },
    data: { status: 'BLOCKED', blockedAt: new Date(), lostReportedAt: new Date() },
  });

  return res.json({ ok: true, status: updated.status });
});

export default router;