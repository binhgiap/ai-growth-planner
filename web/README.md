# AI Growth Planner - Frontend

Next.js 14 frontend application for AI Growth Planner platform.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

```bash
# Install dependencies
npm install
# or
pnpm install
```

### Development

```bash
# Start development server
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### Environment Variables

Create `.env.local` from `.env.local.example`:

```bash
cp .env.local.example .env.local
```

Configure:

```properties
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

### Build for Production

```bash
npm run build
npm run start
```

## 📁 Project Structure

```
web/
├── app/                 # Next.js App Router
│   ├── layout.tsx      # Root layout
│   ├── globals.css     # Global styles
│   ├── page.tsx        # Home page
│   └── dashboard/      # Dashboard pages
├── lib/                # Utility functions
│   └── api-client.ts   # API client setup
├── public/             # Static assets
├── tailwind.config.js  # Tailwind CSS config
├── tsconfig.json       # TypeScript config
└── package.json        # Dependencies
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Validation**: Zod

## 📝 Pages

- `/` - Home page
- `/dashboard` - Dashboard with progress tracking
- `/plan` - 6-month plan and OKRs
- `/reports` - HR evaluation reports

## 🔄 API Integration

Frontend communicates with NestJS backend via `NEXT_PUBLIC_API_URL`.

### API Client Usage

```typescript
import apiClient from '@/lib/api-client'

// GET request
const { data } = await apiClient.get('/users/profile')

// POST request
const { data } = await apiClient.post('/goals', { title: '...' })
```

## 🚀 Deployment on Render

See [RENDER_DEPLOYMENT_GUIDE.md](../RENDER_DEPLOYMENT_GUIDE.md) for detailed instructions.

### Environment Variables for Production

```properties
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NODE_ENV=production
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [React Hook Form](https://react-hook-form.com)
