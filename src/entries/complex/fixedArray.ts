import { toIdent } from './common';

type FixedArraySpec = { _array: { elem: string; len: number } };

/**
 * Extract element type and length from a fixed-size array spec.
 * Supports "[T; N]" and "[T, N]". Returns null if not a fixed array.
 */
export function parseFixedArray(spec: string): FixedArraySpec | null {
  if (typeof spec !== 'string') return null;

  const s = spec.trim();
  if (!(s.startsWith('[') && s.endsWith(']'))) return null;

  // strip outer [ ... ]
  const inner = s.slice(1, -1).trim();
  if (!inner) return null;

  // Find the top-level delimiter ; or , (not inside <...>, ( ... ), or [ ... ])
  let angle = 0, round = 0, square = 0, split = -1, delim = '';
  for (let i = inner.length - 1; i >= 0; i--) {
    const c = inner[i];
    if (c === '>') angle++;
    else if (c === '<') angle--;
    else if (c === ')') round++;
    else if (c === '(') round--;
    else if (c === ']') square++;
    else if (c === '[') square--;
    else if ((c === ';' || c === ',') && angle === 0 && round === 0 && square === 0) {
      split = i; delim = c; break;
    }
  }
  if (split < 0) return null;

  const left = inner.slice(0, split).trim();
  const right = inner.slice(split + 1).trim();
  if (!left || !right) return null;

  // length must be an integer
  const len = Number(right);
  if (!Number.isInteger(len) || len < 0) return null;

  return { _array: { elem: left, len }};
}

// Minimal primitive map; fall back to user-defined name
function solidityElemTypeOf(raw: string): string {
  const t = raw.replace(/\s/g, '');
  const PRIMS: Record<string, string> = {
    u8: 'uint8', u16: 'uint16', u32: 'uint32', u64: 'uint64',
    u128: 'uint128', u256: 'uint256',
    i8: 'int8', i16: 'int16', i32: 'int32', i64: 'int64',
    i128: 'int128', i256: 'int256',
    bool: 'bool', Bytes: 'bytes', string: 'string', String: 'string',
    H256: 'bytes32', H160: 'bytes20', AccountId32: 'bytes32',
  };
  return PRIMS[t] ?? toIdent(raw);
}

function codecNameOf(raw: string): string {
  const t = raw.replace(/\s/g, '');
  const ALIASES: Record<string, string> = {
    u8: 'U8', u16: 'U16', u32: 'U32', u64: 'U64',
    u128: 'U128', u256: 'U256',
    i8: 'I8', i16: 'I16', i32: 'I32', i64: 'I64',
    i128: 'I128', i256: 'I256',
    bool: 'Bool', Bytes: 'Bytes', string: 'String', String: 'String',
    H256: 'H256', H160: 'H160', AccountId32: 'AccountId32',
  };
  return ALIASES[t] ?? toIdent(raw);
}

/**
 * Generate a Solidity codec for a fixed-size array, e.g. "[Junction;3]".
 * - [u8;N] => accepts `bytes` and asserts exact length; no length prefix.
 * - otherwise => accepts `ElemType[N]` and concatenates ElemCodec.encode(...) for each element.
 */
/*
export function generateSolidityFixedArray(typeName: string, spec: FixedArraySpec): string {
  const { elemRaw, len } = parseFixedArray(spec);
  const solName = toIdent(typeName);
  const elemSolType = solidityElemTypeOf(elemRaw);
  const elemCodec = codecNameOf(elemRaw);

  // Special-case [u8;N] → bytes without length prefix
  if (elemSolType === 'uint8') {
    return `// Auto-generated from Substrate fixed array ${spec}

library ${solName}Codec {
    // SCALE encode: exactly ${len} raw bytes, no length prefix
    function encode(bytes memory data) internal pure returns (bytes memory) {
        require(data.length == ${len}, "FixedBytes: bad length");
        return abi.encodePacked(data);
    }
}
`;
  }

  // General case → ElemType[LEN]
  return `// Auto-generated from Substrate fixed array ${spec}

library ${solName}Codec {
    // SCALE encode: ${len} elements back-to-back, no length prefix
    function encode(${elemSolType}[${len}] memory a) internal pure returns (bytes memory) {
        bytes memory out;
        unchecked {
            for (uint256 i = 0; i < ${len}; i++) {
                out = abi.encodePacked(out, ${elemCodec}Codec.encode(a[i]));
            }
        }
        return out;
    }
}
`;
}
*/
