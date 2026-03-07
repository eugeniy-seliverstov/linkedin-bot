import { selectors } from '../selectors.js'
import { log } from '../utils/logger.js'
import { randomTimeout } from '../utils/timeout.js'

export async function connectPeople(page, maxProfiles) {
  await page.waitForSelector(selectors.searchResults.card)

  const cards = await page.$$(selectors.searchResults.card)
  log.info(`Found ${cards.length} profiles`)

  let connected = 0

  for (const card of cards) {
    const didConnect = await connectPerson(page, card)
    if (didConnect) connected++
    if (connected >= maxProfiles) break
  }

  return { looked: cards.length, connected }
}

async function connectPerson(page, card) {
  try {
    const connectLink = await card.$(selectors.searchResults.connectLink)
    if (!connectLink) return false

    const label = await connectLink.getAttribute('aria-label')
    const name = label.replace('Invite ', '').replace(' to connect', '')

    log.info(`Connecting to ${name}`)
    await connectLink.click()

    // Handle "Add a note to your invitation?" modal
    const sendBtn = page.locator(selectors.inviteModal.sendWithoutNote)
    await sendBtn.waitFor({ state: 'visible' })
    await sendBtn.click()
    await randomTimeout()

    log.info(`Connection request sent to ${name}`)
    await randomTimeout()
    return true
  } catch (err) {
    log.error('Error while connecting to a person', err)
    return false
  }
}
