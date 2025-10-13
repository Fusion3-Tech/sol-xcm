import { type ApiPromise } from '@polkadot/api';

import { type Entry } from './entries';
import { sanitize } from './helpers';
import { type Opts } from './cli';
import { type ArgDesc } from './entries/types';
import { type TypeDesc } from './typeDesc/types';
import { generateSolidityEnum } from './typeDesc/types/enum';
import { generateSolidityStruct } from './typeDesc/types/struct';

export async function getCallEncoderContract(
  api: ApiPromise,
  opts: Opts,
  customTypes: TypeDesc[],
  entries: Entry[],
  palletName: string,
) {
  const chain = (await api.rpc.system.chain()).toString();
  const specName = api.runtimeVersion.specName.toString();
  const specVersion = api.runtimeVersion.specVersion.toNumber();

  function solTypeAndEncoder(arg: ArgDesc, paramName: string): { sol: string; enc: string } {
    // map supported kinds to (sol_type, encoder_call)
    if (arg.argType === 'MultiAddressId32')
      return { sol: 'bytes32', enc: `ScaleCodec.multiAddressId32(${paramName})` };
    if (arg.argType === 'AccountId32')
      return { sol: 'bytes32', enc: `ScaleCodec.u128LE(uint128(uint256(${paramName})))` }; // rarely used directly; adjust as needed
    if (arg.argType === 'CompactU128')
      return { sol: 'uint128', enc: `ScaleCodec.compactU128(${paramName})` };
    if (arg.argType === 'CompactU32')
      return { sol: 'uint32', enc: `ScaleCodec.compactU32(${paramName})` };
    if (arg.argType === 'U8') return { sol: 'uint8', enc: `ScaleCodec.u8(${paramName})` };
    if (arg.argType === 'U16') return { sol: 'uint16', enc: `ScaleCodec.u16LE(${paramName})` };
    if (arg.argType === 'U32') return { sol: 'uint32', enc: `ScaleCodec.u32LE(${paramName})` };
    if (arg.argType === 'U64') return { sol: 'uint64', enc: `ScaleCodec.u64LE(${paramName})` };
    if (arg.argType === 'U128') return { sol: 'uint128', enc: `ScaleCodec.u128LE(${paramName})` };
    if (arg.argType === 'Bytes')
      return { sol: 'bytes memory', enc: `ScaleCodec.vecU8(${paramName})` };
    if (arg.argType === 'Bool') return { sol: 'bool', enc: `ScaleCodec.boolean(${paramName})` };
    else return { sol: `${arg.typeName} calldata`, enc: `${arg.typeName}Codec.encode(${paramName})` };
  }

  function makeFnName(e: Entry): string {
    return `${e.section}_${e.method}`;
  }

  const encoderFns: string[] = [];
  const customCodecs: string[] = [];
  const typesGenerated: string[] = [];

  customTypes.forEach((customType) => {
    if (customType.classifiedType === 'Enum') {
      customCodecs.push(generateSolidityEnum(customType.name, customType.complexDesc));
      typesGenerated.push(customType.name);
    } else if (customType.classifiedType === 'Struct') {
      customCodecs.push(generateSolidityStruct(customType.name, customType.complexDesc));
      typesGenerated.push(customType.name);
    }
  });

  for (const e of entries) {
    const pieces: string[] = [];
    const params: string[] = [];

    e.args.forEach((a, idx) => {
      const mapped = solTypeAndEncoder(a, sanitize(a.argName));

      params.push(`${mapped.sol} ${sanitize(a.argName)}`);
      pieces.push(mapped.enc);
    });

    const fname = makeFnName(e);
    const body = pieces.length
      ? `bytes.concat(
            ScaleCodec.callIndex(${e.palletIndex}, ${e.callIndex}),
            ${pieces.join(',\n            ')}
        )`
      : `ScaleCodec.callIndex(${e.palletIndex}, ${e.callIndex})`;

    encoderFns.push(
      `    /// @notice ${e.section}.${e.method}
    function ${fname}(${params.join(', ')}) internal pure returns (bytes memory) {
        return ${body};
    }`,
    );
  }

  const contractLibName = `${palletName}CallEncoder`;

  const callEncodersContract = `// Auto-generated from ${chain} (${specName} v${specVersion})
// Source WS: ${opts.ws}
pragma solidity ^0.8.20;

import "./ScaleCodec.sol";

${customCodecs.join('\n')}

/// @title Typed SCALE encoders for selected calls (supported classified args only)
library ${contractLibName} {
${encoderFns.join('\n\n')}
}
    `;

  return callEncodersContract;
}
