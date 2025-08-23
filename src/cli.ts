import { ApiPromise, WsProvider } from '@polkadot/api';
import { Command } from 'commander';
import fs from 'node:fs';
import path from 'node:path';

import { getEntries } from './entries';
import { getCallsContract } from './callsContract';
import { getCallEncoderContract } from './callEncoderContract';
import { ensureDir, sanitize } from './helpers';

const program = new Command()
  .option('--ws <url>', 'WebSocket endpoint', 'wss://westend-asset-hub-rpc.polkadot.io')
  .option('--out-dir <dir>', 'Output contracts directory', 'contracts')
  .option('--contract <name>', 'Indices contract name', 'PalletCalls')
  .option('--encoders <name>', 'Encoders library name', 'CallEncoders')
  .argument('<pallets...>', 'Pallet names to include (e.g. Balances System)');

export type Opts = {
  ws: string;
  outDir: string;
  contract: string;
  encoders: string;
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
    const entries = await getEntries(api, pallets);

    if (!entries.length) {
      console.error('❌ No matching calls found.');
      process.exit(1);
    }

    entries.sort(
      (a, b) =>
        a.palletIndex - b.palletIndex ||
        a.callIndex - b.callIndex ||
        a.enumName.localeCompare(b.enumName),
    );

    const callsContract = await getCallsContract(api, opts, entries);
    const callEncoderContract = await getCallEncoderContract(api, opts, entries);

    // write files
    const indicesPath = path.join(opts.outDir, `${sanitize(opts.contract)}.sol`);
    const encodersPath = path.join(opts.outDir, `${sanitize(opts.encoders)}.sol`);
    ensureDir(indicesPath);
    ensureDir(encodersPath);
    fs.writeFileSync(indicesPath, callsContract);
    fs.writeFileSync(encodersPath, callEncoderContract);

    console.log(`✅ Wrote:
 - ${indicesPath}
 - ${encodersPath}
(remember to place contracts/ScaleCodec.sol alongside)`);
  } finally {
    await api.disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
