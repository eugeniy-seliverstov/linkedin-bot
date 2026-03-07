---
name: update-selectors
description: Detect and update LinkedIn CSS selectors when the bot stops working due to LinkedIn UI changes. Launches a browser, analyzes the page, and updates src/selectors.js.
user_invocable: true
---

# Update LinkedIn Selectors

## 1. Run the detection script

Run interactively — the user provides SEARCH_URL and may need to log in manually:

```bash
node scripts/update-selectors.js
```

Wait for completion. Output: `scripts/detected-selectors.json`.

## 2. Apply detected selectors

Read `scripts/detected-selectors.json` and `src/selectors.js`. Update each selector in `src/selectors.js` with the detected value. Only replace selectors that were successfully detected (non-empty string). Keep existing values for any missing ones.

## 3. Verify

Run `pnpm lint` to validate the updated file.

## 4. Report

List which selectors changed and which stayed the same. Warn about any undetected selectors — those may need manual inspection.
