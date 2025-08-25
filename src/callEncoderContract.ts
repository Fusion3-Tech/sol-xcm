import { ApiPromise } from '@polkadot/api';

import { ArgDesc, Entry, ParamKind } from './entries';
import { sanitize } from './helpers';
import { Opts } from './cli';

export async function getCallEncoderContract(api: ApiPromise, opts: Opts, entries: Entry[]) {
  const chain = (await api.rpc.system.chain()).toString();
  const specName = api.runtimeVersion.specName.toString();
  const specVersion = api.runtimeVersion.specVersion.toNumber();

  function solTypeAndEncoder(arg: ArgDesc, paramName: string): { sol: string; enc: string } | null {
    // map supported kinds to (sol_type, encoder_call)
    if (arg.kind === 'MultiAddressId32')
      return { sol: 'bytes32', enc: `ScaleCodec.multiAddressId32(${paramName})` };
    if (arg.kind === 'AccountId32')
      return { sol: 'bytes32', enc: `ScaleCodec.u128LE(uint128(uint256(${paramName})))` }; // rarely used directly; adjust as needed
    if (arg.kind === 'CompactU128') return { sol: 'uint128', enc: `ScaleCodec.compactU128(${paramName})` };
    if (arg.kind === 'CompactU32') return { sol: 'uint32', enc: `ScaleCodec.compactU32(${paramName})` };
    if (arg.kind === 'U8') return { sol: 'uint8', enc: `ScaleCodec.u8(${paramName})` };
    if (arg.kind === 'U16') return { sol: 'uint16', enc: `ScaleCodec.u16LE(${paramName})` };
    if (arg.kind === 'U32') return { sol: 'uint32', enc: `ScaleCodec.u32LE(${paramName})` };
    if (arg.kind === 'U64') return { sol: 'uint64', enc: `ScaleCodec.u64LE(${paramName})` };
    if (arg.kind === 'U128') return { sol: 'uint128', enc: `ScaleCodec.u128LE(${paramName})` };
    if (arg.kind === 'Bytes') return { sol: 'bytes memory', enc: `ScaleCodec.vecU8(${paramName})` };
    if (arg.kind === 'Bool') return { sol: 'bool', enc: `ScaleCodec.boolean(${paramName})` };
    if (arg.kind === 'EnumUnit' && arg.enumInfo)
      return { sol: arg.enumInfo.solName, enc: `encode_${arg.enumInfo.solName}(${paramName})` };
    return null;
  }

  function makeFnName(e: Entry): string {
    // e.g. balances_transferKeepAlive_id32 when first arg is MultiAddressId32
    const suffix = e.args.length && e.args[0].kind === 'MultiAddressId32' ? '_id32' : '';
    return `${e.section}_${e.method}${suffix}`;
  }

  const encoderFns: string[] = [];
  for (const e of entries) {
    const pieces: string[] = [];
    const params: string[] = [];

    let supported = true;
    e.args.forEach((a, idx) => {
      const mapped = solTypeAndEncoder(a, sanitize(a.name));
      if (!mapped) supported = false;
      else {
        params.push(`${mapped.sol} ${sanitize(a.name)}`);
        pieces.push(mapped.enc);
      }
    });

    if (!supported) {
      encoderFns.push(
        `    // Skipped ${e.section}.${e.method}: unsupported arg types: ${e.args
          .map((a) => `${a.name}:${a.typeStr}`)
          .join(', ')}`,
      );
      continue;
    }

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

  const callEncodersContract = `// Auto-generated from ${chain} (${specName} v${specVersion})
// Source WS: ${opts.ws}
pragma solidity ^0.8.24;

import "./ScaleCodec.sol";
import "./${sanitize(opts.contract)}.sol";

/// @title Typed SCALE encoders for selected calls (supported arg kinds only)
library ${sanitize(opts.contract)} {
${encoderFns.join('\n\n')}
}
    `;

  return callEncodersContract;
}
