import { ref } from 'vue'
import type {
  CardOwnerRole,
  CardStatus,
  CreateWorkflowCardPayload,
  UpdateWorkflowCardPayload,
  WorkflowCard,
  WorkflowCardListResponse,
  WorkflowCardUpdateResponse
} from '~/types/workflow-card'
import type { ScrapeResult } from '~/modules/scraper/runtime/types'

interface FetchOptions {
  role?: CardOwnerRole
  status?: CardStatus[]
}

export const useWorkflowCards = () => {
  const cards = ref<WorkflowCard[]>([])
  const isLoading = ref(false)
  const isSaving = ref(false)
  const error = ref<string>('')

  async function fetchCards(options?: FetchOptions) {
    try {
      isLoading.value = true
      error.value = ''

      const query: Record<string, string> = {}
      if (options?.role) query.role = options.role
      if (options?.status?.length) query.status = options.status.join(',')

      const response = await $fetch<WorkflowCardListResponse>('/api/cards', {
        query
      })

      cards.value = response.cards
    } catch (err: any) {
      error.value = err?.statusMessage || err?.message || 'Failed to load cards.'
    } finally {
      isLoading.value = false
    }
  }

  async function createCard(result: ScrapeResult, source: CardOwnerRole = 'analyst') {
    const payload: CreateWorkflowCardPayload = { result, source }
    try {
      isSaving.value = true
      error.value = ''

      const response = await $fetch<WorkflowCardUpdateResponse>('/api/cards', {
        method: 'POST',
        body: payload
      })

      upsertCard(response.card)
      return response.card
    } catch (err: any) {
      error.value = err?.statusMessage || err?.message || 'Failed to create card.'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  async function updateCard(id: string, patch: Partial<UpdateWorkflowCardPayload> & { actor: CardOwnerRole }) {
    try {
      isSaving.value = true
      error.value = ''

      const response = await $fetch<WorkflowCardUpdateResponse>(`/api/cards/${id}`, {
        method: 'PATCH',
        body: patch
      })

      upsertCard(response.card)
      return response.card
    } catch (err: any) {
      error.value = err?.statusMessage || err?.message || 'Failed to update card.'
      throw err
    } finally {
      isSaving.value = false
    }
  }

  function upsertCard(card: WorkflowCard) {
    const index = cards.value.findIndex((item) => item.id === card.id)
    if (index >= 0) {
      cards.value.splice(index, 1, card)
    } else {
      cards.value.unshift(card)
    }
  }

  return {
    cards,
    isLoading,
    isSaving,
    error,
    fetchCards,
    createCard,
    updateCard
  }
}
