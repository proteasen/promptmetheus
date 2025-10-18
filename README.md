# Promptmetheus - LLM Wrapper for Vibe Coding

A lightweight, minimal web application for rapid prototyping with AI assistance. Built with Next.js 14, TypeScript, Tailwind CSS, and LangChain.

## 🚀 Features

- **Multi-LLM Support**: OpenAI (GPT-4), Anthropic (Claude), Google (Gemini), Qwen
- **Real-time Code Generation**: Generate complete web applications from prompts
- **Token Tracking**: Monitor token usage and costs in real-time
- **File Attachments**: Upload images, code files, and designs (up to 3MB)
- **Project History**: Save and manage multiple projects
- **Admin Dashboard**: Analytics, user management, and usage metrics
- **Secure Authentication**: Kinde Auth with email OTP magic links
- **Rate Limiting**: Configurable daily token limits per user
- **Responsive Design**: Works on Chrome, Firefox, Safari, and Edge

## 📋 Prerequisites

- Node.js >= 20.11.0
- npm >= 10.0.0
- PostgreSQL database
- Supabase account
- Kinde account for authentication
- API keys for LLM providers (OpenAI, Claude, etc.)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd promptmetheus
```

### 2. Install dependencies

```bash
# Verify packages before installation (recommended)
./verify-packages.sh

# Install dependencies
npm install
```

### 3. Environment Setup

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

**Required Variables:**
- `POSTGRES_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `KINDE_CLIENT_ID` - Kinde client ID
- `KINDE_CLIENT_SECRET` - Kinde client secret
- `KINDE_ISSUER_URL` - Kinde issuer URL
- `OPENAI_API_KEY` - OpenAI API key (at minimum)

**Optional Variables:**
- `ANTHROPIC_API_KEY` - For Claude models
- `GOOGLE_AI_API_KEY` - For Gemini models
- `QWEN_API_KEY` - For Qwen models
- `ADMIN_EMAILS` - Comma-separated admin emails
- `DAILY_TOKEN_LIMIT` - Daily token limit per user (default: 100000)

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Or push schema directly (development)
npm run db:push
```

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
promptmetheus/
├── app/                      # Next.js 14 App Router
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── chats/          # Chat management
│   │   ├── generate-code/  # Code generation
│   │   └── admin/          # Admin endpoints
│   ├── admin/              # Admin dashboard
│   ├── auth/               # Auth pages
│   ├── chat-history/       # Chat history page
│   ├── editor/             # Code editor page
│   └── page.tsx            # Landing page
├── components/              # React components
│   ├── ui/                 # shadcn/ui components
│   ├── chat/               # Chat components
│   ├── editor/             # Editor components
│   └── landing/            # Landing page components
├── lib/                     # Utility libraries
│   ├── llm/                # LLM provider integrations
│   ├── supabase/           # Supabase client
│   ├── auth.ts             # Auth utilities
│   ├── db.ts               # Database client
│   └── langchain.ts        # LangChain configuration
├── prisma/                  # Database schema
│   └── schema.prisma       # Prisma schema
├── scripts/                 # Utility scripts
│   └── migrate.ts          # Migration script
├── .env.example            # Environment variables template
├── .npmrc                  # npm configuration
├── .nvmrc                  # Node version
├── verify-packages.sh      # Package verification script
└── package.json            # Dependencies

```

## 🔧 Configuration

### Authentication (Kinde)

1. Create a Kinde account at [kinde.com](https://kinde.com)
2. Create a new application
3. Configure callback URLs:
   - Allowed callback URLs: `http://localhost:3000/api/auth/kinde_callback`
   - Allowed logout redirect URLs: `http://localhost:3000`
4. Copy credentials to `.env`

### Database (Supabase + PostgreSQL)

1. Create a Supabase project
2. Get your connection string from Settings > Database
3. Add to `.env` as `POSTGRES_URL`
4. Run migrations: `npm run db:migrate`

### LLM Providers

Add API keys for the providers you want to use:
- **OpenAI**: Get key from [platform.openai.com](https://platform.openai.com)
- **Anthropic**: Get key from [console.anthropic.com](https://console.anthropic.com)
- **Google AI**: Get key from [makersuite.google.com](https://makersuite.google.com)

## 📝 Usage

### For Users

1. **Login**: Use email OTP authentication
2. **Create Project**: Enter a prompt describing what you want to build
3. **Attach Files**: Upload images, code, or designs for context
4. **Select Model**: Choose your preferred LLM
5. **Generate**: Click the up arrow to generate code
6. **Edit**: Click components to modify them with follow-up prompts
7. **Export**: Download your project as a ZIP file

### For Admins

1. Set your email in `ADMIN_EMAILS` environment variable
2. Access admin dashboard at `/admin`
3. View analytics, user management, and token usage
4. Manage API keys and system settings

## 🔒 Security Features

- **Package Integrity**: Verification script checks dependencies
- **Rate Limiting**: Configurable per-user token limits
- **Encrypted API Keys**: Keys stored encrypted in database
- **Audit Logging**: Track all system actions
- **Input Validation**: Zod schemas for all inputs
- **CORS Protection**: Configured for API routes
- **Session Management**: 30-minute timeout

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Update these in your deployment:
- Change `KINDE_SITE_URL` to your production URL
- Update `NEXT_PUBLIC_APP_URL`
- Set `NODE_ENV=production`
- Configure production database URL

## 📊 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run migrations
- `npm run db:studio` - Open Prisma Studio

## 🐛 Troubleshooting

### Prisma Client Not Generated

```bash
npm run db:generate
```

### Database Connection Issues

- Verify `POSTGRES_URL` in `.env`
- Check database is running
- Ensure IP is whitelisted in Supabase

### Authentication Issues

- Verify Kinde credentials
- Check callback URLs match
- Clear cookies and try again

### Missing Dependencies

```bash
rm -rf node_modules package-lock.json
npm install
```

## 📚 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Authentication**: Kinde Auth
- **LLM Framework**: LangChain.js
- **Deployment**: Vercel

## 🤝 Contributing

This is a private project. For issues or feature requests, contact the maintainer.

## 📄 License

Private - All rights reserved

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [LangChain Documentation](https://js.langchain.com/docs)
- [Kinde Documentation](https://kinde.com/docs)
- [Supabase Documentation](https://supabase.com/docs)

---

Built with ❤️ for rapid prototyping
