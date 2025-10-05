<template>
  <ccm-card
    class="stack"
    data-space="m"
    :style="cardStyles"
    :aria-busy="isBusy || isEditSaving"
    role="status"
  >
    <template #image>&nbsp;</template>
    <header class="stack" data-space="2xs">
      <component :is="headingTag">
        {{ displayHeading }}
      </component>
      <p v-if="displaySubheading"><small>{{ displaySubheading }}</small></p>
    </header>

    <div v-if="requestStatus === 'queued'" class="stack" data-space="2xs">
      <p>{{ queuedMessage }}</p>
    </div>

    <div v-else-if="requestStatus === 'running'" class="stack" data-space="2xs">
      <p>{{ runningMessage }}</p>
    </div>

    <template v-else-if="result">
      <div class="stack" data-space="2xs">
        <p v-if="siteLabel"><strong>{{ siteLabel }}</strong></p>
      </div>

      <ul class="cluster | padding-left:0" data-space="s">
        <li v-for="item in metadataItems" :key="item.label">
          <span :class="{ 'color:fail-100-tint': !item.value }">
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

      <section class="stack" data-space="2xs">
        <h5>Content preview</h5>
        <div
          v-if="isEditing"
          ref="contentEditable"
          class="editable-field editable-field--multiline"
          contenteditable="true"
          role="textbox"
          aria-multiline="true"
          aria-label="Edit content preview"
          spellcheck="true"
          data-placeholder="Add content…"
          @input="handleContentInput"
        ></div>
        <p v-else-if="textPreview">{{ textPreview }}</p>
        <p v-else class="color:fail-100-tint"><em>Content preview unavailable.</em></p>
      </section>
      <p v-if="result.error">
        <strong>Error:</strong> {{ result.error.message }}
      </p>

      <p v-if="editError" class="edit-error">{{ editError }}</p>
    </template>

    <div v-else-if="shouldShowFailure" class="stack" data-space="2xs">
      <p>
        <strong>{{ failureLabel }}</strong>
        <span>{{ failureMessage }}</span>
      </p>
    </div>

    <template #action>
      <slot name="action">
        <div class="cluster" data-space="s">
          <div class="stack">
          <div class="cluster" data-space="3xs">
            <ccm-chip
              :label="requestStatusLabel"
              :status="requestStatusChipStatus"
            >
              {{ requestStatusLabel }}
            </ccm-chip>
            <ccm-chip
              v-if="resultStatusLabel"
              :label="resultStatusLabel"
              :status="resultStatusChipStatus"
            >
              {{ resultStatusLabel }}
            </ccm-chip>
            <ccm-chip
              v-if="confidenceLabel"
              :label="confidenceLabel"
              color="info"
            >
              {{ confidenceLabel }}
            </ccm-chip>
            <ccm-chip
              v-if="typeLabel"
              :label="typeLabel"
              color="secondary"
            >
              {{ typeLabel }}
            </ccm-chip>
            <ccm-chip
              v-if="methodLabel"
              :label="methodLabel"
              color="accent"
            >
              {{ methodLabel }}
            </ccm-chip>
          </div>

          <details v-if="result && hasDebug" class="stack" data-space="2xs">
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
        </div>

          <div class="cluster" data-space="3xs" split-left>
            <div v-if="hasAdditionalActions && !isEditing" class="card-action__extras">
              <slot name="actions" />
            </div>
            <template v-if="isEditing">
              <ccm-button
                variant="secondary"
                :disabled="isEditSaving"
                @click="cancelEditing"
              >
                Cancel
              </ccm-button>
              <ccm-button
                variant="primary"
                :disabled="isEditSaving"
                @click="saveEditing"
              >
                {{ isEditSaving ? 'Saving…' : 'Save' }}
              </ccm-button>
            </template>
            <template v-else>
              <ccm-button
                variant="secondary"
                :disabled="!canEdit"
                @click="startEditing"
              >
                Edit
              </ccm-button>
              <ccm-button
                v-if="showApproveButton"
                variant="primary"
                @click="emit('approve')"
              >
                {{ approveButtonText }}
              </ccm-button>
            </template>
          </div>
        </div>
      </slot>
    </template>
  </ccm-card>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, useSlots, watch } from 'vue'
import { useScraper } from '~/modules/scraper/runtime/composables/useScraper'
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
  approveLabel?: string
  showApproveButton?: boolean
}>(), {
  headingLevel: 'h3',
  subheading: '',
  result: null,
  isBusy: false,
  queuedMessage: 'Waiting to start…',
  runningMessage: 'Scraping…',
  failureLabel: 'Request failed:',
  failureMessage: '',
  approveLabel: 'Approve',
  showApproveButton: true
})

const emit = defineEmits<{
  (e: 'edit-save', value: ScrapeResult): void
  (e: 'approve'): void
}>()

const { update: updateResult } = useScraper()

const slots = useSlots()

const approveButtonText = computed(() => props.approveLabel || 'Approve')
const showApproveButton = computed(() => props.showApproveButton)

const cardStyles = computed(() => ({
  '--theme-stack-space': '0'
}))

type ChipStatus = 'success' | 'warning' | 'fail'

const isEditing = ref(false)
const isEditSaving = ref(false)
const editError = ref('')
const contentEditable = ref<HTMLElement | null>(null)
const editedContent = ref('')

const canEdit = computed(() => Boolean(props.result))
const hasAdditionalActions = computed(() => Boolean(slots.actions))

const HEADING_CHAR_LIMIT = 160
const SUBHEADING_CHAR_LIMIT = 200
const SITE_LABEL_CHAR_LIMIT = 120
const METADATA_VALUE_CHAR_LIMIT = 200
const TEXT_PREVIEW_CHAR_LIMIT = 600

watch(
  () => props.result,
  (next) => {
    if (next && !isEditing.value) {
      editedContent.value = next.content?.text || ''
    }
  },
  { immediate: true }
)

watch(isEditing, async (value) => {
  if (!value) return
  editError.value = ''
  const current = props.result
  editedContent.value = current?.content?.text || ''
  await nextTick()
  if (contentEditable.value) contentEditable.value.textContent = editedContent.value
})

const headingTag = computed(() => {
  const level = props.headingLevel?.toLowerCase()
  const valid = ['h2', 'h3', 'h4', 'h5', 'h6']
  return valid.includes(level) ? (level as keyof HTMLElementTagNameMap) : 'h3'
})

const displayHeading = computed(() => {
  const formatted = formatCardText(props.result?.metadata?.title, HEADING_CHAR_LIMIT)
  if (formatted) return formatted
  return formatCardText(props.heading, HEADING_CHAR_LIMIT) || props.heading
})

const displaySubheading = computed(() => {
  if (props.result) return ''
  return formatCardText(props.subheading, SUBHEADING_CHAR_LIMIT)
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

const requestStatusChipStatus = computed<ChipStatus | null>(() => {
  switch (props.requestStatus) {
    case 'done':
      return 'success'
    case 'failed':
      return 'fail'
    case 'queued':
    case 'running':
      return 'warning'
    default:
      return null
  }
})

const resultStatusValue = computed(() => props.result?.status || '')

const resultStatusChipStatus = computed<ChipStatus | null>(() => {
  switch (resultStatusValue.value) {
    case 'ok':
      return 'success'
    case 'blocked':
    case 'captcha':
      return 'warning'
    case 'error':
      return 'fail'
    default:
      return null
  }
})

const resultStatusLabel = computed(() => {
  const value = resultStatusValue.value
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
  const siteName = formatCardText(props.result?.metadata?.siteName, SITE_LABEL_CHAR_LIMIT)
  if (siteName) return siteName
  const target = props.result?.normalizedUrl || props.result?.url
  if (!target) return ''
  try {
    const host = new URL(target).hostname.replace(/^www\./i, '')
    return formatCardText(host, SITE_LABEL_CHAR_LIMIT)
  } catch {
    return ''
  }
})

const textPreview = computed(() => {
  const raw = props.result?.content?.text
  if (!raw) return ''
  const normalized = normalizeWhitespace(raw)
  return clampNormalized(normalized, TEXT_PREVIEW_CHAR_LIMIT)
})

const metadataItems = computed<MetadataItem[]>(() => {
  const result = props.result
  const meta = result?.metadata ?? {}
  const items: MetadataItem[] = []

  const primaryUrl = result?.canonicalUrl || result?.normalizedUrl || result?.url || ''
  items.push({
    label: 'URL',
    value: formatCardText(primaryUrl, METADATA_VALUE_CHAR_LIMIT),
    isLink: Boolean(primaryUrl),
    href: primaryUrl || undefined
  })

  items.push({ label: 'Author', value: formatCardText(meta.author, METADATA_VALUE_CHAR_LIMIT) })

  const published = meta.publishDate ? formatDate(meta.publishDate) : ''
  items.push({
    label: 'Published',
    value: formatCardText(published, METADATA_VALUE_CHAR_LIMIT)
  })

  items.push({ label: 'Language', value: formatCardText(meta.language, METADATA_VALUE_CHAR_LIMIT) })

  const publicationName = meta.siteName && meta.siteName !== siteLabel.value ? meta.siteName : ''
  items.push({ label: 'Publication', value: formatCardText(publicationName, METADATA_VALUE_CHAR_LIMIT) })

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

function handleContentInput() {
  editedContent.value = contentEditable.value?.innerText || ''
}

function startEditing() {
  if (!props.result) return
  isEditing.value = true
}

function cancelEditing() {
  isEditing.value = false
  editError.value = ''
}

async function saveEditing() {
  if (!props.result) return

  editedContent.value = contentEditable.value?.innerText || ''

  isEditSaving.value = true
  editError.value = ''

  const base = props.result
  const updated: ScrapeResult = {
    ...base,
    content: {
      ...base.content,
      text: editedContent.value
    },
    metadata: {
      ...base.metadata
    }
  }

  try {
    const saved = await updateResult(updated, { includeHtml: Boolean(base.content?.html) })
    emit('edit-save', saved)
    isEditing.value = false
  } catch (error: any) {
    const message = error?.data?.message || error?.message || 'Failed to save changes.'
    editError.value = message
  } finally {
    isEditSaving.value = false
  }
}

function formatCardText(value: string | undefined | null, limit: number) {
  if (typeof value !== 'string') return ''
  const normalized = normalizeWhitespace(value)
  return clampNormalized(normalized, limit)
}

function clampNormalized(value: string, limit: number) {
  if (!value) return ''
  if (value.length <= limit) return value
  return `${value.slice(0, limit - 1)}…`
}

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

<style scoped>
.editable-field {
  border: 1px solid var(--color-neutral-60, #ccc);
  border-radius: var(--border-radius-s, 6px);
  padding: var(--space-2xs, 0.5rem);
  min-height: 2.5rem;
  background: var(--color-white, #fff);
  line-height: 1.5;
  cursor: text;
}

.editable-field:focus-visible {
  outline: 2px solid var(--color-primary, #0070f3);
  outline-offset: 2px;
}

.editable-field:empty::before {
  content: attr(data-placeholder);
  color: var(--color-neutral-50, #888);
}

.editable-field--multiline {
  min-height: 8rem;
  white-space: pre-wrap;
}

.edit-error {
  color: var(--color-danger-60, #b00020);
}

.card-action__extras {
  display: contents;
}
</style>
