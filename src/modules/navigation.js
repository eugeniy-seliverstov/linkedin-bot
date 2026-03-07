import { config } from '../config.js'
import { selectors } from '../selectors.js'
import { log } from '../utils/logger.js'
import { randomTimeout } from '../utils/timeout.js'

export async function goNextPage(page) {
  log.info('Moving to the next page')
  const nextBtn = await page.waitForSelector(selectors.nextPage.button, { visible: true, timeout: config.timeout })

  await Promise.all([
    page.waitForNavigation({ timeout: config.timeout }),
    nextBtn.click(),
  ])

  await randomTimeout()
  log.info('Moved to the next page')
}
