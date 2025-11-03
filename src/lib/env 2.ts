import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url().min(1),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1).optional(),
  CLERK_SECRET_KEY: z.string().min(1).optional(),
  // Add optional integrations as needed; keep optional to avoid blocking local dev
  // AWS_ACCESS_KEY_ID: z.string().optional(),
  // AWS_SECRET_ACCESS_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
  throw new Error(`Invalid environment variables: ${issues}`);
}

export const env = parsed.data;

