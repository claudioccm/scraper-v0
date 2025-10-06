# Installation & Setup

## Prerequisites

- **Node.js**: Version 18.x or higher
- **npm**: Version 9.x or higher (comes with Node.js)
- **Supabase Account**: For database and storage (optional for basic development)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd scraper-v0
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Supabase connection details
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_STORAGE_BUCKET=scraper

# Scraper authentication
# Keep SCRAPER_SECRET and NUXT_PUBLIC_SCRAPER_SECRET aligned
SCRAPER_SECRET=your_secret_key_here
NUXT_PUBLIC_SCRAPER_SECRET=your_secret_key_here

# Optional: Enable RSS scheduler (disabled by default in development)
RSS_SCHEDULER_ENABLED=false
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at **http://localhost:3000**

## Environment Variables Explained

### Supabase Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | Yes* | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes* | Supabase service role key (has admin privileges) |
| `SUPABASE_STORAGE_BUCKET` | No | Storage bucket name (defaults to `scraper`) |

*Required for persistence features. The app will run without Supabase but won't persist scraped content.

### Scraper Authentication

| Variable | Required | Description |
|----------|----------|-------------|
| `SCRAPER_SECRET` | No | Server-side secret for scraper API authentication |
| `NUXT_PUBLIC_SCRAPER_SECRET` | No | Client-side secret (should match `SCRAPER_SECRET`) |

⚠️ **Note**: Keep these values identical for proper server/client parity.

### RSS Scheduler

| Variable | Required | Description |
|----------|----------|-------------|
| `RSS_SCHEDULER_ENABLED` | No | Set to `true` to enable automated RSS checking (runs daily at 9:00 AM) |

## Available Commands

### Development

```bash
# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Generate static site
npm run generate
```

### Testing

```bash
# Run PDF scraping tests (custom script)
npm run test:pdfs
```

## Supabase Setup

If you're using the persistence features, you'll need to configure Supabase:

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and service role key

### 2. Create Storage Bucket

1. In Supabase dashboard, go to **Storage**
2. Create a new bucket named `scraper` (or your custom name)
3. Set bucket to **private** for security

### 3. Database Schema

Currently, the application uses Supabase primarily for storage. No specific database tables are required at this time, but future versions may require additional schema setup.

## Development Mode Features

When running in development (`npm run dev`), you get:

- **Hot Module Replacement (HMR)**: Instant updates without full page reload
- **DevTools**: Nuxt DevTools enabled for debugging
- **Detailed Errors**: Comprehensive error messages and stack traces
- **Auto-imports**: Components and composables auto-imported
- **Seed Data**: Workflow cards are seeded with demo data on startup

## Troubleshooting

### Port Already in Use

If port 3000 is already occupied:

```bash
# Use a different port
PORT=3001 npm run dev
```

### Module Not Found Errors

Clear the Nuxt cache and reinstall:

```bash
rm -rf .nuxt node_modules package-lock.json
npm install
npm run dev
```

### Supabase Connection Issues

Verify your environment variables:

```bash
# Check if .env file exists and is loaded
cat .env

# Test Supabase connection (you can use their client in a test script)
```

### TypeScript Errors

If you see TypeScript errors, try:

```bash
# Regenerate Nuxt types
npm run postinstall
```

## Next Steps

After setup, explore:

1. [**Architecture Overview**](architecture) - Understand the system design
2. [**Scraper Module**](modules/scraper) - Learn how scraping works
3. [**Workflow System**](frontend/workflow) - Understand the analyst/manager workflow
4. [**API Endpoints**](api/endpoints) - See available API routes

## Docker Setup (Future)

Docker support is planned but not yet implemented. This section will be updated when containerization is added.
