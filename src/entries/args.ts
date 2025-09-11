import { ApiPromise } from '@polkadot/api';
import { ArgDesc } from './types';
import { classifyPrimitive } from './primitives';

function isLookupLike(raw: string) {
  return /^\d+$/.test(raw) || raw.startsWith('Lookup');
}

export function resolveType(api: ApiPromise, arg: any): string {
  const raw = arg.type?.toString?.() ?? String(arg.type);
  if (isLookupLike(raw)) {
    const def = api.registry.lookup.getTypeDef(arg.type);
    return (def.lookupName || def.type || 'Unknown').toString();
  }
  return raw;
}

export function describeArg(api: ApiPromise, a: any): ArgDesc {
  const name = a.name.toString();
  const type = resolveType(api, a);

  return { name, rawType: type, classifiedType: classifyPrimitive(type) };
}
