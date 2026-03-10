import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const categories = [
  { name: 'Books & Textbooks', icon: '📚', description: 'Share textbooks, novels, and educational materials' },
  { name: 'Tools & Equipment', icon: '🔧', description: 'Power tools, hand tools, and DIY equipment' },
  { name: 'Electronics', icon: '💻', description: 'Laptops, cameras, gadgets, and accessories' },
  { name: 'Courses & Learning', icon: '🎓', description: 'Online courses, tutorials, and learning resources' },
  { name: 'Travel & Trips', icon: '✈️', description: 'Plan group trips, share rides, and travel together' },
  { name: 'Projects & Ideas', icon: '💡', description: 'Collaborate on projects and share ideas' },
  { name: 'Study Groups', icon: '📖', description: 'Form study circles and exam prep groups' },
  { name: 'Sports & Fitness', icon: '⚽', description: 'Sports gear, gym equipment, and fitness partners' },
  { name: 'Events & Activities', icon: '🎉', description: 'Organize events and split costs' },
  { name: 'Other', icon: '📦', description: 'Everything else you want to share' },
]

// IMPORTANT: This hash function MUST match exactly the one in the login route
function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

async function main() {
  console.log('Seeding categories...')
  
  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    })
  }
  
  console.log('Categories seeded successfully!')
  
  // Create admin user
  console.log('Creating admin user...')
  const adminPassword = 'admin123'
  const adminPasswordHash = simpleHash(adminPassword)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tmro-mero.com' },
    update: {
      bio: `pwd:${adminPasswordHash}`,
      isAdmin: true,
      isVerified: true,
    },
    create: {
      email: 'admin@tmro-mero.com',
      name: 'Admin User',
      bio: `pwd:${adminPasswordHash}`,
      college: 'Platform Admin',
      isVerified: true,
      isAdmin: true,
      trustScore: 5.0,
    },
  })
  
  console.log('Admin user created:')
  console.log('  Email: admin@tmro-mero.com')
  console.log('  Password: admin123')
  console.log('  isAdmin:', admin.isAdmin)
  
  // Create demo users
  console.log('Creating demo users...')
  const demoPassword = 'demo123'
  const demoPasswordHash = simpleHash(demoPassword)
  
  const demoUsers = [
    { name: 'Alex Sharma', email: 'alex@college.edu', college: 'Tribhuvan University' },
    { name: 'Priya Thapa', email: 'priya@college.edu', college: 'Kathmandu University' },
    { name: 'Raj Kumar', email: 'raj@college.edu', college: 'Pulchowk Campus' },
  ]
  
  for (const demoUser of demoUsers) {
    await prisma.user.upsert({
      where: { email: demoUser.email },
      update: {
        bio: `pwd:${demoPasswordHash}`,
      },
      create: {
        email: demoUser.email,
        name: demoUser.name,
        bio: `pwd:${demoPasswordHash}`,
        college: demoUser.college,
        isVerified: true,
        trustScore: 4.5,
      },
    })
  }
  
  console.log('Demo users created with password: demo123')
  
  // Create demo posts
  console.log('Creating demo posts...')
  
  const booksCategory = await prisma.category.findFirst({ where: { name: 'Books & Textbooks' } })
  const electronicsCategory = await prisma.category.findFirst({ where: { name: 'Electronics' } })
  const travelCategory = await prisma.category.findFirst({ where: { name: 'Travel & Trips' } })
  const projectsCategory = await prisma.category.findFirst({ where: { name: 'Projects & Ideas' } })
  const studyCategory = await prisma.category.findFirst({ where: { name: 'Study Groups' } })
  
  if (booksCategory && electronicsCategory && travelCategory && projectsCategory && studyCategory) {
    const alexUser = await prisma.user.findUnique({ where: { email: 'alex@college.edu' } })
    const priyaUser = await prisma.user.findUnique({ where: { email: 'priya@college.edu' } })
    const rajUser = await prisma.user.findUnique({ where: { email: 'raj@college.edu' } })
    
    if (alexUser && priyaUser && rajUser) {
      // Check if posts already exist
      const existingPosts = await prisma.post.count()
      
      if (existingPosts === 0) {
        const demoPosts = [
          {
            title: 'Data Science Handbook - Group Purchase',
            description: 'Looking for 3 people to split the cost of the Data Science Handbook. This is a comprehensive guide covering Python, Machine Learning, and Data Visualization. We can share the digital copy.',
            type: 'CO_BUY' as const,
            itemName: 'Data Science Handbook',
            itemPrice: 120,
            maxParticipants: 4,
            location: 'Kathmandu',
            authorId: alexUser.id,
            categoryId: booksCategory.id,
            status: 'OPEN' as const,
          },
          {
            title: 'MacBook Pro M2 - Available for Rent',
            description: 'I have a MacBook Pro M2 that I rarely use. Available for rent on weekdays. Great for video editing, development work, or design projects. Must provide valid ID.',
            type: 'RENT' as const,
            itemName: 'MacBook Pro M2',
            itemPrice: 25,
            itemCondition: 'like_new',
            maxParticipants: 1,
            location: 'Lalitpur',
            authorId: priyaUser.id,
            categoryId: electronicsCategory.id,
            status: 'OPEN' as const,
          },
          {
            title: 'Pokhara Trip - Looking for Travel Buddies',
            description: 'Planning a 3-day trip to Pokhara next month. Looking for 4-5 people to share costs for accommodation and transportation. Adventure activities included!',
            type: 'TRIP' as const,
            itemName: 'Pokhara Adventure Trip',
            itemPrice: 500,
            maxParticipants: 5,
            location: 'Pokhara',
            authorId: rajUser.id,
            categoryId: travelCategory.id,
            status: 'OPEN' as const,
            isUrgent: true,
          },
          {
            title: 'Web Development Project Collaboration',
            description: 'Looking for frontend developers to collaborate on an open-source project. We\'re building a community platform for students. Experience with React/Next.js preferred.',
            type: 'PROJECT' as const,
            itemName: 'Community Platform',
            maxParticipants: 4,
            location: 'Remote',
            authorId: alexUser.id,
            categoryId: projectsCategory.id,
            status: 'OPEN' as const,
          },
          {
            title: 'Machine Learning Study Group',
            description: 'Forming a study group for Machine Learning fundamentals. We\'ll meet twice a week and work through Andrew Ng\'s course together. All levels welcome!',
            type: 'STUDY' as const,
            itemName: 'ML Study Circle',
            maxParticipants: 8,
            location: 'Online + Pulchowk Campus',
            authorId: priyaUser.id,
            categoryId: studyCategory.id,
            status: 'OPEN' as const,
          },
        ]
        
        for (const post of demoPosts) {
          await prisma.post.create({ data: post })
        }
        
        console.log('Demo posts created!')
      } else {
        console.log('Posts already exist, skipping...')
      }
    }
  }
  
  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
