import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { healthCardId: string } }
) {
  try {
    const { healthCardId } = params

    // Find the patient
    const patient = await prisma.patient.findUnique({
      where: {
        healthCardId,
      },
    })

    if (!patient) {
      return NextResponse.json(
        { message: 'Health card not found' },
        { status: 404 }
      )
    }

    if (patient.isCardBlocked) {
      return NextResponse.json(
        { message: 'Health card is already blocked' },
        { status: 400 }
      )
    }

    // Block the card
    await prisma.patient.update({
      where: {
        healthCardId,
      },
      data: {
        isCardBlocked: true,
      },
    })

    // Create notification
    await prisma.notification.create({
      data: {
        patientId: patient.id,
        type: 'card_blocked',
        title: 'Health Card Blocked',
        message: `Your health card ${healthCardId} has been blocked successfully. Contact support to reactivate.`,
      },
    })

    // Log the action (this would also go to blockchain in production)
    await prisma.accessLog.create({
      data: {
        patientId: patient.id,
        accessType: 'card_blocked',
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({
      message: 'Health card blocked successfully',
    })

  } catch (error) {
    console.error('Error blocking card:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}