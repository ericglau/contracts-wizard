# Cairo Governance

## Table of Contents

1. [Governor](#governor)
2. [Multisig](#multisig)
3. [Vesting](#vesting)
4. [Account Contracts](#account-contracts)

---

## Governor

On-chain governance for DAOs.

### Basic Governor

```cairo
#[starknet::contract]
mod MyGovernor {
    use openzeppelin_governance::governor::GovernorComponent;
    use openzeppelin_governance::governor::extensions::{
        GovernorSettingsComponent,
        GovernorVotesComponent,
        GovernorVotesQuorumFractionComponent,
        GovernorCountingSimpleComponent,
    };
    use openzeppelin_upgrades::UpgradeableComponent;
    use starknet::{ContractAddress, ClassHash};

    component!(path: GovernorComponent, storage: governor, event: GovernorEvent);
    component!(path: GovernorSettingsComponent, storage: governor_settings, event: GovernorSettingsEvent);
    component!(path: GovernorVotesComponent, storage: governor_votes, event: GovernorVotesEvent);
    component!(path: GovernorVotesQuorumFractionComponent, storage: governor_quorum, event: GovernorQuorumEvent);
    component!(path: GovernorCountingSimpleComponent, storage: governor_counting, event: GovernorCountingEvent);
    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);

    // ... implementations and storage

    #[constructor]
    fn constructor(
        ref self: ContractState,
        voting_token: ContractAddress,
        voting_delay: u64,      // e.g., 86400 (1 day)
        voting_period: u64,     // e.g., 604800 (1 week)
        proposal_threshold: u256,
        quorum_percent: u256,   // e.g., 4 for 4%
    ) {
        self.governor.initializer();
        self.governor_settings.initializer(voting_delay, voting_period, proposal_threshold);
        self.governor_votes.initializer(voting_token);
        self.governor_quorum.initializer(quorum_percent);
    }

    #[abi(embed_v0)]
    impl UpgradeableImpl of IUpgradeable<ContractState> {
        fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
            self.governor.assert_only_governance();
            self.upgradeable.upgrade(new_class_hash);
        }
    }
}
```

### Governor Extensions

| Extension | Description |
|-----------|-------------|
| `GovernorSettings` | Configurable delay, period, threshold |
| `GovernorVotes` | Token-based voting |
| `GovernorVotesQuorumFraction` | Percentage quorum |
| `GovernorCountingSimple` | For/Against/Abstain |
| `GovernorTimelockControl` | Timelock integration |
| `GovernorStorage` | On-chain proposal storage |

### Proposal Lifecycle

```
1. propose() → Create proposal
2. Wait voting_delay
3. cast_vote() → Vote on proposal
4. Wait voting_period
5. queue() → Queue for execution (if timelock)
6. Wait timelock delay
7. execute() → Execute proposal
```

---

## Multisig

Multi-signature wallet requiring multiple approvals.

### Basic Multisig

```cairo
#[starknet::contract]
mod MyMultisig {
    use openzeppelin_governance::multisig::MultisigComponent;
    use openzeppelin_upgrades::UpgradeableComponent;
    use starknet::{ContractAddress, ClassHash};

    component!(path: MultisigComponent, storage: multisig, event: MultisigEvent);
    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);

    #[abi(embed_v0)]
    impl MultisigImpl = MultisigComponent::MultisigImpl<ContractState>;

    impl MultisigInternalImpl = MultisigComponent::InternalImpl<ContractState>;
    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        multisig: MultisigComponent::Storage,
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        MultisigEvent: MultisigComponent::Event,
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        signers: Span<ContractAddress>,
        threshold: u32
    ) {
        self.multisig.initializer(signers, threshold);
    }

    #[abi(embed_v0)]
    impl UpgradeableImpl of IUpgradeable<ContractState> {
        fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
            self.multisig.assert_only_self();
            self.upgradeable.upgrade(new_class_hash);
        }
    }
}
```

### Key Functions

| Function | Description |
|----------|-------------|
| `submit_transaction(to, selector, calldata)` | Submit new transaction |
| `confirm_transaction(tx_id)` | Confirm as signer |
| `revoke_confirmation(tx_id)` | Revoke confirmation |
| `execute_transaction(tx_id)` | Execute if threshold met |
| `add_signer(signer)` | Add new signer (self-call) |
| `remove_signer(signer)` | Remove signer (self-call) |
| `change_threshold(new_threshold)` | Change threshold (self-call) |

### Transaction Flow

```
1. Signer A: submit_transaction() → Returns tx_id
2. Signer B: confirm_transaction(tx_id)
3. Signer C: confirm_transaction(tx_id)
4. Any signer: execute_transaction(tx_id) → Executes if threshold met
```

---

## Vesting

Token vesting with cliff and linear release.

### Basic Vesting

```cairo
#[starknet::contract]
mod MyVesting {
    use openzeppelin_governance::vesting::VestingComponent;
    use starknet::ContractAddress;

    component!(path: VestingComponent, storage: vesting, event: VestingEvent);

    #[abi(embed_v0)]
    impl VestingImpl = VestingComponent::VestingImpl<ContractState>;

    impl VestingInternalImpl = VestingComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        vesting: VestingComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        VestingEvent: VestingComponent::Event,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        beneficiary: ContractAddress,
        start_timestamp: u64,
        cliff_duration: u64,    // e.g., 31536000 (1 year)
        total_duration: u64,    // e.g., 126144000 (4 years)
    ) {
        self.vesting.initializer(beneficiary, start_timestamp, cliff_duration, total_duration);
    }
}
```

### Key Functions

| Function | Description |
|----------|-------------|
| `beneficiary()` | Get beneficiary address |
| `start()` | Get vesting start timestamp |
| `cliff()` | Get cliff end timestamp |
| `end()` | Get vesting end timestamp |
| `duration()` | Get total vesting duration |
| `released(token)` | Get amount already released |
| `releasable(token)` | Get amount currently releasable |
| `release(token)` | Release vested tokens |
| `vested_amount(token, timestamp)` | Calculate vested at timestamp |

### Vesting Schedule

```
|----cliff----|------------linear vesting------------|
^             ^                                      ^
start         cliff_end                              end

Before cliff: 0% vested
After cliff: Linear release until end
After end: 100% vested
```

---

## Account Contracts

Starknet account abstraction.

### Standard Account

```cairo
#[starknet::contract]
mod MyAccount {
    use openzeppelin_account::AccountComponent;
    use openzeppelin_upgrades::UpgradeableComponent;
    use starknet::{ContractAddress, ClassHash};

    component!(path: AccountComponent, storage: account, event: AccountEvent);
    component!(path: UpgradeableComponent, storage: upgradeable, event: UpgradeableEvent);

    #[abi(embed_v0)]
    impl AccountMixinImpl = AccountComponent::AccountMixinImpl<ContractState>;

    impl AccountInternalImpl = AccountComponent::InternalImpl<ContractState>;
    impl UpgradeableInternalImpl = UpgradeableComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        account: AccountComponent::Storage,
        #[substorage(v0)]
        upgradeable: UpgradeableComponent::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        AccountEvent: AccountComponent::Event,
        #[flat]
        UpgradeableEvent: UpgradeableComponent::Event,
    }

    #[constructor]
    fn constructor(ref self: ContractState, public_key: felt252) {
        self.account.initializer(public_key);
    }

    #[abi(embed_v0)]
    impl UpgradeableImpl of IUpgradeable<ContractState> {
        fn upgrade(ref self: ContractState, new_class_hash: ClassHash) {
            self.account.assert_only_self();
            self.upgradeable.upgrade(new_class_hash);
        }
    }
}
```

### Ethereum Account

For Ethereum-style signatures:

```cairo
#[starknet::contract]
mod MyEthAccount {
    use openzeppelin_account::EthAccountComponent;

    component!(path: EthAccountComponent, storage: eth_account, event: EthAccountEvent);

    #[abi(embed_v0)]
    impl EthAccountMixinImpl = EthAccountComponent::EthAccountMixinImpl<ContractState>;

    // ...

    #[constructor]
    fn constructor(ref self: ContractState, eth_public_key: EthPublicKey) {
        self.eth_account.initializer(eth_public_key);
    }
}
```

### Account Key Functions

| Function | Description |
|----------|-------------|
| `__validate__` | Validate transaction signature |
| `__execute__` | Execute transaction calls |
| `__validate_declare__` | Validate declare transaction |
| `__validate_deploy__` | Validate deploy account |
| `get_public_key()` | Get account public key |
| `set_public_key(new_key)` | Change public key |
| `is_valid_signature(hash, signature)` | Verify signature |
