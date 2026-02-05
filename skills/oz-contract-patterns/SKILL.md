---
name: oz-contract-patterns
description: Use when users are writing or modifying smart contracts using OpenZeppelin Contracts components (e.g., ERC20, ERC721, Governor, Account) in Solidity/EVM, Cairo/Starknet, Stylus, Stellar, or Uniswap Hooks and need to understand how to securely and correctly apply specific features or components to existing or work-in-progress contracts.
---

# OpenZeppelin Contracts Feature Discovery (via MCP)

## MCP servers (pick the one matching the target ecosystem)

- **Solidity (EVM)**: https://mcp.openzeppelin.com/contracts/solidity/mcp
- **Cairo (Starknet)**: https://mcp.openzeppelin.com/contracts/cairo/mcp
- **Stylus (Arbitrum Stylus)**: https://mcp.openzeppelin.com/contracts/stylus/mcp
- **Stellar**: https://mcp.openzeppelin.com/contracts/stellar/mcp
- **Uniswap Hooks**: https://mcp.openzeppelin.com/contracts/uniswap-hooks/mcp

## Goal

Learn how to securely and correctly apply OpenZeppelin Contracts features to **existing or work-in-progress** smart contracts by using the MCP smart contract generators as a discovery tool.

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
   - Use the observed diffs to guide modifications to the user's existing or work-in-progress contract.
   - If the user asks for "best practices," answer by:
     - Showing the observed patterns across generated variants.
     - Pointing to which toggles produced which concrete code differences.
     - Explaining how to adapt those patterns to their specific contract.
