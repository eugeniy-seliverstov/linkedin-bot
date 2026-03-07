import { execFileSync } from 'child_process'
import { saveCookies } from '../utils/cookies.js'
import { log } from '../utils/logger.js'

const LOGIN_WAIT_TIMEOUT = 5 * 60 * 1000 // 5 minutes to log in manually

export async function ensureLoggedIn(context, page) {
  log.info('Checking LinkedIn session...')
  await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' })

  const title = await page.title()
  if (title.includes('Feed')) {
    log.info('Already logged in')
    await saveCookies(context)
    return
  }

  // Session expired — notify user and wait for manual login
  log.warn('Not logged in. Waiting for manual login...')
  notify('LinkedIn Bot', 'Session expired. Please log in manually in the browser window.')

  await page.waitForURL('**/feed/**', { timeout: LOGIN_WAIT_TIMEOUT })

  log.info('Login detected, saving cookies')
  await saveCookies(context)
  log.info('Cookies saved, continuing')
}

function notify(title, message) {
  try {
    execFileSync('osascript', ['-e', `display notification "${message}" with title "${title}" sound name "default"`])
  } catch {
    // Notification failed, not critical
  }
}
