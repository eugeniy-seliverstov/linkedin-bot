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

const formatData = (data) => {
  if (!data) return ''
  if (data instanceof Error) return ` ${data.message}\n${data.stack}`
  if (Object.keys(data).length) return ` ${JSON.stringify(data)}`
  return ''
}

const writeLog = (level, message, data) => {
  const timestamp = new Date().toISOString()
  const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}${formatData(data)}\n`

  console.log(logEntry.trim())

  fs.appendFile(getLogFilePath(), logEntry, (err) => {
    if (err) console.error('Error writing log file', err)
  })
}

export const log = {
  info: (message, data) => writeLog('info', message, data),
  warn: (message, data) => writeLog('warn', message, data),
  error: (message, data) => writeLog('error', message, data),
}
