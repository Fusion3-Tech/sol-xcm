import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";

describe("ScaleCodec", async function () {
  const { viem } = await network.connect();

  it("u64LE works", async function () {
    const codec = await viem.deployContract("ScaleCodecHarness");

    // max
    const value = 18446744073709551615n;
    const out = await codec.read.u64LE([value]);

    assert(out === "0xffffffffffffffff");
  });
});
