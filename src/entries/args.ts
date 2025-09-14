import { ApiPromise } from '@polkadot/api';
import { ArgDesc } from './types';
import { classifyPrimitive } from './primitives';
import { resolvePrimitiveType } from './common';
import { Arg } from '.';

function resolveComplexType(api: ApiPromise, a: Arg): string {
  const typeDef = api.registry.lookup.getTypeDef(a.lookupId);
  // call this from the contract writing code, here we just store it as object.
  const type = JSON.parse(typeDef.type);
  return type;
}

export function describeArg(api: ApiPromise, a: Arg): ArgDesc {
  const name = a.name.toString();
  const type = resolvePrimitiveType(api, a);
  if (classifyPrimitive(type) === 'Unsupported') {
    // if not primitive:
    let typeDef;
    try {
      typeDef = resolveComplexType(api, a);
    } catch (e) {}
    const argDesc: ArgDesc = {
      name,
      rawType: type,
      classifiedType: 'Complex',
      complexDesc: typeDef,
    };
    return argDesc;
  }

  return { name, rawType: type, classifiedType: classifyPrimitive(type) };
}
