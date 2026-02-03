# Cross-Language Feature Matrix

## Token Features

### ERC20 / Fungible Token Features

| Feature | Solidity | Cairo | Stellar | Stylus |
|---------|----------|-------|---------|--------|
| Basic Transfer | Yes | Yes | Yes | Yes |
| Burnable | Yes | Yes | Yes | Yes |
| Mintable | Yes | Yes | Yes | - |
| Pausable | Yes | Yes | Yes | - |
| Permit (Gasless) | Yes | Yes | - | Yes |
| Votes | Yes | Yes | - | - |
| Flash Mint | Yes | Yes | - | Yes |
| Cross-chain Bridge | Yes | - | - | - |
| Callback (ERC1363) | Yes | - | - | - |
| Decimals | Configurable | Configurable | Fixed (7) | Configurable |

### ERC721 / NFT Features

| Feature | Solidity | Cairo | Stellar | Stylus |
|---------|----------|-------|---------|--------|
| Basic Transfer | Yes | Yes | Yes | Yes |
| Burnable | Yes | Yes | Yes | Yes |
| Mintable | Yes | Yes | Yes | - |
| Pausable | Yes | Yes | Yes | - |
| Enumerable | Yes | Yes | - | - |
| URI Storage | Yes | Yes | - | - |
| Auto-increment IDs | Yes | Yes | - | - |
| Votes | Yes | - | - | - |
| Royalties (ERC2981) | Yes | Yes | - | - |

### ERC1155 Features

| Feature | Solidity | Cairo | Stellar | Stylus |
|---------|----------|-------|---------|--------|
| Basic Transfer | Yes | Yes | - | Yes |
| Burnable | Yes | Yes | - | Yes |
| Mintable | Yes | Yes | - | - |
| Pausable | Yes | Yes | - | - |
| Supply Tracking | Yes | Yes | - | - |
| Updatable URI | Yes | Yes | - | - |

## Access Control Comparison

### Ownable Pattern

| Aspect | Solidity | Cairo | Stellar | Stylus |
|--------|----------|-------|---------|--------|
| Modifier/Guard | `onlyOwner` | `assert_only_owner()` | `#[only_owner]` or enforce fn | `only_owner` |
| Constructor Arg | `initialOwner` | `owner` | `owner` | `owner` |
| Transfer | `transferOwnership()` | `transfer_ownership()` | `transfer_ownership()` | `transfer_ownership()` |
| Renounce | `renounceOwnership()` | `renounce_ownership()` | - | - |

### Role-Based Access

| Aspect | Solidity | Cairo | Stellar | Stylus |
|--------|----------|-------|---------|--------|
| Modifier/Guard | `onlyRole(ROLE)` | `assert_only_role(ROLE)` | `#[only_role]` | `only_role` |
| Role Definition | `keccak256("ROLE")` | `selector!("ROLE")` | `Symbol::new()` | `keccak256` |
| Admin Role | `DEFAULT_ADMIN_ROLE` | `DEFAULT_ADMIN_ROLE` | Admin address | `DEFAULT_ADMIN_ROLE` |
| Grant Role | `grantRole()` | `grant_role()` | `grant_role()` | `grant_role()` |
| Revoke Role | `revokeRole()` | `revoke_role()` | `revoke_role()` | `revoke_role()` |

### Advanced Access Control

| Feature | Solidity | Cairo | Stellar | Stylus |
|---------|----------|-------|---------|--------|
| AccessManaged | Yes | No | No | No |
| DefaultAdminRules | No | Yes (DAR) | No | No |
| Admin Transfer Delay | No | Yes | No | No |

## Upgradeability Comparison

| Aspect | Solidity | Cairo | Stellar |
|--------|----------|-------|---------|
| Pattern | Proxy-based | ClassHash | Macro-based |
| Proxy Types | UUPS, Transparent | Single | Single |
| Storage Rules | Append-only, gaps | Component storage | SDK-managed |
| Authorization | `_authorizeUpgrade()` | Access control | Trait impl |
| State Migration | Manual | Manual | Manual |

### Solidity Proxy Comparison

| Aspect | UUPS | Transparent |
|--------|------|-------------|
| Gas Overhead | Lower | Higher |
| Upgrade Logic | In implementation | In proxy |
| Access Control Required | Yes | No (proxy admin) |
| Parents Added | Initializable, UUPSUpgradeable | Initializable |

## Governance Features

| Feature | Solidity | Cairo |
|---------|----------|-------|
| Proposal Creation | Yes | Yes |
| Voting | Yes | Yes |
| Quorum (%) | Yes | Yes |
| Quorum (Absolute) | Yes | Yes |
| Timelock | Yes | Yes |
| Vote Delegation | Yes | Yes |
| Clock Mode (Block/Time) | Yes | Yes |
| Proposal Storage | Yes | Yes |
| Settings Updates | Yes | Yes |

## Feature Dependencies

### Solidity Dependencies

```
Votes ──requires──> Permit
UUPS ──requires──> Access Control
Pausable ──requires──> Access Control
Mintable ──requires──> Access Control
Cross-chain + Premint ──requires──> Chain ID
```

### Cairo Dependencies

```
Votes ──requires──> SNIP-12 Metadata (appName, appVersion)
Upgradeable ──requires──> Access Control
Pausable ──requires──> Access Control
```

### Stellar Dependencies

```
Upgradeable ──requires──> Access Control
Pausable ──requires──> Access Control
```
