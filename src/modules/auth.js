import { config } from '../config.js'
import { selectors } from '../selectors.js'
import { saveCookies } from '../utils/cookies.js'
import { log } from '../utils/logger.js'

export async function ensureLoggedIn(page) {
  log.info('Navigating to LinkedIn feed')
  await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded', timeout: config.timeout })

  const isLoggedIn = (await page.title()).includes('Feed')
  if (!isLoggedIn) {
    await login(page)
  }

  await saveCookies(page)
  log.info('Cookies saved')
}

async function login(page) {
  log.info('Opening LinkedIn login page')
  await page.goto('https://linkedin.com/login', { waitUntil: 'domcontentloaded', timeout: config.timeout })

  const accountBlocks = await page.$$(selectors.loginChoose.block)

  if (accountBlocks.length > 0) {
    await page.click(selectors.loginChoose.member)
  } else {
    await page.type(selectors.loginForm.username, config.linkedinLogin, { delay: 100 })
    await page.type(selectors.loginForm.password, config.linkedinPassword, { delay: 100 })

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: config.timeout }),
      page.click(selectors.loginForm.submit),
    ])
  }

  log.info('Login successful')
}
