#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import process from 'node:process'

const DEFAULT_LIST_PATH = '_process/links-pdfs.md'
const DEFAULT_BASE_URL = process.env.SCRAPER_BASE_URL || 'http://localhost:3000'
const SCRAPER_SECRET = process.env.SCRAPER_SECRET || process.env.NUXT_PUBLIC_SCRAPER_SECRET

function printUsage() {
  console.log(`Usage: node scripts/run-pdf-scrapes.mjs [options]\n\n` +
    `Options:\n` +
    `  --file <path>       Path to list of PDF URLs (default: ${DEFAULT_LIST_PATH})\n` +
    `  --base-url <url>    Base URL for scraper app (default: ${DEFAULT_BASE_URL})\n` +
    `  --help              Show this help message\n`)
}

function parseArgs(argv) {
  let listPath = DEFAULT_LIST_PATH
  let baseUrl = DEFAULT_BASE_URL

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]

    if (arg === '--help' || arg === '-h') {
      printUsage()
      process.exit(0)
    }

    if (arg === '--file' || arg === '-f') {
      listPath = argv[i + 1]
      i += 1
      continue
    }

    if (arg.startsWith('--file=')) {
      listPath = arg.slice('--file='.length)
      continue
    }

    if (arg === '--base-url') {
      baseUrl = argv[i + 1]
      i += 1
      continue
    }

    if (arg.startsWith('--base-url=')) {
      baseUrl = arg.slice('--base-url='.length)
      continue
    }

    if (!arg.startsWith('-') && listPath === DEFAULT_LIST_PATH) {
      listPath = arg
      continue
    }

    if (!arg.startsWith('-') && baseUrl === DEFAULT_BASE_URL) {
      baseUrl = arg
      continue
    }

    console.warn(`Unknown argument: ${arg}`)
  }

  return { listPath, baseUrl }
}

function normaliseBaseUrl(value) {
  return value.endsWith('/') ? value.slice(0, -1) : value
}

function cleanUrl(value) {
  const trimmed = value.trim()
  if (!trimmed || trimmed.startsWith('#')) return ''
  return trimmed
}

function formatResultRow(input) {
  const { url, ok, status, type, textLength, title, confidence, error } = input
  const summaryParts = []

  summaryParts.push(`status=${status}`)
  if (type) summaryParts.push(`type=${type}`)
  if (typeof confidence === 'number') summaryParts.push(`confidence=${Math.round(confidence * 100)}%`)
  if (typeof textLength === 'number') summaryParts.push(`text_len=${textLength}`)
  if (title) summaryParts.push(`title="${title.replace(/"/g, '\\"')}"`)

  const header = ok ? '[OK ]' : '[ERR]'
  return `${header} ${url}\n      ${summaryParts.join(' | ')}${error ? `\n      error=${error}` : ''}`
}

async function scrapeUrl(baseUrl, url) {
  const endpoint = `${normaliseBaseUrl(baseUrl)}/api/scrape`
  const body = JSON.stringify({ url })

  const headers = { 'content-type': 'application/json' }
  if (SCRAPER_SECRET) headers['authorization'] = `Bearer ${SCRAPER_SECRET}`

  let response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(60_000)
    })
  } catch (error) {
    return { ok: false, error: error.message || 'fetch failed' }
  }

  if (!response.ok) {
    return { ok: false, statusCode: response.status, statusText: response.statusText }
  }

  try {
    const data = await response.json()
    const text = (data?.content?.text || '').toString()
    return {
      ok: true,
      status: data?.status || 'unknown',
      type: data?.type,
      confidence: typeof data?.confidence === 'number' ? data.confidence : undefined,
      textLength: text.length,
      title: data?.metadata?.title || '',
      debugMethod: data?.debug?.method || null,
      data
    }
  } catch (error) {
    return { ok: false, error: error.message || 'invalid json' }
  }
}

async function readUrlList(listPath) {
  const content = await readFile(listPath, 'utf8')
  return content
    .split(/\r?\n/)
    .map(cleanUrl)
    .filter(Boolean)
}

async function main() {
  const { listPath, baseUrl } = parseArgs(process.argv.slice(2))

  console.log(`Running PDF scrape checks for list: ${listPath}`)
  console.log(`Using scraper base URL: ${normaliseBaseUrl(baseUrl)}`)
  if (SCRAPER_SECRET) console.log('Authorization header: enabled (SCRAPER_SECRET provided)')
  console.log('---')

  let urls
  try {
    urls = await readUrlList(listPath)
  } catch (error) {
    console.error(`Failed to read ${listPath}: ${error.message}`)
    process.exitCode = 1
    return
  }

  if (urls.length === 0) {
    console.warn('No URLs found in list. Nothing to test.')
    return
  }

  const summary = {
    total: 0,
    ok: 0,
    error: 0,
    byStatus: new Map(),
    byType: new Map()
  }

  for (const url of urls) {
    summary.total += 1
    const result = await scrapeUrl(baseUrl, url)

    if (!result.ok) {
      summary.error += 1
      const message = result.error || `${result.statusCode || '?'} ${result.statusText || ''}`.trim()
      console.log(formatResultRow({ url, ok: false, status: 'request_failed', error: message }))
      continue
    }

    summary.ok += 1
    const statusKey = result.status || 'unknown'
    summary.byStatus.set(statusKey, (summary.byStatus.get(statusKey) || 0) + 1)

    if (result.type) {
      summary.byType.set(result.type, (summary.byType.get(result.type) || 0) + 1)
    }

    console.log(formatResultRow({
      url,
      ok: true,
      status: result.status,
      type: result.type,
      confidence: result.confidence,
      textLength: result.textLength,
      title: result.title
    }))
  }

  console.log('---')
  console.log(`Total URLs: ${summary.total}`)
  console.log(`  Success: ${summary.ok}`)
  console.log(`  Errors : ${summary.error}`)

  if (summary.byStatus.size) {
    console.log('Status breakdown:')
    for (const [status, count] of summary.byStatus.entries()) {
      console.log(`  ${status}: ${count}`)
    }
  }

  if (summary.byType.size) {
    console.log('Type breakdown:')
    for (const [type, count] of summary.byType.entries()) {
      console.log(`  ${type}: ${count}`)
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
