import { PRIMS, toIdent } from './common';

/**
 * Generator for Solidity enum definitions and SCALE encoders from Polkadot metadata.
 * 
 * Handles Rust enum variants with different payload shapes:
 * - Unit variants (no data): `enum E { A, B }`
 * - Tuple variants (anonymous fields): `enum E { A(u32, u64) }`
 * - Struct variants (named fields): `enum E { A { x: u32, y: u64 } }`
 * - Mixed variants: `enum E { A, B(u32), C { x: u64 } }`
 * 
 * SCALE encoding for enums:
 * - Discriminant (u8): Variant index (0, 1, 2, ...)
 * - Payload: SCALE-encoded fields concatenated (if any)
 * 
 * Example output:
 * ```solidity
 * enum MyEnumTag { VariantA, VariantB }
 * struct MyEnum { MyEnumTag tag; bytes payload; }
 * library MyEnumCodec { function encode(...) ... }
 * ```
 */

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Possible shapes for enum variant values in metadata.
 * - null: Unit variant (no payload)
 * - number: Explicit discriminant index
 * - string: Single anonymous field (tuple variant)
 * - string[]: Multiple anonymous fields (tuple variant)
 * - Record<string, string>: Named fields (struct variant)
 * - null: no payload (e.g., enum E { A, B })
 * - number: custom discriminant index
 * - string: single unnamed field (tuple variant with one item)
 * - string[]: multiple unnamed fields (tuple variant)
 * - Record: named fields (struct-like variant)
 */
type VariantShape = null | number | string | string[] | Record<string, string>;

/**
 * Metadata can provide enum definitions in two formats:
 * - Array: { _enum: ["A", "B"] } (unit variants only)
 * - Object: { _enum: { A: null, B: "u32", C: { x: "u64" } } } (complex variants)
 */
type EnumJson = { _enum: string[] } | { _enum: Record<string, VariantShape> };

/**
 * Represents a field in an enum variant payload.
 */
type Field = {
  /** Field name (lowerCamelCase, optional for tuple variants) */
  name?: string;
  /** Rust type reference (e.g., "u128", "Vec<AccountId32>") */
  type: string;
};

/**
 * Represents a parsed enum variant with all metadata.
 */
type Variant = {
  /** Variant name (PascalCase, Solidity-safe) */
  name: string;
  /** Discriminant index (0, 1, 2, ...) */
  index: number;
  /** Payload fields (empty for unit variants) */
  fields: Field[];
};

// ============================================================================
// Constants
// ============================================================================

/** Regex patterns for Rust type parsing */
// TODO: Move to shared typeMapping.ts - these patterns are duplicated in struct.ts
const TYPE_PATTERNS = {
  VEC: /^Vec<(.+)>$/,
  BOUNDED_VEC: /^BoundedVec<(.+),(\d+)>$/,
  FIXED_ARRAY: /^\[(.+);(\d+)\]$/,
  COMPACT: /^Compact<(.+)>$/,
  COMPACT_UINT: /^Compact<(u\d+)>$/,
  OPTION: /^Option<(.+)>$/,
  U8: /^u8$/,
} as const;

/** Maximum size for Solidity bytesN types (bytes1 to bytes32) */
const MAX_SOLIDITY_BYTES_SIZE = 32;

/**
 * Maps Rust primitive types to their SCALE encoder library names.
 * Recreated as object to avoid function call overhead in hot path.
 */
// TODO: Move to shared typeMapping.ts - encoder name mapping
const PRIMITIVE_ENCODERS: Record<string, string> = {
  bool: 'ScaleBool',
  char: 'ScaleU32', // Rust char is 4 bytes (Unicode scalar value)
  u8: 'ScaleU8',
  u16: 'ScaleU16',
  u32: 'ScaleU32',
  u64: 'ScaleU64',
  u128: 'ScaleU128',
  u256: 'ScaleU256',
  i8: 'ScaleI8',
  i16: 'ScaleI16',
  i32: 'ScaleI32',
  i64: 'ScaleI64',
  i128: 'ScaleI128',
  i256: 'ScaleI256',
  Bytes: 'ScaleBytes',
  String: 'ScaleBytes', // String encoded as UTF-8 bytes
};

// ============================================================================
// Enum Variant Parsing
// ============================================================================

/**
 * Extracts and normalizes enum variants from metadata JSON.
 * 
 * Handles two metadata formats:
 * 1. Array format: { _enum: ["A", "B", "C"] } (unit variants only)
 * 2. Object format: { _enum: { A: null, B: "u32", C: { x: "u64" } } }
 * 
 * Normalizes variant indices to sequential 0..N-1 regardless of
 * explicit index values in metadata.
 * 
 * @param enumDefinition - Enum JSON from metadata
 * @returns Array of parsed variants sorted by index
 */
function extractVariants(def: EnumJson): Variant[] {
  // Simple enum: just variant names, no payloads
  if (Array.isArray((def as any)._enum)) {
    return (def as { _enum: string[] })._enum.map((n, i) => ({
      name: toIdent(n),
      index: i,
      fields: [],
    }));
  }

  // Complex enum: variants with optional payloads and custom indices
  const raw = (def as { _enum: Record<string, VariantShape> })._enum;
  const entries = Object.entries(raw).map(([k, v], i) => {
    const name = toIdent(k);
    let index: number = i;
    let fields: Field[] = [];

    // Parse variant shape
    if (typeof v === 'number') {
      // Custom discriminant index
      index = v;
    } else if (v === null) {
      // No payload
      fields = [];
    } else if (typeof v === 'string') {
      // Single unnamed field (tuple with one item)
      fields = [{ type: v }];
    } else if (Array.isArray(v)) {
      // Multiple unnamed fields (tuple)
      fields = v.map((t) => ({ type: t }));
    } else if (typeof v === 'object') {
      // Named fields (struct-like)
      fields = Object.entries(v).map(([fname, t]) => ({ name: toIdent(fname), type: t }));
    } else {
      //! Should be clearer: throw new Error(`Unsupported enum variant shape for ${name}: ${JSON.stringify(variantValue)}`);
      throw new Error(`Unsupported enum variant shape for ${name}`);
    }

    return { name, index, fields };
  });

  //! In Substrate, if metadata says { _enum: { A: 0, B: 5, C: 10 } }, discriminants should be preserved as 0, 5, 10
  // SCALE requires variants ordered by discriminant, normalized to 0..N-1
  return entries.sort((a, b) => a.index - b.index).map((e, i) => ({ ...e, index: i }));
}

// ============================================================================
// Solidity Generation (Main Entry Point)
// ============================================================================

/**
 * Generates a complete Solidity enum definition and its SCALE encoder library.
 * 
 * SCALE encoding for enums:
 * - Discriminant: u8 representing variant index (0, 1, 2, ...)
 * - Payload: SCALE-encoded fields concatenated (if variant has fields)
 * 
 * Generated output includes:
 * - Solidity enum for variant tags (discriminant values)
 * - Solidity struct combining tag + payload bytes
 * - Codec library with encode() function and constructor functions for each variant
 * 
 * @param typeName - Name of the enum from metadata
 * @param json - Enum definition (can be pre-parsed object or JSON string)
 * @returns Complete Solidity code as a string
 * @throws Error if json is not a valid enum definition
 */
export function generateSolidityEnum(typeName: string, json: string | EnumJson): string {
  const def: EnumJson = typeof json === 'string' ? JSON.parse(json) : json;
  if (!('_enum' in def)) throw new Error('Not an enum JSON (missing _enum)');

  const enumName = toIdent(typeName);
  const variants = extractVariants(def);
  
  //! Missing validation for empty enums,
  const tagName = `${enumName}Tag`;
  const libName = `${enumName}Codec`;

  const tagMembers = variants.map((v) => `    ${v.name}`).join(',\n');

  //! These payload structs are generated but never used in the code?
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
        //! Empty string "" vs actual empty bytes is unclear in Solidity
        //! Use `new bytes(0)` or `hex""` for clarity
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

  //! Use bytes1(uint8(e.tag)), same issue as in struct.ts -> https://github.com/argotorg/solidity/issues/10903
  //! Reference: https://docs.soliditylang.org/en/latest/abi-spec.html#non-standard-packed-mode
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

// ============================================================================
// Type Mapping Functions
// ============================================================================

/**
 * Maps a Rust type reference to its Solidity equivalent.
 * Handles primitives, containers (Vec, arrays), and custom types.
 * 
 * SCALE type mapping rules:
 * - Primitives: Direct mapping (u8 -> uint8, u128 -> uint128, etc.)
 * - Vec<u8>: Maps to bytes (compact length + raw bytes)
 * - Vec<T>: Maps to T[] (dynamic array)
 * - [u8; N] where N <= 32: Maps to bytesN (fixed size)
 * - [T; N]: Maps to T[N] (fixed-size array)
 * - Compact<T>: Same Solidity type as T (encoding differs)
 * - Option<T>: Same Solidity type as T (None/Some handled by encoder)
 * 
 * @param rustType - Rust type reference from metadata (e.g., "u128", "Vec<AccountId32>")
 * @returns Solidity type string
 * 
 * @example
 * solTypeOf("u128") // returns "uint128"
 * solTypeOf("Vec<u8>") // returns "bytes"
 * solTypeOf("[u8; 32]") // returns "bytes32"
 */
export function solTypeOf(t: string): string {
  const normalized = t.replace(/\s+/g, '');

  //! TypeScript doesn't guarantee PRIMS[normalized] is defined after this check
  if (PRIMS[normalized]) return PRIMS[normalized];

  // Vec<T> and BoundedVec<T,N>
  let match = normalized.match(TYPE_PATTERNS.VEC);
  if (match) {
    const inner = match[1];
    if (TYPE_PATTERNS.U8.test(inner)) return 'bytes'; // Vec<u8>
    return `${solTypeOf(inner)}[]`;
  }
  match = normalized.match(TYPE_PATTERNS.BOUNDED_VEC);
  if (match) {
    const inner = match[1];
    if (TYPE_PATTERNS.U8.test(inner)) return 'bytes'; // BoundedVec<u8,N>
    return `${solTypeOf(inner)}[]`; // enforce N at encode/decode time
  }

  // Fixed-size array [T; N]
  match = normalized.match(TYPE_PATTERNS.FIXED_ARRAY);
  if (match) {
    const inner = match[1];
    const length = Number(match[2]);
    if (TYPE_PATTERNS.U8.test(inner) && length <= MAX_SOLIDITY_BYTES_SIZE) {
      return `bytes${length}`; // SCALE: raw bytes, no length prefix
    }
    return `${solTypeOf(inner)}[${length}]`;
  }

  // Compact<T> maps to the same Solidity numeric type; encoding differs
  match = normalized.match(TYPE_PATTERNS.COMPACT);
  if (match) return solTypeOf(match[1]);

  // Option<T> -> represent as T in Solidity; None/Some tag handled by encoder
  match = normalized.match(TYPE_PATTERNS.OPTION);
  if (match) return solTypeOf(match[1]); // for function params; tag handled by encoder

  //! Consider logging warning or throwing error for truly unknown types to catch metadata bugs early
  // Fallback: treat unknown as bytes
  return 'bytes';
}

// ============================================================================
// Encoder Expression Generation (TODO: Move to shared typeMapping.ts)
// ============================================================================

/**
 * Returns a Solidity expression that evaluates to SCALE-encoded bytes for a given value.
 * Used when generating encoder functions for complex types.
 * 
 * SCALE encoding rules:
 * - Primitives: Call appropriate ScaleXXX.encode() function
 * - Vec<u8>: ScaleBytes.encode() (compact length + raw bytes)
 * - Vec<T>: ScaleVec.encode_T() (generated typed encoder)
 * - [u8; N]: ScaleFixedBytes.encode() (raw bytes, no length prefix)
 * - [T; N]: ScaleFixedArray.encode_T_N() (generated typed encoder)
 * - Compact<T>: ScaleCompact.encodeT() (variable-length integer encoding)
 * - Option<T>: ScaleOption.encode_T() (Some/None tag + optional value)
 * 
 * @param expr - Solidity variable name or expression to encode
 * @param rustType - Rust type reference from metadata
 * @returns Solidity encoder expression (e.g., "ScaleU128.encode(amount)")
 * 
 * @example
 * encodeExprOf("amount", "u128") // returns "ScaleU128.encode(amount)"
 * encodeExprOf("data", "Vec<u8>") // returns "ScaleBytes.encode(data)"
 */
export function encodeExprOf(expr: string, t: string): string {
  const normalized = t.replace(/\s+/g, '');

  // Check primitives
  if (PRIMITIVE_ENCODERS[normalized]) {
    return `${PRIMITIVE_ENCODERS[normalized]}.encode(${expr})`;
  }

  //! Rust metadata uses 'String' (capitalized). If lowercase 'string' never appears, remove it
  //! If it's for Solidity's string type, this should be documented
  // Special case: String encoded as UTF-8 bytes
  if (normalized === 'String' || normalized === 'string') {
    return `ScaleBytes.encode(bytes(${expr}))`; // UTF-8 bytes
  }

  // Vec<T>
  let match = normalized.match(TYPE_PATTERNS.VEC);
  if (match) {
    const inner = match[1];
    if (TYPE_PATTERNS.U8.test(inner)) return `ScaleBytes.encode(${expr})`; // bytes with compact len
    // assumes you generate a typed vec encoder for the inner type
    return `ScaleVec.encode_${sanitizeTypeForEncoder(inner)}(${expr})`;
  }

  // BoundedVec<T, N>
  match = normalized.match(TYPE_PATTERNS.BOUNDED_VEC);
  if (match) {
    const inner = match[1];
    const bound = match[2];
    if (TYPE_PATTERNS.U8.test(inner)) return `ScaleBytes.encodeBounded(${expr}, ${bound})`;
    return `ScaleVec.encodeBounded_${sanitizeTypeForEncoder(inner)}(${expr}, ${bound})`;
  }

  // Fixed-size array [T; N]
  match = normalized.match(TYPE_PATTERNS.FIXED_ARRAY);
  if (match) {
    const inner = match[1];
    const length = Number(match[2]);
    if (TYPE_PATTERNS.U8.test(inner)) {
      // SCALE fixed [u8;N] is raw bytes (no length prefix)
      return length <= MAX_SOLIDITY_BYTES_SIZE
        ? `ScaleFixedBytes.encode(bytes${length}(${expr}))`
        : `ScaleFixedU8Array.encode(${expr})`; // implement as a loop
    }
    return `ScaleFixedArray.encode_${sanitizeTypeForEncoder(inner)}_${length}(${expr})`;
  }

  // Compact<T>
  match = normalized.match(TYPE_PATTERNS.COMPACT_UINT);
  if (match) {
    const baseType = match[1].toUpperCase(); // e.g., U32
    return `ScaleCompact.encode${baseType}(${expr})`;
  }

  // Option<T>
  match = normalized.match(TYPE_PATTERNS.OPTION);
  if (match) {
    const inner = match[1];
    // Assume you pass a tuple (bool isSome, T val) or have a struct; adjust to your API.
    return `ScaleOption.encode_${sanitizeTypeForEncoder(inner)}(${expr})`;
  }

  //! Fallback returns raw expression assuming already-encoded bytes
  // Fallback: assume already-encoded bytes
  return `${expr}`;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Converts a Rust type reference to a safe identifier for encoder function names.
 * Handles special characters and nested types to create valid Solidity identifiers.
 * 
 * Examples:
 * - "u32" -> "U32"
 * - "Vec<u32>" -> "Vec_U32"
 * - "[AccountId32; 10]" -> "Arr_AccountId32_10"
 * 
 * @param rustType - Rust type reference
 * @returns Sanitized type string safe for use in function names
 */
function sanitizeTypeForEncoder(t: string): string {
  return t
    .replace(/\s+/g, '')
    .replace(/\[/g, 'Arr_')
    .replace(/]/g, '')
    .replace(/;/g, '_')
    .replace(/</g, '_')
    .replace(/>/g, '')
    .replace(/,/g, '_')
    .replace(/u(\d+)/g, 'U$1')
    .replace(/i(\d+)/g, 'I$1');
}
