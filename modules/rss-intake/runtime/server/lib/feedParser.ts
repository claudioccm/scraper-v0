import type { RssFeedItem } from '../../types'

export async function parseFeed(feedUrl: string): Promise<RssFeedItem[]> {
  try {
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RSS-Intake/1.0)'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.status} ${response.statusText}`)
    }

    const xmlText = await response.text()
    const feedType = detectFeedType(xmlText)

    if (feedType === 'rss') {
      return parseRssFeed(xmlText)
    } else if (feedType === 'atom') {
      return parseAtomFeed(xmlText)
    } else {
      throw new Error('Unsupported feed format')
    }
  } catch (error: any) {
    console.error(`[RSS Parser] Error parsing feed ${feedUrl}:`, error.message)
    throw error
  }
}

function detectFeedType(xmlText: string): 'rss' | 'atom' | 'unknown' {
  if (xmlText.includes('<rss')) return 'rss'
  if (xmlText.includes('<feed') && xmlText.includes('xmlns="http://www.w3.org/2005/Atom"')) return 'atom'
  return 'unknown'
}

function parseRssFeed(xmlText: string): RssFeedItem[] {
  const items: RssFeedItem[] = []

  // Match all <item>...</item> blocks
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi
  const itemMatches = xmlText.matchAll(itemRegex)

  for (const match of itemMatches) {
    const itemContent = match[1]

    const guid = extractTag(itemContent, 'guid') || extractTag(itemContent, 'link') || ''
    const title = cleanText(extractTag(itemContent, 'title') || '')
    const link = extractTag(itemContent, 'link') || ''
    const description = cleanText(extractCDATA(itemContent, 'description') || extractTag(itemContent, 'description') || '')
    const pubDate = extractTag(itemContent, 'pubDate') || extractTag(itemContent, 'dc:date')
    const author = extractTag(itemContent, 'author') || extractTag(itemContent, 'dc:creator')

    if (guid && title && link) {
      items.push({
        guid,
        title,
        link,
        description,
        pubDate,
        author
      })
    }
  }

  return items
}

function parseAtomFeed(xmlText: string): RssFeedItem[] {
  const items: RssFeedItem[] = []

  // Match all <entry>...</entry> blocks
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi
  const entryMatches = xmlText.matchAll(entryRegex)

  for (const match of entryMatches) {
    const entryContent = match[1]

    const guid = extractTag(entryContent, 'id') || ''
    const title = cleanText(extractTag(entryContent, 'title') || '')
    const linkMatch = entryContent.match(/<link[^>]*href=["']([^"']+)["'][^>]*>/i)
    const link = linkMatch?.[1] || ''
    const summary = cleanText(extractTag(entryContent, 'summary') || extractTag(entryContent, 'content') || '')
    const published = extractTag(entryContent, 'published') || extractTag(entryContent, 'updated')
    const authorName = extractTag(entryContent.match(/<author>([\s\S]*?)<\/author>/i)?.[1] || '', 'name')

    if (guid && title && link) {
      items.push({
        guid,
        title,
        link,
        description: summary,
        pubDate: published,
        author: authorName
      })
    }
  }

  return items
}

function extractTag(content: string, tagName: string): string | undefined {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i')
  const match = content.match(regex)
  return match?.[1]?.trim()
}

function extractCDATA(content: string, tagName: string): string | undefined {
  const regex = new RegExp(`<${tagName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tagName}>`, 'i')
  const match = content.match(regex)
  return match?.[1]?.trim()
}

function cleanText(text: string): string {
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}
