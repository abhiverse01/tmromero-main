import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@tmro-mero.com' },
    update: {},
    create: {
      email: 'demo@tmro-mero.com',
      name: 'Demo User',
      college: 'Tribhuvan University',
      isVerified: true,
      trustScore: 4.5,
    },
  })

  console.log('✅ Created demo user:', demoUser.name)

  // Get categories
  const categories = await prisma.category.findMany()
  
  if (categories.length === 0) {
    console.log('❌ No categories found. Run the seed script first.')
    return
  }

  // Demo posts
  const demoPosts = [
    {
      title: 'Looking for people to share Data Science Handbook',
      description: 'I want to buy the "Hands-On Machine Learning" book. Looking for 2-3 people to share the cost and the book. We can rotate it among ourselves.',
      type: 'CO_BUY',
      itemName: 'Hands-On Machine Learning Book',
      itemPrice: 89.99,
      maxParticipants: 4,
      location: 'Kathmandu, Nepal',
      categoryId: categories.find(c => c.name.includes('Books'))?.id || categories[0].id,
      authorId: demoUser.id,
      isUrgent: true,
    },
    {
      title: 'Sharing my Camera Equipment for Weekend Trips',
      description: 'I have a DSLR camera with multiple lenses that I rarely use. Happy to lend it out for weekend trips or photography sessions. Small fee for maintenance.',
      type: 'RENT',
      itemName: 'Canon EOS R6 with Lenses',
      itemPrice: 15.00,
      itemCondition: 'like_new',
      maxParticipants: 1,
      location: 'Lalitpur, Nepal',
      categoryId: categories.find(c => c.name.includes('Electronics'))?.id || categories[0].id,
      authorId: demoUser.id,
      terms: 'Must return in same condition. Deposit required.',
    },
    {
      title: 'Planning a Trip to Pokhara - Join Us!',
      description: 'Planning a 3-day trip to Pokhara next month. Looking for travel buddies to share costs and make the trip more fun. We can rent a car together.',
      type: 'TRIP',
      itemName: 'Pokhara Trip',
      itemPrice: 200.00,
      maxParticipants: 6,
      location: 'Pokhara, Nepal',
      categoryId: categories.find(c => c.name.includes('Travel'))?.id || categories[0].id,
      authorId: demoUser.id,
      startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      endDate: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000),
      terms: 'Everyone shares transportation and accommodation costs equally.',
    },
    {
      title: 'Study Group for Web Development Course',
      description: 'Starting a study group for the freeCodeCamp Web Development certification. We\'ll meet twice a week to learn together and help each other.',
      type: 'STUDY',
      itemName: 'Web Development Study Group',
      maxParticipants: 10,
      location: 'Online / Kathmandu',
      categoryId: categories.find(c => c.name.includes('Study'))?.id || categories[0].id,
      authorId: demoUser.id,
      terms: 'Must commit to attending sessions regularly.',
    },
    {
      title: 'Power Tools Available for DIY Projects',
      description: 'I have a drill, sander, and other power tools available for borrowing. Great for weekend DIY projects.',
      type: 'SHARE',
      itemName: 'Power Tools Set',
      itemCondition: 'good',
      maxParticipants: 1,
      location: 'Bhaktapur, Nepal',
      categoryId: categories.find(c => c.name.includes('Tools'))?.id || categories[0].id,
      authorId: demoUser.id,
    },
    {
      title: 'Looking for Project Collaborators - Mobile App',
      description: 'Building a mobile app for local food delivery. Looking for developers, designers, and anyone interested in startups to collaborate.',
      type: 'PROJECT',
      itemName: 'Food Delivery App',
      maxParticipants: 5,
      location: 'Remote / Kathmandu',
      categoryId: categories.find(c => c.name.includes('Project'))?.id || categories[0].id,
      authorId: demoUser.id,
      terms: 'Equity split based on contribution.',
    },
  ]

  for (const post of demoPosts) {
    const created = await prisma.post.create({
      data: post,
    })
    console.log('✅ Created post:', created.title)
  }

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
