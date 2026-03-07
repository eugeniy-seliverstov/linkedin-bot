import { execFileSync } from 'child_process'
import { saveCookies } from '../utils/cookies.js'
import { log } from '../utils/logger.js'

const LOGIN_WAIT_TIMEOUT = 5 * 60 * 1000 // 5 minutes to log in manually

export async function ensureLoggedIn(context, page) {
  log.info('Checking LinkedIn session...')
  await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' })

  const title = await page.title()
  if (title.includes('Feed')) {
    log.info('Already logged in')
    await saveCookies(context)
    return
  }

  // Session expired — notify user and wait for manual login
  log.warn('Not logged in. Waiting for manual login...')
  notify('LinkedIn Bot', 'Session expired. Please log in manually in the browser window.')

  await page.waitForURL('**/feed/**', { timeout: LOGIN_WAIT_TIMEOUT })

  log.info('Login detected, saving cookies')
  await saveCookies(context)
  log.info('Cookies saved, continuing')
}

function notify(title, message) {
  try {
    const esc = (s) => s.replaceAll('\\', '\\\\').replaceAll('"', '\\"')
    if (process.platform === 'darwin') {
      execFileSync('osascript', ['-e', `display notification "${esc(message)}" with title "${esc(title)}" sound name "default"`])
    } else if (process.platform === 'win32') {
      const ps = `Add-Type -AssemblyName System.Windows.Forms; $n = New-Object System.Windows.Forms.NotifyIcon; $n.Icon = [System.Drawing.SystemIcons]::Information; $n.Visible = $true; $n.ShowBalloonTip(5000, "${esc(title)}", "${esc(message)}", [System.Windows.Forms.ToolTipIcon]::Info); Start-Sleep -s 6; $n.Dispose()`
      execFileSync('powershell', ['-NoProfile', '-Command', ps])
    } else {
      execFileSync('notify-send', [title, message])
    }
  } catch {
    // Notification failed, not critical
  }
}
