/**
 * Parser for Rust fixed-size array type syntax from Polkadot metadata.
 * 
 * Examples:
 * - "[u8; 32]" -> { _array: { elem: "u8", len: 32 } }
 * - "[AccountId32; 10]" -> { _array: { elem: "AccountId32", len: 10 } }
 * - "[Vec<MyStruct>; 5]" -> { _array: { elem: "Vec<MyStruct>", len: 5 } }
 * 
 * Supports both semicolon and comma delimiters: "[T; N]" or "[T, N]".
 */

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Parsed fixed-size array specification.
 * The `_array` wrapper matches the metadata JSON structure.
 */
type FixedArraySpec = { _array: { elem: string; len: number } };

// ============================================================================
// Constants
// ============================================================================


const ARRAY_DELIMITERS = [';', ','] as const;

/** Sentinel value indicating delimiter not found */
const DELIMITER_NOT_FOUND = -1;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Finds the index of the top-level delimiter in a fixed-array inner string.
 * Scans right-to-left to handle nested arrays like "[[u8; 2]; 3]".
 * Ignores delimiters inside angle brackets <>, parentheses (), or square brackets [].
 * Valid delimiters between element type and length in array syntax (";", ",")
 * 
 * @param innerContent - String between outer brackets (e.g., "u8; 32")
 * @returns Index of delimiter, or DELIMITER_NOT_FOUND if none found
 * 
 * @example
 * findTopLevelDelimiter("Vec<u8, u16>; 10") // returns 12 (index of ';')
 */
function findTopLevelDelimiter(innerContent: string): number {
  let angleBracketDepth = 0;
  let roundBracketDepth = 0;
  let squareBracketDepth = 0;
  
  // Scan right-to-left to find the last top-level delimiter
  // (handles nested arrays like [[u8; 2]; 3] correctly)
  for (let i = innerContent.length - 1; i >= 0; i--) {
    const char = innerContent[i];
    
    // Track bracket depth to identify top-level delimiters
    if (char === '>') angleBracketDepth++;
    else if (char === '<') angleBracketDepth--;
    else if (char === ')') roundBracketDepth++;
    else if (char === '(') roundBracketDepth--;
    else if (char === ']') squareBracketDepth++;
    else if (char === '[') squareBracketDepth--;
    else if (
      (char === ';' || char === ',') &&
      angleBracketDepth === 0 &&
      roundBracketDepth === 0 &&
      squareBracketDepth === 0
    ) {
      return i; // Found top-level delimiter
    }
  }
  
  return DELIMITER_NOT_FOUND;
}

// ============================================================================
// Main Parsing Function
// ============================================================================

/**
 * Parses a Rust fixed-size array type specification into structured form.
 * 
 * Supports Rust array syntax:
 * - "[T; N]" (semicolon delimiter, standard Rust)
 * - "[T, N]" (comma delimiter, alternate format)
 * 
 * Where T is the element type and N is the array length (positive integer).
 * 
 * @param spec - Type string from metadata (e.g., "[u8; 32]")
 * @returns Parsed array spec, or null if not a valid fixed array
 * 
 * @example
 * parseFixedArray("[u8; 32]")
 * // Returns: { _array: { elem: "u8", len: 32 } }
 * 
 * @example
 * parseFixedArray("[Vec<AccountId32>; 10]")
 * // Returns: { _array: { elem: "Vec<AccountId32>", len: 10 } }
 */
export function parseFixedArray(spec: string): FixedArraySpec | null {
  // Validate input type
  if (typeof spec !== 'string') return null;

  // Validate Rust array syntax: must be wrapped in brackets
  const trimmed = spec.trim();
  if (!(trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    return null;
  }

  // Extract content between brackets
  const innerContent = trimmed.slice(1, -1).trim();
  if (!innerContent) return null; // Empty brackets: "[]"

  // Find the delimiter separating element type from length
  const delimiterIndex = findTopLevelDelimiter(innerContent);
  if (delimiterIndex === DELIMITER_NOT_FOUND) {
    return null; // No delimiter found
  }

  // Split into element type and length
  const elementType = innerContent.slice(0, delimiterIndex).trim();
  const lengthString = innerContent.slice(delimiterIndex + 1).trim();
  
  // Validate both parts exist
  if (!elementType || !lengthString) {
    return null; // Missing element type or length
  }

  // Parse and validate length

  const length = Number(lengthString);
  if (!Number.isInteger(length) || length < 0 ) {
    return null; // Length must be a non-negative integer 
  }
  
  //! Either consider fail on array that is too large (|| length > 1024) 
  //! inside Parse and validate length or Number.MAX_SAFE_INTEGER
  //! const MAX_ARRAY_LENGTH = 10000; // Reasonable limit for Solidity

  //! if (length > MAX_ARRAY_LENGTH) {
  //!   return null; // Array too large for practical use
  //! }

  return { _array: { elem: elementType, len: length } };
}
