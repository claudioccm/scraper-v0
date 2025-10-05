# Scraper LLM Analysis

## Current Implementation (v0)

**The scraper does NOT currently use LLMs.** All content extraction is done via:

### Extraction Methods

1. **HTML Metadata Extraction** - [scrape.post.ts:514-533](modules/scraper/runtime/server/api/scrape.post.ts#L514)
   - Parses `<meta>` tags (Open Graph, Twitter Cards)
   - Extracts `<title>`, `<link rel="canonical">`
   - Uses regex patterns for structured data

2. **Configured Field Extraction** - [config.ts](modules/scraper/runtime/config.ts)
   - Domain-specific regex patterns (e.g., SF Examiner author selector)
   - Fallback to default patterns for unknown domains
   - Priority: meta names → meta properties → custom regexes

3. **Text Summarization** - [scrape.post.ts:966-971](modules/scraper/runtime/server/api/scrape.post.ts#L966)
   ```typescript
   function createSummaryFromText(text: string) {
     const normalized = normalizeForSummary(text)
     const words = normalized.split(/\s+/).slice(0, SUMMARY_WORD_LIMIT) // ~60 words
     return sanitizeSummary(words.join(' '))
   }
   ```
   - **No LLM used** - just takes first ~60 words
   - Applies text normalization (spacing, weird chars)
   - Truncates to 400 chars max

### Summary Guideline Config

The `summaryGuideline` in [config.ts:3-7](modules/scraper/runtime/config.ts#L3) is **metadata only**:

```typescript
const summaryGuideline: SummaryGuidelineConfig = {
  prompt: 'Summarize the linked content in no more than 400 characters...',
  maxLength: 400
}
```

- Stored with scrape results as `metadata.summaryGuideline`
- **Not sent to any LLM** - just documents the intended summary style
- Could be used in future LLM integration

## Future LLM Integration

For RSS intake and improved scraping, we need:

1. **Multi-Provider LLM Configuration** (see [rss-intake.md](../_process/specs/rss-intake.md))
   - Support: OpenAI, Anthropic, Google, DeepSeek, GLM, Llama, etc.
   - Configurable API endpoints and keys
   - Cost-optimized model selection

2. **Use Cases**
   - **RSS Relevance Analysis**: Score RSS items against system prompts
   - **Enhanced Summarization**: Use LLM for better summaries (optional)
   - **Content Classification**: Auto-tag articles by topic

3. **Implementation Pattern**
   - Create `modules/llm-provider` module
   - Config file: `config/llm-providers.yaml`
   - Abstract interface for different providers
   - Fallback to current regex-based extraction if LLM unavailable
