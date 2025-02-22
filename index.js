import dotenv from 'dotenv'
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

import { getConnectionMessage } from './modules/messages.js'

import { log } from './utils/logger.js'
import { randomTimeout } from './utils/timeout.js'
import { loadCookies, saveCookies } from './utils/cookies.js'

dotenv.config()
puppeteer.use(StealthPlugin())

// Configuration
const LINKEDIN_LOGIN = process.env.LINKEDIN_LOGIN
const LINKEDIN_PASSWORD = process.env.LINKEDIN_PASSWORD
const SEARCH_URL = process.env.SEARCH_URL
const MAX_PAGE = parseInt(process.env.MAX_PAGE) || 300
const MAX_CLICKED_PROFILES = parseInt(process.env.MAX_CLICKED_PROFILES) || 15
const SHOULD_ADD_MESSAGE = process.env.SHOULD_ADD_MESSAGE === 'true'
const TIMEOUT = parseInt(process.env.TIMEOUT) || 30000

let LOOKED_PROFILES = 0
let CLICKED_PROFILES = 0

const { browser, page } = await launchBrowser()

// Set up a function to launch Puppeteer and load cookies if available
async function launchBrowser() {
  const browser = await puppeteer.launch({
    headless: process.argv.includes('--stealth') ? 'new' : false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    timeout: TIMEOUT,
  })
  const page = await browser.newPage()
  await loadCookies(page)
  return { browser, page }
}

const selectors = {
  loginForm: {
    username: '#username', password: '#password', submit: '.login__form_action_container button',
  },
  searchResults: {
    item: '.search-results-container > div:nth-child(2) > div > ul > li',
    subtitle: '.mb1 > div:nth-child(2)',
    connectButton: 'div > div > div > div:nth-child(3) button',
    sendButton: 'button[aria-label="Send without a note"]',
    addMessageButton: 'button[aria-label="Add a note"]',
    inviteHeaderMsg: '.artdeco-modal h2#send-invite-modal',
    name: '.entity-result__title-line--2-lines > span > a > span > span:nth-child(1)',
  },
  nextPage: {
    button: 'button[aria-label="Next"]',
  },
  skills: {
    skillButton: '.pv2', button: 'button'
  }
}

async function login() {
  try {
    log.info('Opening LinkedIn login page')
    await page.goto('https://linkedin.com/login', { waitUntil: 'domcontentloaded', timeout: TIMEOUT })

    await page.type(selectors.loginForm.username, LINKEDIN_LOGIN, { delay: 100 })
    await page.type(selectors.loginForm.password, LINKEDIN_PASSWORD, { delay: 100 })

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: TIMEOUT }),
      page.click(selectors.loginForm.submit)
    ])
    log.info('Login successful')
  } catch (err) {
    log.error('Error while logging in', err)
  }
}

async function finish() {
  log.info('Finishing script execution')
  log.info(`Profiles viewed: ${LOOKED_PROFILES}`)
  log.info(`Profiles connected: ${CLICKED_PROFILES}`)

  await browser.close()
}

async function connectPerson(card) {
  try {
    const subtitle = await card.$eval(selectors.searchResults.subtitle, element => element.textContent.trim())
    let connectBtn

    try {
      connectBtn = await card.waitForSelector(selectors.searchResults.connectButton, { timeout: TIMEOUT })
    } catch (error) {
      log.info('No connect button found', error)
      connectBtn = null
    }

    const buttonText = await connectBtn?.evaluate(btn => btn.textContent.trim())
    log.info(`Button text: "${buttonText}"`)

    if (buttonText.includes('Connect')) {
      log.info(`Connecting to ${subtitle}`)
      await connectBtn?.click()

      if (SHOULD_ADD_MESSAGE) {
        const name = await card.$eval(selectors.searchResults.name, element => element.textContent.trim().split(' ')[0])
        log.info(`Adding message to ${name}`)

        const addMessageBtn = await page.waitForSelector(selectors.searchResults.addMessageButton, { timeout: TIMEOUT })
        await addMessageBtn.click()

        const msg = getConnectionMessage(name)
        await page.type('textarea', msg, { delay: 100 })
      }

      const sendBtn = await page.waitForSelector(selectors.searchResults.sendButton, { timeout: TIMEOUT })
      await sendBtn.click()
      await randomTimeout()

      CLICKED_PROFILES += 1
      log.info('Connection request sent')

      await randomTimeout()
    }
  } catch (err) {
    log.error('Error while connecting to a person', err)
  }
}

async function connectPeople() {
  try {
    await page.waitForSelector(selectors.searchResults.item, { timeout: TIMEOUT })

    const cards = await page.$$(selectors.searchResults.item)
    LOOKED_PROFILES += cards.length
    log.info(`Found ${cards.length} profiles`)

    for (const card of cards) {
      await connectPerson(card)

      if (CLICKED_PROFILES >= MAX_CLICKED_PROFILES) {
        break
      }
    }
  } catch (err) {
    log.error('Error while connecting to people', err)
  }
}

async function goNext() {
  try {
    log.info('Moving to the next page')
    const nextBtn = await page.waitForSelector(selectors.nextPage.button, { visible: true, timeout: TIMEOUT })

    await Promise.all([page.waitForNavigation({ timeout: TIMEOUT }), nextBtn.click(),])
    await randomTimeout()
    log.info('Moved to the next page')
  } catch (err) {
    log.error('Error while going to the next page', err)
  }
}

async function start() {
  try {
    log.info('Starting LinkedIn bot')
    await page.setViewport({ width: 1080, height: 1024 })

    log.info('Navigating to LinkedIn feed')
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded', timeout: TIMEOUT })

    const isLoggedIn = (await page.title()).includes('Feed')
    if (!isLoggedIn) await login()

    await saveCookies(page)
    log.info('Cookies saved')

    log.info('Navigating to search page')
    await page.goto(SEARCH_URL, { waitUntil: 'domcontentloaded', timeout: TIMEOUT })

    // await increaseSkills()

    for (let i = 0; i < MAX_PAGE; i++) {
      log.info(`Processing page ${i + 1} of ${MAX_PAGE}`)
      await scrollDown()
      await connectPeople()

      if (MAX_CLICKED_PROFILES > CLICKED_PROFILES) {
        await goNext()
      } else {
        log.info('Max clicked profiles reached, stopping')
        break
      }
    }

    await finish()
  } catch (err) {
    log.error('Error while starting the program', err)
  }
}

async function scrollDown() {
  try {
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0
        let distance = 100
        let timer = setInterval(() => {
          let scrollHeight = document.body.scrollHeight
          window.scrollBy(0, distance)
          totalHeight += distance
          if (totalHeight >= scrollHeight) {
            clearInterval(timer)
            resolve()
          }
        }, 100)
      })
    })
  } catch (err) {
    log.error('Error while scrolling down', err)
  }
}

start()
