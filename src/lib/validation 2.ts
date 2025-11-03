import { z } from 'zod';

export function parseQuery<T extends z.ZodTypeAny>(schema: T, searchParams: URLSearchParams) {
  const obj = Object.fromEntries(searchParams.entries());
  const result = schema.safeParse(obj);
  if (!result.success) {
    const message = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
    return { success: false as const, message, issues: result.error.issues };
  }
  return { success: true as const, data: result.data as z.infer<T> };
}

export async function parseJsonBody<T extends z.ZodTypeAny>(schema: T, req: Request) {
  const body = await req.json().catch(() => undefined);
  const result = schema.safeParse(body);
  if (!result.success) {
    const message = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
    return { success: false as const, message, issues: result.error.issues };
  }
  return { success: true as const, data: result.data as z.infer<T> };
}

