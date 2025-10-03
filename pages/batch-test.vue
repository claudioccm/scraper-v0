<template>
  <ccm-section>
    <div class="stack" data-space="xl">
      <h2>Scraper Batch Test Harness</h2>
      <form class="batch-form" @submit.prevent="onSubmit">
        <label class="field" for="scrape-urls">
          <span class="field__label">URLs to scrape</span>
          <textarea
            id="scrape-urls"
            v-model="urlsInput"
            class="field__input field__input--multiline"
            name="urls"
            rows="8"
            placeholder="https://example.com/article\nhttps://example.com/research.pdf"
            autocomplete="off"
            :disabled="isProcessing"
          ></textarea>
        </label>
        <p class="field__hint">
          Enter one URL per line. Blank lines and lines starting with <code>#</code> are ignored.
        </p>
        <p v-if="formError" class="field__error">{{ formError }}</p>
        <div class="actions">
          <ccm-button
            is="button"
            type="submit"
            variant="primary"
            color="primary"
            :disabled="isProcessing || !parsedInputCount"
          >
            {{ submitLabel }}
          </ccm-button>
          <ccm-button
            is="button"
            type="button"
            variant="ghost"
            color="primary"
            :disabled="isProcessing || !batchItems.length"
            @click="clearResults"
          >
            Clear results
          </ccm-button>
        </div>
      </form>

      <section v-if="batchItems.length" class="stack" data-space="m">
        <header class="stack" data-space="2xs">
          <h3>Batch progress</h3>
          <p>
            {{ processedCount }} / {{ totalCount }} processed
            <span v-if="runningCount">• {{ runningCount }} running</span>
            <span v-if="failedCount">• {{ failedCount }} failed</span>
          </p>
        </header>

        <div class="stack" data-space="m">
          <ScrapeResultCard
            v-for="(item, index) in batchItems"
            :key="item.id"
            :heading="`Request ${index + 1}`"
            heading-level="h4"
            :subheading="item.url"
            :request-status="item.status"
            :result="item.result"
            :is-busy="item.status === 'running'"
            :failure-message="item.message"
          />
        </div>
      </section>
    </div>
  </ccm-section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ScraperRequestStatus } from '~/types/scraper'

const { scrape } = useScraper()

type ScrapeResponse = Awaited<ReturnType<typeof scrape>>

interface BatchItem {
  id: string
  url: string
  status: ScraperRequestStatus
  result: ScrapeResponse | null
  message: string
}


const urlsInput = ref('')
const formError = ref('')
const batchItems = ref<BatchItem[]>([])
const isProcessing = ref(false)

const parsedInputCount = computed(() => parseUrlList(urlsInput.value).length)
const totalCount = computed(() => batchItems.value.length)
const processedCount = computed(() => batchItems.value.filter((item) => item.status === 'done' || item.status === 'failed').length)
const runningCount = computed(() => batchItems.value.filter((item) => item.status === 'running').length)
const failedCount = computed(() => batchItems.value.filter((item) => item.status === 'failed').length)

const submitLabel = computed(() => {
  if (!isProcessing.value) return 'Run batch'
  if (!totalCount.value) return 'Running…'
  return `Running… ${processedCount.value}/${totalCount.value}`
})

function parseUrlList(raw: string): string[] {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}


function clearResults() {
  if (isProcessing.value) return
  batchItems.value = []
}

async function onSubmit() {
  if (isProcessing.value) return
  formError.value = ''

  const urls = parseUrlList(urlsInput.value)
  if (!urls.length) {
    formError.value = 'Enter at least one http(s) URL.'
    return
  }

  const invalid = urls.filter((url) => !isHttpUrl(url))
  if (invalid.length) {
    formError.value = `Invalid URL: ${invalid[0]}`
    return
  }

  batchItems.value = urls.map((url, index) => ({
    id: `${Date.now()}-${index}`,
    url,
    status: 'queued',
    result: null,
    message: ''
  }))

  isProcessing.value = true
  try {
    await runBatch(batchItems.value)
  } finally {
    isProcessing.value = false
  }
}

async function runBatch(items: BatchItem[]) {
  for (const item of items) {
    item.status = 'running'
    item.message = ''
    item.result = null

    try {
      const data = await scrape(item.url.trim())
      item.result = data
      item.status = 'done'
    } catch (err: any) {
      const data = (err?.data ?? null) as ScrapeResponse | null
      if (data) {
        item.result = data
        item.status = 'done'
        item.message = data?.error?.message || err?.statusMessage || err?.message || ''
      } else {
        item.status = 'failed'
        item.message = err?.statusMessage || err?.message || 'Scrape request failed.'
      }
    }
  }
}

definePageMeta({
  hero: {
    brow: 'Internal tools',
    title: 'Batch scraper test view',
    tagline: 'Run the scraper module against multiple URLs and inspect each output.'
  }
})
</script>

<style scoped>
.batch-form {
  display: grid;
  gap: var(--space-m, 1.25rem);
  background: var(--surface-raised, #fff);
  padding: var(--space-l, 1.5rem);
  border-radius: 1rem;
  box-shadow: var(--shadow-l, 0 10px 30px rgba(0, 0, 0, 0.08));
}

.field {
  display: grid;
  gap: var(--space-xs, 0.5rem);
}

.field__label {
  font-weight: 600;
}

.field__input {
  width: 100%;
  padding: var(--space-s, 0.75rem);
  border: 1px solid var(--border-subtle, #d4d4d4);
  border-radius: 0.75rem;
  font: inherit;
}

.field__input:disabled {
  background: var(--surface-muted, #f3f3f3);
}

.field__input--multiline {
  min-height: 10rem;
  resize: vertical;
}

.field__hint {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-muted, #555);
}

.field__hint code {
  font-family: monospace;
  font-size: 0.85rem;
}

.field__error {
  margin: 0;
  color: var(--color-danger, #b00020);
  font-weight: 600;
}

.actions {
  display: flex;
  gap: var(--space-s, 0.75rem);
}

</style>
