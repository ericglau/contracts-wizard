---
name: openzeppelin-contracts-patterns
description: Use when users are writing or modifying smart contracts using OpenZeppelin Contracts components (e.g., ERC20, ERC721, Governor, Account) in Solidity/EVM, Cairo/Starknet, Stylus, Stellar, or Uniswap Hooks and need to understand how to securely and correctly apply specific features or components to new, existing, or work-in-progress contracts.
---

# OpenZeppelin Contracts Patterns

## Goal

Learn how to securely and correctly apply OpenZeppelin Contracts features to **new, existing, or work-in-progress** smart contracts by using the MCP smart contract generators as a discovery tool.

## MCP Server Setup

MCP servers must be installed for the desired languages/ecosystems. If not already installed, visit https://mcp.openzeppelin.com/ for installation instructions.

Verify whether the required servers are available by checking for names similar to the below in the list of available MCP servers, or if any of the tools listed below are available.

Default server names:
- **Solidity (EVM)**: `OpenZeppelinSolidityContracts`
- **Cairo (Starknet)**: `OpenZeppelinCairoContracts`
- **Stylus (Arbitrum Stylus)**: `OpenZeppelinStylusContracts`
- **Stellar**: `OpenZeppelinStellarContracts`
- **Uniswap Hooks**: `OpenZeppelinUniswapHooks`

After installation, the following tools become available for each ecosystem. This is a non-exhaustive list and additional tools may become available over time.
- **Solidity (EVM)**: `solidity-erc20`, `solidity-erc721`, `solidity-erc1155`, `solidity-stablecoin`, `solidity-rwa`, `solidity-account`, `solidity-governor`, `solidity-custom`
- **Cairo (Starknet)**: `cairo-erc20`, `cairo-erc721`, `cairo-erc1155`, `cairo-account`, `cairo-governor`, `cairo-multisig`, `cairo-vesting`, `cairo-custom`
- **Stylus (Arbitrum Stylus)**: `stylus-erc20`, `stylus-erc721`, `stylus-erc1155`
- **Stellar**: `stellar-fungible`, `stellar-stablecoin`, `stellar-non-fungible`
- **Uniswap Hooks**: `uniswap-hooks`

## Discovery loop (use generators to learn patterns, then apply to user's contract)

1. **Choose server + target primitive**
   - Select the MCP server for the user's language/ecosystem.
   - Identify the generator tool matching the contract type the user is working with (e.g., ERC20 / ERC721 / Governor / Account).

2. **Generate a baseline for learning**
   - Generate the simplest valid contract that matches the user's core primitive.
   - Save this as `baseline` (keep the exact options used).
   - **Purpose**: This is a reference implementation to study, not the final output.

3. **Enumerate feature toggles**
   - From user requirements and the generator's available options, list candidate features to evaluate.
   - Prefer changing **one option at a time**.

4. **Regenerate variants to observe differences**
   - For each feature toggle `Fi`, generate `variant_Fi_on` and/or `variant_Fi_off`.
   - If two features are likely to interact, also generate a small set of pairwise combinations (only as needed).
   - **Purpose**: Understand what each feature adds or changes.

5. **Diff and extract patterns (no assumptions)**
   - Diff `baseline` vs each variant.
   - Record *only what concretely changes*: inheritance/traits, storage, functions/entrypoints, modifiers/guards, initialization.
   - **Purpose**: Learn the exact code patterns each feature requires.

6. **Apply learned patterns to user's contract**
   - Use the observed diffs to guide the development or modification of the user's smart contract.
   - If the user asks for "best practices," answer by:
     - Showing the observed patterns across generated variants.
     - Pointing to which toggles produced which concrete code differences.
     - Explaining how to adapt those patterns to their specific contract.
