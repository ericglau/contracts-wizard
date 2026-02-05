---
name: openzeppelin-contracts-patterns
description: Use when writing, modifying, or reviewing smart contracts that use OpenZeppelin Contracts. Triggers include: (1) implementing token standards (ERC20, ERC721, ERC1155, fungible, non-fungible), (2) adding security features (access control, pausability), (3) governance contracts (Governor, voting, timelocks), (4) account abstraction, (5) upgradeability patterns, (6) questions about OpenZeppelin component integration. Supports Solidity/EVM, Cairo/Starknet, Stylus, Stellar, and Uniswap Hooks.
---

# OpenZeppelin Contracts Patterns

Use the MCP smart contract generators as a discovery tool to learn and apply OpenZeppelin Contracts patterns to user contracts.

## Prerequisites

Verify the required MCP server is available. Server names and tools by ecosystem:

| Ecosystem | Server Name | Tools (non-exhaustive) |
|-----------|-------------|------------------------|
| Solidity/EVM | `OpenZeppelinSolidityContracts` | `solidity-erc20`, `solidity-erc721`, `solidity-erc1155`, `solidity-governor`, `solidity-account`, `solidity-custom` |
| Cairo/Starknet | `OpenZeppelinCairoContracts` | `cairo-erc20`, `cairo-erc721`, `cairo-account`, `cairo-governor`, `cairo-custom` |
| Stylus | `OpenZeppelinStylusContracts` | `stylus-erc20`, `stylus-erc721`, `stylus-erc1155` |
| Stellar | `OpenZeppelinStellarContracts` | `stellar-fungible`, `stellar-stablecoin`, `stellar-non-fungible` |
| Uniswap | `OpenZeppelinUniswapHooks` | `uniswap-hooks` |

If unavailable, direct user to https://mcp.openzeppelin.com/ for installation.

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
