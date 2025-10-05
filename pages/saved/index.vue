<template>
  <ccm-section>
    <div class="stack">
      <header class="view-header">
        <h1>Saved for Later</h1>
        <p>Cards you want to keep on deck. Promote them when a future issue needs more coverage.</p>
      </header>

      <div v-if="isLoadingCards && !savedCards.length" class="empty-state">
        <p>Loading saved cards…</p>
      </div>

      <div v-else>
        <div v-if="!savedCards.length" class="empty-state">
          <p>No cards saved for later.</p>
        </div>

        <div v-else class="cards">
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
      </div>
    </div>
  </ccm-section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import ScrapeResultCard from '~/components/scraper/ScrapeResultCard.vue'
import { useWorkflowCards } from '~/composables/useWorkflowCards'
import type { WorkflowCard } from '~/types/workflow-card'
import type { ScrapeResult } from '~/modules/scraper/runtime/types'

const { cards, isLoading: isLoadingCards, fetchCards, updateCard } = useWorkflowCards()

onMounted(() => {
  fetchCards({ role: 'manager' })
})

const savedCards = computed(() =>
  cards.value
    .filter((card) => card.status === 'saved_for_later')
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
)

async function handleEditSave(card: WorkflowCard, result: ScrapeResult) {
  try {
    await updateCard(card.id, { actor: 'manager', result })
  } catch (error) {}
}

async function handleShortlist(card: WorkflowCard) {
  await applyStatus(card, 'shortlisted')
}

async function handleArchive(card: WorkflowCard) {
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

.cards {
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
