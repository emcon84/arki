function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required environment variable: ${key}`)
  return value
}

export const env = {
  anthropicApiKey: requireEnv('ANTHROPIC_API_KEY'),
  databaseUrl: requireEnv('DATABASE_URL'),
  resendApiKey: process.env.RESEND_API_KEY,
  adminSecret: process.env.ADMIN_SECRET,
  feedbackEmail: process.env.FEEDBACK_EMAIL ?? 'emcon84@gmail.com',
}
