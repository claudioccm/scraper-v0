<template>
  <ccm-section>
    <div class="stack">
      <header class="view-header">
        <h1>Analyst View</h1>
        <p>Paste links, watch scraping progress, make quick edits, and send ready cards to your manager.</p>
      </header>

      <form class="card-form" @submit.prevent="submitLinks">
        <label class="field" for="analyst-links">
          <span class="field__label">Links to scrape</span>
          <textarea
            id="analyst-links"
            v-model="linksInput"
            class="field__textarea"
            rows="6"
            placeholder="https://example.com/story-one\nhttps://another-site.com/post"
          ></textarea>
        </label>
        <p class="field__hint">Enter one URL per line. Blank lines are ignored.</p>
        <p v-if="formError" class="field__error">{{ formError }}</p>
        <div class="form-actions">
          <ccm-button
            is="button"
            type="submit"
            variant="primary"
            color="primary"
            :disabled="isSubmitting || !hasAnyLink"
          >
            <template v-if="isSubmitting">Processing…</template>
            <template v-else>Scrape links</template>
          </ccm-button>
          <ccm-button
            is="button"
            type="button"
            variant="ghost"
            :disabled="!linksInput.trim() || isSubmitting"
            @click="clearForm"
          >
            Clear
          </ccm-button>
        </div>
      </form>

      <section v-if="submissionStatuses.length" class="progress">
        <h2>Scraping progress</h2>
        <ul>
          <li v-for="entry in submissionStatuses" :key="entry.id" class="progress__item">
            <span class="progress__url">{{ entry.url }}</span>
            <span class="progress__state" :data-state="entry.state">{{ entry.label }}</span>
          </li>
        </ul>
      </section>

      <section class="cards">
        <header class="cards__header">
          <h2>My cards</h2>
          <p>Cards still in the analyst queue.</p>
        </header>

        <div v-if="isLoadingCards && !myCards.length" class="empty-state">
          <p>Loading cards…</p>
        </div>
        <div v-else class="cards__list">
          <ScrapeResultCard
            v-for="placeholder in pendingPlaceholders"
            :key="`pending-${placeholder.id}`"
            :heading="placeholder.url"
            heading-level="h3"
            :subheading="placeholder.url"
            :request-status="placeholder.state === 'queued' ? 'queued' : 'running'"
            :queued-message="placeholder.label"
            :running-message="placeholder.label"
            :is-busy="true"
            :approve-label="'Send to manager'"
          />

          <div v-if="!pendingPlaceholders.length && !myCards.length" class="empty-state">
            <p>No cards yet. Paste links above to create your first batch.</p>
          </div>

          <ScrapeResultCard
            v-for="card in myCards"
            :key="card.id"
            :heading="cardHeading(card)"
            heading-level="h3"
            :subheading="card.result.normalizedUrl || card.result.url"
            :request-status="'done'"
            :result="card.result"
            :approve-label="'Send to manager'"
            @edit-save="(updated) => handleEditSave(card, updated)"
            @approve="() => handleApprove(card)"
          />
        </div>
      </section>

      <section v-if="sentToManager.length" class="cards">
        <header class="cards__header">
          <h2>Sent to manager</h2>
          <p>Cards awaiting manager decisions.</p>
        </header>
        <div class="cards__list">
          <ScrapeResultCard
            v-for="card in sentToManager"
            :key="card.id"
            :heading="cardHeading(card)"
            heading-level="h3"
            :subheading="card.result.normalizedUrl || card.result.url"
            :request-status="'done'"
            :result="card.result"
            :approve-label="card.status === 'manager_review' ? 'Send again' : 'Send to manager'"
            @edit-save="(updated) => handleEditSave(card, updated)"
            @approve="() => handleApprove(card)"
          />
        </div>
      </section>
    </div>
  </ccm-section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import ScrapeResultCard from '~/components/scraper/ScrapeResultCard.vue'
import { useScraper } from '~/modules/scraper/runtime/composables/useScraper'
import { useWorkflowCards } from '~/composables/useWorkflowCards'
import type { WorkflowCard } from '~/types/workflow-card'
import type { ScrapeResult } from '~/modules/scraper/runtime/types'

type SubmissionState = 'queued' | 'running' | 'success' | 'error'

interface SubmissionEntry {
  id: string
  url: string
  state: SubmissionState
  label: string
}

const linksInput = ref('')
const formError = ref('')
const submissionStatuses = reactive<SubmissionEntry[]>([])

const { cards, isLoading: isLoadingCards, isSaving, fetchCards, createCard, updateCard } = useWorkflowCards()
const { scrape } = useScraper()

const isSubmitting = computed(() => isSaving.value)
const hasAnyLink = computed(() => parseLinks(linksInput.value).length > 0)

const myCards = computed(() =>
  cards.value
    .filter((card) => card.status === 'draft' || card.status === 'needs_review')
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
)

const sentToManager = computed(() =>
  cards.value
    .filter((card) => card.status !== 'draft' && card.status !== 'needs_review')
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
)

const pendingPlaceholders = computed(() =>
  submissionStatuses.filter((entry) => entry.state === 'queued' || entry.state === 'running')
)

onMounted(() => {
  fetchCards({ role: 'analyst' })
})

function parseLinks(value: string): string[] {
  return value
    .split(/\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

function clearForm() {
  if (isSubmitting.value) return
  linksInput.value = ''
  formError.value = ''
}

async function submitLinks() {
  formError.value = ''

  const urls = parseLinks(linksInput.value)
  if (!urls.length) {
    formError.value = 'Add at least one valid URL.'
    return
  }

  const entries: SubmissionEntry[] = urls.map((url) => ({
    id: createId(),
    url,
    state: 'queued',
    label: 'Queued…'
  }))

  submissionStatuses.splice(0, submissionStatuses.length, ...entries)

  for (const entry of submissionStatuses) {
    entry.state = 'running'
    entry.label = 'Scraping…'
    try {
      const result = await scrape(entry.url)
      await createCard(result, 'analyst')
      entry.state = 'success'
      entry.label = 'Card ready'
    } catch (error: any) {
      entry.state = 'error'
      entry.label = error?.statusMessage || error?.message || 'Scrape failed'
    }
  }

  linksInput.value = ''
}

async function handleEditSave(card: WorkflowCard, result: ScrapeResult) {
  try {
    await updateCard(card.id, { actor: 'analyst', result })
  } catch (error) {
    // Errors already surfaced through the composable.
  }
}

async function handleApprove(card: WorkflowCard) {
  if (card.status === 'manager_review') return
  try {
    await updateCard(card.id, {
      actor: 'analyst',
      status: 'manager_review'
    })
  } catch (error) {}
}

function cardHeading(card: WorkflowCard): string {
  const meta = card.result.metadata || {}
  return meta.title?.trim() || meta.summary?.trim() || card.result.normalizedUrl || card.result.url
}

function createId(): string {
  return Math.random().toString(36).slice(2, 10)
}
</script>

<style scoped>
.stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl, 2.5rem);
  max-width: 960px;
}

.view-header {
  display: grid;
  gap: var(--space-2xs, 0.5rem);
}

.card-form {
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

.field__textarea {
  width: 100%;
  padding: var(--space-s, 0.75rem);
  border-radius: var(--border-radius-m, 10px);
  border: 1px solid var(--color-neutral-50, #94a3b8);
  font-size: 1rem;
  resize: vertical;
  min-height: 9rem;
}

.field__textarea:focus-visible {
  outline: 2px solid var(--color-primary, #1d4ed8);
  outline-offset: 2px;
}

.field__hint {
  font-size: 0.9rem;
  color: var(--color-neutral-60, #64748b);
}

.field__error {
  color: var(--color-danger-60, #b00020);
}

.form-actions {
  display: flex;
  gap: var(--space-s, 0.75rem);
}

.progress ul {
  display: grid;
  gap: var(--space-2xs, 0.5rem);
  padding: 0;
  list-style: none;
}

.progress__item {
  display: flex;
  justify-content: space-between;
  gap: var(--space-s, 0.75rem);
  font-size: 0.95rem;
  border-bottom: 1px solid var(--color-neutral-40, #cbd5f5);
  padding-bottom: var(--space-3xs, 0.35rem);
}

.progress__state[data-state='running'],
.progress__state[data-state='queued'] {
  color: var(--color-neutral-60, #64748b);
}

.progress__state[data-state='success'] {
  color: var(--color-success-60, #047857);
}

.progress__state[data-state='error'] {
  color: var(--color-danger-60, #b00020);
}

.cards {
  display: grid;
  gap: var(--space-m, 1rem);
}

.cards__header {
  display: grid;
  gap: var(--space-3xs, 0.35rem);
}

.cards__list {
  display: grid;
  gap: var(--space-m, 1rem);
}

.empty-state {
  border: 1px dashed var(--color-neutral-40, #cbd5f5);
  border-radius: var(--border-radius-m, 12px);
  padding: var(--space-m, 1rem);
  color: var(--color-neutral-60, #64748b);
  text-align: center;
}
</style>
