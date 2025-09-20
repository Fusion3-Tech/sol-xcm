import fs from 'fs';
import path from 'path';

// Sanitize enum/identifier names for Solidity
export const sanitize = (s: string) => s.replace(/[^A-Za-z0-9_]/g, '_');

export function ensureWritePathValid(filePath: string) {
  const dir = path.dirname(filePath);
  if (dir && dir !== '.') fs.mkdirSync(dir, { recursive: true });
}
