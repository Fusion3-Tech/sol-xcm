import { ApiPromise } from '@polkadot/api';
import { ArgDesc } from './types';
import { resolvePrimitiveType } from './common';
import { Arg } from '.';
import { classifyType } from '../typeDesc/desc';

export function describeArg(api: ApiPromise, a: Arg): ArgDesc {
  const type = resolvePrimitiveType(api, a);

  return { argName: a.name, typeName: type, argType: classifyType(type) };
}
