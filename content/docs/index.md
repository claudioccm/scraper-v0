# Documentation Home

Welcome to the Scraper-v0 project documentation. This documentation covers all aspects of the project including architecture, modules, API endpoints, and development workflows.

## Quick Navigation

### Getting Started
- [**Project Overview**](overview) - Understanding the project's purpose and current state
- [**Installation & Setup**](setup) - How to get the project running locally
- [**Architecture**](architecture) - System design and component relationships

### Core Modules
- [**Scraper Module**](modules/scraper) - Web scraping functionality for HTML, PDF, and YouTube
- [**RSS Intake Module**](modules/rss-intake) - Automated RSS feed processing and relevance analysis
- [**Persistence Module**](modules/persistence) - Supabase integration for data storage

### Frontend
- [**Pages & Routes**](frontend/pages) - Application pages and routing structure
- [**Components**](frontend/components) - Reusable Vue components
- [**Workflow System**](frontend/workflow) - Analyst and Manager card workflows

### Backend
- [**API Endpoints**](api/endpoints) - Server API routes and usage
- [**Server Utils**](api/server-utils) - Shared server-side utilities

### Development
- [**Current Status**](status) - What's implemented and what's in progress
- [**Future Roadmap**](roadmap) - Planned features and improvements
- [**Contributing**](contributing) - Development guidelines and best practices

## Project at a Glance

**Scraper-v0** is a Nuxt 3 application that combines web scraping capabilities with an intelligent workflow system for content analysis. The project enables:

- **Multi-format scraping**: HTML pages, PDFs, and YouTube videos
- **Automated RSS monitoring**: Scheduled RSS feed checking with AI-powered relevance filtering
- **Workflow management**: Analyst → Manager approval pipeline for curated content
- **Persistent storage**: Supabase integration for scraped data and metadata

## Tech Stack

- **Framework**: Nuxt 3 with Vue 3 Composition API
- **Rendering**: Client-side rendering (SSR disabled, experimental client fallback enabled)
- **Database**: Supabase (PostgreSQL + Storage)
- **Content**: Nuxt Content module for file-based content
- **Styling**: Custom CSS with CSS layers architecture
- **Scraping**: Puppeteer/Playwright support with PDF parsing

## Current Development Status

⚠️ **This project is in active development.** Many features are functional but not finalized. See [Current Status](status) for details on what's implemented and what's being worked on.
