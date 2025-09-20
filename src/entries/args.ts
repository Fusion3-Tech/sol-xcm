import { type ApiPromise } from '@polkadot/api';

import { type ArgDesc } from './types';
import { type Arg } from '.';
import { classifyType } from '../typeDesc/desc';

export function describeArg(api: ApiPromise, a: Arg): ArgDesc {
  const type = resolvePrimitiveType(api, a);

  return { argName: a.name, typeName: type, argType: classifyType(type) };
}

function isLookupLike(raw: string) {
  return /^\d+$/.test(raw) || raw.startsWith('Lookup');
}

function resolvePrimitiveType(api: ApiPromise, arg: Arg): string {
  const raw = arg.lookupId.toString();
  if (isLookupLike(raw)) {
    const def = api.registry.lookup.getTypeDef(arg.lookupId);
    return (def.lookupName || def.type || 'Unknown').toString();
  }
  return raw;
}
