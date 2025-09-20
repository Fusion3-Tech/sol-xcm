import { ApiPromise, WsProvider } from '@polkadot/api';
import { Command } from 'commander';
import fs from 'node:fs';
import { copyFile } from 'node:fs/promises';
import path from 'node:path';

import { getEntries } from './entries';
import { getCallEncoderContract } from './callEncoder';
import { ensureWritePathValid, sanitize } from './helpers';
import { extractAllTypes } from './typeDesc';

const program = new Command()
  .option('--ws <url>', 'WebSocket endpoint', 'wss://westend-asset-hub-rpc.polkadot.io')
  .option('--out-dir <dir>', 'Output contracts directory', 'contracts')
  .option('--contract <name>', 'Encoder contract name', 'CallEncoders')
  .argument('<pallets...>', 'Pallet names to include (e.g. Balances System)');

export type Opts = {
  ws: string;
  outDir: string;
  contract: string;
};

async function main() {
  const parsed = program.parse(process.argv);
  const opts = parsed.opts<Opts>();
  const pallets = (parsed.args as string[]).map((x) => x.toLowerCase());

  if (!pallets.length) {
    program.error('Provide at least one pallet.');
  }

  const api = await ApiPromise.create({ provider: new WsProvider(opts.ws) });
  try {
    const customTypes = extractAllTypes(api, pallets);
    console.log(customTypes);
    console.log(JSON.stringify(customTypes));
    const entries = await getEntries(api, pallets);

    if (!entries.length) {
      console.error('❌ No matching calls found.');
      process.exit(1);
    }

    entries.sort((a, b) => a.palletIndex - b.palletIndex || a.callIndex - b.callIndex);

    const callEncoderContract = await getCallEncoderContract(api, opts, customTypes, entries);

    // write files
    const encodersOutPath = path.join(opts.outDir, `${sanitize(opts.contract)}.sol`);
    const scaleCodecOutPath = path.join(opts.outDir, 'ScaleCodec.sol');
    ensureWritePathValid(encodersOutPath);
    ensureWritePathValid(scaleCodecOutPath);
    fs.writeFileSync(encodersOutPath, callEncoderContract);
    copyFile('src/contracts/ScaleCodec.sol', scaleCodecOutPath, 0);

    console.log(`✅ Wrote:
 - ${encodersOutPath}
 - ${scaleCodecOutPath}`);
  } finally {
    await api.disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
