import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'
import { config } from '../config.js'
import { loadCookies } from '../utils/cookies.js'

puppeteer.use(StealthPlugin())

export async function launchBrowser() {
  const browser = await puppeteer.launch({
    headless: process.argv.includes('--stealth'),
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    timeout: config.timeout,
  })
  const page = await browser.newPage()
  await page.setViewport({ width: 1080, height: 1024 })
  await loadCookies(page)
  return { browser, page }
}

export async function scrollDown(page) {
  /* eslint-disable no-undef -- browser context via page.evaluate */
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0
      const distance = 100
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
