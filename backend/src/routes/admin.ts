import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';

const router = Router();

router.get('/cards', async (_req, res) => {
  const cards = await prisma.healthCard.findMany({
    include: { user: { select: { fullName: true, email: true, phone: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(cards);
});

router.post('/cards/block', async (req, res) => {
  const schema = z.object({ cardId: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { cardId } = parsed.data;

  const card = await prisma.healthCard.findUnique({ where: { cardId } });
  if (!card) return res.status(404).json({ error: 'Not found' });

  const updated = await prisma.healthCard.update({
    where: { cardId },
    data: { status: 'BLOCKED', blockedAt: new Date() },
  });

  res.json({ ok: true, status: updated.status });
});

router.post('/cards/unblock', async (req, res) => {
  const schema = z.object({ cardId: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { cardId } = parsed.data;

  const card = await prisma.healthCard.findUnique({ where: { cardId } });
  if (!card) return res.status(404).json({ error: 'Not found' });

  const updated = await prisma.healthCard.update({
    where: { cardId },
    data: { status: 'ACTIVE', blockedAt: null },
  });

  res.json({ ok: true, status: updated.status });
});

export default router;