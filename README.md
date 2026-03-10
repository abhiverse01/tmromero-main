# Tmro Mero

A free, open-source community platform for young people to share resources, co-buy items, collaborate on projects, and build meaningful connections.

## 🌟 Features

- **Resource Sharing** - Share tools, equipment, books, and more with your community
- **Co-Buying** - Team up with others to purchase items in bulk at better prices
- **Project Collaboration** - Find collaborators for your projects or join exciting initiatives
- **Community Building** - Connect with like-minded individuals in your area

## 🚀 Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible UI components
- **Prisma** - Database ORM with SQLite
- **Zustand** - State management
- **NextAuth.js** - Authentication

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/tmro-mero.git
cd tmro-mero

# Install dependencies
bun install

# Set up the database
bun run db:push
bun run db:seed

# Start development server
bun run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

## 📁 Project Structure

```
src/
├── app/                 # Next.js App Router pages & API routes
│   ├── api/            # Backend API endpoints
│   └── page.tsx        # Main application page
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   └── features/       # Feature-specific components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and configurations
├── store/              # Zustand state management
└── types/              # TypeScript type definitions
```

## 🎨 Available Categories

- 📚 Books & Education
- 🛠️ Tools & Equipment
- 🎮 Gaming & Entertainment
- 👕 Clothing & Accessories
- 🏠 Home & Living
- 💻 Electronics & Tech
- 🎨 Hobbies & Crafts
- 🚗 Transport & Travel

## 🚀 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/tmro-mero)

1. Push your code to GitHub
2. Import the project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## 🔐 Admin Access

Default admin credentials (change in production):

- **Email**: admin@tmro-mero.com
- **Password**: admin123

## 📝 License

MIT License - feel free to use this project for your own community!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ for communities everywhere
