import assert from "node:assert/strict";
import { describe, it, before } from "node:test";
import { network } from "hardhat";
import { ApiPromise, WsProvider } from "@polkadot/api";

const POLKADOT_ASSET_HUB_WS = 'wss://sys.ibp.network/asset-hub-polkadot';

describe("BalancesCallEncoder - all extrinsics encode correctly", async function () {
  let balances: any;
  let api: ApiPromise;

  before(async () => {
    const { viem } = await network.connect();
    balances = await viem.deployContract("BalancesCallEncoderHarness");
    api = await ApiPromise.create({provider: new WsProvider(POLKADOT_ASSET_HUB_WS)});
  });

  it("balances_transferAllowDeath_id32", async function () {
    const dest = '0x1111111111111111111111111111111111111111111111111111111111111111';
    const amount = 5_000_000;
    const call = await balances.read.balances_transferAllowDeath([dest, amount]);

    const expectedCall = api.tx.balances.transferAllowDeath(dest, amount).toHex();

    assert(
        call ===
        stripRange(expectedCall, 2, 6) // strip compact encoding, starting from 2, because first two are 0x
    );
  });
});

function stripRange(s: string, start: number, end: number): string {
    return s.slice(0, start) + s.slice(end);
}
