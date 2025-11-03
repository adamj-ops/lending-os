import crypto from 'crypto';

function timingSafeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function hmacSha256(secret: string, payload: string): { hex: string; base64: string } {
  const h = crypto.createHmac('sha256', secret);
  h.update(payload, 'utf8');
  const digest = h.digest();
  return { hex: digest.toString('hex'), base64: digest.toString('base64') };
}

export function verifyHmac({
  secret,
  payload,
  signature,
}: {
  secret: string;
  payload: string;
  signature: string;
}): boolean {
  const sig = signature.trim();
  const computed = hmacSha256(secret, payload);
  try {
    if (/^[a-f0-9]{64}$/i.test(sig)) {
      return timingSafeEqual(Buffer.from(computed.hex, 'utf8'), Buffer.from(sig, 'utf8'));
    }
    // Allow formats like 'sha256=...' or base64 string
    const cleaned = sig.includes('=') ? sig.split('=')[1] : sig;
    return timingSafeEqual(Buffer.from(computed.base64, 'utf8'), Buffer.from(cleaned, 'utf8'));
  } catch {
    return false;
  }
}

