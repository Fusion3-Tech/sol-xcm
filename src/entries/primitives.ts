import { ArgType } from './types';

export function classifyPrimitive(type: string): ArgType {
  const t = type.replace(/\s/g, '').toLowerCase();
  if (t.includes('multiaddress')) return 'MultiAddressId32';
  if (t.includes('accountid32') || t === 'accountid') return 'AccountId32';
  if (t.startsWith('compact<')) {
    if (t.includes('u128') || t.includes('balance')) return 'CompactU128';
    if (t.includes('u32')) return 'CompactU32';
  }
  if (t === 'bool') return 'Bool';
  if (t === 'u8') return 'U8';
  if (t === 'u16') return 'U16';
  if (t === 'u32') return 'U32';
  if (t === 'u64') return 'U64';
  if (t === 'u128' || t.endsWith('balance')) return 'U128';
  if (t === 'bytes' || t === 'vec<u8>' || t.includes('boundedvec<u8')) return 'Bytes';
  return 'Unsupported';
}
