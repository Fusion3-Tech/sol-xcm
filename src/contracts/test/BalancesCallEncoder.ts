import assert from "node:assert/strict";
import { describe, it, before, after } from "node:test";
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
    await api.isReady;
  });

  after(async () => {
    await api.disconnect();
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

  it("balances_forceTransfer", async function () {
    const source = '0x1111111111111111111111111111111111111111111111111111111111111111';
    const dest = '0x2222222222222222222222222222222222222222222222222222222222222222';
    const amount = 3_000_000;
    const call = await balances.read.balances_forceTransfer([source, dest, amount]);

    const expectedCall = api.tx.balances.forceTransfer(source, dest, amount).toHex();

    assert(
        call ===
        stripRange(expectedCall, 2, 6)
    );
  });

  it("balances_transferKeepAlive", async function () {
    const dest = '0x3333333333333333333333333333333333333333333333333333333333333333';
    const amount = 2_000_000;
    const call = await balances.read.balances_transferKeepAlive([dest, amount]);

    const expectedCall = api.tx.balances.transferKeepAlive(dest, amount).toHex();

    assert(
        call ===
        stripRange(expectedCall, 2, 6)
    );
  });

  it("balances_transferAll", async function () {
    const dest = '0x4444444444444444444444444444444444444444444444444444444444444444';
    const keep_alive = true;
    const call = await balances.read.balances_transferAll([dest, keep_alive]);

    const expectedCall = api.tx.balances.transferAll(dest, keep_alive).toHex();

    assert(
        call ===
        stripRange(expectedCall, 2, 6)
    );
  });

  it("balances_transferAll with keep_alive = true", async function () {
    const dest = '0x4444444444444444444444444444444444444444444444444444444444444444';
    const keep_alive = true;
    const call = await balances.read.balances_transferAll([dest, keep_alive]);

    const expectedCall = api.tx.balances.transferAll(dest, keep_alive).toHex();

    assert(
        call ===
        stripRange(expectedCall, 2, 6)
    );
  });

  it("balances_transferAll with keep_alive = false", async function () {
    const dest = '0x4444444444444444444444444444444444444444444444444444444444444444';
    const keep_alive = false;
    const call = await balances.read.balances_transferAll([dest, keep_alive]);

    const expectedCall = api.tx.balances.transferAll(dest, keep_alive).toHex();

    assert(
        call ===
        stripRange(expectedCall, 2, 6)
    );
  });

  it("balances_forceUnreserve", async function () {
    const who = '0x5555555555555555555555555555555555555555555555555555555555555555';
    const amount = 1_000_000;
    const call = await balances.read.balances_forceUnreserve([who, amount]);

    const expectedCall = api.tx.balances.forceUnreserve(who, amount).toHex();

    assert(
        call ===
        stripRange(expectedCall, 2, 6)
    );
  });

  it("balances_forceSetBalance", async function () {
    const who = '0x6666666666666666666666666666666666666666666666666666666666666666';
    const new_free = 10_000_000;
    const call = await balances.read.balances_forceSetBalance([who, new_free]);

    const expectedCall = api.tx.balances.forceSetBalance(who, new_free).toHex();

    assert(
        call ===
        stripRange(expectedCall, 2, 6)
    );
  });

  it("balances_upgradeAccounts", async function () {
    const who = '0x7777777777777777777777777777777777777777777777777777777777777777';
    const call = await balances.read.balances_upgradeAccounts([who]);

    // The polkadot API expects an array of accounts for `upgradeAccounts`
    const expectedCall = api.tx.balances.upgradeAccounts([who]).toHex();

    assert(
        call ===
        stripRange(expectedCall, 2, 6)
    );
  });

  it("balances_forceAdjustTotalIssuance", async function () {
    // Direction: 0 for Increase, 1 for Decrease
    const direction = { tag: 1, payload: '0x' }; // Decrease
    const delta = 1_000_000;
    const call = await balances.read.balances_forceAdjustTotalIssuance([direction, delta]);

    const expectedCall = api.tx.balances.forceAdjustTotalIssuance({ 'Decrease': null }, delta).toHex();

    assert(
        call ===
        stripRange(expectedCall, 2, 6)
    );
  });

  it("balances_burn", async function () {
    const value = 500_000;
    const keep_alive = false;
    const call = await balances.read.balances_burn([value, keep_alive]);

    const expectedCall = api.tx.balances.burn(value, keep_alive).toHex();

    assert(
        call ===
        stripRange(expectedCall, 2, 6)
    );
  });

  it("balances_burn with keep_alive = false", async function () {
    const value = 500_000;
    const keep_alive = false;
    const call = await balances.read.balances_burn([value, keep_alive]);

    const expectedCall = api.tx.balances.burn(value, keep_alive).toHex();

    assert(
        call ===
        stripRange(expectedCall, 2, 6)
    );
  });

  it("balances_burn with keep_alive = true", async function () {
    const value = 500_000;
    const keep_alive = true;
    const call = await balances.read.balances_burn([value, keep_alive]);

    const expectedCall = api.tx.balances.burn(value, keep_alive).toHex();

    assert(
        call ===
        stripRange(expectedCall, 2, 6)
    );
  });
});

function stripRange(s: string, start: number, end: number): string {
    return s.slice(0, start) + s.slice(end);
}
