import 'dotenv/config'

function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    console.error(`Missing required env variable: ${name}`)
    process.exit(1)
  }
  return value
}

function requireLinkedInUrl(name) {
  const value = requireEnv(name)
  try {
    const parsed = new URL(value)
    if (!parsed.hostname.endsWith('linkedin.com')) {
      console.error(`${name} must be a linkedin.com URL`)
      process.exit(1)
    }
  } catch {
    console.error(`${name} is not a valid URL`)
    process.exit(1)
  }
  return value
}

export const config = {
  searchUrl: requireLinkedInUrl('SEARCH_URL'),
  maxPage: parseInt(process.env.MAX_PAGE) || 300,
  maxClickedProfiles: parseInt(process.env.MAX_CLICKED_PROFILES) || 15,
  timeout: parseInt(process.env.TIMEOUT) || 30000,
  randomMaxTimeout: parseInt(process.env.RANDOM_MAX_TIMEOUT) || 5000,
}
