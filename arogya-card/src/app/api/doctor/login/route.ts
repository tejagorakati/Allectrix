import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password, licenseNumber } = await request.json()

    // Validate required fields
    if (!email || !password || !licenseNumber) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find doctor by email and license number
    const doctor = await prisma.doctor.findFirst({
      where: {
        email,
        licenseNumber,
      },
    })

    if (!doctor) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    if (!doctor.isActive) {
      return NextResponse.json(
        { message: 'Doctor account is inactive. Contact administrator.' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, doctor.hashedPassword)
    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate token
    const token = generateToken({
      doctorId: doctor.id,
      email: doctor.email,
      licenseNumber: doctor.licenseNumber,
      type: 'doctor',
    })

    return NextResponse.json({
      message: 'Login successful',
      token,
      doctor: {
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        licenseNumber: doctor.licenseNumber,
        specialization: doctor.specialization,
      },
    })

  } catch (error) {
    console.error('Doctor login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}