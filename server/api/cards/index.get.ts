import { getQuery } from 'h3'
import { listCards } from '~/server/utils/cardWorkflow'
import type { CardOwnerRole, CardStatus, WorkflowCardListResponse } from '~/types/workflow-card'

export default defineEventHandler((event): WorkflowCardListResponse => {
  const query = getQuery(event)
  let cards = listCards()

  const role = typeof query.role === 'string' ? (query.role as CardOwnerRole) : undefined
  const statusParam = query.status

  if (role === 'analyst' || role === 'manager') {
    cards = cards.filter((card) => card.owner === role)
  }

  if (Array.isArray(statusParam)) {
    const statuses = new Set<CardStatus>(statusParam as CardStatus[])
    cards = cards.filter((card) => statuses.has(card.status))
  } else if (typeof statusParam === 'string' && statusParam.trim().length) {
    const statuses = new Set<CardStatus>(statusParam.split(',').map((value) => value.trim() as CardStatus))
    cards = cards.filter((card) => statuses.has(card.status))
  }

  return { cards }
})
