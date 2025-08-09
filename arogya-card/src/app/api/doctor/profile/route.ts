import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded || decoded.type !== 'doctor') {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      )
    }

    const doctor = await prisma.doctor.findUnique({
      where: {
        id: decoded.doctorId as string,
      },
      select: {
        id: true,
        name: true,
        email: true,
        licenseNumber: true,
        specialization: true,
        isActive: true,
      },
    })

    if (!doctor) {
      return NextResponse.json(
        { message: 'Doctor not found' },
        { status: 404 }
      )
    }

    if (!doctor.isActive) {
      return NextResponse.json(
        { message: 'Doctor account is inactive' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      doctor,
    })

  } catch (error) {
    console.error('Error fetching doctor profile:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}