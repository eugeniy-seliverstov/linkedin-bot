import { selectors } from '../selectors.js'
import { log } from '../utils/logger.js'
import { randomTimeout } from '../utils/timeout.js'

export async function goNextPage(page) {
  log.info('Moving to the next page')

  const nextBtn = page.locator(selectors.nextPage.button)
  await nextBtn.scrollIntoViewIfNeeded()

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    nextBtn.click(),
  ])

  await page.waitForSelector(selectors.searchResults.card)

  await randomTimeout()
  log.info('Moved to the next page')
}
