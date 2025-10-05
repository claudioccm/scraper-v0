import { createError, defineEventHandler, readBody } from 'h3'
import { createCard } from '~/server/utils/cardWorkflow'
import type { CreateWorkflowCardPayload, WorkflowCardUpdateResponse } from '~/types/workflow-card'

export default defineEventHandler(async (event): Promise<WorkflowCardUpdateResponse> => {
  const body = await readBody<CreateWorkflowCardPayload | undefined>(event)

  if (!body?.result) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing scrape result payload'
    })
  }

  const payload: CreateWorkflowCardPayload = {
    result: body.result,
    source: body.source === 'manager' ? 'manager' : 'analyst'
  }

  const card = createCard(payload)

  return { card }
})
