import type { DomainScraperConfig, ScraperConfig, ScraperFieldConfig, SummaryGuidelineConfig } from './config.types'

const summaryGuideline: SummaryGuidelineConfig = {
  prompt:
    'Summarize the linked content in no more than 400 characters using a neutral newsroom tone. Highlight the primary subject, the key facts or findings, and any concrete outcomes or next steps while avoiding speculation or promotional language.',
  maxLength: 400
}

const defaultConfig: DomainScraperConfig = {
  title: {
    metaProperties: ['og:title', 'twitter:title'],
    regexes: ['<h1[^>]*>([^<]{8,})<\\/h1>']
  },
  summary: {
    metaNames: ['description'],
    metaProperties: ['og:description', 'twitter:description'],
    regexes: ['<p[^>]*>([^<]{40,})<\\/p>']
  },
  author: {
    metaNames: ['author'],
    metaProperties: ['article:author'],
    regexes: [
      '<[^>]*(?:class|id)="[^"]*(?:author|byline)[^"]*"[^>]*>([^<]{3,})<',
      '<span[^>]*itemprop="author"[^>]*>([^<]{3,})<'
    ]
  },
  publication: {
    metaProperties: ['og:site_name'],
    metaNames: ['application-name', 'publisher']
  }
}

export const scraperConfig: ScraperConfig = {
  summary: summaryGuideline,
  domains: {
    '*': defaultConfig,
    'www.sfexaminer.com': {
      author: {
        regexes: [
          '<span[^>]*class="[^"]*byline__name[^"]*"[^>]*>([^<]{3,})<',
          '<span[^>]*class="[^"]*author-name[^"]*"[^>]*>([^<]{3,})<'
        ]
      },
      summary: {
        regexes: [
          '<div[^>]*class="[^"]*article-body[^"]*"[^>]*>([\\s\\S]{120,}?<p[^>]*>[\\s\\S]*?)<\\/div>'
        ]
      }
    }
  }
}

export function getConfigForHost(hostname: string): DomainScraperConfig {
  const domainConfig = scraperConfig.domains[hostname] || {}
  return mergeDomainConfig(scraperConfig.domains['*'] || {}, domainConfig)
}

export function getSummaryConfig(): SummaryGuidelineConfig {
  return scraperConfig.summary
}

function mergeDomainConfig(base: DomainScraperConfig, override: DomainScraperConfig): DomainScraperConfig {
  return {
    title: mergeField(base.title, override.title),
    summary: mergeField(base.summary, override.summary),
    author: mergeField(base.author, override.author),
    publication: mergeField(base.publication, override.publication)
  }
}

function mergeField(base: ScraperFieldConfig | undefined, override: ScraperFieldConfig | undefined): ScraperFieldConfig | undefined {
  if (!base && !override) return undefined
  return {
    metaNames: dedupe([...(base?.metaNames || []), ...(override?.metaNames || [])]),
    metaProperties: dedupe([...(base?.metaProperties || []), ...(override?.metaProperties || [])]),
    regexes: dedupe([...(base?.regexes || []), ...(override?.regexes || [])])
  }
}

function dedupe(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)))
}

export type { ScraperFieldConfig, DomainScraperConfig }
