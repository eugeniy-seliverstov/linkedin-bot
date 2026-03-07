import 'dotenv/config'

function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    console.error(`Missing required env variable: ${name}`)
    process.exit(1)
  }
  return value
}

export const config = {
  linkedinLogin: requireEnv('LINKEDIN_LOGIN'),
  linkedinPassword: requireEnv('LINKEDIN_PASSWORD'),
  searchUrl: requireEnv('SEARCH_URL'),
  maxPage: parseInt(process.env.MAX_PAGE) || 300,
  maxClickedProfiles: parseInt(process.env.MAX_CLICKED_PROFILES) || 15,
  shouldAddMessage: process.env.SHOULD_ADD_MESSAGE === 'true',
  timeout: parseInt(process.env.TIMEOUT) || 30000,
  randomMaxTimeout: parseInt(process.env.RANDOM_MAX_TIMEOUT) || 5000,
}
