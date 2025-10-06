<template>
  <ccm-section>
    <div class="stack">
      <header class="view-header">
        <h1>Suggestions</h1>
        <p>RSS-suggested articles based on your configured criteria. Review and promote relevant items to your workflow.</p>
      </header>

      <div class="actions">
        <ccm-button
          is="button"
          variant="primary"
          color="primary"
          :disabled="isChecking"
          @click="triggerRssCheck"
        >
          <template v-if="isChecking">Checking feeds…</template>
          <template v-else>Check feeds now</template>
        </ccm-button>
        <p v-if="checkMessage" class="check-message" :class="{ error: checkError }">{{ checkMessage }}</p>
      </div>

      <section class="cards">
        <header class="cards__header">
          <h2>Suggested articles</h2>
          <p>{{ suggestionCards.length }} {{ suggestionCards.length === 1 ? 'suggestion' : 'suggestions' }} from RSS feeds</p>
        </header>

        <div v-if="isLoadingCards && !suggestionCards.length" class="empty-state">
          <p>Loading suggestions…</p>
        </div>
        <div v-else class="cards__list">
          <div v-if="!suggestionCards.length" class="empty-state">
            <p>No suggestions yet. Click "Check feeds now" or wait for the daily automatic check.</p>
          </div>

          <ScrapeResultCard
            v-for="card in suggestionCards"
            :key="card.id"
            :heading="cardHeading(card)"
            heading-level="h3"
            :subheading="card.result.normalizedUrl || card.result.url"
            :request-status="'done'"
            :result="card.result"
            :approve-label="'Add to my workflow'"
            @edit-save="(updated) => handleEditSave(card, updated)"
            @approve="() => handlePromote(card)"
          />
        </div>
      </section>
    </div>
  </ccm-section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import ScrapeResultCard from '~/components/scraper/ScrapeResultCard.vue'
import { useWorkflowCards } from '~/composables/useWorkflowCards'
import type { WorkflowCard } from '~/types/workflow-card'
import type { ScrapeResult } from '~/modules/scraper/runtime/types'

const { cards, isLoading: isLoadingCards, fetchCards, updateCard } = useWorkflowCards()

const isChecking = ref(false)
const checkMessage = ref('')
const checkError = ref(false)

const suggestionCards = computed(() =>
  cards.value
    .filter((card) => card.status === 'suggestion')
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
)

onMounted(() => {
  fetchCards({ role: 'analyst' })
})

async function triggerRssCheck() {
  isChecking.value = true
  checkMessage.value = ''
  checkError.value = false

  try {
    const response = await $fetch<any>('/api/rss/check', {
      method: 'POST'
    })

    checkMessage.value = response.message || 'RSS check completed'
    checkError.value = !response.success

    if (response.success) {
      // Refresh cards to show new suggestions
      await fetchCards({ role: 'analyst' })
    }
  } catch (error: any) {
    checkMessage.value = error?.message || 'Failed to check RSS feeds'
    checkError.value = true
  } finally {
    isChecking.value = false
  }
}

async function handleEditSave(card: WorkflowCard, result: ScrapeResult) {
  try {
    await updateCard(card.id, { actor: 'analyst', result })
  } catch (error) {
    // Errors already surfaced through the composable
  }
}

async function handlePromote(card: WorkflowCard) {
  try {
    await updateCard(card.id, {
      actor: 'analyst',
      status: 'draft'
    })
  } catch (error) {
    // Errors already surfaced through the composable
  }
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

.actions {
  display: flex;
  gap: var(--space-m, 1rem);
  align-items: center;
}

.check-message {
  font-size: 0.9rem;
  color: var(--color-success-60, #047857);
}

.check-message.error {
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
