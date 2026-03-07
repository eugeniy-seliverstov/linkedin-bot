import { chromium } from 'playwright'
import fs from 'fs'

const COOKIES_PATH = './cookies.json'
const OUTPUT_PATH = './scripts/detected-selectors.json'

const browser = await chromium.launch({ headless: false, slowMo: 300 })
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })

// Load cookies if available
if (fs.existsSync(COOKIES_PATH)) {
  const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH, 'utf8'))
  if (cookies.length) await context.addCookies(cookies)
}

const page = await context.newPage()
await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded', timeout: 30000 })
await page.waitForTimeout(2000)

const title = await page.title()
if (!title.includes('Feed')) {
  console.log('\n=== Not logged in. Please log in manually in the browser. ===\n')
  await page.waitForURL('**/feed/**', { timeout: 300000 })
  const cookies = await context.cookies()
  fs.writeFileSync(COOKIES_PATH, JSON.stringify(cookies, null, 2))
  console.log('Cookies saved.\n')
}

console.log('Enter your SEARCH_URL and press ENTER:')
const searchUrl = await new Promise(r => process.stdin.once('data', d => r(d.toString().trim())))

console.log('\nNavigating to search page...')
await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 })
await page.waitForTimeout(3000)

// Scroll to load all results
await page.evaluate(async () => {
  for (let i = 0; i < 10; i++) {
    window.scrollBy(0, 500)
    await new Promise(r => setTimeout(r, 300))
  }
  window.scrollTo(0, 0)
})
await page.waitForTimeout(2000)

const results = { searchResults: {}, inviteModal: {}, nextPage: {} }

// === Search result cards ===
console.log('\n=== Search Result Cards ===')
const cardCandidates = [
  '[data-view-name="people-search-result"]',
  'li.reusable-search__result-container',
  '.entity-result',
  '.search-results-container ul > li',
]
for (const sel of cardCandidates) {
  const count = await page.locator(sel).count()
  console.log(`  ${sel} => ${count}`)
  if (count > 0 && !results.searchResults.card) results.searchResults.card = sel
}

// === Name link ===
console.log('\n=== Name Link ===')
const nameCandidates = [
  'a[data-view-name="search-result-lockup-title"]',
  '.entity-result__title-text a',
  'a.app-aware-link span[aria-hidden="true"]',
]
for (const sel of nameCandidates) {
  const count = await page.locator(sel).count()
  const text = count > 0 ? await page.locator(sel).first().textContent().catch(() => '') : ''
  console.log(`  ${sel} => ${count} ${text ? `("${text.trim()}")` : ''}`)
  if (count > 0 && !results.searchResults.name) results.searchResults.name = sel
}

// === Connect link/button ===
console.log('\n=== Connect Button ===')
const connectCandidates = [
  'a[aria-label*="Invite"][aria-label*="to connect"]',
  'button[aria-label*="Invite"][aria-label*="to connect"]',
  'button:has-text("Connect")',
]
for (const sel of connectCandidates) {
  const count = await page.locator(sel).count()
  console.log(`  ${sel} => ${count}`)
  if (count > 0 && !results.searchResults.connectLink) results.searchResults.connectLink = sel
}

// === Pending link ===
const pendingCandidates = [
  'a[aria-label*="Pending"]',
  'button[aria-label*="Pending"]',
  'span:has-text("Pending")',
]
for (const sel of pendingCandidates) {
  const count = await page.locator(sel).count()
  if (count > 0 && !results.searchResults.pendingLink) results.searchResults.pendingLink = sel
}

// === Next page button ===
console.log('\n=== Pagination ===')
const nextCandidates = [
  'button[data-testid="pagination-controls-next-button-visible"]',
  'button[aria-label="Next"]',
  'button:has-text("Next")',
  '.artdeco-pagination__button--next',
]
for (const sel of nextCandidates) {
  const count = await page.locator(sel).count()
  console.log(`  ${sel} => ${count}`)
  if (count > 0 && !results.nextPage.button) results.nextPage.button = sel
}

// === Test invite modal (click first Connect, then detect modal buttons) ===
console.log('\n=== Invite Modal ===')
if (results.searchResults.connectLink) {
  const connectEl = page.locator(results.searchResults.connectLink).first()
  const label = await connectEl.getAttribute('aria-label').catch(() => '')
  console.log(`  Clicking: ${label}`)
  await connectEl.click()
  await page.waitForTimeout(2000)

  const modalCandidates = [
    'button[aria-label="Send without a note"]',
    'button:has-text("Send without a note")',
    'button:has-text("Send now")',
    '.artdeco-modal button.artdeco-button--primary',
  ]
  for (const sel of modalCandidates) {
    const count = await page.locator(sel).count()
    const visible = count > 0 ? await page.locator(sel).first().isVisible() : false
    console.log(`  ${sel} => ${count}, visible: ${visible}`)
    if (visible && !results.inviteModal.sendWithoutNote) results.inviteModal.sendWithoutNote = sel
  }

  // Dismiss modal
  const dismissBtn = page.locator('button[aria-label="Dismiss"]').first()
  if (await dismissBtn.isVisible().catch(() => false)) {
    await dismissBtn.click()
    await page.waitForTimeout(500)
  }
} else {
  console.log('  No connect link found, skipping modal test')
}

// === Output ===
console.log('\n=== Detected Selectors ===')
console.log(JSON.stringify(results, null, 2))

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2))
console.log(`\nSaved to ${OUTPUT_PATH}`)

// Check for missing selectors
const missing = []
if (!results.searchResults.card) missing.push('searchResults.card')
if (!results.searchResults.name) missing.push('searchResults.name')
if (!results.searchResults.connectLink) missing.push('searchResults.connectLink')
if (!results.inviteModal.sendWithoutNote) missing.push('inviteModal.sendWithoutNote')
if (!results.nextPage.button) missing.push('nextPage.button')

if (missing.length) {
  console.log(`\n⚠ Missing selectors: ${missing.join(', ')}`)
} else {
  console.log('\n✓ All selectors detected successfully')
}

console.log('\nPress ENTER to close browser.')
await new Promise(r => process.stdin.once('data', r))
await browser.close()
