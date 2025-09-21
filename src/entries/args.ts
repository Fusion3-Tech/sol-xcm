import { type ApiPromise } from '@polkadot/api';

import { type ArgDesc } from './types';
import { classifyType, resolveTypeName } from '../typeDesc/desc';

type Arg = {
  name: string;
  lookupId: number;
};

export function describeArg(api: ApiPromise, a: Arg): ArgDesc {
  const type = resolveTypeName(api, a.lookupId);

  return { argName: a.name, typeName: type, argType: classifyType(type) };
}
