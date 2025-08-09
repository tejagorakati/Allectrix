import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateHealthCardId } from '@/lib/utils'
import { generateQRCode } from '@/lib/qr'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const dateOfBirth = formData.get('dateOfBirth') as string
    const emergencyContact = formData.get('emergencyContact') as string || undefined
    const bloodGroup = formData.get('bloodGroup') as string || undefined
    const allergies = formData.get('allergies') as string || undefined
    const chronicDiseases = formData.get('chronicDiseases') as string || undefined

    // Validate required fields
    if (!name || !email || !phone || !dateOfBirth) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingPatient = await prisma.patient.findFirst({
      where: {
        OR: [
          { email },
          { phone }
        ]
      }
    })

    if (existingPatient) {
      return NextResponse.json(
        { message: 'Patient with this email or phone already exists' },
        { status: 409 }
      )
    }

    // Generate unique health card ID
    const healthCardId = generateHealthCardId()

    // Handle profile image upload
    let profilePicture = undefined
    const profileImageFile = formData.get('profileImage') as File
    if (profileImageFile) {
      const bytes = await profileImageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Create uploads directory if it doesn't exist
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'profiles')
      await mkdir(uploadDir, { recursive: true })
      
      const filename = `${uuidv4()}-${profileImageFile.name}`
      const filepath = join(uploadDir, filename)
      await writeFile(filepath, buffer)
      profilePicture = `/uploads/profiles/${filename}`
    }

    // Handle medical file uploads
    const uploadedFileUrls: string[] = []
    const entries = Array.from(formData.entries())
    
    for (const [key, value] of entries) {
      if (key.startsWith('medicalFile_') && value instanceof File) {
        const bytes = await value.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'medical')
        await mkdir(uploadDir, { recursive: true })
        
        const filename = `${uuidv4()}-${value.name}`
        const filepath = join(uploadDir, filename)
        await writeFile(filepath, buffer)
        uploadedFileUrls.push(`/uploads/medical/${filename}`)

        // Store file metadata
        await prisma.uploadedFile.create({
          data: {
            filename,
            originalName: value.name,
            mimeType: value.type,
            size: value.size,
            url: `/uploads/medical/${filename}`,
            uploadedBy: email, // Use email as identifier for now
          }
        })
      }
    }

    // Generate QR code data
    const qrData = JSON.stringify({
      healthCardId,
      name,
      emergencyContact,
      bloodGroup,
      allergies: allergies ? allergies.split(',').map(a => a.trim()) : [],
      emergency: true
    })

    const qrCodeDataURL = await generateQRCode(qrData)

    // Create patient record
    const patient = await prisma.patient.create({
      data: {
        name,
        email,
        phone,
        dateOfBirth: new Date(dateOfBirth),
        healthCardId,
        qrCodeData: qrCodeDataURL,
        profilePicture,
        emergencyContact,
        bloodGroup,
        allergies,
        chronicDiseases,
      }
    })

    // Create initial notification
    await prisma.notification.create({
      data: {
        patientId: patient.id,
        type: 'registration',
        title: 'Welcome to Arogya Card!',
        message: `Your health card ${healthCardId} has been created successfully.`,
      }
    })

    return NextResponse.json({
      message: 'Patient registered successfully',
      healthCardId,
      patientId: patient.id,
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}