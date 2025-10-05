import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import yaml from 'js-yaml'
import type { RssIntakeConfig } from './types'

const CONFIG_PATH = resolve(process.cwd(), 'config/rss-feeds.yaml')

let cachedConfig: RssIntakeConfig | null = null

export function loadRssConfig(): RssIntakeConfig {
  if (cachedConfig) {
    return cachedConfig
  }

  if (!existsSync(CONFIG_PATH)) {
    console.warn('[RSS Intake] Config file not found at:', CONFIG_PATH)
    return {
      system_prompt: '',
      feeds: []
    }
  }

  try {
    const fileContent = readFileSync(CONFIG_PATH, 'utf-8')
    const config = yaml.load(fileContent) as RssIntakeConfig

    if (!config.system_prompt || !Array.isArray(config.feeds)) {
      throw new Error('Invalid RSS config structure')
    }

    cachedConfig = config
    console.log(`[RSS Intake] Loaded ${config.feeds.length} feeds from config`)
    return config
  } catch (error: any) {
    console.error('[RSS Intake] Error loading config:', error.message)
    return {
      system_prompt: '',
      feeds: []
    }
  }
}

export function getPromptForFeed(feedUrl: string): string {
  const config = loadRssConfig()
  const feed = config.feeds.find(f => f.rss_feed_url === feedUrl)

  if (!feed) {
    return config.system_prompt
  }

  // Feed has its own system_prompt - replace global
  if (feed.system_prompt) {
    return feed.system_prompt
  }

  // Feed has custom_prompt - extend global
  if (feed.custom_prompt) {
    return `${config.system_prompt} AND ${feed.custom_prompt}`
  }

  // Use global
  return config.system_prompt
}

export function reloadConfig(): void {
  cachedConfig = null
}
