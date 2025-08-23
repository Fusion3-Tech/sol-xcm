import { Command } from 'commander';
import { ApiPromise, WsProvider } from '@polkadot/api';
import fs from 'fs';

import { DEFAULT_CONTRACT, DEFAULT_SOLC, DEFAULT_WS } from './types';
import { ensureDirForFile, sanitize } from './helpers';
import { collectPalletCalls, generateSolidity } from './core';


const program = new Command()
  .name('generate-xcm-interface')
  .description("Generate a Solidity enum + indices() mapping for selected pallets' calls.")
  .argument(
    '<pallets...>',
    'Pallet names to include (case-insensitive), e.g. Balances System Utility',
  )
  .option('--ws <url>', 'WebSocket endpoint', DEFAULT_WS)
  .option('-o, --out <file>', 'Output .sol file path')
  .option('-c, --contract <name>', 'Contract name', DEFAULT_CONTRACT)
  .option('--solc <version>', 'Solidity pragma version', DEFAULT_SOLC);

async function main() {
  const parsed = program.parse(process.argv);
  const palletsArg = (parsed.args as string[]).map((s) => s.toLowerCase());
  const opts = parsed.opts<{
    ws: string;
    out?: string;
    contract: string;
    solc: string;
    json?: string;
  }>();

  const contract = sanitize(opts.contract || DEFAULT_CONTRACT);

  if (!palletsArg.length) {
    program.error('Please provide at least one pallet name.');
  }

  const api = await ApiPromise.create({ provider: new WsProvider(opts.ws) });
  try {
    const chain = (await api.rpc.system.chain()).toString();
    const specName = api.runtimeVersion.specName.toString();
    const specVersion = api.runtimeVersion.specVersion.toNumber();

    const entries = await collectPalletCalls(api, palletsArg);

    if (entries.length === 0) {
      console.error('❌ No matching calls found. Check pallet names.');
      process.exit(1);
    }

    const solidity = generateSolidity({
      chain,
      specName,
      specVersion,
      ws: opts.ws,
      contract,
      solc: opts.solc,
      entries,
      palletsLower: palletsArg,
    });

    const outFile = opts.out ?? `${sanitize(contract)}_${sanitize(specName)}_v${specVersion}.sol`;

    ensureDirForFile(outFile);
    fs.writeFileSync(outFile, solidity);

    console.log(
      `✅ Wrote ${outFile} (${entries.length} calls) from pallets: ${palletsArg.join(', ')}`,
    );
  } finally {
    await api.disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
