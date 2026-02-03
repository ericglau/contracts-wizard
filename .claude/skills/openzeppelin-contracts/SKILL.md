---
name: openzeppelin-contracts
description: |
  Master skill for building secure smart contracts using OpenZeppelin Contracts libraries. Use when users ask about: (1) Smart contract development for any blockchain, (2) Token standards (ERC20, ERC721, ERC1155, fungible tokens), (3) Access control patterns, (4) Upgradeable contracts, (5) Governance and DAOs, (6) Account abstraction (ERC-4337), (7) Security best practices for smart contracts. Routes to language-specific skills: openzeppelin-solidity (Ethereum/EVM), openzeppelin-cairo (Starknet), openzeppelin-stellar (Soroban), openzeppelin-stylus (Arbitrum Stylus).
---

# OpenZeppelin Contracts

Build secure smart contracts using OpenZeppelin's battle-tested libraries.

## Language Selection

Choose the appropriate language based on target blockchain:

| Target | Language | Skill |
|--------|----------|-------|
| Ethereum, Polygon, Arbitrum, Base, Optimism, any EVM chain | Solidity | `openzeppelin-solidity` |
| Starknet | Cairo | `openzeppelin-cairo` |
| Stellar/Soroban | Rust (Soroban SDK) | `openzeppelin-stellar` |
| Arbitrum Stylus | Rust (Stylus SDK) | `openzeppelin-stylus` |

## Quick Reference

### Contract Types by Language

| Type | Solidity | Cairo | Stellar | Stylus |
|------|----------|-------|---------|--------|
| Fungible Token | ERC20 | ERC20 | Fungible | ERC20 |
| NFT | ERC721 | ERC721 | Non-Fungible | ERC721 |
| Multi-Token | ERC1155 | ERC1155 | - | ERC1155 |
| Governance | Governor | Governor | - | - |
| Account (AA) | Account | Account | - | - |
| Stablecoin | Stablecoin | - | Stablecoin | - |
| Multisig | - | Multisig | - | - |
| Vesting | - | Vesting | - | - |

### Access Control Options

| Pattern | Solidity | Cairo | Stellar | Stylus |
|---------|----------|-------|---------|--------|
| Single Owner | Ownable | Ownable | Ownable | Ownable |
| Role-Based | AccessControl | AccessControl | AccessControl | AccessControl |
| Managed Authority | AccessManaged | - | - | - |
| Admin Rules | - | DAR | - | - |

### Upgradeability Patterns

| Pattern | Solidity | Cairo | Stellar |
|---------|----------|-------|---------|
| Transparent Proxy | Yes | - | - |
| UUPS Proxy | Yes | - | - |
| Class Hash | - | Yes | - |
| Macro-based | - | - | Yes |

## Security Checklist

Before deploying any contract:

1. **Access Control**: Verify all privileged functions have appropriate guards
2. **Initialization**: Upgradeable contracts must use initializers, not constructors
3. **Reentrancy**: Use checks-effects-interactions pattern or reentrancy guards
4. **Input Validation**: Validate all external inputs
5. **Integer Safety**: Use SafeMath or Solidity 0.8+ built-in checks
6. **Visibility**: Mark functions with appropriate visibility modifiers

See [security-checklist.md](references/security-checklist.md) for comprehensive guidelines.

## Workflow

1. Identify target blockchain and select language skill
2. Choose contract type (token, governance, account, custom)
3. Configure features (access control, upgradeability, extensions)
4. Generate contract using patterns from the appropriate skill
5. Review against security checklist
6. Test thoroughly before deployment
