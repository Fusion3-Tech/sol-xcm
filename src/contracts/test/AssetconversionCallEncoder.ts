import assert from "node:assert/strict";
import { describe, it, before, after } from "node:test";
import { network } from "hardhat";
import { ApiPromise, WsProvider } from "@polkadot/api";

const POLKADOT_ASSET_HUB_WS = 'wss://sys.ibp.network/asset-hub-polkadot';

describe("AssetconversionCallEncoder - all extrinsics encode correctly", async function () {
  let assetConversion: any;
  let api: ApiPromise;

  // Sample data for complex types
  const asset1: any = {
    parents: 0,
    interior: { tag: 0, payload: '0x' } // Here variant (no payload)
  };
  const asset2: any = {
    parents: 1,
    interior: { tag: 1, payload: '0x01020304' } // X1 variant with sample payload
  };
  const path: any[] = [asset1, asset2]; // Vec<StagingXcmV5Location>
  const mintTo = '0x1111111111111111111111111111111111111111111111111111111111111111';
  const amount = 5_000_000n; // Use BigInt for u128
  const amountZero = 0n;

  before(async () => {
    const { viem } = await network.connect();
    assetConversion = await viem.deployContract("AssetconversionCallEncoderHarness");
    api = await ApiPromise.create({ provider: new WsProvider(POLKADOT_ASSET_HUB_WS) });
    await api.isReady;
  });

  after(async () => {
    await api.disconnect();
  });

  it("assetConversion_createPool: basic test", async function () {
    const call = await assetConversion.read.assetConversion_createPool([asset1, asset2]);
    const expectedCall = api.tx.assetConversion.createPool(asset1, asset2).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("assetConversion_addLiquidity: with non-zero amounts", async function () {
    const call = await assetConversion.read.assetConversion_addLiquidity([asset1, asset2, amount, amount, amount, amount, mintTo]);
    const expectedCall = api.tx.assetConversion.addLiquidity(asset1, asset2, amount, amount, amount, amount, mintTo).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("assetConversion_addLiquidity: with zero amounts", async function () {
    const call = await assetConversion.read.assetConversion_addLiquidity([asset1, asset2, amountZero, amountZero, amountZero, amountZero, mintTo]);
    const expectedCall = api.tx.assetConversion.addLiquidity(asset1, asset2, amountZero, amountZero, amountZero, amountZero, mintTo).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("assetConversion_removeLiquidity: with non-zero amounts", async function () {
    const call = await assetConversion.read.assetConversion_removeLiquidity([asset1, asset2, amount, amount, amount, mintTo]);
    const expectedCall = api.tx.assetConversion.removeLiquidity(asset1, asset2, amount, amount, amount, mintTo).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("assetConversion_removeLiquidity: with zero amounts", async function () {
    const call = await assetConversion.read.assetConversion_removeLiquidity([asset1, asset2, amountZero, amountZero, amountZero, mintTo]);
    const expectedCall = api.tx.assetConversion.removeLiquidity(asset1, asset2, amountZero, amountZero, amountZero, mintTo).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("assetConversion_swapExactTokensForTokens: with path and non-zero amounts", async function () {
    const call = await assetConversion.read.assetConversion_swapExactTokensForTokens([path, amount, amount, mintTo, true]);
    const expectedCall = api.tx.assetConversion.swapExactTokensForTokens(path, amount, amount, mintTo, true).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("assetConversion_swapExactTokensForTokens: with keep_alive = false", async function () {
    const call = await assetConversion.read.assetConversion_swapExactTokensForTokens([path, amount, amount, mintTo, false]);
    const expectedCall = api.tx.assetConversion.swapExactTokensForTokens(path, amount, amount, mintTo, false).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("assetConversion_swapTokensForExactTokens: with path and non-zero amounts", async function () {
    const call = await assetConversion.read.assetConversion_swapTokensForExactTokens([path, amount, amount, mintTo, true]);
    const expectedCall = api.tx.assetConversion.swapTokensForExactTokens(path, amount, amount, mintTo, true).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("assetConversion_swapTokensForExactTokens: with keep_alive = false", async function () {
    const call = await assetConversion.read.assetConversion_swapTokensForExactTokens([path, amount, amount, mintTo, false]);
    const expectedCall = api.tx.assetConversion.swapTokensForExactTokens(path, amount, amount, mintTo, false).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("assetConversion_touch: basic test", async function () {
    const call = await assetConversion.read.assetConversion_touch([asset1, asset2]);
    const expectedCall = api.tx.assetConversion.touch(asset1, asset2).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });
});

function stripRange(s: string, start: number, end: number): string {
  return s.slice(0, start) + s.slice(end);
}