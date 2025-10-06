import { defineEventHandler } from 'h3'
import { listCards } from '~/server/utils/cardWorkflow'

export default defineEventHandler(async () => {
  const allCards = listCards()

  // Filter only suggestion status cards
  const suggestions = allCards.filter(card => card.status === 'suggestion')

  return {
    cards: suggestions
  }
})
