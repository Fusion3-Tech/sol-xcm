import { type ApiPromise } from '@polkadot/api';

import { sanitize } from '../helpers';
import { describeArg } from './args';
import { type ArgDesc } from './types';

export type Entry = {
  entryName: string;
  section: string;
  method: string;
  palletIndex: number;
  callIndex: number;
  args: ArgDesc[];
};

export async function getEntries(api: ApiPromise, pallet: string): Promise<Entry[]> {
  const entries: Entry[] = [];

  for (const [section, sectionMethods] of Object.entries(api.tx)) {
    if (pallet !== section.toLowerCase()) continue;
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
