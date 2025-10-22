import { PRIMS, RESERVED, toIdent } from './common';
import { normalizeType, TYPE_PATTERNS, getCodecName } from './typeMapping';

/**
 * Generator for Solidity struct definitions and SCALE encoders from Polkadot metadata.
 * 
 * Converts Rust struct definitions from chain metadata into:
 * - Solidity struct declarations with typed fields
 * - Codec libraries with SCALE encoding functions
 * 
 * Examples of generated code:
 * 
 * Input (metadata):
 *   { "field1": "u128", "field2": "AccountId32" }
 * 
 * Output (Solidity):
 *   struct MyStruct {
 *       uint128 field1;
 *       bytes32 field2;
 *   }
 *   library MyStructCodec {
 *       function encode(MyStruct memory s) internal pure returns (bytes memory) {
 *           return abi.encodePacked(U128Codec.encode(s.field1), AccountId32Codec.encode(s.field2));
 *       }
 *   }
 * 
 * SCALE encoding rules for structs:
 * - Fields encoded in declaration order
 * - No field names or padding
 * - Simply concatenate encoded field values
 */

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

// Note: TYPE_PATTERNS, normalizeType, and getCodecName are now imported 
// from ./typeMapping to avoid duplication

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
  const normalized = normalizeType(typeRef);

  if (PRIMS[normalized]) return [PRIMS[normalized], 'primitive'];
  if (TYPE_PATTERNS.VEC_U8.test(normalized)) return ['bytes', 'primitive'];
  if (TYPE_PATTERNS.FIXED_U8_ARRAY.test(normalized)) return ['bytes', 'primitive'];
  // Fallback: user-defined type (enum/struct/tuple wrapper). Keep as type name.
  return [toIdent(typeRef), 'complex'];
}

/**
 * Returns the codec library name for encoding a given Rust type.
 * Used when generating encoder function calls.
 * 
 * Examples:
 * - "u128" -> "ScaleU128" (calls ScaleU128Codec.encode)
 * - "Vec<u8>" -> "ScaleBytes" (calls ScaleBytesCodec.encode)
 * - "MyCustomType" -> "MyCustomType" (calls MyCustomTypeCodec.encode)
 * 
 * @param typeRef - Rust type reference from metadata
 * @returns Codec library name (PascalCase)
 */
function codecNameOf(typeRef: string): string {
  const codecName = getCodecName(typeRef);
  
  // If it's a known type from TYPE_TO_CODEC_NAME, it already has "Scale" prefix
  // For custom types, we need to use the sanitized identifier
  if (codecName.startsWith('Scale')) {
    return codecName;
  }
  
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
