---
name: oz-contract-patterns
description: Use when users are writing or designing smart contracts with OpenZeppelin Contracts (e.g., ERC20, ERC721, Governor, Account, Uniswap Hooks) in Solidity/EVM, Cairo/Starknet, Stylus, Stellar, or Uniswap Hooks and want to generate multiple variants by toggling generator options on/off and diffing outputs to derive patterns.
---

# OpenZeppelin Contract Pattern Discovery (via MCP)

## MCP servers (pick the one matching the target ecosystem)

- **Solidity (EVM)**: https://mcp.openzeppelin.com/contracts/solidity/mcp
- **Cairo (Starknet)**: https://mcp.openzeppelin.com/contracts/cairo/mcp
- **Stylus (Arbitrum Stylus)**: https://mcp.openzeppelin.com/contracts/stylus/mcp
- **Stellar**: https://mcp.openzeppelin.com/contracts/stellar/mcp
- **Uniswap Hooks**: https://mcp.openzeppelin.com/contracts/uniswap-hooks/mcp

## Minimal “toggle + compare” loop (tool-agnostic)

1. **Choose server + target primitive**
   - Select the MCP server for the user’s language/ecosystem.
   - Identify the generator tool for the intended contract type (e.g., ERC20 / ERC721 / Governor / Account / Hook).

2. **Generate a baseline**
   - Generate the simplest valid contract that matches the user’s core goal.
   - Save this as `baseline` (keep the exact options used).

3. **Enumerate feature toggles**
   - From user requirements and the generator’s available options, list candidate features to evaluate.
   - Prefer changing **one option at a time**.

4. **Regenerate variants**
   - For each feature toggle `Fi`, generate `variant_Fi_on` and/or `variant_Fi_off`.
   - If two features are likely to interact, also generate a small set of pairwise combinations (only as needed).

5. **Diff and extract patterns (no assumptions)**
   - Diff `baseline` vs each variant.
   - Record *only what concretely changes* in structure and interfaces.

6. **Converge + regenerate final**
   - After selecting options based on observed generator output + user constraints, regenerate a final candidate.
   - If the user asks for “best practices,” answer by:
     - Showing the observed patterns across generated variants.
     - Pointing to which toggles produced which concrete code differences.
     - Regenerating the preferred variant with the chosen toggles.
