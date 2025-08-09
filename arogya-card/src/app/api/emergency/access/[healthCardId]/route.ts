import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { healthCardId: string } }
) {
  try {
    const { healthCardId } = params
    const { accessorName, accessMethod } = await request.json()

    // Find the patient
    const patient = await prisma.patient.findUnique({
      where: {
        healthCardId,
      },
      select: {
        id: true,
        name: true,
        dateOfBirth: true,
        bloodGroup: true,
        allergies: true,
        emergencyContact: true,
        profilePicture: true,
        healthCardId: true,
        isCardBlocked: true,
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
        { message: 'Health card is blocked. Contact patient or administrator.' },
        { status: 403 }
      )
    }

    // Log emergency access
    await prisma.emergencyAccess.create({
      data: {
        patientId: patient.id,
        accessorName: accessorName || 'Unknown Emergency Personnel',
        accessMethod: accessMethod || 'manual',
        ipAddress: request.ip || 'unknown',
        location: 'Emergency Access Point', // In production, get actual location
      },
    })

    // Create notification for patient
    await prisma.notification.create({
      data: {
        patientId: patient.id,
        type: 'emergency',
        title: 'Emergency Access Alert',
        message: `Your health card was accessed by emergency personnel at ${new Date().toLocaleString()}. If this was not expected, please contact support immediately.`,
      },
    })

    // Return only essential emergency information
    const emergencyData = {
      name: patient.name,
      dateOfBirth: patient.dateOfBirth,
      bloodGroup: patient.bloodGroup,
      allergies: patient.allergies,
      emergencyContact: patient.emergencyContact,
      profilePicture: patient.profilePicture,
      healthCardId: patient.healthCardId,
    }

    return NextResponse.json({
      message: 'Emergency access granted',
      patientData: emergencyData,
    })

  } catch (error) {
    console.error('Emergency access error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}