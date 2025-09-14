import { ApiPromise } from '@polkadot/api';
import { sanitize } from '../helpers';
import { ArgDesc } from './types';
import { describeArg } from './args';
import { findTypeByLookupName, resolvePrimitiveType } from './common';
import { classifyPrimitive } from './primitives';

export type Arg = {
  name: string;
  lookupId: number;
}

export type Entry = {
  entryName: string;
  section: string;
  method: string;
  palletIndex: number;
  callIndex: number;
  args: ArgDesc[];
};

export async function getEntries(api: ApiPromise, pallets: string[]): Promise<Entry[]> {
  const entries: Entry[] = [];

  extractAllTypes(api, pallets);

  for (const [section, sectionMethods] of Object.entries(api.tx)) {
    if (!pallets.includes(section.toLowerCase())) continue;
    for (const [method, extrinsic] of Object.entries(sectionMethods)) {
      const [palletIndex, callIndex] = extrinsic.callIndex as Uint8Array;

      const metaArgs = extrinsic.toJSON().fields;
      const args = metaArgs.map((a: any) => {
        const arg = describeArg(api, { name: a.name, lookupId: a.type });
        return arg;
      });

      entries.push({
        entryName: sanitize(`${section}_${method}`),
        section,
        method,
        palletIndex,
        callIndex,
        args,
      });
    }
  }

  return entries;
}

function extractAllTypes(api: ApiPromise, pallets: string[]) {
  let types = Array<{ typeName: string; def: any }>();
  for (const [section, sectionMethods] of Object.entries(api.tx)) {
    if (!pallets.includes(section.toLowerCase())) continue;
    for (const [_, extrinsic] of Object.entries(sectionMethods)) {
      const metaArgs = extrinsic.toJSON().fields;
      metaArgs.forEach((a: any) => {
        describe({ name: a.name, lookupId: a.type });
      });
    }
  }

  return types;

  function describe(a: Arg) {
    const arg = describeArg(api, a);
    if (arg.complexDesc && !types.find((t) => t.typeName === arg.rawType)) {
      types.push({ typeName: arg.rawType, def: arg.complexDesc });

      for (const [field, typeRef] of Object.entries(arg.complexDesc)) {
        const typeDef = findTypeByLookupName(api, typeRef as string);
        if (!typeDef) continue;
        if (classifyPrimitive(resolvePrimitiveType(api, { name: typeDef.def.lookupName || '', lookupId: typeDef.id })) !== 'Unsupported') {
          console.log(`PRIMITIVE Field: ${field}: ${typeRef as string}`);
        } else {
          console.log(`COMPLEX Field: ${field}: ${typeRef as string}`);

          console.log({ name: typeDef.def.lookupName || '', lookupId: typeDef.id });
          describe({ name: typeDef.def.lookupName || '', lookupId: typeDef.id })
        }
      }
    }
  }
}
