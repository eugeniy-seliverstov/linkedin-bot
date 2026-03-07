import { config } from '../config.js'
import { selectors } from '../selectors.js'
import { getConnectionMessage } from './messages.js'
import { log } from '../utils/logger.js'
import { randomTimeout } from '../utils/timeout.js'

export async function connectPeople(page) {
  await page.waitForSelector(selectors.searchResults.cards, { timeout: config.timeout })

  const cards = await page.$$(selectors.searchResults.cards)
  log.info(`Found ${cards.length} profiles`)

  let connected = 0

  for (const card of cards) {
    const didConnect = await connectPerson(page, card)
    if (didConnect) connected++
    if (connected >= config.maxClickedProfiles) break
  }

  return { looked: cards.length, connected }
}

async function connectPerson(page, card) {
  try {
    const subtitle = await card.$eval(selectors.searchResults.subtitle, el => el.textContent.trim())
    let button

    try {
      button = await card.waitForSelector(selectors.searchResults.connectButton, { timeout: config.timeout })
    } catch {
      log.info('No connect button found')
      return false
    }

    const buttonText = await button?.evaluate(btn => btn.textContent.trim())
    if (!buttonText?.includes('Connect')) return false

    log.info(`Connecting to ${subtitle}`)
    await button.click()

    if (config.shouldAddMessage) {
      const name = await card.$eval(selectors.searchResults.name, el => el.textContent.trim().split(' ')[0])
      log.info(`Adding message to ${name}`)

      const addMessageBtn = await page.waitForSelector(selectors.searchResults.addMessageButton, { timeout: config.timeout })
      await addMessageBtn.click()

      await page.type('textarea', getConnectionMessage(name), { delay: 100 })
    }

    const sendBtn = await page.waitForSelector(selectors.searchResults.sendButton, { timeout: config.timeout })
    await sendBtn.click()
    await randomTimeout()

    log.info('Connection request sent')
    await randomTimeout()

    return true
  } catch (err) {
    log.error('Error while connecting to a person', err)
    return false
  }
}
