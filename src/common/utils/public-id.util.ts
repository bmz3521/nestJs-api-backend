import { randomBytes } from 'crypto';

export function generatePublicId(): string {
  return randomBytes(16).toString('hex');
}
