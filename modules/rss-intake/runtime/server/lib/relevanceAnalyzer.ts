import type { RssFeedItem, RelevanceResult } from '../../types'

const RELEVANCE_THRESHOLD = 70

export function analyzeRelevance(item: RssFeedItem, criteria: string): RelevanceResult {
  if (!criteria || criteria.trim() === '') {
    return {
      isRelevant: true,
      score: 100,
      reason: 'No criteria specified - accepting all'
    }
  }

  // Extract keywords from criteria (split by AND, OR, commas)
  const keywords = extractKeywords(criteria)

  // Combine title and description for analysis
  const content = `${item.title} ${item.description || ''}`.toLowerCase()

  // Calculate relevance score based on keyword matches
  let matchCount = 0
  let totalKeywords = keywords.length

  for (const keyword of keywords) {
    if (content.includes(keyword.toLowerCase())) {
      matchCount++
    }
  }

  // Calculate score (0-100)
  const score = totalKeywords > 0
    ? Math.round((matchCount / totalKeywords) * 100)
    : 0

  const isRelevant = score >= RELEVANCE_THRESHOLD

  return {
    isRelevant,
    score,
    reason: isRelevant
      ? `Matched ${matchCount}/${totalKeywords} keywords`
      : `Only matched ${matchCount}/${totalKeywords} keywords (threshold: ${RELEVANCE_THRESHOLD})`
  }
}

function extractKeywords(criteria: string): string[] {
  // Split by AND, OR, commas, and clean up
  const keywords = criteria
    .split(/\s+AND\s+|\s+OR\s+|,/i)
    .map(k => k.trim())
    .filter(k => k.length > 0)

  // If no AND/OR/commas, split by spaces
  if (keywords.length === 1) {
    return criteria
      .split(/\s+/)
      .map(k => k.trim())
      .filter(k => k.length > 2) // Ignore very short words
  }

  return keywords
}
