import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { healthCardId: string } }
) {
  try {
    const { healthCardId } = params

    const patient = await prisma.patient.findUnique({
      where: {
        healthCardId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dateOfBirth: true,
        healthCardId: true,
        qrCodeData: true,
        profilePicture: true,
        emergencyContact: true,
        bloodGroup: true,
        allergies: true,
        chronicDiseases: true,
        isCardBlocked: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!patient) {
      return NextResponse.json(
        { message: 'Health card not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      patient,
    })

  } catch (error) {
    console.error('Error fetching patient:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}