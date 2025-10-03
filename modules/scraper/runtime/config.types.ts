export interface ScraperFieldConfig {
  metaNames?: string[]
  metaProperties?: string[]
  regexes?: string[]
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
}
