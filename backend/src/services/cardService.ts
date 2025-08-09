import { prisma } from '../utils/prisma';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { generateQrDataUrl } from '../utils/qr';

function sha256(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

export async function issueHealthCard(userId: string) {
  const cardId = uuidv4().replace(/-/g, '').slice(0, 12).toUpperCase();
  const qrCodeData = await generateQrDataUrl(cardId);

  const card = await prisma.healthCard.create({
    data: {
      userId,
      cardId,
      qrCodeData,
    },
  });

  await appendAccessLog({
    userId,
    actorType: 'SYSTEM',
    action: 'CREATE_RECORD',
    description: `Card issued ${cardId}`,
    data: { cardId },
  });

  return card;
}

export async function blockCard(cardId: string, reason?: string) {
  const card = await prisma.healthCard.update({
    where: { cardId },
    data: { status: 'BLOCKED', blockedAt: new Date(), lostReportedAt: new Date() },
  });
  await appendAccessLog({
    userId: card.userId,
    actorType: 'SYSTEM',
    action: 'BLOCK_CARD',
    description: reason || 'blocked',
    data: { cardId },
  });
  return card;
}

export async function unblockCard(cardId: string) {
  const card = await prisma.healthCard.update({
    where: { cardId },
    data: { status: 'ACTIVE', blockedAt: null },
  });
  await appendAccessLog({
    userId: card.userId,
    actorType: 'SYSTEM',
    action: 'UNBLOCK_CARD',
    description: 'unblocked',
    data: { cardId },
  });
  return card;
}

async function appendAccessLog(params: {
  userId?: string;
  doctorId?: string;
  adminId?: string;
  actorType: 'DOCTOR' | 'ADMIN' | 'SYSTEM' | 'EMERGENCY';
  action:
    | 'READ'
    | 'CREATE_RECORD'
    | 'UPDATE_RECORD'
    | 'BLOCK_CARD'
    | 'UNBLOCK_CARD'
    | 'EMERGENCY_READ'
    | 'LOGIN'
    | 'FAILED_LOGIN';
  description?: string;
  data?: unknown;
}) {
  const last = await prisma.accessLog.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { hash: true },
  });
  const dataHash = sha256(JSON.stringify(params.data ?? {}));
  const prevHash = last?.hash ?? null;
  const hash = sha256([params.userId, params.doctorId, params.adminId, params.actorType, params.action, params.description, dataHash, prevHash].join('|'));

  await prisma.accessLog.create({
    data: {
      userId: params.userId ?? null,
      doctorId: params.doctorId ?? null,
      adminId: params.adminId ?? null,
      actorType: params.actorType,
      action: params.action,
      description: params.description,
      hash,
      prevHash,
      dataHash,
      onChainStatus: 'PENDING',
    },
  });
}