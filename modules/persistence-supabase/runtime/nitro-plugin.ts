import { registerScraperPersistence } from '../../scraper/runtime/server/lib/persistence'
import { createSupabasePersistence } from './server/provider'

const plugin = () => {
  registerScraperPersistence(createSupabasePersistence())
}

export default plugin
