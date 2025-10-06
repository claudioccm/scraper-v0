# Project Overview

## Purpose

Scraper-v0 is a comprehensive content intelligence platform designed to help teams discover, scrape, analyze, and curate web content efficiently. It combines automated content discovery through RSS feeds with on-demand web scraping and a structured workflow for content review and approval.

## Key Features

### 1. Multi-Format Web Scraping
The scraper module supports three primary content types:
- **HTML Pages**: Full webpage scraping with metadata extraction
- **PDF Documents**: Text extraction from PDF files
- **YouTube Videos**: Transcript and metadata extraction

### 2. RSS Feed Intelligence
- Automated RSS feed monitoring on a configurable schedule
- AI-powered relevance analysis using custom prompts
- Deduplication to avoid processing the same content twice
- Automatic creation of suggestion cards for relevant items

### 3. Workflow Management
A dual-role workflow system:

**Analyst Role**:
- Submit URLs for scraping
- Review and edit scraped content cards
- Send approved cards to managers

**Manager Role**:
- Review cards sent by analysts
- Shortlist important content
- Archive or save items for later

### 4. Data Persistence
- Integration with Supabase for reliable storage
- Storage of scraped content (HTML, text, metadata)
- Cloud storage bucket for file assets

## Use Cases

### Content Curation
Teams can efficiently curate relevant content from multiple sources:
1. RSS feeds automatically discover new content
2. Relevance analyzer filters for important items
3. Scraper extracts full content and metadata
4. Workflow ensures quality review before publication

### Research & Analysis
Researchers can:
- Scrape articles, papers (PDFs), and videos
- Store structured metadata for analysis
- Build a searchable knowledge base
- Track content through review stages

### Competitive Intelligence
Organizations can:
- Monitor competitor blogs via RSS
- Automatically flag relevant announcements
- Archive content with full metadata
- Maintain a historical record of changes

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Nuxt 3)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Analyst    │  │   Manager    │  │  Suggestions │      │
│  │     View     │  │     View     │  │     View     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Nitro)                         │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  /api/     │  │  /api/rss/   │  │  /api/cards/ │        │
│  │  scrape    │  │  check       │  │  CRUD        │        │
│  └────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       Core Modules                           │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  Scraper   │  │  RSS Intake  │  │ Persistence  │        │
│  │  Module    │  │    Module    │  │   (Supabase) │        │
│  └────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     External Services                        │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │  Supabase  │  │  RSS Feeds   │  │   YouTube    │        │
│  │  Database  │  │              │  │     API      │        │
│  └────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## Design Principles

### 1. Modularity
Each major feature (scraper, RSS intake, persistence) is implemented as a standalone Nuxt module that can be configured or disabled independently.

### 2. Extensibility
The scraper system is designed to support additional content types and extraction methods through configuration and domain-specific overrides.

### 3. Developer Experience
- Hot module replacement in development
- TypeScript support throughout
- Clear separation of concerns
- Composable-based architecture

### 4. Content Management
Uses Nuxt Content for file-based content, making documentation and static pages easy to manage without a database.

## Current Limitations

⚠️ **Development Status**: This is a work-in-progress. Known limitations include:

- **In-memory card storage**: Workflow cards are stored in memory (not persisted to database yet)
- **No authentication**: No user auth system implemented
- **RSS scheduler disabled by default**: Must set `RSS_SCHEDULER_ENABLED=true` to enable
- **Basic error handling**: Error handling could be more robust
- **Limited testing**: Test coverage is minimal
- **Client-side only**: SSR is disabled, limiting SEO capabilities

See the [Current Status](status) documentation for a complete list of what's implemented vs. in-progress.
