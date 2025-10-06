import assert from "node:assert/strict";
import { describe, it, before, after } from "node:test";
import { network } from "hardhat";
import { ApiPromise, WsProvider } from "@polkadot/api";

const WESTEND_ASSET_HUB_WS = 'wss://westend-asset-hub-rpc.polkadot.io';

describe("ForeignassetsCallEncoder - all extrinsics encode correctly", async function () {
  let foreignAssets: any;
  let api: ApiPromise;

  // Sample data for testing
  const admin = '0x1111111111111111111111111111111111111111111111111111111111111111';
  const owner = '0x2222222222222222222222222222222222222222222222222222222222222222';
  const beneficiary = '0x3333333333333333333333333333333333333333333333333333333333333333';
  const who = '0x4444444444444444444444444444444444444444444444444444444444444444';
  const target = '0x5555555555555555555555555555555555555555555555555555555555555555';
  const source = '0x6666666666666666666666666666666666666666666666666666666666666666';
  const dest = '0x7777777777777777777777777777777777777777777777777777777777777777';
  const delegate = '0x8888888888888888888888888888888888888888888888888888888888888888';
  const destination = '0x9999999999999999999999999999999999999999999999999999999999999999';
  const issuer = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  const freezer = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
  const min_balance = 1000000n; // uint128
  const amount = 5000000n; // uint128
  const decimals = 18; // uint8
  const name = '0x546573744173736574'; // "TestAsset" as bytes
  const symbol = '0x54415354'; // "TAST" as bytes

  // Sample StagingXcmV5Location: parents=1, interior=Here
  const id = {
    parents: 1,
    interior: { tag: 0, payload: '0x' } // Here variant (tag 0, no payload)
  };

  // Sample StagingXcmV5Location for another test: parents=0, interior=X1 with a single junction
  const idX1 = {
    parents: 0,
    interior: { tag: 1, payload: '0x00' } // X1 variant (tag 1, payload as bytes[1])
  };

  before(async () => {
    const { viem } = await network.connect();
    foreignAssets = await viem.deployContract("ForeignassetsCallEncoderHarness");
    api = await ApiPromise.create({ provider: new WsProvider(WESTEND_ASSET_HUB_WS) });
    await api.isReady;
  });

  after(async () => {
    await api.disconnect();
  });

  it("foreignAssets_create", async function () {
    const call = await foreignAssets.read.foreignAssets_create([id, admin, min_balance]);
    const expectedCall = api.tx.foreignAssets.create(id, admin, min_balance).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("foreignAssets_forceCreate", async function () {
    const call = await foreignAssets.read.foreignAssets_forceCreate([id, owner, true, min_balance]);
    const expectedCall = api.tx.foreignAssets.forceCreate(id, owner, true, min_balance).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("foreignAssets_startDestroy", async function () {
    const call = await foreignAssets.read.foreignAssets_startDestroy([id]);
    const expectedCall = api.tx.foreignAssets.startDestroy(id).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("foreignAssets_destroyAccounts", async function () {
    const call = await foreignAssets.read.foreignAssets_destroyAccounts([id]);
    const expectedCall = api.tx.foreignAssets.destroyAccounts(id).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("foreignAssets_destroyApprovals", async function () {
    const call = await foreignAssets.read.foreignAssets_destroyApprovals([id]);
    const expectedCall = api.tx.foreignAssets.destroyApprovals(id).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("foreignAssets_finishDestroy", async function () {
    const call = await foreignAssets.read.foreignAssets_finishDestroy([id]);
    const expectedCall = api.tx.foreignAssets.finishDestroy(id).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("foreignAssets_mint", async function () {
    const call = await foreignAssets.read.foreignAssets_mint([id, beneficiary, amount]);
    const expectedCall = api.tx.foreignAssets.mint(id, beneficiary, amount).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("foreignAssets_burn", async function () {
    const call = await foreignAssets.read.foreignAssets_burn([id, who, amount]);
    const expectedCall = api.tx.foreignAssets.burn(id, who, amount).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("foreignAssets_transfer", async function () {
    const call = await foreignAssets.read.foreignAssets_transfer([id, target, amount]);
    const expectedCall = api.tx.foreignAssets.transfer(id, target, amount).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("foreignAssets_transferKeepAlive", async function () {
    const call = await foreignAssets.read.foreignAssets_transferKeepAlive([id, target, amount]);
    const expectedCall = api.tx.foreignAssets.transferKeepAlive(id, target, amount).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("foreignAssets_forceTransfer", async function () {
    const call = await foreignAssets.read.foreignAssets_forceTransfer([id, source, dest, amount]);
    const expectedCall = api.tx.foreignAssets.forceTransfer(id, source, dest, amount).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("foreignAssets_freeze", async function () {
    const call = await foreignAssets.read.foreignAssets_freeze([id, who]);
    const expectedCall = api.tx.foreignAssets.freeze(id, who).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("foreignAssets_thaw", async function () {
    const call = await foreignAssets.read.foreignAssets_thaw([id, who]);
    const expectedCall = api.tx.foreignAssets.thaw(id, who).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("foreignAssets_freezeAsset", async function () {
    const call = await foreignAssets.read.foreignAssets_freezeAsset([id]);
    const expectedCall = api.tx.foreignAssets.freezeAsset(id).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("foreignAssets_thawAsset", async function () {
    const call = await foreignAssets.read.foreignAssets_thawAsset([id]);
    const expectedCall = api.tx.foreignAssets.thawAsset(id).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("foreignAssets_transferOwnership", async function () {
    const call = await foreignAssets.read.foreignAssets_transferOwnership([id, owner]);
    const expectedCall = api.tx.foreignAssets.transferOwnership(id, owner).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("foreignAssets_setTeam", async function () {
    const call = await foreignAssets.read.foreignAssets_setTeam([id, issuer, admin, freezer]);
    const expectedCall = api.tx.foreignAssets.setTeam(id, issuer, admin, freezer).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("foreignAssets_setMetadata", async function () {
    const call = await foreignAssets.read.foreignAssets_setMetadata([id, name, symbol, decimals]);
    const expectedCall = api.tx.foreignAssets.setMetadata(id, name, symbol, decimals).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("foreignAssets_clearMetadata", async function () {
    const call = await foreignAssets.read.foreignAssets_clearMetadata([id]);
    const expectedCall = api.tx.foreignAssets.clearMetadata(id).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("foreignAssets_forceSetMetadata", async function () {
    const call = await foreignAssets.read.foreignAssets_forceSetMetadata([id, name, symbol, decimals, false]);
    const expectedCall = api.tx.foreignAssets.forceSetMetadata(id, name, symbol, decimals, false).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("foreignAssets_forceClearMetadata", async function () {
    const call = await foreignAssets.read.foreignAssets_forceClearMetadata([id]);
    const expectedCall = api.tx.foreignAssets.forceClearMetadata(id).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("foreignAssets_forceAssetStatus", async function () {
    const call = await foreignAssets.read.foreignAssets_forceAssetStatus([id, owner, issuer, admin, freezer, min_balance, true, false]);
    const expectedCall = api.tx.foreignAssets.forceAssetStatus(id, owner, issuer, admin, freezer, min_balance, true, false).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("foreignAssets_approveTransfer", async function () {
    const call = await foreignAssets.read.foreignAssets_approveTransfer([id, delegate, amount]);
    const expectedCall = api.tx.foreignAssets.approveTransfer(id, delegate, amount).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("foreignAssets_cancelApproval", async function () {
    const call = await foreignAssets.read.foreignAssets_cancelApproval([id, delegate]);
    const expectedCall = api.tx.foreignAssets.cancelApproval(id, delegate).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("foreignAssets_forceCancelApproval", async function () {
    const call = await foreignAssets.read.foreignAssets_forceCancelApproval([id, owner, delegate]);
    const expectedCall = api.tx.foreignAssets.forceCancelApproval(id, owner, delegate).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("foreignAssets_transferApproved", async function () {
    const call = await foreignAssets.read.foreignAssets_transferApproved([id, owner, destination, amount]);
    const expectedCall = api.tx.foreignAssets.transferApproved(id, owner, destination, amount).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("foreignAssets_touch", async function () {
    const call = await foreignAssets.read.foreignAssets_touch([id]);
    const expectedCall = api.tx.foreignAssets.touch(id).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("foreignAssets_refund", async function () {
    const call = await foreignAssets.read.foreignAssets_refund([id, true]);
    const expectedCall = api.tx.foreignAssets.refund(id, true).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("foreignAssets_setMinBalance", async function () {
    const call = await foreignAssets.read.foreignAssets_setMinBalance([id, min_balance]);
    const expectedCall = api.tx.foreignAssets.setMinBalance(id, min_balance).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("foreignAssets_touchOther", async function () {
    const call = await foreignAssets.read.foreignAssets_touchOther([id, who]);
    const expectedCall = api.tx.foreignAssets.touchOther(id, who).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("foreignAssets_refundOther", async function () {
    const call = await foreignAssets.read.foreignAssets_refundOther([id, who]);
    const expectedCall = api.tx.foreignAssets.refundOther(id, who).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("foreignAssets_block", async function () {
    const call = await foreignAssets.read.foreignAssets_block([id, who]);
    const expectedCall = api.tx.foreignAssets.block(id, who).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  it("foreignAssets_transferAll", async function () {
    const call = await foreignAssets.read.foreignAssets_transferAll([id, dest, false]);
    const expectedCall = api.tx.foreignAssets.transferAll(id, dest, false).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });

  // Add more tests as needed for edge cases, e.g., different interior variants
  it("foreignAssets_create: with X1 interior", async function () {
    const call = await foreignAssets.read.foreignAssets_create([idX1, admin, min_balance]);
    const expectedCall = api.tx.foreignAssets.create(idX1, admin, min_balance).toHex();
    assert(call === stripRange(expectedCall, 2, 6));
  });
});

function stripRange(s: string, start: number, end: number): string {
  return s.slice(0, start) + s.slice(end);
}