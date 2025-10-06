import cron from 'node-cron'

let schedulerTask: cron.ScheduledTask | null = null

export function startScheduler(callback: () => Promise<void>): void {
  if (schedulerTask) {
    console.log('[RSS Scheduler] Already running')
    return
  }

  // Run daily at 9:00 AM
  schedulerTask = cron.schedule('0 9 * * *', async () => {
    console.log('[RSS Scheduler] Starting scheduled RSS check...')
    try {
      await callback()
      console.log('[RSS Scheduler] Scheduled check completed')
    } catch (error: any) {
      console.error('[RSS Scheduler] Scheduled check failed:', error.message)
    }
  })

  console.log('[RSS Scheduler] Daily scheduler started (runs at 9:00 AM)')
}

export function stopScheduler(): void {
  if (schedulerTask) {
    schedulerTask.stop()
    schedulerTask = null
    console.log('[RSS Scheduler] Scheduler stopped')
  }
}
