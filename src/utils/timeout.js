import { config } from '../config.js'

export function randomTimeout(maxTimeout = config.randomMaxTimeout) {
  const ms = Math.floor(Math.random() * maxTimeout) + 1
  return new Promise(resolve => setTimeout(resolve, ms))
}
