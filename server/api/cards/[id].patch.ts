import { createError, defineEventHandler, readBody } from 'h3'
import { updateCard } from '~/server/utils/cardWorkflow'
import type { UpdateWorkflowCardPayload, WorkflowCardUpdateResponse } from '~/types/workflow-card'

export default defineEventHandler(async (event): Promise<WorkflowCardUpdateResponse> => {
  const id = event.context.params?.id
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing card id'
    })
  }

  const body = await readBody<Partial<UpdateWorkflowCardPayload> | undefined>(event)
  if (!body?.actor) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Actor required for updates'
    })
  }

  try {
    const card = updateCard(id, {
      actor: body.actor,
      status: body.status,
      owner: body.owner,
      result: body.result,
      note: body.note
    })

    return { card }
  } catch (error: any) {
    throw createError({
      statusCode: 404,
      statusMessage: error?.message || 'Card not found'
    })
  }
})
