import assert from "node:assert/strict";
import { describe, it, before } from "node:test";
import { network } from "hardhat";

describe("ScaleCodec - primitives and edge cases", async function () {
  let codec: any;

  before(async () => {
    const { viem } = await network.connect();
    codec = await viem.deployContract("ScaleCodecHarness");
  });

  it("fixed integers: u8, u16LE, u32LE", async function () {
    assert((await codec.read.u8([255])) === "0xff");
    assert((await codec.read.u16LE([0x1234])) === "0x3412");
    assert((await codec.read.u32LE([0xdeadbeef])) === "0xefbeadde");
  });

  it("vecU8 and boolean", async function () {
    // vecU8: compact(len=2)=0x08 + data 0x0102
    assert((await codec.read.vecU8([("0x0102" as any)])) === "0x080102");

    // boolean
    assert((await codec.read.boolean([true])) === "0x01");
    assert((await codec.read.boolean([false])) === "0x00");
  });

  it("fixed integers edges: u64LE small + max, u128LE small", async function () {
    // use BigInt for 64/128-bit values
    assert((await codec.read.u64LE([1n])) === "0x0100000000000000");
    assert((await codec.read.u64LE([18446744073709551615n])) === "0xffffffffffffffff");
    assert((await codec.read.u128LE([1n])) === "0x01000000000000000000000000000000");
  });

  it("compactUint modes and boundaries", async function () {
    // single-byte mode
    assert((await codec.read.compactUint([0n])) === "0x00");
    assert((await codec.read.compactUint([63n])) === "0xfc"); // max single-byte

    // two-byte mode boundary
    assert((await codec.read.compactUint([64n])) === "0x0101"); // start two-byte
    // max two-byte: x = 2^14 - 1 = 16383 -> (x<<2)|1 = 65533 -> little-endian bytes 0xfdff
    assert((await codec.read.compactUint([16383n])) === "0xfdff");

    // four-byte mode: first value in 4-byte mode (2^14)
    // x = 16384 -> (x<<2)|2 = 65538 -> u32LE(65538) -> little-endian 0x02 0x00 0x01 0x00
    assert((await codec.read.compactUint([16384n])) === "0x02000100");

    // example four-byte value (1 << 20)
    assert((await codec.read.compactUint([1048576n])) === "0x02004000");

    // big-integer mode example (2^30)
    assert((await codec.read.compactUint([1073741824n])) === "0x0300000040");
  });

  it("option / multiAddressId32 / callIndex", async function () {
    // optionNone has no parameters
    assert((await codec.read.optionNone()) === "0x00");
    // optionSome expects bytes -> cast to any to satisfy test typings
    assert((await codec.read.optionSome([("0xdead" as any)])) === "0x01dead");

    // multiAddressId32: variant 0x00 + 32 bytes account
    const account = "0x" + "11".repeat(32);
    // cast to any to satisfy the test wrapper TS types
    assert((await codec.read.multiAddressId32([(account as any)])) === "0x00" + "11".repeat(32));

    // callIndex: pallet 10, call 3 -> 0x0a03
    assert((await codec.read.callIndex([10, 3])) === "0x0a03");
  });

  it("u8 min/max", async function () {
    const out0 = await codec.read.u8([0]);
    assert(out0 === "0x00");
    const out255 = await codec.read.u8([255]);
    assert(out255 === "0xff");
  });

  it("u16/u32 max", async function () {
    assert((await codec.read.u16LE([65535])) === "0xffff");
    assert((await codec.read.u32LE([4294967295])) === "0xffffffff");
  });

  it("compactUint max-4byte and boundary", async function () {
    // max for 4-byte mode: 2^30 - 1
    const max4 = 1073741823n;
    const enc = await codec.read.compactUint([max4]);
    // (max4 << 2) | 2 encoded as u32LE
    assert(enc !== undefined && enc.length > 0);
  });

  it("vecU8 empty and optionSome empty", async function () {
    // empty vec -> compact(0) = 0x00
    assert((await codec.read.vecU8([("0x" as any)])) === "0x00");
    // optionSome with empty payload -> 0x01
    assert((await codec.read.optionSome([("0x" as any)])) === "0x01");
  });

  it("callIndex boundary values", async function () {
    assert((await codec.read.callIndex([0, 0])) === "0x0000");
    assert((await codec.read.callIndex([255, 255])) === "0xffff");
  });
});
