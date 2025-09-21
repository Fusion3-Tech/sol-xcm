import { toIdent } from './common';

type EnumJson = { _enum: string[] } | { _enum: Record<string, number | null> }; // supports {"A":0,"B":1} or {"A":null,"B":null}

function extractVariants(def: EnumJson): { name: string; index: number }[] {
  if (Array.isArray((def as any)._enum)) {
    return (def as { _enum: string[] })._enum.map((n, i) => ({ name: toIdent(n), index: i }));
  }
  const obj = (def as { _enum: Record<string, number | null> })._enum;
  // If numeric indices are provided, sort by that; else keep insertion order.
  const entries = Object.entries(obj).map(([k, v], i) => ({
    name: toIdent(k),
    index: typeof v === 'number' ? v : i,
  }));
  // ensure unique indices & stable order
  return entries.sort((a, b) => a.index - b.index).map((e, i) => ({ ...e, index: i }));
}

export function generateSolidityEnum(typeName: string, json: string | EnumJson): string {
  const def: EnumJson = typeof json === 'string' ? JSON.parse(json) : json;
  if (!('_enum' in def)) throw new Error('Not an enum JSON (missing _enum)');
  const enumName = toIdent(typeName);
  const variants = extractVariants(def);

  const enumBody = variants.map((v) => `    ${v.name}`).join(',\n');
  const toIndexCases = variants
    .map((v) => `        if (v == ${enumName}.${v.name}) return ${v.index};`)
    .join('\n');
  const fromIndexCases = variants
    .map((v) => `        if (i == ${v.index}) return ${enumName}.${v.name};`)
    .join('\n');

  return `// Auto-generated from Substrate enum ${typeName}

enum ${enumName} {
${enumBody}
}

library ${enumName}Codec {
    // SCALE encode: variant index as a single byte (<= 256 variants)
    function encode(${enumName} v) internal pure returns (bytes memory) {
        return abi.encodePacked(uint8(toIndex(v)));
    }

    function toIndex(${enumName} v) internal pure returns (uint8) {
${toIndexCases}
        revert("Invalid enum value");
    }

    function fromIndex(uint8 i) internal pure returns (${enumName} v) {
${fromIndexCases}
        revert("Invalid enum index");
    }
}
`;
}
