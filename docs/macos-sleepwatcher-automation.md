# Auto-launch on macOS with sleepwatcher

The bot runs automatically when your Mac wakes up / is unlocked.

## Install sleepwatcher

```bash
brew install sleepwatcher
```

## Setup

### 1. Create the launch script

```bash
mkdir -p ~/.config/linkedin-bot
```

Create `~/.config/linkedin-bot/run.sh`:

```bash
#!/bin/bash

# Paths (adjust Node version and bot directory if needed)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
BOT_DIR="$HOME/linkedin-bot"
LOG="$BOT_DIR/logs/automation.log"
LOCK="$HOME/.config/linkedin-bot/last-run"

# Run only once per day
TODAY=$(date +%Y-%m-%d)
if [ -f "$LOCK" ] && [ "$(cat "$LOCK")" = "$TODAY" ]; then
  echo "$(date) Already ran today, skipping" >> "$LOG"
  exit 0
fi

# Skip if already running
if pgrep -f "node src/index.js" > /dev/null; then
  echo "$(date) Bot already running, skipping" >> "$LOG"
  exit 0
fi

echo "$TODAY" > "$LOCK"
echo "$(date) Starting bot..." >> "$LOG"
cd "$BOT_DIR" && pnpm start >> "$LOG" 2>&1 &
```

Make it executable:

```bash
chmod +x ~/.config/linkedin-bot/run.sh
```

### 2. Hook into sleepwatcher

Create `~/.wakeup` (sleepwatcher runs this on wake):

```bash
#!/bin/bash
# Wait 10 sec for Wi-Fi to connect
sleep 10
~/.config/linkedin-bot/run.sh
```

```bash
chmod +x ~/.wakeup
```

### 3. Start sleepwatcher as a service

```bash
brew services start sleepwatcher
```

Verify it's running:

```bash
brew services info sleepwatcher
```

## How it works

1. Mac wakes up / is unlocked
2. sleepwatcher triggers `~/.wakeup`
3. Script waits 10 sec (Wi-Fi) and starts the bot
4. Bot checks cookies:
   - **Valid cookies** — runs automatically
   - **Session expired** — sends a macOS notification with sound, waits up to 5 min for manual login
5. Bot finishes and exits

## Disable

```bash
brew services stop sleepwatcher
rm ~/.wakeup
```
