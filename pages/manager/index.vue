<template>
  <ccm-section>
    <div class="stack">
      <header class="view-header">
        <h1>Manager View</h1>
        <p>Review cards from your analysts, make edits, and move the best stories into the newsletter pipeline.</p>
      </header>

      <details class="ingest">
        <summary>Paste links (optional)</summary>
        <form class="card-form" @submit.prevent="submitLinks">
          <label class="field" for="manager-links">
            <span class="field__label">Links to scrape</span>
            <textarea
              id="manager-links"
              v-model="linksInput"
              class="field__textarea"
              rows="4"
              placeholder="https://publication.com/story"
            ></textarea>
          </label>
          <p class="field__hint">Enter one URL per line. Blank lines are ignored.</p>
          <p v-if="formError" class="field__error">{{ formError }}</p>
          <div class="form-actions">
            <ccm-button
              is="button"
              type="submit"
              variant="secondary"
              :disabled="isSubmitting || !hasAnyLink"
            >
              <template v-if="isSubmitting">Scraping…</template>
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
      </details>

      <section class="cards">
        <header class="cards__header">
          <h2>Needs review</h2>
          <p>Cards waiting for a manager decision.</p>
        </header>
        <div v-if="isLoadingCards && !reviewCards.length" class="empty-state">
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
            :approve-label="'Shortlist'"
          />

          <div v-if="!pendingPlaceholders.length && !reviewCards.length" class="empty-state">
            <p>No cards in review. Ask an analyst to send new items or paste links above.</p>
          </div>

          <ScrapeResultCard
            v-for="card in reviewCards"
            :key="card.id"
            :heading="cardHeading(card)"
            heading-level="h3"
            :subheading="card.result.normalizedUrl || card.result.url"
            :request-status="'done'"
            :result="card.result"
            :approve-label="'Shortlist'"
            @edit-save="(updated) => handleEditSave(card, updated)"
            @approve="() => handleShortlist(card)"
          >
            <template #actions>
              <ccm-button
                variant="ghost"
                color="danger"
                :disabled="card.status === 'archived'"
                @click="handleArchive(card)"
              >
                Archive
              </ccm-button>
              <ccm-button variant="ghost" @click="handleReturn(card)">
                Send back to analyst
              </ccm-button>
              <ccm-button
                variant="secondary"
                :disabled="card.status === 'saved_for_later'"
                @click="handleSaveForLater(card)"
              >
                Save for later
              </ccm-button>
            </template>
          </ScrapeResultCard>
        </div>
      </section>

      <section v-if="shortlistedCards.length" class="cards">
        <header class="cards__header">
          <h2>Shortlisted</h2>
          <p>Ready for the next newsletter issue.</p>
        </header>
        <div class="cards__list">
          <ScrapeResultCard
            v-for="card in shortlistedCards"
            :key="card.id"
            :heading="cardHeading(card)"
            heading-level="h3"
            :subheading="card.result.normalizedUrl || card.result.url"
            :request-status="'done'"
            :result="card.result"
            :approve-label="'Shortlist'"
            :show-approve-button="false"
            @edit-save="(updated) => handleEditSave(card, updated)"
          >
            <template #actions>
              <ccm-button variant="ghost" @click="handleReturn(card)">
                Send back to analyst
              </ccm-button>
              <ccm-button variant="ghost" color="danger" @click="handleArchive(card)">
                Archive
              </ccm-button>
              <ccm-button variant="secondary" @click="handleSaveForLater(card)">
                Move to saved for later
              </ccm-button>
            </template>
          </ScrapeResultCard>
        </div>
      </section>

      <section v-if="savedCards.length" class="cards">
        <header class="cards__header">
          <h2>Saved for later</h2>
          <p>Hold for future issues.</p>
        </header>
        <div class="cards__list">
          <ScrapeResultCard
            v-for="card in savedCards"
            :key="card.id"
            :heading="cardHeading(card)"
            heading-level="h3"
            :subheading="card.result.normalizedUrl || card.result.url"
            :request-status="'done'"
            :result="card.result"
            :approve-label="'Shortlist'"
            @edit-save="(updated) => handleEditSave(card, updated)"
            @approve="() => handleShortlist(card)"
          >
            <template #actions>
              <ccm-button variant="ghost" color="danger" @click="handleArchive(card)">
                Archive
              </ccm-button>
              <ccm-button variant="ghost" @click="handleReturn(card)">
                Send back to analyst
              </ccm-button>
            </template>
          </ScrapeResultCard>
        </div>
      </section>

      <section v-if="archivedCards.length" class="cards">
        <header class="cards__header">
          <h2>Archived</h2>
          <p>Cards removed from circulation.</p>
        </header>
        <div class="cards__list">
          <ScrapeResultCard
            v-for="card in archivedCards"
            :key="card.id"
            :heading="cardHeading(card)"
            heading-level="h3"
            :subheading="card.result.normalizedUrl || card.result.url"
            :request-status="'done'"
            :result="card.result"
            :approve-label="'Shortlist'"
            @edit-save="(updated) => handleEditSave(card, updated)"
            @approve="() => handleShortlist(card)"
          >
            <template #actions>
              <ccm-button variant="ghost" @click="handleReturn(card)">
                Send back to analyst
              </ccm-button>
              <ccm-button
                variant="secondary"
                :disabled="card.status === 'saved_for_later'"
                @click="handleSaveForLater(card)"
              >
                Move to saved for later
              </ccm-button>
            </template>
          </ScrapeResultCard>
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

const reviewCards = computed(() =>
  cards.value
    .filter((card) => card.status === 'manager_review')
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
)

const shortlistedCards = computed(() =>
  cards.value
    .filter((card) => card.status === 'shortlisted')
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
)

const savedCards = computed(() =>
  cards.value
    .filter((card) => card.status === 'saved_for_later')
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
)

const archivedCards = computed(() =>
  cards.value
    .filter((card) => card.status === 'archived')
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
)

const pendingPlaceholders = computed(() =>
  submissionStatuses.filter((entry) => entry.state === 'queued' || entry.state === 'running')
)

onMounted(() => {
  fetchCards({ role: 'manager' })
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
      await createCard(result, 'manager')
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
    await updateCard(card.id, { actor: 'manager', result })
  } catch (error) {}
}

async function handleShortlist(card: WorkflowCard) {
  if (card.status === 'shortlisted') return
  await applyStatus(card, 'shortlisted')
}

async function handleSaveForLater(card: WorkflowCard) {
  if (card.status === 'saved_for_later') return
  await applyStatus(card, 'saved_for_later')
}

async function handleArchive(card: WorkflowCard) {
  if (card.status === 'archived') return
  await applyStatus(card, 'archived')
}

async function handleReturn(card: WorkflowCard) {
  let note = ''
  if (typeof window !== 'undefined') {
    note = window.prompt('Add a note for the analyst (optional)', '') || ''
  }
  await applyStatus(card, 'needs_review', note)
}

async function applyStatus(card: WorkflowCard, status: WorkflowCard['status'], note?: string) {
  try {
    await updateCard(card.id, {
      actor: 'manager',
      status,
      note
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

.ingest {
  border: 1px solid var(--color-neutral-30, #d4dbea);
  border-radius: var(--border-radius-m, 12px);
  padding: var(--space-s, 0.75rem);
  background: var(--color-white, #fff);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.ingest[open] {
  border-color: var(--color-neutral-40, #cbd5f5);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}

.ingest > summary {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--space-2xs, 0.5rem);
  font-weight: 600;
  margin: 0;
  color: var(--color-neutral-70, #475569);
}

.ingest > summary::marker {
  display: none;
}

.ingest > summary::before {
  content: '+';
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 999px;
  background: var(--color-neutral-20, #e2e8f0);
  color: var(--color-neutral-70, #475569);
}

.ingest[open] > summary::before {
  content: '-';
}

.ingest[open] > summary {
  margin-bottom: var(--space-s, 0.75rem);
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
  gap: var(--space-xl, 2.5rem);
}

.empty-state {
  border: 1px dashed var(--color-neutral-40, #cbd5f5);
  border-radius: var(--border-radius-m, 12px);
  padding: var(--space-m, 1rem);
  color: var(--color-neutral-60, #64748b);
  text-align: center;
}
</style>
