export interface ScraperFieldConfig {
  metaNames?: string[]
  metaProperties?: string[]
  regexes?: string[]
}

export interface PdfScraperConfig {
  focusSection?: string
  minSectionLength?: number
  maxSectionLength?: number
}

export interface SummaryGuidelineConfig {
  prompt: string
  maxLength: number
}

export interface DomainScraperConfig {
  title?: ScraperFieldConfig
  summary?: ScraperFieldConfig
  author?: ScraperFieldConfig
  publication?: ScraperFieldConfig
}

export interface ScraperConfig {
  summary: SummaryGuidelineConfig
  domains: Record<string, DomainScraperConfig>
  pdf?: PdfScraperConfig
}
