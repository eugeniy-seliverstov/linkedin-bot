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
5. Customize messages in `src/modules/messages.js`. Use `NAME` as a placeholder — it will be replaced with the target's first name. A random message is chosen each time.
6. Run the bot:
   - Visible browser: `pnpm dev`
   - Headless mode: `pnpm start:stealth`

## Configuration

The `.env` file should contain the following environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `LINKEDIN_LOGIN` | Yes | Email address associated with the LinkedIn account |
| `LINKEDIN_PASSWORD` | Yes | Password for the LinkedIn account |
| `SEARCH_URL` | Yes | URL of the LinkedIn search results page. **Use 1st and 2nd circles in search, not 3rd!** |
| `MAX_PAGE` | No | Maximum number of pages to scrape (default: 300) |
| `TIMEOUT` | No | Maximum time in ms to wait for page elements (default: 30000) |
| `RANDOM_MAX_TIMEOUT` | No | Maximum random delay in ms between actions (default: 5000) |
| `MAX_CLICKED_PROFILES` | No | Maximum number of connection requests to send (default: 15) |
| `SHOULD_ADD_MESSAGE` | No | Include a personalized message in requests (`true`/`false`) |

## How It Works
1. Launches a Puppeteer-controlled browser and attempts to reuse saved cookies for authentication.
2. If not logged in, navigates to the LinkedIn login page and authenticates with provided credentials.
3. Navigates to the search results page using the provided URL.
4. Iterates over each profile on the page, sending a connection request if a "Connect" button is available, optionally including a personalized message.
5. Repeats for each subsequent page of search results until the maximum page count is reached.
6. Once the maximum number of connection requests is sent, saves cookies, writes a log file, and closes the browser.
