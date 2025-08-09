import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';

const router = Router();

const accessSchema = z.object({
  cardId: z.string().optional(),
  biometricToken: z.string().optional(),
});

router.post('/access', async (req, res) => {
  const parsed = accessSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { cardId, biometricToken } = parsed.data;
  let userId: string | null = null;

  if (cardId) {
    const card = await prisma.healthCard.findUnique({ where: { cardId } });
    if (!card) return res.status(404).json({ error: 'Not found' });
    userId = card.userId;
  } else if (biometricToken) {
    const user = await prisma.user.findFirst({ where: { biometricToken } });
    if (!user) return res.status(404).json({ error: 'Not found' });
    userId = user.id;
  } else {
    return res.status(400).json({ error: 'cardId or biometricToken required' });
  }

  const user = await prisma.user.findUnique({ where: { id: userId! } });
  if (!user) return res.status(404).json({ error: 'Not found' });
  if (!user.allowEmergencyRead) return res.status(403).json({ error: 'Emergency access disabled' });

  return res.json({
    user: {
      fullName: user.fullName,
      bloodGroup: user.bloodGroup,
      allergies: user.allergiesJson,
      chronicDiseases: user.chronicDiseasesJson,
      emergencyContacts: await prisma.emergencyContact.findMany({ where: { userId: user.id } }),
    },
  });
});

export default router;