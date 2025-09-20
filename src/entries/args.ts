import { ApiPromise } from '@polkadot/api';
import { ArgDesc } from './types';
import { classifyPrimitive } from './primitives';
import { extractLookupId, resolvePrimitiveType } from './common';
import { Arg } from '.';
import { parseFixedArray } from './complex/fixedArray';

function resolveComplexType(api: ApiPromise, a: Arg): string {
  const typeDef = api.registry.lookup.getTypeDef(a.lookupId);
  // call this from the contract writing code, here we just store it as object.
  const type = JSON.parse(typeDef.type);
  return type;
}

export function describeArg(api: ApiPromise, a: Arg): ArgDesc {
  const type = resolvePrimitiveType(api, a);

  if(classifyPrimitive(type) === 'VecFixed') {
    const arrDesc = parseFixedArray(type);
    if(!arrDesc) throw Error("Failed to parse Fixed Array");

    const lookupId = extractLookupId(arrDesc._array.elem);
    if(!lookupId) throw Error("Failed to extract lookup id");
    const arrType = resolvePrimitiveType(api, { name: arrDesc._array.elem, lookupId, })

    if(classifyPrimitive(arrType) === 'Unsupported') {
      // if not primitive:
      let typeDef;
      try {
        typeDef = resolveComplexType(api, {lookupId, name: arrType });
      } catch (e) {}
      const argDesc: ArgDesc = {
        name: arrType,
        classifiedType: 'Complex',
        complexDesc: typeDef,
      };
      return argDesc;
    }
    return { name: arrType, classifiedType: classifyPrimitive(arrType) };
  }

  if (classifyPrimitive(type) === 'Unsupported') {
    // if not primitive:
    let typeDef;
    try {
      typeDef = resolveComplexType(api, a);
    } catch (e) {}
    const argDesc: ArgDesc = {
      name: type,
      classifiedType: 'Complex',
      complexDesc: typeDef,
    };
    return argDesc;
  }

  return { name: type, classifiedType: classifyPrimitive(type) };
}
