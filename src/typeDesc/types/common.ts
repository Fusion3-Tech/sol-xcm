export const RESERVED = new Set([
  'break',
  'case',
  'delete',
  'do',
  'else',
  'for',
  'function',
  'if',
  'in',
  'instanceof',
  'new',
  'return',
  'switch',
  'this',
  'throw',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'contract',
  'library',
  'struct',
  'enum',
  'event',
  'error',
  'mapping',
  'address',
  'bool',
  'string',
  'bytes',
  'int',
  'uint',
  'public',
  'private',
  'internal',
  'external',
  'pure',
  'view',
  'payable',
  'memory',
  'storage',
  'calldata',
  'constant',
  'immutable',
  'override',
  'virtual',
  'using',
  'as',
  'constructor',
  'receive',
  'fallback',
  'abstract',
]);

export function toIdent(x: string): string {
  // PascalCase, strip non-alphanumerics, avoid leading digits & reserved words
  const cleaned = x.replace(/[^a-zA-Z0-9]+/g, ' ').trim();
  let pascal = cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map((s) => s[0]?.toUpperCase() + s.slice(1))
    .join('');
  if (!pascal) pascal = 'X';
  if (/^[0-9]/.test(pascal)) pascal = '_' + pascal;
  if (RESERVED.has(pascal)) pascal = pascal + '_';
  return pascal;
}
