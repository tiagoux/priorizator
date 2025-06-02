# ECBR Priorizacao

A comprehensive prioritization application for ECBR (European Central Bank Research) that helps teams manage and prioritize features, projects, and initiatives using various methodologies including RACI matrices.

## Features

- **User Authentication**: Secure login system powered by Supabase
- **Feature Management**: Create, edit, and organize features/initiatives
- **RACI Matrix**: Define roles and responsibilities for team members
- **Team Management**: Manage responsible teams and stakeholders
- **Priority Scoring**: Advanced prioritization algorithms
- **Responsive Design**: Modern UI built with React and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Supabase (PostgreSQL database + Auth)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (for database and authentication)

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
git clone git@github.com:tiagoux/priorizator.git
cd priorizator
npm install
```

### 2. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

### 3. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the API settings
3. Run the database migrations (located in `supabase/migrations/`)
4. Set up authentication providers as needed

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
├── app/                    # Next.js app directory
├── src/
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── lib/               # Utility libraries (Supabase config)
│   └── types.ts           # TypeScript type definitions
├── supabase/
│   └── migrations/        # Database migration files
└── public/                # Static assets
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and commit: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

This project is private and proprietary to ECBR. 