# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
yarn dev          # Run the bot (visible browser)
yarn start:stealth # Run in headless mode
yarn lint         # ESLint check
yarn lint:fix     # ESLint auto-fix
```

Package manager: **yarn** (yarn.lock present).

## Architecture

LinkedIn automation bot built with Puppeteer (via `puppeteer-extra` + stealth plugin). Pure JavaScript, ES modules (`"type": "module"`).

**Entry point:** `index.js` — contains the entire bot flow: browser launch, login (with cookie reuse), search page navigation, profile iteration, connection requests, pagination. All CSS selectors are defined in the `selectors` object at the top of `index.js`.

**Modules:**
- `modules/messages.js` — array of connection message templates with `NAME` placeholder, random selection via `getConnectionMessage(name)`
- `modules/skills.js` — skill endorsement function (currently unused/commented out in index.js)

**Utils:**
- `utils/cookies.js` — save/load browser cookies to `cookies.json` for session persistence
- `utils/logger.js` — simple file+console logger, writes daily log files to `logs/YYYY-MM-DD.log`
- `utils/timeout.js` — random delay helper using `RANDOM_MAX_TIMEOUT` env var

## Configuration

All config via `.env` (see `.env.example`). Key variables: `LINKEDIN_LOGIN`, `LINKEDIN_PASSWORD`, `SEARCH_URL`, `MAX_PAGE`, `MAX_CLICKED_PROFILES`, `SHOULD_ADD_MESSAGE`, `RANDOM_MAX_TIMEOUT`.

## Code Style

- ESLint flat config (`eslint.config.js`): single quotes, no semicolons, object curly spacing
- No TypeScript — plain JS with ES module imports
