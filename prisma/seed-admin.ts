import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Creating admin user...')

  // Create admin user with specific credentials
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@tmro-mero.com' },
    update: {},
    create: {
      email: 'admin@tmro-mero.com',
      name: 'Admin',
      college: 'tmro-mero Platform',
      isVerified: true,
      isAdmin: true,
      trustScore: 5.0,
      bio: 'pwd:-44248b8d', // Password: admin123
    },
  })

  console.log('✅ Admin user created!')
  console.log('📧 Email: admin@tmro-mero.com')
  console.log('🔑 Password: admin123')
  console.log('')
  console.log('⚠️  IMPORTANT: Change these credentials in production!')
}

main()
  .catch((e) => {
    console.error('❌ Failed to create admin user:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
