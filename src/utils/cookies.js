import fs from 'fs'
import { fileURLToPath } from 'url'
import { resolve, dirname } from 'path'
import { log } from './logger.js'

const COOKIES_PATH = resolve(dirname(fileURLToPath(import.meta.url)), '../../cookies.json')

export async function saveCookies(context) {
  try {
    const cookies = await context.cookies()
    await fs.promises.writeFile(COOKIES_PATH, JSON.stringify(cookies, null, 2))
    await fs.promises.chmod(COOKIES_PATH, 0o600)
  } catch (err) {
    log.error('Error saving cookies', err)
  }
}

export async function loadCookies(context) {
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
    await context.addCookies(cookies)
    log.info('Cookies loaded successfully')
  } catch (err) {
    log.warn('Error loading cookies', err)
  }
}
