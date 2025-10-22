/**
 * Shared type mapping utilities for converting Substrate/Polkadot types to Solidity.
 * 
 * This module provides common constants, patterns, and helper functions used across
 * struct.ts and enum.ts to avoid duplication and maintain consistency.
 */

// ============================================================================
// Type Normalization
// ============================================================================

/**
 * Normalizes a Rust type reference by removing all whitespace.
 * This ensures consistent type matching regardless of formatting.
 * 
 * @param typeRef - Raw type reference that may contain whitespace
 * @returns Normalized type reference without whitespace
 * 
 * @example
 * normalizeType("Vec < u8 >") // returns "Vec<u8>"
 * normalizeType("[ u8 ; 32 ]") // returns "[u8;32]"
 */
export function normalizeType(typeRef: string): string {
  return typeRef.replace(/\s+/g, '');
}

// ============================================================================
// Type Patterns (Regex)
// ============================================================================

/**
 * Regex patterns for matching Rust type structures.
 * Used across both enum and struct generators for consistent type parsing.
 */
export const TYPE_PATTERNS = {
  /** Matches Vec<T> - dynamic vector type */
  VEC: /^Vec<(.+)>$/,
  
  /** Matches BoundedVec<T,N> - vector with maximum size constraint */
  BOUNDED_VEC: /^BoundedVec<(.+),(\d+)>$/,
  
  /** Matches [T; N] - fixed-size array type */
  FIXED_ARRAY: /^\[(.+);(\d+)\]$/,
  
  /** Matches Compact<T> - compact-encoded integer type */
  COMPACT: /^Compact<(.+)>$/,
  
  /** Matches Compact<uN> - compact-encoded unsigned integer */
  COMPACT_UINT: /^Compact<(u\d+)>$/,
  
  /** Matches Option<T> - optional value type */
  OPTION: /^Option<(.+)>$/,
  
  /** Matches u8 primitive type */
  U8: /^u8$/,
  
  /** Matches Vec<u8> - byte vector (special case for bytes) */
  VEC_U8: /^Vec<u8>$/,
  
  /** Matches [u8; N] - fixed-size byte array */
  FIXED_U8_ARRAY: /^\[u8;[0-9]+\]$/,
} as const;

// ============================================================================
// Codec Name Mappings
// ============================================================================

/**
 * Maps Rust primitive/common types to their SCALE codec library names.
 * Used when generating encoder function calls in both struct and enum generators.
 * 
 * Note: This is the merged mapping from both TYPE_TO_CODEC_NAME (struct.ts)
 * and PRIMITIVE_ENCODERS (enum.ts). The "Scale" prefix convention from enum.ts
 * is preferred for consistency.
 */
export const TYPE_TO_CODEC_NAME: Record<string, string> = {
  // Boolean
  bool: 'ScaleBool',
  
  // Character (Rust char is 4 bytes - Unicode scalar value)
  char: 'ScaleU32',
  
  // Unsigned integers
  u8: 'ScaleU8',
  u16: 'ScaleU16',
  u32: 'ScaleU32',
  u64: 'ScaleU64',
  u128: 'ScaleU128',
  u256: 'ScaleU256',
  
  // Signed integers
  i8: 'ScaleI8',
  i16: 'ScaleI16',
  i32: 'ScaleI32',
  i64: 'ScaleI64',
  i128: 'ScaleI128',
  i256: 'ScaleI256',
  
  // Hash types
  H256: 'ScaleH256',
  H160: 'ScaleH160',
  
  // Account ID
  AccountId32: 'ScaleAccountId32',
  
  // Bytes and strings
  Bytes: 'ScaleBytes',
  String: 'ScaleBytes', // String encoded as UTF-8 bytes
  string: 'ScaleBytes', // lowercase alias
} as const;

// ============================================================================
// Constants
// ============================================================================

/** Maximum size for Solidity bytesN types (bytes1 to bytes32) */
export const MAX_SOLIDITY_BYTES_SIZE = 32;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Returns the codec library name for encoding a given Rust type.
 * Used when generating encoder function calls.
 * 
 * Handles special cases like Vec<u8> and [u8; N] arrays.
 * 
 * @param typeRef - Rust type reference from metadata
 * @returns Codec library name (with "Scale" prefix)
 * 
 * @example
 * getCodecName("u128") // returns "ScaleU128"
 * getCodecName("Vec<u8>") // returns "ScaleBytes"
 * getCodecName("[u8; 32]") // returns "ScaleFixedBytes"
 * getCodecName("MyCustomType") // returns "MyCustomType" (assumes custom codec exists)
 */
export function getCodecName(typeRef: string): string {
  const normalized = normalizeType(typeRef);

  // Check if it's a known primitive/common type
  if (TYPE_TO_CODEC_NAME[normalized]) {
    return TYPE_TO_CODEC_NAME[normalized];
  }

  // Check special patterns
  if (TYPE_PATTERNS.VEC_U8.test(normalized)) return 'ScaleBytes';
  if (TYPE_PATTERNS.FIXED_U8_ARRAY.test(normalized)) return 'ScaleFixedBytes';

  // Fallback: assume user-defined type has a matching codec
  // Note: This would need to be the sanitized PascalCase type name in practice
  return normalized;
}

/**
 * Converts a Rust type reference to a safe identifier for encoder function names.
 * Handles special characters and nested types to create valid Solidity identifiers.
 * 
 * @param rustType - Rust type reference
 * @returns Sanitized type string safe for use in function names
 * 
 * @example
 * sanitizeTypeForEncoder("u32") // returns "U32"
 * sanitizeTypeForEncoder("Vec<u32>") // returns "Vec_U32"
 * sanitizeTypeForEncoder("[AccountId32; 10]") // returns "Arr_AccountId32_10"
 */
export function sanitizeTypeForEncoder(t: string): string {
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
