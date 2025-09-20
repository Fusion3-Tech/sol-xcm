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
