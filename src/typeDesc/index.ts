import { type ApiPromise } from '@polkadot/api';

import { type TypeDesc } from './types';
import {
  type LookupId,
  classifyType,
  descType,
  findTypeByLookupName,
  resolveTypeName,
} from './desc';

export function extractAllTypes(api: ApiPromise, pallets: string[]): TypeDesc[] {
  const types: TypeDesc[] = [];

  for (const [section, sectionMethods] of Object.entries(api.tx)) {
    if (!pallets.includes(section.toLowerCase())) continue;

    for (const [, extrinsic] of Object.entries(sectionMethods as Record<string, any>)) {
      const metaArgs = (extrinsic as any).toJSON().fields;
      metaArgs.forEach((a: any) => {
        describe(a.type);
      });
    }
  }

  return types;

  function describe(lookupId: LookupId): void {
    const type = descType(api, lookupId);

    if (types.find((t) => t.lookupId === type.lookupId)) return;

    if (type.classifiedType === 'Unsupported') {
      const typeDef = findTypeByLookupName(api, type.name);
      if (!typeDef || !typeDef.id) return;

      if (typeDef.def.sub && typeDef.def.sub) {
        (typeDef.def.sub as Array<any>).forEach((t) => {
          // todo: don't or
          describe(t.lookupIndex || t.index);
        });
      }
    }

    if (!type.complexDesc) return;

    types.push(type);

    for (const [field, typeRef] of Object.entries(type.complexDesc)) {
      const typeDef = findTypeByLookupName(api, typeRef as string);
      if (!typeDef || !typeDef.id) continue;

      const typeName = classifyType(resolveTypeName(api, typeDef.id));

      if (typeName === 'Unsupported') describe(typeDef.id);

      if (typeDef.def.sub && typeDef.def.sub) {
        (typeDef.def.sub as Array<any>).forEach((t) => {
          // todo: don't or
          describe(t.lookupIndex || t.index);
        });
      }
    }
  }
}
