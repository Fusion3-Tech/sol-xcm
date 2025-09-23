# Sol-XCM

This project is a typed interface generator for solidity.

With Plaza live on Kusama and soon on Polkadot projects will be able to deploy smart contracts written in solidity on the Polkadot Hub.

### Why is a typed interface needed?

With Solidity on Polkadot Hub, it is possible to send XCM messages from contracts. This project provides a typed interface for constructing XCM messages and for encoding calls to be executed via the `Transact` instruction.

This repo also provides a `ScaleCodec` contract for encoding primitive types.

Without the typed interface and the `ScaleCodec` contract, users would have to hardcode pre-encoded XCM calls in Solidity, which is definitely not a good approach.

### How is the typed interface for constructing custom calls generated?

Solidity contracts execute in a sandboxed environment. They can only access data from their own state, other contracts’ state, or the precompiles/chain extensions provided by the underlying blockchain.

Each Polkadot-SDK based blockchain provides self describing metadata. The runtime metadata structure contains all the information necessary on how to interact with the Polkadot runtime.

Given that Solidity contracts are executed in a sandboxed environment, they don't have access to the metadata of blockchains deployed on Polkadot. Because of this, we are providing a script that generates a Solidity library exposing a typed interface for the specified module the user wants to interact with. 

We are providing a CLI interface that allows users to specify the blockchain and the modules for which they want to generate the interface.

### Usage

```
Usage: cli [options] <pallets...>

Arguments:
  pallets            Pallet names to include (e.g. Balances System)

Options:
  --ws <url>         WebSocket endpoint (default: "wss://westend-asset-hub-rpc.polkadot.io")
  --out-dir <dir>    Output contracts directory (default: "contracts")
  --contract <name>  Encoder contract name (default: "CallEncoders")
  -h, --help         display help for command
```

```
npm run generate Balances
```
