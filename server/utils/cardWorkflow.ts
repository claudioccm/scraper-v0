import { randomUUID } from 'node:crypto'
import type {
  CardOwnerRole,
  CardStatus,
  CreateWorkflowCardPayload,
  UpdateWorkflowCardPayload,
  WorkflowCard
} from '~/types/workflow-card'

const ANALYST_STATUSES = new Set<CardStatus>(['suggestion', 'draft', 'needs_review'])
const MANAGER_STATUSES = new Set<CardStatus>(['manager_review', 'shortlisted', 'saved_for_later', 'archived'])

interface WorkflowStore {
  cards: Map<string, WorkflowCard>
}

const STORE_KEY = '__workflow_card_store__'

type GlobalWithStore = typeof globalThis & { [STORE_KEY]?: WorkflowStore }

function getStore(): WorkflowStore {
  const g = globalThis as GlobalWithStore
  if (!g[STORE_KEY]) {
    g[STORE_KEY] = { cards: new Map() }
  }
  return g[STORE_KEY]!
}

function resolveOwnerFromStatus(status: CardStatus): CardOwnerRole {
  if (ANALYST_STATUSES.has(status)) return 'analyst'
  if (MANAGER_STATUSES.has(status)) return 'manager'
  return 'analyst'
}

export function listCards(): WorkflowCard[] {
  return Array.from(getStore().cards.values()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function getCard(id: string): WorkflowCard | undefined {
  return getStore().cards.get(id)
}

export function createCard(payload: CreateWorkflowCardPayload): WorkflowCard {
  const store = getStore()
  const now = new Date().toISOString()
  const status: CardStatus = payload.source === 'manager' ? 'manager_review' : 'draft'
  const owner: CardOwnerRole = resolveOwnerFromStatus(status)

  const card: WorkflowCard = {
    id: randomUUID(),
    result: payload.result,
    status,
    createdAt: now,
    updatedAt: now,
    owner,
    source: payload.source,
    history: [
      {
        at: now,
        status,
        actor: payload.source
      }
    ]
  }

  store.cards.set(card.id, card)
  return card
}

export function updateCard(id: string, payload: UpdateWorkflowCardPayload): WorkflowCard {
  const store = getStore()
  const current = store.cards.get(id)
  if (!current) {
    throw new Error(`Card ${id} not found`)
  }

  let updated = false
  const next = { ...current }

  if (payload.result) {
    next.result = payload.result
    updated = true
  }

  if (payload.status && payload.status !== current.status) {
    next.status = payload.status
    next.owner = resolveOwnerFromStatus(payload.status)
    next.history = [
      ...next.history,
      {
        at: new Date().toISOString(),
        status: payload.status,
        actor: payload.actor,
        note: payload.note
      }
    ]
    updated = true
  }

  if (payload.owner && payload.owner !== next.owner) {
    next.owner = payload.owner
    updated = true
  }

  if (!updated) {
    return current
  }

  next.updatedAt = new Date().toISOString()
  store.cards.set(id, next)
  return next
}

export function seedWorkflowCards(): void {
  const store = getStore()
  if (store.cards.size > 0) return

  const now = new Date()

  const cardA = buildSeedCard({
      baseId: 'demo-1',
      status: 'draft',
      title: 'OpenAI introduces new GPT capabilities',
      url: 'https://example.com/openai-updates',
      summary: 'Overview of the latest GPT enhancements for enterprise adopters.',
      author: 'Jane Doe',
      siteName: 'TechDaily',
      confidence: 0.82,
      published: addDays(now, -1)
  })
  store.cards.set(cardA.id, cardA)

  const cardB = buildSeedCard({
      baseId: 'demo-2',
      status: 'needs_review',
      title: 'EU releases new AI regulation framework',
      url: 'https://example.com/eu-ai-regulation',
      summary: 'Key takeaways from the EU AI Act relevant to analysts.',
      author: 'Maria Schmidt',
      siteName: 'PolicyWatch',
      confidence: 0.54,
      published: addDays(now, -2)
  })
  store.cards.set(cardB.id, cardB)

  const cardC = buildSeedCard({
      baseId: 'demo-3',
      status: 'manager_review',
      title: 'Case study: Retail adoption of AI forecasting',
      url: 'https://example.com/retail-ai-forecasting',
      summary: 'A leading retailer improves demand planning accuracy with machine learning.',
      author: 'David Kim',
      siteName: 'FutureOps',
      confidence: 0.9,
      published: addDays(now, -3)
  })
  store.cards.set(cardC.id, cardC)

  const cardD = buildSeedCard({
      baseId: 'demo-4',
      status: 'shortlisted',
      title: 'How to evaluate AI vendors effectively',
      url: 'https://example.com/evaluating-ai-vendors',
      summary: 'A practical checklist for managers to compare AI platform capabilities.',
      author: 'Priya Natarajan',
      siteName: 'LeadersDigest',
      confidence: 0.71,
      published: addDays(now, -5)
  })
  store.cards.set(cardD.id, cardD)
}

interface SeedCardOptions {
  baseId: string
  status: CardStatus
  title: string
  url: string
  summary: string
  author: string
  siteName: string
  confidence: number
  published: Date
}

function buildSeedCard(options: SeedCardOptions): WorkflowCard {
  const now = new Date().toISOString()
  const status = options.status
  const owner = resolveOwnerFromStatus(status)

  const resultId = `${options.baseId}-${Math.round(Math.random() * 1_000_000)}`

  return {
    id: randomUUID(),
    result: {
      id: resultId,
      type: 'html',
      url: options.url,
      normalizedUrl: options.url,
      canonicalUrl: options.url,
      ts: now,
      status: 'ok',
      confidence: options.confidence,
      confidenceFactors: [],
      content: {
        text: options.summary
      },
      metadata: {
        title: options.title,
        summary: options.summary,
        author: options.author,
        publishDate: options.published.toISOString(),
        siteName: options.siteName,
        language: 'en'
      }
    },
    status,
    createdAt: now,
    updatedAt: now,
    owner,
    source: owner,
    history: [
      {
        at: now,
        status,
        actor: owner
      }
    ]
  }
}

function addDays(reference: Date, delta: number): Date {
  const copy = new Date(reference)
  copy.setDate(copy.getDate() + delta)
  return copy
}

seedWorkflowCards()
