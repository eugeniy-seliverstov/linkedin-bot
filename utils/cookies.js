import fs from 'fs'
import { log } from './logger.js'

export const COOKIES_PATH = './cookies.json'

export async function saveCookies(page) {
  try {
    const cookies = await page.cookies()
    await fs.promises.writeFile(COOKIES_PATH, JSON.stringify(cookies, null, 2))
  } catch (error) {
    console.error('Error saving cookies:', error)
  }
}

export async function loadCookies(page) {
  try {
    if (!fs.existsSync(COOKIES_PATH)) {
      log.warn('Cookies file not found, skipping loading cookies')
      return
    }

    const cookiesJSON = await fs.promises.readFile(COOKIES_PATH, 'utf8')
    if (!cookiesJSON.trim()) {
      log.warn('Cookies file is empty, skipping loading cookies')
      return
    }

    const cookies = JSON.parse(cookiesJSON)
    await page.setCookie(...cookies)
    log.info('Cookies loaded successfully')
  } catch (error) {
    log.warn('Error loading cookies:', error)
  }
}
