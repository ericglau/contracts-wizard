# Cairo Component System

## Table of Contents

1. [Overview](#overview)
2. [Component Declaration](#component-declaration)
3. [Implementation Embedding](#implementation-embedding)
4. [Storage and Events](#storage-and-events)
5. [withComponents Macro](#withcomponents-macro)
6. [Hooks](#hooks)
7. [Component Composition](#component-composition)

---

## Overview

Cairo uses components instead of Solidity-style inheritance:

| Solidity | Cairo |
|----------|-------|
| `contract A is B, C` | `component!(path: B, ...) component!(path: C, ...)` |
| Implicit inheritance | Explicit component declaration |
| Automatic override | Manual implementation selection |
| Single storage | Substorage per component |

---

## Component Declaration

### Basic Syntax

```cairo
component!(path: ComponentName, storage: storage_name, event: EventName);
```

### Example

```cairo
#[starknet::contract]
mod MyToken {
    use openzeppelin_token::erc20::{ERC20Component, ERC20HooksEmptyImpl};

    component!(path: ERC20Component, storage: erc20, event: ERC20Event);

    // ... rest of contract
}
```

### Multiple Components

```cairo
component!(path: ERC20Component, storage: erc20, event: ERC20Event);
component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
component!(path: PausableComponent, storage: pausable, event: PausableEvent);
```

---

## Implementation Embedding

### Embedded (Public) Implementations

Exposed in contract ABI:

```cairo
#[abi(embed_v0)]
impl ERC20Impl = ERC20Component::ERC20Impl<ContractState>;

#[abi(embed_v0)]
impl ERC20MetadataImpl = ERC20Component::ERC20MetadataImpl<ContractState>;

#[abi(embed_v0)]
impl ERC20CamelOnlyImpl = ERC20Component::ERC20CamelOnlyImpl<ContractState>;
```

### Mixin Pattern

Combine multiple implementations:

```cairo
#[abi(embed_v0)]
impl ERC20MixinImpl = ERC20Component::ERC20MixinImpl<ContractState>;
```

### Internal Implementations

Not exposed in ABI, used internally:

```cairo
impl ERC20InternalImpl = ERC20Component::InternalImpl<ContractState>;
```

### When to Use Each

| Type | Use Case |
|------|----------|
| `#[abi(embed_v0)]` | Public contract interface |
| No attribute | Internal helper functions |

---

## Storage and Events

### Storage Declaration

```cairo
#[storage]
struct Storage {
    #[substorage(v0)]
    erc20: ERC20Component::Storage,
    #[substorage(v0)]
    ownable: OwnableComponent::Storage,
    // Custom storage
    custom_value: u256,
}
```

### Event Declaration

```cairo
#[event]
#[derive(Drop, starknet::Event)]
enum Event {
    #[flat]
    ERC20Event: ERC20Component::Event,
    #[flat]
    OwnableEvent: OwnableComponent::Event,
    // Custom events
    CustomEvent: CustomEvent,
}

#[derive(Drop, starknet::Event)]
struct CustomEvent {
    value: u256,
}
```

### The `#[flat]` Attribute

Flattens component events into contract events:

```cairo
// With #[flat] - events appear as contract events
#[flat]
ERC20Event: ERC20Component::Event,

// Without #[flat] - events nested under component name
ERC20Event: ERC20Component::Event,
```

---

## withComponents Macro

### Basic Usage

Cleaner syntax that auto-generates boilerplate:

```cairo
#[starknet::contract]
#[with_components(ERC20, Ownable)]
mod MyToken {
    use openzeppelin_token::erc20::ERC20HooksEmptyImpl;
    use starknet::ContractAddress;

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.erc20.initializer("MyToken", "MTK");
        self.ownable.initializer(owner);
    }
}
```

### What It Generates

The macro automatically generates:
- `component!()` declarations
- Storage struct with substorages
- Event enum with flat events

### Without vs With Macro

**Without macro (verbose):**
```cairo
#[starknet::contract]
mod MyToken {
    use openzeppelin_token::erc20::{ERC20Component, ERC20HooksEmptyImpl};
    use openzeppelin_access::ownable::OwnableComponent;

    component!(path: ERC20Component, storage: erc20, event: ERC20Event);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    #[abi(embed_v0)]
    impl ERC20MixinImpl = ERC20Component::ERC20MixinImpl<ContractState>;
    impl ERC20InternalImpl = ERC20Component::InternalImpl<ContractState>;

    #[abi(embed_v0)]
    impl OwnableMixinImpl = OwnableComponent::OwnableMixinImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc20: ERC20Component::Storage,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC20Event: ERC20Component::Event,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
    }

    // ...
}
```

**With macro (concise):**
```cairo
#[starknet::contract]
#[with_components(ERC20, Ownable)]
mod MyToken {
    use openzeppelin_token::erc20::ERC20HooksEmptyImpl;

    // Component declarations, storage, and events generated automatically

    // ...
}
```

---

## Hooks

### Hook Traits

Components can define hooks for customization:

```cairo
// Empty hooks (default behavior)
use openzeppelin_token::erc20::ERC20HooksEmptyImpl;

// Custom hooks
impl ERC20HooksImpl of ERC20Component::ERC20HooksTrait<ContractState> {
    fn before_update(
        ref self: ERC20Component::ComponentState<ContractState>,
        from: ContractAddress,
        recipient: ContractAddress,
        amount: u256
    ) {
        // Custom logic before transfer
    }

    fn after_update(
        ref self: ERC20Component::ComponentState<ContractState>,
        from: ContractAddress,
        recipient: ContractAddress,
        amount: u256
    ) {
        // Custom logic after transfer
    }
}
```

### Pausable via Hooks

```cairo
impl ERC20HooksImpl of ERC20Component::ERC20HooksTrait<ContractState> {
    fn before_update(
        ref self: ERC20Component::ComponentState<ContractState>,
        from: ContractAddress,
        recipient: ContractAddress,
        amount: u256
    ) {
        let contract_state = self.get_contract();
        contract_state.pausable.assert_not_paused();
    }

    fn after_update(
        ref self: ERC20Component::ComponentState<ContractState>,
        from: ContractAddress,
        recipient: ContractAddress,
        amount: u256
    ) {}
}
```

### Votes via Hooks

```cairo
impl ERC20HooksImpl of ERC20Component::ERC20HooksTrait<ContractState> {
    fn before_update(
        ref self: ERC20Component::ComponentState<ContractState>,
        from: ContractAddress,
        recipient: ContractAddress,
        amount: u256
    ) {}

    fn after_update(
        ref self: ERC20Component::ComponentState<ContractState>,
        from: ContractAddress,
        recipient: ContractAddress,
        amount: u256
    ) {
        let mut contract_state = self.get_contract_mut();
        contract_state.votes.transfer_voting_units(from, recipient, amount);
    }
}
```

---

## Component Composition

### Full Example

```cairo
#[starknet::contract]
mod MyToken {
    use openzeppelin_token::erc20::{ERC20Component, ERC20HooksEmptyImpl};
    use openzeppelin_access::ownable::OwnableComponent;
    use openzeppelin_upgrades::UpgradeableComponent;
    use starknet::{ContractAddress, ClassHash};

    component!(path: ERC20Component, storage: erc20, event: ERC20Event);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);

    // Public implementations
    #[abi(embed_v0)]
    impl ERC20MixinImpl = ERC20Component::ERC20MixinImpl<ContractState>;
    #[abi(embed_v0)]
    impl OwnableMixinImpl = OwnableComponent::OwnableMixinImpl<ContractState>;

    // Internal implementations
    impl ERC20InternalImpl = ERC20Component::InternalImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;
    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc20: ERC20Component::Storage,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC20Event: ERC20Component::Event,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        owner: ContractAddress,
        recipient: ContractAddress,
        initial_supply: u256
    ) {
        self.erc20.initializer("MyToken", "MTK");
        self.ownable.initializer(owner);
        self.erc20.mint(recipient, initial_supply);
    }

    #[abi(embed_v0)]
    impl UpgradeableImpl of IUpgradeable<ContractState> {
        fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
            self.ownable.assert_only_owner();
            self.upgradeable.upgrade(new_class_hash);
        }
    }

    #[generate_trait]
    #[abi(per_item)]
    impl ExternalImpl of ExternalTrait {
        #[external(v0)]
        fn mint(ref self: ContractState, recipient: ContractAddress, amount: u256) {
            self.ownable.assert_only_owner();
            self.erc20.mint(recipient, amount);
        }
    }
}
```

### Interface Flags

Prevent duplicate SRC5 implementations:

```cairo
// SRC5Component handles interface registration
// Only add once even with multiple components
#[abi(embed_v0)]
impl SRC5Impl = SRC5Component::SRC5Impl<ContractState>;
```
