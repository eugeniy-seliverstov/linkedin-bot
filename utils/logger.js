import fs from 'fs'
import path from 'path'

const LOG_DIR = './logs'

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true })
}

const getLogFilePath = () => {
  const date = new Date().toISOString().split('T')[0]
  return path.join(LOG_DIR, `${date}.log`)
}

const writeLog = (level, message, data = {}) => {
  const timestamp = new Date().toISOString()
  const logData = data && Object.keys(data).length ? ` ${JSON.stringify(data)}` : ''

  const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}${logData}\n`

  console.log(logEntry.trim())

  const filePath = getLogFilePath()
  fs.appendFile(filePath, logEntry, (err) => {
    if (err) console.error('Error writing log file', err)
  })
}

export const log = {
  info: (message, data) => writeLog('info', message, data),
  warn: (message, data) => writeLog('warn', message, data),
  error: (message, data) => writeLog('error', message, data),
}
