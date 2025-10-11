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

export const PRIMS: Record<string, string> = {
  // unsigned
  u8: 'uint8',
  u16: 'uint16',
  u32: 'uint32',
  u64: 'uint64',
  u128: 'uint128',
  u256: 'uint256',
  // signed
  i8: 'int8',
  i16: 'int16',
  i32: 'int32',
  i64: 'int64',
  i128: 'int128',
  i256: 'int256',
  bool: 'bool',
  // common hashes/ids
  H256: 'bytes32',
  H160: 'bytes20',
  AccountId32: 'bytes32',
  // strings/bytes
  Bytes: 'bytes',
  String: 'string',
  string: 'string',
};
