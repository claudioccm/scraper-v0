<template>
  <ccm-section>
    <div class="stack">
      <h2>Scraper Test Harness</h2>
      <form class="scrape-form" @submit.prevent="onSubmit">
        <label class="field" for="scrape-url">
          <span class="field__label">URL to scrape</span>
          <input
            id="scrape-url"
            v-model="url"
            class="field__input"
            type="url"
            name="url"
            placeholder="https://example.com/article"
            autocomplete="off"
            required
          />
        </label>
        <p v-if="validationError" class="field__error">{{ validationError }}</p>
        <div class="actions">
          <ccm-button
            is="button"
            type="submit"
            variant="primary"
            color="primary"
            :disabled="!isUrlValid || isLoading"
          >
            {{ isLoading ? 'Scraping…' : 'Scrape URL' }}
          </ccm-button>
        </div>
      </form>
      <ScrapeResultCard
        v-if="showCard"
        heading="Latest run"
        heading-level="h3"
        :subheading="result?.normalizedUrl || ''"
        :request-status="requestStatus"
        :result="result"
        :is-busy="isLoading"
        failure-label="Scrape failed:"
        :failure-message="scrapeError"
      />
    </div>
  </ccm-section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ScraperRequestStatus } from '~/types/scraper'

const { scrape } = useScraper()

type ScrapeResponse = Awaited<ReturnType<typeof scrape>>

const url = ref('')
const result = ref<ScrapeResponse | null>(null)
const isLoading = ref(false)
const validationError = ref('')
const scrapeError = ref('')
const submitted = ref(false)
const requestStatus = ref<ScraperRequestStatus>('done')

const isUrlValid = computed(() => {
  const value = url.value.trim()
  if (!value) return false
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
})

const showCard = computed(() => submitted.value && (isLoading.value || Boolean(result.value) || Boolean(scrapeError.value)))

const onSubmit = async () => {
  validationError.value = ''
  scrapeError.value = ''

  if (!isUrlValid.value) {
    validationError.value = 'Enter a valid http(s) URL.'
    submitted.value = false
    requestStatus.value = 'done'
    return
  }

  submitted.value = true
  requestStatus.value = 'running'
  isLoading.value = true
  result.value = null

  try {
    const data = await scrape(url.value.trim())
    result.value = data
    requestStatus.value = 'done'
  } catch (err: any) {
    const data = (err?.data ?? null) as ScrapeResponse | null
    if (data) {
      result.value = data
      requestStatus.value = 'done'
    } else {
      requestStatus.value = 'failed'
    }

    const message = data?.error?.message || err?.statusMessage || err?.message || 'Scrape request failed.'
    scrapeError.value = message
  } finally {
    isLoading.value = false
  }
}

definePageMeta({
  hero: {
    brow: 'Internal tools',
    title: 'Scraper test view',
    tagline: 'Run the scraper module against a specific URL and inspect the output.'
  }
})
</script>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-l, 1.5rem);
  max-width: 720px;
}

.scrape-form {
  display: grid;
  gap: var(--space-m, 1rem);
}

.field {
  display: grid;
  gap: var(--space-2xs, 0.5rem);
}

.field__label {
  font-weight: 600;
}

.field__input {
  width: 100%;
  padding: var(--space-s, 0.75rem);
  border-radius: var(--border-radius-m, 8px);
  border: 1px solid var(--color-neutral-60, #ccc);
  background: var(--color-white, #fff);
  font-size: 1rem;
}

.field__input:focus-visible {
  outline: 2px solid var(--color-primary, #0070f3);
  outline-offset: 2px;
}

.field__error {
  color: var(--color-danger-60, #b00020);
  font-size: 0.95rem;
}

.actions {
  display: flex;
  gap: var(--space-s, 0.75rem);
}
</style>
