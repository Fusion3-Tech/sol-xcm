import assert from 'node:assert/strict';
import { describe, it, before, after } from 'node:test';
import { network } from 'hardhat';
import { ApiPromise, WsProvider } from '@polkadot/api';

const POLKADOT_ASSET_HUB_WS = 'wss://sys.ibp.network/asset-hub-polkadot';

describe('BalancesCallEncoder - all extrinsics encode correctly', async function () {
  let balances: any;
  let api: ApiPromise;

  const dest1 = '0x1111111111111111111111111111111111111111111111111111111111111111';
  const dest2 = '0x2222222222222222222222222222222222222222222222222222222222222222';
  const amount = 5_000_000;
  const amountZero = 0;

  before(async () => {
    const { viem } = await network.connect();
    balances = await viem.deployContract('BalancesCallEncoderHarness');
    api = await ApiPromise.create({ provider: new WsProvider(POLKADOT_ASSET_HUB_WS) });
    await api.isReady;
  });

  after(async () => {
    await api.disconnect();
  });

  it('balances_transferAllowDeath: with non-zero amount', async function () {
    const call = await balances.read.balances_transferAllowDeath([dest1, amount]);
    const expectedCall = api.tx.balances.transferAllowDeath(dest1, amount).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it('balances_transferAllowDeath: with zero amount', async function () {
    const call = await balances.read.balances_transferAllowDeath([dest1, amountZero]);
    const expectedCall = api.tx.balances.transferAllowDeath(dest1, amountZero).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it('balances_forceTransfer: with non-zero amount', async function () {
    const call = await balances.read.balances_forceTransfer([dest1, dest2, amount]);
    const expectedCall = api.tx.balances.forceTransfer(dest1, dest2, amount).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it('balances_forceTransfer: with zero amount', async function () {
    const call = await balances.read.balances_forceTransfer([dest1, dest2, amountZero]);
    const expectedCall = api.tx.balances.forceTransfer(dest1, dest2, amountZero).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it('balances_transferKeepAlive: with non-zero amount', async function () {
    const call = await balances.read.balances_transferKeepAlive([dest1, amount]);
    const expectedCall = api.tx.balances.transferKeepAlive(dest1, amount).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it('balances_transferKeepAlive: with zero amount', async function () {
    const call = await balances.read.balances_transferKeepAlive([dest1, amountZero]);
    const expectedCall = api.tx.balances.transferKeepAlive(dest1, amountZero).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it('balances_transferAll: with keep_alive = true', async function () {
    const call = await balances.read.balances_transferAll([dest1, true]);
    const expectedCall = api.tx.balances.transferAll(dest1, true).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it('balances_transferAll: with keep_alive = false', async function () {
    const call = await balances.read.balances_transferAll([dest1, false]);
    const expectedCall = api.tx.balances.transferAll(dest1, false).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it('balances_forceUnreserve: with non-zero amount', async function () {
    const call = await balances.read.balances_forceUnreserve([dest1, amount]);
    const expectedCall = api.tx.balances.forceUnreserve(dest1, amount).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it('balances_forceUnreserve: with zero amount', async function () {
    const call = await balances.read.balances_forceUnreserve([dest1, amountZero]);
    const expectedCall = api.tx.balances.forceUnreserve(dest1, amountZero).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it('balances_forceSetBalance: with non-zero amount', async function () {
    const call = await balances.read.balances_forceSetBalance([dest1, amount]);
    const expectedCall = api.tx.balances.forceSetBalance(dest1, amount).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it('balances_forceSetBalance: with zero amount', async function () {
    const call = await balances.read.balances_forceSetBalance([dest1, amountZero]);
    const expectedCall = api.tx.balances.forceSetBalance(dest1, amountZero).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it('balances_upgradeAccounts: (known issue)', async function () {
    // The polkadot API expects an array of accounts, but the contract takes a single one.
    // This test correctly identifies this mismatch.
    const call = await balances.read.balances_upgradeAccounts([dest1]);
    const expectedCall = api.tx.balances.upgradeAccounts([dest1]).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it('balances_forceAdjustTotalIssuance: with Decrease', async function () {
    const direction = { tag: 1, payload: '0x' }; // Decrease
    const call = await balances.read.balances_forceAdjustTotalIssuance([direction, amount]);
    const expectedCall = api.tx.balances
      .forceAdjustTotalIssuance({ Decrease: null }, amount)
      .toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it('balances_forceAdjustTotalIssuance: with Increase', async function () {
    const direction = { tag: 0, payload: '0x' }; // Increase
    const call = await balances.read.balances_forceAdjustTotalIssuance([direction, amount]);
    const expectedCall = api.tx.balances
      .forceAdjustTotalIssuance({ Increase: null }, amount)
      .toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it('balances_burn: with keep_alive = true', async function () {
    const call = await balances.read.balances_burn([amount, true]);
    const expectedCall = api.tx.balances.burn(amount, true).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it('balances_burn: with keep_alive = false', async function () {
    const call = await balances.read.balances_burn([amount, false]);
    const expectedCall = api.tx.balances.burn(amount, false).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });
});

function stripRange(s: string, start: number, end: number): string {
  return s.slice(0, start) + s.slice(end);
}
