import { config } from './config.js'
import { launchBrowser, scrollDown } from './modules/browser.js'
import { ensureLoggedIn } from './modules/auth.js'
import { connectPeople } from './modules/connect.js'
import { goNextPage } from './modules/navigation.js'
import { log } from './utils/logger.js'

let browser

async function start() {
  log.info('Starting LinkedIn bot')

  const launched = await launchBrowser()
  browser = launched.browser
  const { page } = launched

  await ensureLoggedIn(page)

  log.info('Navigating to search page')
  await page.goto(config.searchUrl, { waitUntil: 'domcontentloaded', timeout: config.timeout })

  let totalLooked = 0
  let totalConnected = 0

  for (let i = 0; i < config.maxPage; i++) {
    log.info(`Processing page ${i + 1} of ${config.maxPage}`)
    await scrollDown(page)

    const { looked, connected } = await connectPeople(page)
    totalLooked += looked
    totalConnected += connected

    if (totalConnected >= config.maxClickedProfiles) {
      log.info('Max clicked profiles reached, stopping')
      break
    }

    await goNextPage(page)
  }

  log.info(`Profiles viewed: ${totalLooked}`)
  log.info(`Profiles connected: ${totalConnected}`)
  await browser.close()
}

process.on('SIGINT', async () => {
  log.info('Interrupted, closing browser...')
  if (browser) await browser.close()
  process.exit(0)
})

start().catch(async (err) => {
  log.error('Fatal error', err)
  if (browser) await browser.close()
  process.exit(1)
})
