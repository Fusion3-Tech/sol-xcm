import { type ApiPromise } from "@polkadot/api";

import { type TypeDesc } from "./types";
import { type LookupId, classifyType, descType, findTypeByLookupName, resolvePrimitiveType } from "./desc";

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

    if (!type.complexDesc) return;
    if (types.find((t) => t.lookupId === type.lookupId)) return;

    types.push(type);

    for (const [field, typeRef] of Object.entries(type.complexDesc)) {
      const typeDef = findTypeByLookupName(api, typeRef as string);
      if (!typeDef || !typeDef.id) continue;

      const typeKind = classifyType(
        resolvePrimitiveType(api, typeDef.id),
      );

      if (typeKind !== 'Unsupported') {
        console.log(`PRIMITIVE Field: ${field}: ${typeRef as string}`);
      } else {
        console.log(`COMPLEX Field: ${field}: ${typeRef as string}`);

        describe(typeDef.id);
      }

      if(typeDef.def.sub && typeDef.def.sub) {
        (typeDef.def.sub as Array<any>).forEach(t => {
          // todo: don't or
          describe(t.lookupIndex || t.index)
        })
      }
    }
  }
}
