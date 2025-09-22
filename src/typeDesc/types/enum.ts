import { toIdent } from './common';

type VariantShape = null | number | string | string[] | Record<string, string>;
type EnumJson = { _enum: string[] } | { _enum: Record<string, VariantShape> };

type Field = { name?: string; type: string };
type Variant = { name: string; index: number; fields: Field[] };

function extractVariants(def: EnumJson): Variant[] {
  if (Array.isArray((def as any)._enum)) {
    // Pure tag enum
    return (def as { _enum: string[] })._enum.map((n, i) => ({
      name: toIdent(n),
      index: i,
      fields: [],
    }));
  }

  const raw = (def as { _enum: Record<string, VariantShape> })._enum;
  const entries = Object.entries(raw).map(([k, v], i) => {
    const name = toIdent(k);
    let index: number = i;
    let fields: Field[] = [];

    if (typeof v === 'number') {
      index = v;
    } else if (v === null) {
      fields = [];
    } else if (typeof v === 'string') {
      fields = [{ type: v }];
    } else if (Array.isArray(v)) {
      fields = v.map((t) => ({ type: t }));
    } else if (typeof v === 'object') {
      fields = Object.entries(v).map(([fname, t]) => ({ name: toIdent(fname), type: t }));
    } else {
      throw new Error(`Unsupported enum variant shape for ${name}`);
    }

    return { name, index, fields };
  });

  // normalize indices to 0..N-1 in order of "index"
  return entries.sort((a, b) => a.index - b.index).map((e, i) => ({ ...e, index: i }));
}

export function generateSolidityEnum(typeName: string, json: string | EnumJson): string {
  const def: EnumJson = typeof json === 'string' ? JSON.parse(json) : json;
  if (!('_enum' in def)) throw new Error('Not an enum JSON (missing _enum)');

  const enumName = toIdent(typeName);
  const variants = extractVariants(def);
  const tagName = `${enumName}Tag`;
  const libName = `${enumName}Codec`;

  const tagMembers = variants.map((v) => `    ${v.name}`).join(',\n');

  const payloadStructs = variants
    .map((v) => {
      if (v.fields.length === 0) return `// ${v.name} has no payload`;
      const lines = v.fields
        .map((f, i) => {
          const solT = solTypeOf(f.type);
          const fname = f.name ?? `_${i}`;
          return `        ${solT} ${fname};`;
        })
        .join('\n');
      return `struct ${v.name}Payload {\n${lines}\n    }`;
    })
    .join('\n\n');

  // Constructors for each variant
  const ctors = variants
    .map((v) => {
      if (v.fields.length === 0) {
        return `
function ${v.name}() internal pure returns (${enumName} memory e) {
  e.tag = ${tagName}.${v.name};
  e.payload = "";
}`;
      }
      const params = v.fields.map((f, i) => `${solTypeOf(f.type)} ${f.name ?? `_${i}`}`).join(', ');
      const encodeParts = v.fields
        .map((f, i) => encodeExprOf(f.name ?? `_${i}`, f.type))
        .join(', ');
      const payloadEnc =
        v.fields.length === 1
          ? encodeExprOf(v.fields[0].name ?? `_0`, v.fields[0].type)
          : `bytes.concat(${encodeParts})`;
      return `function ${v.name}(${params}) internal pure returns (${enumName} memory e) {
        e.tag = ${tagName}.${v.name};
        e.payload = ${payloadEnc};
      }`;
    })
    .join('\n\n');

  return `// Auto-generated from Substrate enum ${typeName}

enum ${tagName} {
${tagMembers}
}

struct ${enumName} {
    ${tagName} tag;
    bytes payload; // SCALE-encoded payload for the active variant
}

library ${libName} {
    // Concatenate tag + payload
    function encode(${enumName} memory e) internal pure returns (bytes memory) {
        return bytes.concat(abi.encodePacked(uint8(e.tag)), e.payload);
    }

${payloadStructs.length ? '\n    ' + payloadStructs.replace(/\n/g, '\n    ') + '\n' : ''}

${ctors.replace(/\n/g, '\n    ')}
}
`;
}

// --- Type mapping ---
export function solTypeOf(t: string): string {
  const s = t.replace(/\s+/g, '');

  // primitives
  const prim: Record<string, string> = {
    bool: 'bool',
    char: 'uint32', // SCALE char is u32 code point
    u8: 'uint8',
    u16: 'uint16',
    u32: 'uint32',
    u64: 'uint64',
    u128: 'uint128',
    u256: 'uint256',
    i8: 'int8',
    i16: 'int16',
    i32: 'int32',
    i64: 'int64',
    i128: 'int128',
    i256: 'int256',
    Bytes: 'bytes', // polkadot.js alias for Vec<u8>
    String: 'string', // UTF-8 string (Vec<u8> semantically)
  };
  if (prim[s]) return prim[s];

  // Vec<T> and BoundedVec<T,N>
  let m = s.match(/^Vec<(.+)>$/);
  if (m) {
    const inner = m[1];
    if (/^u8$/.test(inner)) return 'bytes'; // Vec<u8>
    return `${solTypeOf(inner)}[]`;
  }
  m = s.match(/^BoundedVec<(.+),(\d+)>$/);
  if (m) {
    const inner = m[1];
    if (/^u8$/.test(inner)) return 'bytes'; // BoundedVec<u8,N>
    return `${solTypeOf(inner)}[]`; // enforce N at encode/decode time
  }

  // Fixed-size array [T; N]
  m = s.match(/^\[(.+);(\d+)\]$/);
  if (m) {
    const inner = m[1],
      N = Number(m[2]);
    if (/^u8$/.test(inner) && N <= 32) return `bytes${N}`; // SCALE: raw bytes, no length
    return `${solTypeOf(inner)}[${N}]`;
  }

  // Compact<T> maps to the same Solidity numeric type; encoding differs
  m = s.match(/^Compact<(.+)>$/);
  if (m) return solTypeOf(m[1]);

  // Option<T> -> represent as (bool isSome, T value) at the ABI boundary,
  // or encode-only (leave as T) and handle option in encoder.
  m = s.match(/^Option<(.+)>$/);
  if (m) return solTypeOf(m[1]); // for function params; tag handled by encoder

  // Fallback: treat unknown as bytes (you can tighten this as you add more types)
  return 'bytes';
}

// --- Encoding expression mapping ---
// Returns a Solidity expression that evaluates to SCALE-encoded bytes for `expr`.
export function encodeExprOf(expr: string, t: string): string {
  const s = t.replace(/\s+/g, '');

  // primitives (assumes you have these codec libs)
  const prim = {
    bool: (e: string) => `ScaleBool.encode(${e})`,
    char: (e: string) => `ScaleU32.encode(${e})`,
    u8: (e: string) => `ScaleU8.encode(${e})`,
    u16: (e: string) => `ScaleU16.encode(${e})`,
    u32: (e: string) => `ScaleU32.encode(${e})`,
    u64: (e: string) => `ScaleU64.encode(${e})`,
    u128: (e: string) => `ScaleU128.encode(${e})`,
    u256: (e: string) => `ScaleU256.encode(${e})`,
    i8: (e: string) => `ScaleI8.encode(${e})`,
    i16: (e: string) => `ScaleI16.encode(${e})`,
    i32: (e: string) => `ScaleI32.encode(${e})`,
    i64: (e: string) => `ScaleI64.encode(${e})`,
    i128: (e: string) => `ScaleI128.encode(${e})`,
    i256: (e: string) => `ScaleI256.encode(${e})`,
    Bytes: (e: string) => `ScaleBytes.encode(${e})`, // compact len + data
    String: (e: string) => `ScaleBytes.encode(bytes(${e}))`, // UTF-8 bytes
  } as Record<string, (e: string) => string>;
  if (prim[s]) return prim[s](expr);

  // Vec<T>
  let m = s.match(/^Vec<(.+)>$/);
  if (m) {
    const inner = m[1];
    if (/^u8$/.test(inner)) return `ScaleBytes.encode(${expr})`; // bytes with compact len
    // assumes you generate a typed vec encoder for the inner type
    return `ScaleVec.encode_${mangle(inner)}(${expr})`;
  }

  // BoundedVec<T, N>
  m = s.match(/^BoundedVec<(.+),(\d+)>$/);
  if (m) {
    const inner = m[1],
      N = m[2];
    if (/^u8$/.test(inner)) return `ScaleBytes.encodeBounded(${expr}, ${N})`;
    return `ScaleVec.encodeBounded_${mangle(inner)}(${expr}, ${N})`;
  }

  // Fixed-size array [T; N]
  m = s.match(/^\[(.+);(\d+)\]$/);
  if (m) {
    const inner = m[1],
      N = Number(m[2]);
    if (/^u8$/.test(inner)) {
      // SCALE fixed [u8;N] is raw bytes (no length prefix)
      return N <= 32
        ? `ScaleFixedBytes.encode(bytes${N}(${expr}))`
        : `ScaleFixedU8Array.encode(${expr})`; // implement as a loop
    }
    return `ScaleFixedArray.encode_${mangle(inner)}_${N}(${expr})`;
  }

  // Compact<T>
  m = s.match(/^Compact<(u\d+)>$/);
  if (m) {
    const k = m[1].toUpperCase(); // e.g., U32
    return `ScaleCompact.encode${k}(${expr})`;
  }

  // Option<T>
  m = s.match(/^Option<(.+)>$/);
  if (m) {
    const inner = m[1];
    // Assume you pass a tuple (bool isSome, T val) or have a struct; adjust to your API.
    return `ScaleOption.encode_${mangle(inner)}(${expr})`;
  }

  // Fallback: assume already-encoded bytes
  return `${expr}`;
}

// Helper to create suffix-safe names from types, e.g. "u32" -> "U32", "Vec<u32>" -> "Vec_U32"
function mangle(t: string): string {
  return t
    .replace(/\s+/g, '')
    .replace(/\[/g, 'Arr_')
    .replace(/]/g, '')
    .replace(/;/g, '_')
    .replace(/</g, '_')
    .replace(/>/g, '')
    .replace(/,/g, '_')
    .replace(/\+/g, 'Plus')
    .replace(/-/g, 'Minus')
    .replace(/\*/g, 'Times')
    .replace(/u(\d+)/g, 'U$1')
    .replace(/i(\d+)/g, 'I$1');
}
