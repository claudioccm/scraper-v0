<template>
  <ccm-card class="stack" data-space="m" :aria-busy="isBusy" role="status">
    <template #image>&nbsp;</template>
    <header class="stack" data-space="2xs">
      <component :is="headingTag">
        {{ displayHeading }}
      </component>
      <p v-if="displaySubheading"><small>{{ displaySubheading }}</small></p>
    </header>

    <div class="cluster" data-space="xs">
      <strong>{{ requestStatusLabel }}</strong>
      <span v-if="resultStatusLabel">{{ resultStatusLabel }}</span>
      <span v-if="confidenceLabel">{{ confidenceLabel }}</span>
      <span v-if="typeLabel">{{ typeLabel }}</span>
      <span v-if="methodLabel">{{ methodLabel }}</span>
    </div>

    <div v-if="requestStatus === 'queued'" class="stack" data-space="2xs">
      <p>{{ queuedMessage }}</p>
    </div>

    <div v-else-if="requestStatus === 'running'" class="stack" data-space="2xs">
      <p>{{ runningMessage }}</p>
    </div>

    <template v-else-if="result">
      <div class="stack" data-space="2xs">
        <p v-if="siteLabel"><strong>{{ siteLabel }}</strong></p>
        <p v-if="result.metadata?.title">{{ result.metadata.title }}</p>
      </div>

      <section class="stack" data-space="2xs">
        <h5>Summary</h5>
        <p v-if="summary">{{ summary }}</p>
        <p v-else><em>Summary not available.</em></p>
      </section>

      <ul class="cluster | padding-left:0" data-space="s">
        <li v-for="item in metadataItems" :key="item.label">
          <span>
            <strong>{{ item.label }}:</strong>
            <template v-if="item.value">
              <a
                v-if="item.isLink"
                :href="item.href"
                target="_blank"
                rel="noopener"
              >
                {{ item.value }}
              </a>
              <span v-else>{{ item.value }}</span>
            </template>
            <em v-else>Not available</em>
          </span>
        </li>
      </ul>

      <details v-if="hasDebug" class="stack" data-space="2xs">
        <summary>Debug details</summary>
        <div class="stack" data-space="xs">
          <div v-if="debugTools.length" class="stack" data-space="2xs">
            <h5>Tools</h5>
            <ul class="stack" data-space="3xs">
              <li v-for="tool in debugTools" :key="tool">{{ tool }}</li>
            </ul>
          </div>
          <div v-if="debugAttempts.length" class="stack" data-space="2xs">
            <h5>Attempts</h5>
            <ul class="stack" data-space="3xs">
              <li v-for="(attempt, idx) in debugAttempts" :key="`${attempt.step}-${idx}`">
                <strong>{{ attempt.step }}</strong>
                <span v-if="attempt.detail"> — {{ attempt.detail }}</span>
              </li>
            </ul>
          </div>
          <div v-if="debugNotes.length" class="stack" data-space="2xs">
            <h5>Notes</h5>
            <ul class="stack" data-space="3xs">
              <li v-for="(note, idx) in debugNotes" :key="`note-${idx}`">{{ note }}</li>
            </ul>
          </div>
        </div>
      </details>

      <p v-if="result.error">
        <strong>Error:</strong> {{ result.error.message }}
      </p>
    </template>

    <div v-else-if="shouldShowFailure" class="stack" data-space="2xs">
      <p>
        <strong>{{ failureLabel }}</strong>
        <span>{{ failureMessage }}</span>
      </p>
    </div>

    <template #action>
      <div class="cluster" data-space="3xs">
        <ccm-button variant="secondary" split-left>Edit</ccm-button>
        <ccm-button variant="primary">Approve</ccm-button>
      </div>
    </template>
  </ccm-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ScrapeResult } from '~/modules/scraper/runtime/types'
import type { ScraperRequestStatus } from '~/types/scraper'

interface MetadataItem {
  label: string
  value: string
  isLink?: boolean
  href?: string
}

const props = withDefaults(defineProps<{
  heading: string
  headingLevel?: string
  subheading?: string
  requestStatus: ScraperRequestStatus
  result: ScrapeResult | null
  isBusy?: boolean
  queuedMessage?: string
  runningMessage?: string
  failureLabel?: string
  failureMessage?: string
}>(), {
  headingLevel: 'h3',
  subheading: '',
  result: null,
  isBusy: false,
  queuedMessage: 'Waiting to start…',
  runningMessage: 'Scraping…',
  failureLabel: 'Request failed:',
  failureMessage: ''
})

const headingTag = computed(() => {
  const level = props.headingLevel?.toLowerCase()
  const valid = ['h2', 'h3', 'h4', 'h5', 'h6']
  return valid.includes(level) ? (level as keyof HTMLElementTagNameMap) : 'h3'
})

const SUMMARY_CHAR_LIMIT = 400

const displayHeading = computed(() => {
  const title = props.result?.metadata?.title
  if (typeof title === 'string') {
    const normalized = normalizeWhitespace(title)
    if (normalized) return normalized
  }
  return props.heading
})

const displaySubheading = computed(() => {
  if (props.result) return ''
  return normalizeWhitespace(props.subheading || '')
})

const requestStatusLabel = computed(() => {
  switch (props.requestStatus) {
    case 'queued':
      return 'Queued'
    case 'running':
      return 'Running'
    case 'done':
      return 'Completed'
    case 'failed':
      return 'Request failed'
    default:
      return props.requestStatus
  }
})

const resultStatusLabel = computed(() => {
  const value = props.result?.status
  if (!value) return ''
  return value
    .replace(/_/g, ' ')
    .replace(/\b([a-z])/g, (_match, char: string) => char.toUpperCase())
})

const confidenceLabel = computed(() => {
  const confidence = props.result?.confidence
  if (typeof confidence !== 'number' || Number.isNaN(confidence)) return ''
  return `Confidence ${(confidence * 100).toFixed(0)}%`
})

const typeLabel = computed(() => {
  const type = props.result?.type
  if (!type) return ''
  return `Type ${type.toUpperCase()}`
})

const methodLabel = computed(() => {
  const method = props.result?.debug?.method
  if (!method) return ''
  return `Method ${method}`
})

const siteLabel = computed(() => {
  const siteName = props.result?.metadata?.siteName?.trim()
  if (siteName) return siteName
  const target = props.result?.normalizedUrl || props.result?.url
  if (!target) return ''
  try {
    const host = new URL(target).hostname
    return host.replace(/^www\./i, '')
  } catch {
    return ''
  }
})

const summary = computed(() => {
  const raw =
    props.result?.metadata?.summary ||
    props.result?.metadata?.description ||
    props.result?.content?.text

  if (!raw) return ''

  const normalized = normalizeWhitespace(raw)
  if (!normalized) return ''

  return normalized.length > SUMMARY_CHAR_LIMIT
    ? `${normalized.slice(0, SUMMARY_CHAR_LIMIT - 1)}…`
    : normalized
})

const metadataItems = computed<MetadataItem[]>(() => {
  const result = props.result
  const meta = result?.metadata ?? {}
  const items: MetadataItem[] = []

  const primaryUrl = result?.canonicalUrl || result?.normalizedUrl || result?.url || ''
  items.push({
    label: 'URL',
    value: primaryUrl,
    isLink: Boolean(primaryUrl),
    href: primaryUrl || undefined
  })

  items.push({ label: 'Author', value: meta.author || '' })

  items.push({
    label: 'Published',
    value: meta.publishDate ? formatDate(meta.publishDate) : ''
  })

  items.push({ label: 'Language', value: meta.language || '' })

  const publicationName = meta.siteName && meta.siteName !== siteLabel.value ? meta.siteName : ''
  items.push({ label: 'Publication', value: publicationName })

  return items
})

const debugTools = computed(() => props.result?.debug?.toolsUsed ?? [])
const debugAttempts = computed(() => props.result?.debug?.attempts ?? [])
const debugNotes = computed(() => props.result?.debug?.notes ?? [])

const hasDebug = computed(() => {
  return Boolean(debugTools.value.length || debugAttempts.value.length || debugNotes.value.length)
})

const shouldShowFailure = computed(() => {
  if (!props.failureMessage) return false
  return props.requestStatus === 'failed' || (!props.result && props.failureMessage)
})

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function formatDate(value: string) {
  const trimmed = value?.trim()
  if (!trimmed) return value
  const date = new Date(trimmed)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>
