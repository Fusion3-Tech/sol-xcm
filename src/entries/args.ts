import { type ApiPromise } from '@polkadot/api';

import { type ArgDesc } from './types';
import { type Arg } from '.';
import { classifyType, resolveTypeName } from '../typeDesc/desc';

export function describeArg(api: ApiPromise, a: Arg): ArgDesc {
  const type = resolveTypeName(api, a.lookupId);

  return { argName: a.name, typeName: type, argType: classifyType(type) };
}
