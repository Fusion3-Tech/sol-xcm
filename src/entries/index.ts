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

export function extractAllTypes(api: ApiPromise, pallets: string[]): ArgDesc[] {
  const types: ArgDesc[] = [];

  for (const [section, sectionMethods] of Object.entries(api.tx)) {
    if (!pallets.includes(section.toLowerCase())) continue;

    for (const [, extrinsic] of Object.entries(sectionMethods as Record<string, any>)) {
      const metaArgs = (extrinsic as any).toJSON().fields;
      metaArgs.forEach((a: any) => {
        describe({ name: a.name, lookupId: a.type });
      });
    }
  }

  return types;

  function describe(a: Arg): void {
    const arg = describeArg(api, a);

    if (!arg.complexDesc) return;
    if (types.find((t) => t.rawType === arg.rawType)) return;

    types.push(arg);

    for (const [field, typeRef] of Object.entries(arg.complexDesc)) {
      const typeDef = findTypeByLookupName(api, typeRef as string);
      if (!typeDef) continue;

      const primKind = classifyPrimitive(
        resolvePrimitiveType(api, { name: typeDef.def.lookupName || '', lookupId: typeDef.id })
      );

      if (primKind !== 'Unsupported') {
        console.log(`PRIMITIVE Field: ${field}: ${typeRef as string}`);
      } else {
        console.log(`COMPLEX Field: ${field}: ${typeRef as string}`);
        describe({ name: typeDef.def.lookupName || '', lookupId: typeDef.id });
      }
    }
  }
}
