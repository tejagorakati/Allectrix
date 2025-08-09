import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'

const prisma = new PrismaClient()

async function main() {
  // Create sample doctors
  const doctor1Password = await hashPassword('doctor123')
  const doctor2Password = await hashPassword('doctor456')

  const doctor1 = await prisma.doctor.upsert({
    where: { email: 'dr.smith@hospital.com' },
    update: {},
    create: {
      name: 'Dr. John Smith',
      email: 'dr.smith@hospital.com',
      phone: '+91-9876543210',
      licenseNumber: 'MED001',
      specialization: 'Cardiology',
      hashedPassword: doctor1Password,
      isActive: true,
    },
  })

  const doctor2 = await prisma.doctor.upsert({
    where: { email: 'dr.patel@clinic.com' },
    update: {},
    create: {
      name: 'Dr. Priya Patel',
      email: 'dr.patel@clinic.com',
      phone: '+91-9876543211',
      licenseNumber: 'MED002',
      specialization: 'General Medicine',
      hashedPassword: doctor2Password,
      isActive: true,
    },
  })

  // Create admin user
  const adminPassword = await hashPassword('admin123')
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@arogyacard.com' },
    update: {},
    create: {
      name: 'System Administrator',
      email: 'admin@arogyacard.com',
      hashedPassword: adminPassword,
      role: 'admin',
    },
  })

  console.log({
    doctor1,
    doctor2,
    admin,
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })