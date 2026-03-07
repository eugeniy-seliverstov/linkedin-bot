import fs from 'fs'
import { log } from './logger.js'

const COOKIES_PATH = './cookies.json'

export async function saveCookies(page) {
  try {
    const cookies = await page.cookies()
    await fs.promises.writeFile(COOKIES_PATH, JSON.stringify(cookies, null, 2))
  } catch (err) {
    log.error('Error saving cookies', err)
  }
}

export async function loadCookies(page) {
  try {
    if (!fs.existsSync(COOKIES_PATH)) {
      log.warn('Cookies file not found, skipping')
      return
    }

    const raw = await fs.promises.readFile(COOKIES_PATH, 'utf8')
    if (!raw.trim()) {
      log.warn('Cookies file is empty, skipping')
      return
    }

    const cookies = JSON.parse(raw)
    await page.setCookie(...cookies)
    log.info('Cookies loaded successfully')
  } catch (err) {
    log.warn('Error loading cookies', err)
  }
}
