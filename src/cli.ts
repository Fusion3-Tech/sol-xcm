import { ApiPromise, WsProvider } from '@polkadot/api';
import { Command } from 'commander';
import fs from 'node:fs';
import { copyFile } from 'node:fs/promises';
import path from 'node:path';

import { getEntries } from './entries';
import { getCallEncoderContract } from './callEncoder';
import { ensureWritePathValid } from './helpers';
import { extractAllTypes } from './typeDesc';

const program = new Command()
  .option('--ws <url>', 'WebSocket endpoint', 'wss://westend-asset-hub-rpc.polkadot.io')
  .option('--out-dir <dir>', 'Output contracts directory', 'contracts')
  .argument('<pallets...>', 'Pallet names to include (e.g. Balances System)');

export type Opts = {
  ws: string;
  outDir: string;
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
    for (const pallet of pallets) {
      const customTypes = extractAllTypes(api, pallet);
      const entries = await getEntries(api, pallet);

      if (!entries.length) {
        console.warn(`⚠️ No matching calls found for pallet: ${pallet}. Skipping.`);
        continue;
      }

      entries.sort((a, b) => a.palletIndex - b.palletIndex || a.callIndex - b.callIndex);

      const palletNamePascal = pallet.charAt(0).toUpperCase() + pallet.slice(1);
      const contract = await getCallEncoderContract(
        api,
        opts,
        customTypes,
        entries,
        palletNamePascal,
      );

      // write files
      const encodersOutPath = path.join(opts.outDir, `${palletNamePascal}CallEncoder.sol`);
      ensureWritePathValid(encodersOutPath);
      fs.writeFileSync(encodersOutPath, contract);

      console.log(`✅ Wrote: ${encodersOutPath}`);
    }

    const scaleCodecOutPath = path.join(opts.outDir, 'ScaleCodec.sol');
    ensureWritePathValid(scaleCodecOutPath);
    copyFile('src/contracts/src/ScaleCodec.sol', scaleCodecOutPath, 0);
    console.log(`✅ Wrote: ${scaleCodecOutPath}`);
  } finally {
    await api.disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
