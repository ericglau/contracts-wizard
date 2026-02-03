# Security Checklist

## Pre-Deployment Checklist

### Access Control

- [ ] All privileged functions protected with appropriate modifiers
- [ ] Admin/owner addresses verified before deployment
- [ ] Role assignments reviewed and documented
- [ ] No unauthorized access to sensitive functions

### Initialization

- [ ] Upgradeable contracts use `initialize()` not `constructor()`
- [ ] Initializer can only be called once (`initializer` modifier)
- [ ] All parent contracts initialized in correct order
- [ ] No state set in field declarations for upgradeable contracts

### Token Security

- [ ] Transfer functions handle zero address correctly
- [ ] Approval race conditions mitigated (use increaseAllowance/decreaseAllowance)
- [ ] Permit signatures include deadline and nonce
- [ ] Flash loan callbacks verified for ERC-3156 compliance

### Reentrancy Protection

- [ ] State changes before external calls (checks-effects-interactions)
- [ ] ReentrancyGuard used where needed
- [ ] Callbacks (onERC721Received, etc.) cannot manipulate state unexpectedly

### Integer Safety

- [ ] Using Solidity 0.8+ with built-in overflow checks OR SafeMath
- [ ] Division by zero prevented
- [ ] Casting between types verified safe

### Upgradeability

- [ ] Storage layout preserved between versions
- [ ] No storage gaps removed or reordered
- [ ] New storage added only at end of contract
- [ ] Namespaced storage (ERC-7201) used where appropriate
- [ ] Upgrade authorization properly restricted

### External Interactions

- [ ] External call return values checked
- [ ] Low-level calls use proper error handling
- [ ] Untrusted contracts treated with caution
- [ ] Pull over push for payments

## Common Vulnerabilities by Contract Type

### ERC20 Tokens

| Vulnerability | Mitigation |
|--------------|------------|
| Approval race condition | Use Permit or increaseAllowance |
| Flash loan attacks | Implement proper callback verification |
| Unlimited minting | Restrict mint function with access control |
| Pausable bypass | Ensure pause affects all transfer paths |

### ERC721 NFTs

| Vulnerability | Mitigation |
|--------------|------------|
| Reentrancy via onERC721Received | Use ReentrancyGuard or CEI pattern |
| Metadata manipulation | Validate URI inputs |
| Enumerable gas griefing | Consider gas limits in loops |
| Approval for all abuse | Document risks to users |

### Governor Contracts

| Vulnerability | Mitigation |
|--------------|------------|
| Flash loan governance attacks | Use ERC20Votes with checkpoints |
| Proposal spam | Set appropriate proposal threshold |
| Timelock bypass | Ensure all execution through timelock |
| Quorum manipulation | Use percentage-based quorum |

### Upgradeable Contracts

| Vulnerability | Mitigation |
|--------------|------------|
| Uninitialized proxy | Call initialize immediately after deployment |
| Storage collision | Follow storage layout rules strictly |
| Unauthorized upgrade | Protect _authorizeUpgrade with access control |
| Logic contract takeover | Disable initializers in implementation |

## Language-Specific Considerations

### Solidity

- Use `private` for internal state, `internal` for inheritance
- Prefer `external` over `public` for gas efficiency
- Use `immutable` for values set once in constructor
- Avoid `delegatecall` to untrusted contracts

### Cairo

- Components provide storage isolation
- Use `assert_only_owner()` consistently
- Verify ClassHash before upgrades
- Test with both `withComponents` on and off

### Stellar/Soroban

- Always pass `&Env` as first parameter
- Use SDK functions for state, not direct storage
- Validate `live_until_ledger` for time-sensitive operations
- Fixed 7 decimals for fungible tokens

### Stylus

- Follow Rust ownership rules strictly
- Use proper error handling with Result types
- Verify trait implementations match interface expectations
- Test on Arbitrum testnet before mainnet
