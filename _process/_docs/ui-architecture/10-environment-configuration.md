# 10. Environment Configuration

## Required Environment Variables

```bash
# .env.example - Template for all environments

# =============================================================================
# APPLICATION CONFIGURATION
# =============================================================================

# Application URL (used for SSR, meta tags, and API calls)
NUXT_PUBLIC_APP_URL=http://localhost:3000

# App environment (development, staging, production)
NUXT_ENV=development

# =============================================================================
# API CONFIGURATION  
# =============================================================================

# API base URL for server-side calls
NUXT_API_BASE_URL=http://localhost:3000/api

# Public API base URL for client-side calls  
NUXT_PUBLIC_API_BASE_URL=/api

# API version for versioned endpoints
NUXT_PUBLIC_API_VERSION=v1

# API rate limiting (requests per minute)
NUXT_API_RATE_LIMIT=60

# =============================================================================
# CONTENT MANAGEMENT
# =============================================================================

# Nuxt Content configuration
NUXT_CONTENT_BASE_URL=/content

# Enable content indexing for search
NUXT_PUBLIC_CONTENT_SEARCH_ENABLED=true

# Content cache TTL in seconds (3600 = 1 hour)
NUXT_CONTENT_CACHE_TTL=3600

# =============================================================================
# THIRD-PARTY INTEGRATIONS
# =============================================================================

# Google Analytics Measurement ID
NUXT_PUBLIC_GOOGLE_ANALYTICS_ID=

# Vimeo API configuration (for video components)
NUXT_PUBLIC_VIMEO_API_KEY=
NUXT_VIMEO_CLIENT_SECRET=

# YouTube API configuration  
NUXT_PUBLIC_YOUTUBE_API_KEY=

# =============================================================================
# SECURITY CONFIGURATION
# =============================================================================

# JWT secret for authentication (generate with: openssl rand -base64 32)
NUXT_JWT_SECRET=

# Session secret for server-side sessions
NUXT_SESSION_SECRET=

# CORS allowed origins (comma-separated)
NUXT_CORS_ORIGINS=http://localhost:3000

# Content Security Policy nonce
NUXT_CSP_NONCE=

# =============================================================================
# DATABASE & CACHE (if applicable)
# =============================================================================

# Database connection string
NUXT_DATABASE_URL=

# Redis URL for caching/sessions
NUXT_REDIS_URL=

# =============================================================================
# EMAIL & NOTIFICATIONS  
# =============================================================================

# Email service configuration
NUXT_EMAIL_SERVICE_API_KEY=
NUXT_EMAIL_FROM_ADDRESS=noreply@yoursite.com

# =============================================================================
# MONITORING & ANALYTICS
# =============================================================================

# Error tracking (Sentry, Bugsnag, etc.)
NUXT_PUBLIC_SENTRY_DSN=

# Performance monitoring
NUXT_PUBLIC_PERFORMANCE_MONITORING=false

# =============================================================================
# DEVELOPMENT & DEBUGGING
# =============================================================================

# Enable detailed error reporting in development
NUXT_DEBUG=false

# Enable Vue DevTools in production builds
NUXT_PUBLIC_VUE_DEVTOOLS=false

# Log level (silent, error, warn, info, debug, trace)
NUXT_LOG_LEVEL=info
```

## Environment Management Utilities

```typescript
// utils/env.ts
interface EnvironmentConfig {
  isDevelopment: boolean
  isProduction: boolean
  isTest: boolean
  apiUrl: string
  appUrl: string
  logLevel: string
}

export const useEnvironment = (): EnvironmentConfig => {
  const config = useRuntimeConfig()
  
  return {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production', 
    isTest: process.env.NODE_ENV === 'test',
    apiUrl: config.public.apiBaseUrl,
    appUrl: config.public.appUrl,
    logLevel: process.env.NUXT_LOG_LEVEL || 'info'
  }
}

// Composable for feature flags
export const useFeatureFlags = () => {
  const config = useRuntimeConfig()
  
  return {
    contentSearchEnabled: config.public.contentSearchEnabled,
    performanceMonitoring: config.public.performanceMonitoring,
    analyticsEnabled: !!config.public.googleAnalyticsId,
    errorTrackingEnabled: !!config.public.sentryDsn
  }
}

// Environment validation utility
export const validateEnvironment = () => {
  const requiredEnvVars = [
    'NUXT_PUBLIC_APP_URL',
    'NUXT_JWT_SECRET'
  ]
  
  const missingVars = requiredEnvVars.filter(
    envVar => !process.env[envVar]
  )
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    )
  }
}
```

**Key Conventions:**
- **`NUXT_`** prefix for server-side only variables
- **`NUXT_PUBLIC_`** prefix for client-accessible variables  
- **Validation on startup** to catch configuration issues early
- **Environment-specific overrides** in nuxt.config.ts
- **Feature flags** for progressive rollouts and A/B testing
- **Security by default** - secrets never exposed to client

---
