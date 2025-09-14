import { ApiPromise } from '@polkadot/api';
import { Arg } from '.';

export function isLookupLike(raw: string) {
  return /^\d+$/.test(raw) || raw.startsWith('Lookup');
}

export function resolvePrimitiveType(api: ApiPromise, arg: Arg): string {
  const raw = arg.lookupId.toString();
  if (isLookupLike(raw)) {
    const def = api.registry.lookup.getTypeDef(arg.lookupId);
    return (def.lookupName || def.type || 'Unknown').toString();
  }
  return raw;
}

export function findTypeByLookupName(api: ApiPromise, name: string) {
  const { lookup } = api.registry;

  for (const portable of lookup.types) {
    const id = portable.id.toNumber();

    // High-level TypeDef (what you usually want)
    const def = lookup.getTypeDef(id); // { info, lookupName, sub, type, ... }

    // 1) Exact lookupName match
    if (def.lookupName === name) {
      return { id, def, si: lookup.getSiType(id) };
    }

    // 2) Some runtimes don't set lookupName; derive it from the SCALE-Info path
    const si = lookup.getSiType(id); // SiType
    const joined = si.path.map((p: any) => p.toString()).join('');
    if (joined === name) {
      return { id, def, si };
    }

    // 3) Fallback: sometimes def.type equals the friendly name
    if (def.type === name) {
      return { id, def, si };
    }
  }

  return null; // not found
}
