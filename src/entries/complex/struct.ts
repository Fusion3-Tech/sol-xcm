import { RESERVED, toIdent } from './common';

type StructShape = { _struct: Record<string, string> } | Record<string, string>; // e.g. { parents: 'u8', interior: 'StagingXcmV5Junctions' }

function isStructShape(x: any): x is StructShape {
  if (x && typeof x === 'object' && !Array.isArray(x)) {
    if ('_enum' in x) return false;
    if ('_struct' in x) return typeof x._struct === 'object' && x._struct !== null;
    // plain object of field -> type
    return Object.values(x).every((v) => typeof v === 'string');
  }
  return false;
}

function toVarIdent(x: string): string {
  // lowerCamelCase, strip non-alphanumerics, avoid leading digits & reserved words
  const cleaned = x.replace(/[^a-zA-Z0-9]+/g, ' ').trim();
  let parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'x';
  let head = parts[0].toLowerCase();
  let tail = parts.slice(1).map((s) => s[0]?.toUpperCase() + s.slice(1));
  let out = head + tail.join('');
  if (/^[0-9]/.test(out)) out = '_' + out;
  if (RESERVED.has(out)) out = out + '_';
  return out;
}

/** Map registry/alias names to Solidity *field types* used inside the struct. */
function solidityFieldTypeOf(typeRef: string): string {
  const t = typeRef.replace(/\s+/g, '');
  const PRIMS: Record<string, string> = {
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

  if (PRIMS[t]) return PRIMS[t];
  if (/^Vec<u8>$/.test(t)) return 'bytes';
  if (/^\[u8;[0-9]+\]$/.test(t)) return 'bytes'; // fixed-size byte-array from metadata → bytes (simplest)
  // Fallback: user-defined type (enum/struct/tuple wrapper). Keep as type name.
  return toIdent(typeRef);
}

/** Which codec library to call for a field when encoding. */
function codecNameOf(typeRef: string): string {
  // Normalize a few common aliases so you can implement these codec libs once.
  const t = typeRef.replace(/\s+/g, '');
  const ALIASES: Record<string, string> = {
    u8: 'U8',
    u16: 'U16',
    u32: 'U32',
    u64: 'U64',
    u128: 'U128',
    u256: 'U256',
    i8: 'I8',
    i16: 'I16',
    i32: 'I32',
    i64: 'I64',
    i128: 'I128',
    i256: 'I256',
    bool: 'Bool',
    H256: 'H256',
    H160: 'H160',
    AccountId32: 'AccountId32',
    Bytes: 'Bytes',
    String: 'String',
    string: 'String',
  };
  if (ALIASES[t]) return ALIASES[t];

  if (/^Vec<u8>$/.test(t)) return 'Bytes'; // treat Vec<u8> as Bytes
  if (/^\[u8;[0-9]+\]$/.test(t)) return 'FixedBytes'; // your FixedBytesCodec should take bytes memory

  // Fallback: user-defined. Use sanitized PascalCase type name.
  return toIdent(typeRef);
}

function extractStructFields(def: StructShape): { name: string; typeRef: string }[] {
  const rec = '_struct' in (def as any) ? (def as any)._struct : def;
  return Object.entries(rec).map(([k, v]) => ({ name: toVarIdent(k), typeRef: v as string }));
}

export function generateSolidityStruct(typeName: string, json: string | StructShape): string {
  const def = typeof json === 'string' ? JSON.parse(json) : json;
  if (!isStructShape(def))
    throw new Error('Not a struct JSON (expected {_struct:{...}} or plain {field:type})');

  const structName = toIdent(typeName);
  const fields = extractStructFields(def);

  const structBody = fields
    .map(({ name, typeRef }) => `    ${solidityFieldTypeOf(typeRef)} ${name};`)
    .join('\n');

  const encodeArgs = fields
    .map(({ name, typeRef }) => `${codecNameOf(typeRef)}Codec.encode(s.${name})`)
    .join(', ');

  return `// Auto-generated from Substrate struct ${typeName}

struct ${structName} {
${structBody}
}

library ${structName}Codec {
    // SCALE encode: concatenate field encodings in declaration order
    function encode(${structName} memory s) internal pure returns (bytes memory) {
        return abi.encodePacked(${encodeArgs});
    }
}
`;
}
