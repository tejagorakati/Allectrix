import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const doctor = await prisma.doctor.upsert({
    where: { email: 'doc@example.com' },
    update: {},
    create: {
      email: 'doc@example.com',
      fullName: 'Test Doctor',
      passwordHash,
      isActive: true,
    },
  });

  const admin = await prisma.admin.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      fullName: 'Admin User',
      passwordHash,
      isSuper: true,
      isActive: true,
    },
  });

  console.log({ doctor: { id: doctor.id, email: doctor.email }, admin: { id: admin.id, email: admin.email } });
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });