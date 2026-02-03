# Cairo Upgradeability

## Table of Contents

1. [Overview](#overview)
2. [Basic Upgradeable Contract](#basic-upgradeable-contract)
3. [Authorization Patterns](#authorization-patterns)
4. [Storage Considerations](#storage-considerations)

---

## Overview

Cairo contracts upgrade by replacing the class hash:

```
Contract Instance (Address)
    ↓ stores
Class Hash → Implementation Code
    ↓ upgrade
New Class Hash → New Implementation Code
```

Unlike Solidity proxy patterns, Cairo handles this natively.

---

## Basic Upgradeable Contract

```cairo
#[starknet::contract]
mod MyContract {
    use openzeppelin_upgrades::UpgradeableComponent;
    use openzeppelin_upgrades::interface::IUpgradeable;
    use openzeppelin_access::ownable::OwnableComponent;
    use starknet::{ContractAddress, ClassHash};

    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    #[abi(embed_v0)]
    impl OwnableMixinImpl = OwnableComponent::OwnableMixinImpl<ContractState>;

    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.ownable.initializer(owner);
    }

    #[abi(embed_v0)]
    impl UpgradeableImpl of IUpgradeable<ContractState> {
        fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
            self.ownable.assert_only_owner();
            self.upgradeable.upgrade(new_class_hash);
        }
    }
}
```

---

## Authorization Patterns

### With Ownable

```cairo
#[abi(embed_v0)]
impl UpgradeableImpl of IUpgradeable<ContractState> {
    fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
        self.ownable.assert_only_owner();
        self.upgradeable.upgrade(new_class_hash);
    }
}
```

### With AccessControl

```cairo
const UPGRADER_ROLE: felt252 = selector!("UPGRADER_ROLE");

#[abi(embed_v0)]
impl UpgradeableImpl of IUpgradeable<ContractState> {
    fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
        self.access_control.assert_only_role(UPGRADER_ROLE);
        self.upgradeable.upgrade(new_class_hash);
    }
}
```

### For Governor Contracts

```cairo
#[abi(embed_v0)]
impl UpgradeableImpl of IUpgradeable<ContractState> {
    fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
        self.governor.assert_only_governance();
        self.upgradeable.upgrade(new_class_hash);
    }
}
```

### For Multisig Contracts

```cairo
#[abi(embed_v0)]
impl UpgradeableImpl of IUpgradeable<ContractState> {
    fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
        self.multisig.assert_only_self();
        self.upgradeable.upgrade(new_class_hash);
    }
}
```

### For Account Contracts

```cairo
#[abi(embed_v0)]
impl UpgradeableImpl of IUpgradeable<ContractState> {
    fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
        self.account.assert_only_self();
        self.upgradeable.upgrade(new_class_hash);
    }
}
```

---

## Storage Considerations

### Component Storage

Each component has isolated storage via substorage:

```cairo
#[storage]
struct Storage {
    #[substorage(v0)]
    erc20: ERC20Component::Storage,
    #[substorage(v0)]
    ownable: OwnableComponent::Storage,
    custom_value: u256,
}
```

### Adding Storage in Upgrades

Safe to add new storage variables:

```cairo
// V1
#[storage]
struct Storage {
    #[substorage(v0)]
    erc20: ERC20Component::Storage,
    value_a: u256,
}

// V2 - Safe: added at end
#[storage]
struct Storage {
    #[substorage(v0)]
    erc20: ERC20Component::Storage,
    value_a: u256,
    value_b: u256,  // New
}
```

### Storage Layout Rules

1. **Never remove existing storage variables**
2. **Never reorder storage variables**
3. **Add new variables at the end only**
4. **Component substorages are isolated**

### Verifying Upgrades

Before upgrading, verify:

1. New class hash is declared on Starknet
2. Storage layout is compatible
3. Interfaces remain compatible
4. Authorization is correct

---

## Upgrade Process

### 1. Declare New Class

```bash
sncast declare --contract-name MyContractV2
```

### 2. Call Upgrade

```cairo
// From owner/upgrader
contract.upgrade(new_class_hash);
```

### 3. Verify

```bash
sncast call --contract-address <ADDRESS> --function get_implementation_hash
```

---

## Full Example: Upgradeable ERC20

```cairo
#[starknet::contract]
mod MyTokenV1 {
    use openzeppelin_token::erc20::{ERC20Component, ERC20HooksEmptyImpl};
    use openzeppelin_upgrades::UpgradeableComponent;
    use openzeppelin_upgrades::interface::IUpgradeable;
    use openzeppelin_access::ownable::OwnableComponent;
    use starknet::{ContractAddress, ClassHash};

    component!(path: ERC20Component, storage: erc20, event: ERC20Event);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);
    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);

    #[abi(embed_v0)]
    impl ERC20MixinImpl = ERC20Component::ERC20MixinImpl<ContractState>;
    #[abi(embed_v0)]
    impl OwnableMixinImpl = OwnableComponent::OwnableMixinImpl<ContractState>;

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
