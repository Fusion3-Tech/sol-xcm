/*
  Single file containing all primitive tests. 
*/

import assert from "node:assert/strict";
import { describe, it, before } from "node:test";
import { network } from "hardhat";

describe("ScaleCodec - full primitive coverage (all in one file for now)", async function () {
  let codec: any;

  before(async () => {
    const { viem } = await network.connect();
    codec = await viem.deployContract("ScaleCodecHarness");
  });

  // ---------------------------
  // u8 tests
  // ---------------------------
  it("u8: min 0 -> 0x00", async function () {
    assert((await codec.read.u8([0])) === "0x00");
  });

  it("u8: max 255 -> 0xff", async function () {
    assert((await codec.read.u8([255])) === "0xff");
  });

  // ---------------------------
  // u16 tests
  // ---------------------------
  it("u16LE: example 0x1234 -> 0x3412", async function () {
    assert((await codec.read.u16LE([0x1234])) === "0x3412");
  });

  it("u16LE: max 65535 -> 0xffff", async function () {
    assert((await codec.read.u16LE([65535])) === "0xffff");
  });

  // ---------------------------
  // u32 tests
  // ---------------------------
  it("u32LE: example 0xdeadbeef -> 0xefbeadde", async function () {
    assert((await codec.read.u32LE([0xdeadbeef])) === "0xefbeadde");
  });

  it("u32LE: max 4294967295 -> 0xffffffff", async function () {
    assert((await codec.read.u32LE([4294967295])) === "0xffffffff");
  });

  // ---------------------------
  // u64 tests
  // ---------------------------
  it("u64LE: small 1 -> 0x0100000000000000", async function () {
    assert((await codec.read.u64LE([1n])) === "0x0100000000000000");
  });

  it("u64LE: max -> 0xffffffffffffffff", async function () {
    assert((await codec.read.u64LE([18446744073709551615n])) === "0xffffffffffffffff");
  });

  // ---------------------------
  // u128 tests
  // ---------------------------
  it("u128LE: min 0 -> 16 zero bytes", async function () {
    assert((await codec.read.u128LE([0n])) === "0x00000000000000000000000000000000");
  });

  it("u128LE: small 1 -> 0x01 + 15 zeros", async function () {
    assert((await codec.read.u128LE([1n])) === "0x01000000000000000000000000000000");
  });

  it("u128LE: max -> 16 bytes 0xff", async function () {
    const maxU128 = BigInt("340282366920938463463374607431768211455");
    assert((await codec.read.u128LE([maxU128])) === "0xffffffffffffffffffffffffffffffff");
  });

  // ---------------------------
  // compactUint tests
  // ---------------------------

  // single-byte mode
  it("compactUint: 0 -> 0x00", async function () {
    assert((await codec.read.compactUint([0n])) === "0x00");
  });
  it("compactUint: 63 -> 0xfc (max single-byte)", async function () {
    assert((await codec.read.compactUint([63n])) === "0xfc");
  });

  // two-byte mode
  it("compactUint: 64 -> 0x0101 (start two-byte)", async function () {
    assert((await codec.read.compactUint([64n])) === "0x0101");
  });
  it("compactUint: 16383 -> 0xfdff (max two-byte)", async function () {
    assert((await codec.read.compactUint([16383n])) === "0xfdff");
  });

  // four-byte mode
  it("compactUint: 16384 -> 0x02000100 (first 4-byte)", async function () {
    assert((await codec.read.compactUint([16384n])) === "0x02000100");
  });
  it("compactUint: 2^30-1 -> 0xfeffffff (max 4-byte)", async function () {
    assert((await codec.read.compactUint([1073741823n])) === "0xfeffffff");
  });

  // big-integer mode
  it("compactUint: 2^30 -> 0x0300000040 (start big-int)", async function () {
    assert((await codec.read.compactUint([1073741824n])) === "0x0300000040");
  });

  // ---------------------------
  // vecU8 tests 
  // ---------------------------
  it("vecU8: empty -> 0x00", async function () {
    assert((await codec.read.vecU8(["0x" as any])) === "0x00");
  });

  it("vecU8: example [1,2,3,4] -> 0x1001020304", async function () {
    assert((await codec.read.vecU8(["0x01020304" as any])) === "0x1001020304");
  });

  // ---------------------------
  // boolean tests 
  // ---------------------------
  it("boolean: true -> 0x01", async function () {
    assert((await codec.read.boolean([true])) === "0x01");
  });

  it("boolean: false -> 0x00", async function () {
    assert((await codec.read.boolean([false])) === "0x00");
  });

  // ---------------------------
  // option tests 
  // ---------------------------
  it("option: None -> 0x00", async function () {
    assert((await codec.read.optionNone()) === "0x00");
  });

  it("option: Some(empty) -> 0x01", async function () {
    assert((await codec.read.optionSome(["0x" as any])) === "0x01");
  });

  it("option: Some(0xdead) -> 0x01dead", async function () {
    assert((await codec.read.optionSome(["0xdead" as any])) === "0x01dead");
  });

  // ---------------------------
  // Other specific types
  // ---------------------------
  it("multiAddressId32: example -> 0x00 + 32 bytes", async function () {
    const account = "0x" + "11".repeat(32);
    assert((await codec.read.multiAddressId32([account as any])) === "0x00" + "11".repeat(32));
  });

  it("callIndex: example (10,3) -> 0x0a03", async function () {
    assert((await codec.read.callIndex([10, 3])) === "0x0a03");
  });

  it("callIndex: boundary (255,255) -> 0xffff", async function () {
    assert((await codec.read.callIndex([255, 255])) === "0xffff");
  });
});
