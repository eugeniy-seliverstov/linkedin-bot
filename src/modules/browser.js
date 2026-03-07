import { chromium } from 'playwright'
import { config } from '../config.js'
import { loadCookies } from '../utils/cookies.js'

export async function launchBrowser() {
  const browser = await chromium.launch({
    headless: process.argv.includes('--headless'),
    slowMo: 100,
  })
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  })
  await loadCookies(context)

  const page = await context.newPage()
  page.setDefaultTimeout(config.timeout)

  return { browser, context, page }
}

export async function scrollDown(page) {
  /* eslint-disable no-undef -- browser context via page.evaluate */
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0
      const distance = 200
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight
        window.scrollBy(0, distance)
        totalHeight += distance
        if (totalHeight >= scrollHeight) {
          clearInterval(timer)
          resolve()
        }
      }, 100)
    })
  })
  /* eslint-enable no-undef */
}
