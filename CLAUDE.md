# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev            # Run the bot (visible browser)
pnpm start:stealth  # Run in headless mode
pnpm lint           # ESLint check
pnpm lint:fix       # ESLint auto-fix
```

Package manager: **pnpm**.

## Architecture

LinkedIn automation bot built with Puppeteer (via `puppeteer-extra` + stealth plugin). Pure JavaScript, ES modules (`"type": "module"`). All source code lives under `src/`.

```
src/
  index.js          # Entry point + orchestration, graceful shutdown
  config.js         # Centralized env config with validation
  selectors.js      # All LinkedIn CSS selectors
  modules/
    browser.js      # Puppeteer launch (stealth plugin), scrollDown
    auth.js         # Login flow with cookie reuse
    connect.js      # Profile connection logic
    messages.js     # Connection message templates (NAME placeholder)
    navigation.js   # Search results pagination
  utils/
    cookies.js      # Cookie persistence to cookies.json
    logger.js       # File + console logger (logs/YYYY-MM-DD.log)
    timeout.js      # Random delay helper
```

Modules receive `page`/`browser` as arguments (dependency injection). Errors bubble up to a single top-level handler in `src/index.js`.

## Configuration

All config via `.env` (see `.env.example`). Required: `LINKEDIN_LOGIN`, `LINKEDIN_PASSWORD`, `SEARCH_URL`. Optional: `MAX_PAGE`, `TIMEOUT`, `MAX_CLICKED_PROFILES`, `SHOULD_ADD_MESSAGE`, `RANDOM_MAX_TIMEOUT`.

## Code Style

- ESLint flat config (`eslint.config.js`): extends `recommended`
- No TypeScript — plain JS with ES module imports
