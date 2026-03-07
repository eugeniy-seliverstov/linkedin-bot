# LINKEDIN-BOT by pullso

This script is designed to automate the process of sending connection requests to LinkedIn users who match a certain search query.

## Prerequisites
- Node.js installed
- pnpm installed (`npm install -g pnpm`)
- LinkedIn account

## Getting Started
1. Clone the repository
2. Set LinkedIn language to English.
3. Install dependencies: `pnpm install`
4. Copy `.env.example` to `.env` and fill in the required values.
5. Run the bot:
   - Visible browser: `pnpm dev`
   - Headless mode: `pnpm start:headless`

## Configuration

Copy `.env.example` to `.env` and fill in the required values:

| Variable | Required | Description |
|----------|----------|-------------|
| `SEARCH_URL` | Yes | URL of the LinkedIn search results page. **Use 1st and 2nd circles in search, not 3rd!** |
| `MAX_PAGE` | No | Maximum number of pages to process (default: 300) |
| `TIMEOUT` | No | Maximum time in ms to wait for page elements (default: 30000) |
| `RANDOM_MAX_TIMEOUT` | No | Maximum random delay in ms between actions (default: 5000) |
| `MAX_CLICKED_PROFILES` | No | Maximum number of connection requests to send per run (default: 15) |

## Authentication

The bot uses **cookie-based authentication**. No credentials are stored in config.

1. On first run, a browser window opens — log in manually.
2. Cookies are saved to `cookies.json` and reused on subsequent runs.
3. If the session expires, the bot sends a **macOS notification** and waits up to 5 minutes for you to log in again.

## How It Works
1. Launches a Playwright-controlled Chromium browser and loads saved cookies.
2. Checks if the LinkedIn session is active. If not, waits for manual login.
3. Navigates to the search results page using the provided URL.
4. Iterates over each profile on the page, sending a connection request if a "Connect" link is available.
5. Repeats for each subsequent page until the maximum page count or connection limit is reached.

## Updating Selectors

LinkedIn periodically changes its HTML structure, which can break the bot (e.g. "No cards found", connect button not found, timeouts). When this happens, run the selector detection script to find working selectors and update `src/selectors.js` automatically.

```bash
node scripts/update-selectors.js
```

The script opens a browser, navigates to your search page, tests multiple selector candidates, and saves results to `scripts/detected-selectors.json`.

**If you use Claude Code**, run the `/update-selectors` skill — it executes the script, reads the output, and updates `src/selectors.js` in one step.

## macOS Automation

You can configure the bot to run automatically once per day whenever your Mac wakes up or is unlocked, using **sleepwatcher**.

See [docs/macos-sleepwatcher-automation.md](docs/macos-sleepwatcher-automation.md) for the full setup guide.
