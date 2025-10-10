import type { Config } from 'drizzle-kit';

export default {
  schema: './db/schema.ts',
  out: './db/migrations',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: '4f114494-537e-4c31-8271-79f3ee49dfed',
    token: process.env.CLOUDFLARE_API_TOKEN!,
  },
} satisfies Config;
