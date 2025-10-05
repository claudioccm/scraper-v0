import type { ScrapeResult } from '~/modules/scraper/runtime/types'

export type CardStatus =
  | 'suggestion'
  | 'draft'
  | 'needs_review'
  | 'manager_review'
  | 'shortlisted'
  | 'saved_for_later'
  | 'archived'

export type CardOwnerRole = 'analyst' | 'manager' | 'rss-intake'

export interface StatusHistoryEntry {
  at: string
  status: CardStatus
  actor: CardOwnerRole
  note?: string
}

export interface WorkflowCard {
  id: string
  result: ScrapeResult
  status: CardStatus
  createdAt: string
  updatedAt: string
  owner: CardOwnerRole
  history: StatusHistoryEntry[]
  source: CardOwnerRole
}

export interface CreateWorkflowCardPayload {
  result: ScrapeResult
  source: CardOwnerRole
}

export interface UpdateWorkflowCardPayload {
  status?: CardStatus
  owner?: CardOwnerRole
  result?: ScrapeResult
  note?: string
  actor: CardOwnerRole
}

export interface WorkflowCardListResponse {
  cards: WorkflowCard[]
}

export interface WorkflowCardUpdateResponse {
  card: WorkflowCard
}
