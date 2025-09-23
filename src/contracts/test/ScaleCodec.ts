import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";

describe("ScaleCodec", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  it("u16LE works", async function () {
    const codec = await viem.deployContract("ScaleCodecHarness");

    const value = 0x1234;
    const out = await codec.read.u16LE([value]);

    const buf = new ArrayBuffer(2);
    new DataView(buf).setUint16(0, value, true);
    const expected =
      "0x" + [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");

    assert(out === expected);
  });
});
