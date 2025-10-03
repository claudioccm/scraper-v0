export type ScrapeType = 'auto' | 'html' | 'pdf' | 'youtube'

export interface ScrapeRequestOptions {
  timeoutMs?: number
  preferBrowser?: boolean
  languageHint?: string
  returnHtml?: boolean
  force?: boolean
}

export interface ScrapeRequest {
  url: string
  type?: ScrapeType
  options?: ScrapeRequestOptions
}

export interface ScrapeTranscript {
  lang: string
  text: string
}

export interface ScrapeResult {
  id: string
  type: 'html' | 'pdf' | 'youtube'
  url: string
  normalizedUrl: string
  canonicalUrl?: string
  ts: string
  status: 'ok' | 'blocked' | 'captcha' | 'error'
  confidence: number
  confidenceFactors: string[]
  content: {
    text: string
    html?: string
  }
  metadata: {
    title?: string
    description?: string
    summary?: string
    summaryGuideline?: string
    author?: string
    publishDate?: string
    siteName?: string
    language?: string
    images?: string[]
    channelName?: string
    tags?: string[]
    durationSeconds?: number
    transcripts?: ScrapeTranscript[]
  }
  storage?: {
    htmlPath?: string
    textPath?: string
    metaPath?: string
  }
  error?: { code: string; message: string }
  debug?: ScrapeDebugInfo
}

export interface ScrapeDebugInfo {
  method: string
  attempts: Array<{ step: string; detail?: string }>
  toolsUsed: string[]
  notes?: string[]
}
