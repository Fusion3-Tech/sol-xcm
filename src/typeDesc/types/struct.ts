import { PRIMS, RESERVED, toIdent } from './common';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Metadata can provide struct definitions in two formats:
 * - Wrapped: { _struct: { field1: "u128", field2: "AccountId32" } }
 * - Plain:   { field1: "u128", field2: "AccountId32" }
 */
type StructShape = { _struct: Record<string, string> } | Record<string, string>;

/**
 * Represents a parsed struct field with all necessary information
 * for generating Solidity code.
 */
interface StructField {
  /** Solidity-safe field name (lowerCamelCase) */
  name: string;
  /** Original Rust type reference from metadata (e.g., "u128", "Vec<u8>") */
  typeRef: string;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Maps Rust primitive/common types to their Solidity codec library names.
 * Used when generating encoder function calls.
 */
const TYPE_TO_CODEC_NAME: Record<string, string> = {
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

/**
 * Regex pattern to match Vec<u8> type.
 * In SCALE, Vec<u8> is encoded as compact length + raw bytes.
 */
const VEC_U8_PATTERN = /^Vec<u8>$/;

/**
 * Regex pattern to match fixed-size byte arrays like [u8; 32].
 * In SCALE, fixed arrays have no length prefix.
 */
const FIXED_U8_ARRAY_PATTERN = /^\[u8;[0-9]+\]$/;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validates that the input is a valid struct shape from metadata.
 * Returns true if the input matches either wrapped or plain struct format.
 * 
 * @param x - Value to validate
 * @returns True if x is a valid StructShape
 */
function isStructShape(x: any): x is StructShape {
  if (x && typeof x === 'object' && !Array.isArray(x)) {
    if ('_enum' in x) return false;
    if ('_struct' in x) return typeof x._struct === 'object' && x._struct !== null;
    // plain object of field -> type
    return Object.values(x).every((v) => typeof v === 'string');
  }
  return false;
}

/**
 * Converts a metadata field name to a valid Solidity field name (lowerCamelCase).
 * Handles special characters, leading digits, and Solidity reserved words.
 * 
 * Examples:
 * - "my_field" -> "myField"
 * - "123abc" -> "_123abc"
 * - "for" -> "for_"
 * 
 * @param x - Raw field name from metadata
 * @returns Solidity-safe lowerCamelCase field name
 */
function toVarIdent(x: string): string {
  const cleaned = x.replace(/[^a-zA-Z0-9]+/g, ' ').trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  
  if (words.length === 0) return 'x';
  
  const firstWord = words[0].toLowerCase();
  const restWords = words.slice(1).map((s) => s[0]?.toUpperCase() + s.slice(1));
  let fieldName = firstWord + restWords.join('');
  
  // Prefix with underscore if starts with digit
  if (/^[0-9]/.test(fieldName)) fieldName = '_' + fieldName;
  
  // Suffix with underscore if it's a reserved word
  if (RESERVED.has(fieldName)) fieldName = fieldName + '_';
  
  return fieldName;
}

/**
 * Maps a Rust type reference to its Solidity field type.
 * Used when generating struct field declarations.
 * 
 * SCALE encoding rules:
 * - Primitives (u8, u128, etc.) map directly to Solidity uintX types
 * - Vec<u8> maps to bytes (compact length + raw bytes in SCALE)
 * - [u8; N] maps to bytes (fixed size, no length prefix in SCALE)
 * - Custom types are assumed to have corresponding Solidity definitions
 * 
 * @param typeRef - Rust type reference from metadata (e.g., "u128", "Vec<u8>")
 * @returns Tuple of [Solidity type, category]
 */
function solidityFieldTypeOf(typeRef: string): [string, 'primitive' | 'complex'] {
  //! Duplicate 1 - duplicate normalization logic should be under a single helper function
  const normalized = typeRef.replace(/\s+/g, ''); 

  if (PRIMS[normalized]) return [PRIMS[normalized], 'primitive'];
  if (VEC_U8_PATTERN.test(normalized)) return ['bytes', 'primitive'];
  if (FIXED_U8_ARRAY_PATTERN.test(normalized)) return ['bytes', 'primitive'];
  // Fallback: user-defined type (enum/struct/tuple wrapper). Keep as type name.
  return [toIdent(typeRef), 'complex'];
}

/**
 * Returns the codec library name for encoding a given Rust type.
 * Used when generating encoder function calls.
 * 
 * Examples:
 * - "u128" -> "U128" (calls U128Codec.encode)
 * - "Vec<u8>" -> "Bytes" (calls BytesCodec.encode)
 * - "MyCustomType" -> "MyCustomType" (calls MyCustomTypeCodec.encode)
 * 
 * @param typeRef - Rust type reference from metadata
 * @returns Codec library name (PascalCase)
 */
function codecNameOf(typeRef: string): string {
  const normalized = typeRef.replace(/\s+/g, ''); //! Duplicate 2 (see Duplicate 1)

  // Check if it's a known primitive/common type
  if (TYPE_TO_CODEC_NAME[normalized]) {
    return TYPE_TO_CODEC_NAME[normalized];
  }

  // Check special patterns
  //! Logic duplication; if we add a new pattern (eg. Vec<u16>), we must update both functions.
  if (VEC_U8_PATTERN.test(normalized)) return 'Bytes';
  if (FIXED_U8_ARRAY_PATTERN.test(normalized)) return 'FixedBytes';

  // Fallback: user-defined. Use sanitized PascalCase type name.
  return toIdent(typeRef);
}

/**
 * Extracts and parses struct fields from a StructShape definition.
 * Handles both wrapped and plain metadata formats.
 * 
 * @param def - Struct definition from metadata
 * @returns Array of parsed struct fields with Solidity-safe names
 */
function extractStructFields(def: StructShape): StructField[] {
  //! "def as any" is a poor type modeling defeats TypeScript safety
  //! proposing additional helper function
  const fieldsMap = '_struct' in (def as any) ? (def as any)._struct : def;
  return Object.entries(fieldsMap).map(([k, v]) => ({ name: toVarIdent(k), typeRef: v as string }));
}

// ============================================================================
// Main Generation Function
// ============================================================================

/**
 * Generates a complete Solidity struct definition and its SCALE encoder library.
 * 
 * SCALE encoding for structs:
 * - Fields are encoded in declaration order
 * - No field names or padding
 * - Simply concatenate encoded fields
 * 
 * Generated output includes:
 * - Solidity struct definition with typed fields
 * - Codec library with encode() function
 * 
 * @param typeName - Name of the struct from metadata
 * @param def - Struct definition (wrapped or plain format)
 * @returns Complete Solidity code as a string
 * @throws Error if def is not a valid struct shape
 */
export function generateSolidityStruct(typeName: string, def: StructShape): string {
  if (!isStructShape(def))
    throw new Error('Not a struct JSON (expected {_struct:{...}} or plain {field:type})');

  const structName = toIdent(typeName);
  const fields = extractStructFields(def);
  //! Unused tuple
  const structBody = fields
    .map(({ name, typeRef }) => {
      return `    ${solidityFieldTypeOf(typeRef)[0]} ${name};`;
    })
    .join('\n');

  const encodeArgs = fields
    .map(({ name, typeRef }) => `${codecNameOf(typeRef)}Codec.encode(s.${name})`)
    .join(', ');
  //! abi.encodePacked - wrong encoding see -> https://github.com/argotorg/solidity/issues/10903
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
