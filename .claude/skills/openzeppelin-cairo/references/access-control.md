# Cairo Access Control

## Table of Contents

1. [Overview](#overview)
2. [Ownable](#ownable)
3. [AccessControl (Roles)](#accesscontrol-roles)
4. [DefaultAdminRules (DAR)](#defaultadminrules-dar)

---

## Overview

Three access control patterns available:

| Pattern | Use Case | Complexity |
|---------|----------|------------|
| Ownable | Single admin | Low |
| AccessControl | Multiple roles | Medium |
| DAR | Roles + timed admin transfer | High |

---

## Ownable

Single account controls all privileged functions.

### Basic Usage

```cairo
#[starknet::contract]
mod MyContract {
    use openzeppelin_access::ownable::OwnableComponent;
    use starknet::ContractAddress;

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    #[abi(embed_v0)]
    impl OwnableMixinImpl = OwnableComponent::OwnableMixinImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        OwnableEvent: OwnableComponent::Event,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.ownable.initializer(owner);
    }

    #[generate_trait]
    #[abi(per_item)]
    impl ExternalImpl of ExternalTrait {
        #[external(v0)]
        fn privileged_action(ref self: ContractState) {
            self.ownable.assert_only_owner();
            // ... privileged logic
        }
    }
}
```

### Key Functions

| Function | Description |
|----------|-------------|
| `owner()` | Returns current owner |
| `transfer_ownership(new_owner)` | Transfer to new owner |
| `renounce_ownership()` | Permanently remove owner |
| `assert_only_owner()` | Revert if not owner |

### Two-Step Transfer (Ownable2Step)

```cairo
use openzeppelin_access::ownable::Ownable2StepComponent;

component!(path: Ownable2StepComponent, storage: ownable, event: OwnableEvent);

// New owner must call accept_ownership()
```

---

## AccessControl (Roles)

Multiple roles with granular permissions.

### Basic Usage

```cairo
#[starknet::contract]
mod MyContract {
    use openzeppelin_access::accesscontrol::AccessControlComponent;
    use openzeppelin_access::accesscontrol::DEFAULT_ADMIN_ROLE;
    use starknet::ContractAddress;

    component!(path: AccessControlComponent, storage: access_control, event: AccessControlEvent);

    #[abi(embed_v0)]
    impl AccessControlMixinImpl = AccessControlComponent::AccessControlMixinImpl<ContractState>;
    impl AccessControlInternalImpl = AccessControlComponent::InternalImpl<ContractState>;

    // Role definitions
    const MINTER_ROLE: felt252 = selector!("MINTER_ROLE");
    const PAUSER_ROLE: felt252 = selector!("PAUSER_ROLE");

    #[storage]
    struct Storage {
        #[substorage(v0)]
        access_control: AccessControlComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        AccessControlEvent: AccessControlComponent::Event,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        default_admin: ContractAddress,
        minter: ContractAddress,
        pauser: ContractAddress
    ) {
        self.access_control.initializer();
        self.access_control._grant_role(DEFAULT_ADMIN_ROLE, default_admin);
        self.access_control._grant_role(MINTER_ROLE, minter);
        self.access_control._grant_role(PAUSER_ROLE, pauser);
    }

    #[generate_trait]
    #[abi(per_item)]
    impl ExternalImpl of ExternalTrait {
        #[external(v0)]
        fn mint(ref self: ContractState, recipient: ContractAddress, amount: u256) {
            self.access_control.assert_only_role(MINTER_ROLE);
            // ... mint logic
        }

        #[external(v0)]
        fn pause(ref self: ContractState) {
            self.access_control.assert_only_role(PAUSER_ROLE);
            // ... pause logic
        }
    }
}
```

### Role Definition

Roles use `selector!()` macro:

```cairo
const MINTER_ROLE: felt252 = selector!("MINTER_ROLE");
const BURNER_ROLE: felt252 = selector!("BURNER_ROLE");
const PAUSER_ROLE: felt252 = selector!("PAUSER_ROLE");
const UPGRADER_ROLE: felt252 = selector!("UPGRADER_ROLE");
```

### Key Functions

| Function | Description |
|----------|-------------|
| `has_role(role, account)` | Check if account has role |
| `grant_role(role, account)` | Grant role (admin only) |
| `revoke_role(role, account)` | Revoke role (admin only) |
| `renounce_role(role, account)` | Self-remove from role |
| `get_role_admin(role)` | Get admin role |
| `assert_only_role(role)` | Revert if not in role |

### Role Hierarchy

Set custom admin for a role:

```cairo
#[constructor]
fn constructor(ref self: ContractState) {
    // MINTER_ADMIN_ROLE can grant/revoke MINTER_ROLE
    self.access_control._set_role_admin(MINTER_ROLE, MINTER_ADMIN_ROLE);
}
```

---

## DefaultAdminRules (DAR)

Enhanced role-based access with time-delayed admin transfers.

### Basic Usage

```cairo
#[starknet::contract]
mod MyContract {
    use openzeppelin_access::accesscontrol::AccessControlDefaultAdminRulesComponent;
    use starknet::ContractAddress;

    component!(
        path: AccessControlDefaultAdminRulesComponent,
        storage: access_control,
        event: AccessControlEvent
    );

    #[abi(embed_v0)]
    impl AccessControlDefaultAdminRulesImpl =
        AccessControlDefaultAdminRulesComponent::AccessControlDefaultAdminRulesImpl<ContractState>;

    // Configuration constants
    const INITIAL_DELAY: u64 = 86400;  // 1 day in seconds
    const DEFAULT_ADMIN_DELAY_INCREASE_WAIT: u64 = 432000;  // 5 days
    const MAXIMUM_DEFAULT_ADMIN_TRANSFER_DELAY: u64 = 2592000;  // 30 days

    #[storage]
    struct Storage {
        #[substorage(v0)]
        access_control: AccessControlDefaultAdminRulesComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        AccessControlEvent: AccessControlDefaultAdminRulesComponent::Event,
    }

    #[constructor]
    fn constructor(ref self: ContractState, initial_default_admin: ContractAddress) {
        self.access_control.initializer(
            INITIAL_DELAY,
            initial_default_admin,
            DEFAULT_ADMIN_DELAY_INCREASE_WAIT,
            MAXIMUM_DEFAULT_ADMIN_TRANSFER_DELAY
        );
    }
}
```

### Configuration Options

| Option | Description |
|--------|-------------|
| `initial_delay` | Initial transfer delay |
| `default_admin_delay_increase_wait` | Wait time before delay can increase |
| `max_transfer_delay` | Maximum allowed transfer delay |

### Transfer Process

1. Admin calls `begin_default_admin_transfer(new_admin)`
2. Wait for delay period
3. New admin calls `accept_default_admin_transfer()`

### Key Functions

| Function | Description |
|----------|-------------|
| `default_admin()` | Get current admin |
| `pending_default_admin()` | Get pending admin |
| `default_admin_delay()` | Get current delay |
| `begin_default_admin_transfer(new_admin)` | Start transfer |
| `cancel_default_admin_transfer()` | Cancel pending transfer |
| `accept_default_admin_transfer()` | Accept (new admin calls) |
| `change_default_admin_delay(new_delay)` | Change delay period |

### Custom Configuration

```cairo
// Immutable config using trait
impl ImmutableConfig of AccessControlDefaultAdminRulesComponent::ImmutableConfig {
    const INITIAL_DELAY: u64 = 86400;
    const DEFAULT_ADMIN_DELAY_INCREASE_WAIT: u64 = 432000;
    const MAX_DEFAULT_ADMIN_TRANSFER_DELAY: u64 = 2592000;
}
```

---

## Choosing an Access Control Pattern

```
Simple contract, single admin?
    └── Yes → Use Ownable
    └── No → Multiple roles needed?
        └── Yes → Need secure admin transfer?
            └── Yes → Use DAR
            └── No → Use AccessControl
        └── No → Use Ownable
```

### Comparison

| Aspect | Ownable | AccessControl | DAR |
|--------|---------|---------------|-----|
| Roles | 1 | Unlimited | Unlimited |
| Admin transfer | Immediate | Immediate | Time-delayed |
| Complexity | Low | Medium | High |
| Gas cost | Lowest | Medium | Higher |
