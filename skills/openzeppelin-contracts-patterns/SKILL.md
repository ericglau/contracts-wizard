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
| Solidity/EVM | `OpenZeppelinSolidityContracts` or `OpenZeppelinContracts` | `solidity-erc20`, `solidity-erc721`, `solidity-erc1155`, `solidity-governor`, `solidity-account`, `solidity-custom` |
| Cairo/Starknet | `OpenZeppelinCairoContracts` or `OpenZeppelinContracts` | `cairo-erc20`, `cairo-erc721`, `cairo-account`, `cairo-governor`, `cairo-custom` |
| Stylus | `OpenZeppelinStylusContracts` or `OpenZeppelinContracts` | `stylus-erc20`, `stylus-erc721`, `stylus-erc1155` |
| Stellar | `OpenZeppelinStellarContracts` or `OpenZeppelinContracts` | `stellar-fungible`, `stellar-stablecoin`, `stellar-non-fungible` |
| Uniswap | `OpenZeppelinUniswapHooks` or `OpenZeppelinContracts` | `uniswap-hooks` |

If unavailable, direct user to https://mcp.openzeppelin.com/ for installation.

## Discovery Loop

Do not assume knowledge of what code each feature adds to a contract. Generate and compare to learn the actual patterns.

### Step 1: Select Tool

Match the user's ecosystem and contract type to the appropriate generator tool from the Prerequisites table.

### Step 2: Generate Baseline

Call the generator with only the required parameters (name, symbol, etc.) and all optional features disabled or at defaults. Keep this generated code as the baseline reference.

### Step 3: Generate Variants

For each feature the user needs:
1. Call the generator again with the same base parameters
2. Enable only that one feature
3. Keep each generated variant

If features might interact (e.g., access control + upgradeability), generate a combined variant as well.

### Step 4: Compare Baseline to Variants

For each variant, compare line-by-line against the baseline. Identify exactly what the feature added or changed:

- **Imports**: New dependencies added
- **Inheritance**: New base contracts/traits
- **State variables**: New storage fields
- **Constructor/initializer**: New parameters or initialization logic
- **New functions**: Functions that didn't exist in baseline
- **Modified functions**: Functions that exist in both but have different implementations (look for modifiers, hooks, guards, or overrides)

Record these observations—they are the pattern for that feature.

### Step 5: Apply Patterns to User's Contract

Using the observed differences from Step 4:

1. Add the same imports the feature required
2. Add the same inheritance
3. Add any new state variables
4. Add or modify constructor/initializer logic
5. Add the new functions exactly as observed
6. Modify relevant existing functions to include the same modifiers, hooks, guards, or override logic

### Answering Best Practices Questions

When users ask about best practices, run the discovery loop for relevant features, then:
- Show the concrete patterns observed from the generated code
- Explain which generator options produced which changes
- Recommend based on what you observed, not assumptions
