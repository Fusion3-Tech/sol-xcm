import { ApiPromise } from '@polkadot/api';
import { ArgDesc } from './types';
import { classifyPrimitive } from './primitives';
import { generateSolidityEnum } from './complex/enum';

function isLookupLike(raw: string) {
  return /^\d+$/.test(raw) || raw.startsWith('Lookup');
}

function resolvePrimitiveType(api: ApiPromise, arg: any): string {
  const raw = arg.type?.toString?.() ?? String(arg.type);
  if (isLookupLike(raw)) {
    const def = api.registry.lookup.getTypeDef(arg.type);
    return (def.lookupName || def.type || 'Unknown').toString();
  }
  return raw;
}

function resolveComplexType(api: ApiPromise, a: any): any {
  const typeDef = api.registry.lookup.getTypeDef(a.type);
  // call this from the contract writing code, here we just store it as object.
  const type = JSON.parse(typeDef.type);
  if (type._enum) {
    console.log(generateSolidityEnum(typeDef.lookupName || 'Unknown', typeDef.type));
  }
  return type;
}

export function describeArg(api: ApiPromise, a: any): ArgDesc {
  const name = a.name.toString();
  const type = resolvePrimitiveType(api, a);
  if (classifyPrimitive(type) === 'Unsupported') {
    // if not primitive:
    const typeDef = resolveComplexType(api, a);
    const argDesc: ArgDesc = {
      name,
      rawType: type,
      classifiedType: 'Complex',
      // complexDesc: JSON.parse(typeDef.type),
      complexDesc: typeDef,
    };
    console.log(argDesc);
    return argDesc;
  }

  return { name, rawType: type, classifiedType: classifyPrimitive(type) };
}
