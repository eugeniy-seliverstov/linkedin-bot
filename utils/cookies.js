import fs from 'fs'

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
      console.warn('Cookies file not found, skipping loading cookies')
      return
    }

    const cookiesJSON = await fs.promises.readFile(COOKIES_PATH, 'utf8')
    if (!cookiesJSON.trim()) {
      console.warn('Cookies file is empty, skipping loading cookies')
      return
    }

    const cookies = JSON.parse(cookiesJSON)
    await page.setCookie(...cookies)
    console.log('Cookies loaded successfully')
  } catch (error) {
    console.error('Error loading cookies:', error)
  }
}
