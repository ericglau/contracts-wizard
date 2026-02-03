# Cairo Token Standards

## Table of Contents

1. [ERC20 Fungible Tokens](#erc20-fungible-tokens)
2. [ERC721 Non-Fungible Tokens](#erc721-non-fungible-tokens)
3. [ERC1155 Multi-Tokens](#erc1155-multi-tokens)

---

## ERC20 Fungible Tokens

### Basic ERC20

```cairo
#[starknet::contract]
mod MyToken {
    use openzeppelin_token::erc20::{ERC20Component, ERC20HooksEmptyImpl};
    use starknet::ContractAddress;

    component!(path: ERC20Component, storage: erc20, event: ERC20Event);

    #[abi(embed_v0)]
    impl ERC20MixinImpl = ERC20Component::ERC20MixinImpl<ContractState>;
    impl ERC20InternalImpl = ERC20Component::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc20: ERC20Component::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC20Event: ERC20Component::Event,
    }

    #[constructor]
    fn constructor(ref self: ContractState) {
        self.erc20.initializer("MyToken", "MTK");
    }
}
```

### Available Features

| Feature | Component/Implementation |
|---------|-------------------------|
| Basic Transfer | `ERC20Component` |
| Burnable | `burn()` internal function |
| Mintable | `mint()` internal function |
| Pausable | `PausableComponent` + hooks |
| Votes | `VotesComponent` + hooks |
| Flash Mint | `ERC20FlashMintComponent` |

### ERC20 with Premint

```cairo
#[constructor]
fn constructor(ref self: ContractState, recipient: ContractAddress) {
    self.erc20.initializer("MyToken", "MTK");
    self.erc20.mint(recipient, 1000000000000000000000000); // 1M tokens (18 decimals)
}
```

### ERC20 Mintable + Burnable

```cairo
#[starknet::contract]
mod MyToken {
    use openzeppelin_token::erc20::{ERC20Component, ERC20HooksEmptyImpl};
    use openzeppelin_access::ownable::OwnableComponent;
    use starknet::ContractAddress;

    component!(path: ERC20Component, storage: erc20, event: ERC20Event);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    #[abi(embed_v0)]
    impl ERC20MixinImpl = ERC20Component::ERC20MixinImpl<ContractState>;
    #[abi(embed_v0)]
    impl OwnableMixinImpl = OwnableComponent::OwnableMixinImpl<ContractState>;

    impl ERC20InternalImpl = ERC20Component::InternalImpl<ContractState>;
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

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.erc20.initializer("MyToken", "MTK");
        self.ownable.initializer(owner);
    }

    #[generate_trait]
    #[abi(per_item)]
    impl ExternalImpl of ExternalTrait {
        #[external(v0)]
        fn mint(ref self: ContractState, recipient: ContractAddress, amount: u256) {
            self.ownable.assert_only_owner();
            self.erc20.mint(recipient, amount);
        }

        #[external(v0)]
        fn burn(ref self: ContractState, amount: u256) {
            self.erc20.burn(starknet::get_caller_address(), amount);
        }
    }
}
```

### ERC20 with Pausable

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

### ERC20 with Votes

Requires SNIP-12 metadata:

```cairo
#[starknet::contract]
mod MyToken {
    use openzeppelin_token::erc20::{ERC20Component};
    use openzeppelin_governance::votes::VotesComponent;
    use openzeppelin_utils::nonces::NoncesComponent;
    use starknet::ContractAddress;

    component!(path: ERC20Component, storage: erc20, event: ERC20Event);
    component!(path: VotesComponent, storage: votes, event: VotesEvent);
    component!(path: NoncesComponent, storage: nonces, event: NoncesEvent);

    // SNIP-12 Metadata (required for Votes)
    #[abi(embed_v0)]
    impl SNIP12MetadataImpl of ISNIP12Metadata<ContractState> {
        fn snip12_metadata(self: @ContractState) -> (felt252, felt252) {
            ('MyToken', '1')  // (name, version)
        }
    }

    // Custom hooks for vote tracking
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

    // ... storage, events, constructor
}
```

---

## ERC721 Non-Fungible Tokens

### Basic ERC721

```cairo
#[starknet::contract]
mod MyNFT {
    use openzeppelin_token::erc721::{ERC721Component, ERC721HooksEmptyImpl};
    use starknet::ContractAddress;

    component!(path: ERC721Component, storage: erc721, event: ERC721Event);

    #[abi(embed_v0)]
    impl ERC721MixinImpl = ERC721Component::ERC721MixinImpl<ContractState>;
    impl ERC721InternalImpl = ERC721Component::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc721: ERC721Component::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC721Event: ERC721Component::Event,
    }

    #[constructor]
    fn constructor(ref self: ContractState) {
        self.erc721.initializer("MyNFT", "MNFT", "https://api.example.com/token/");
    }
}
```

### Available Features

| Feature | Component/Implementation |
|---------|-------------------------|
| Basic Transfer | `ERC721Component` |
| Burnable | `burn()` internal function |
| Mintable | `safe_mint()` internal function |
| Pausable | `PausableComponent` + hooks |
| Enumerable | `ERC721EnumerableComponent` |
| Royalties | `ERC2981Component` |

### ERC721 with Auto-Increment IDs

```cairo
#[starknet::contract]
mod MyNFT {
    use openzeppelin_token::erc721::{ERC721Component, ERC721HooksEmptyImpl};
    use openzeppelin_access::ownable::OwnableComponent;
    use starknet::ContractAddress;

    component!(path: ERC721Component, storage: erc721, event: ERC721Event);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc721: ERC721Component::Storage,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        next_token_id: u256,
    }

    // ... events, implementations

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.erc721.initializer("MyNFT", "MNFT", "");
        self.ownable.initializer(owner);
        self.next_token_id.write(0);
    }

    #[generate_trait]
    #[abi(per_item)]
    impl ExternalImpl of ExternalTrait {
        #[external(v0)]
        fn safe_mint(ref self: ContractState, recipient: ContractAddress, token_uri: ByteArray) {
            self.ownable.assert_only_owner();
            let token_id = self.next_token_id.read();
            self.next_token_id.write(token_id + 1);
            self.erc721.safe_mint(recipient, token_id, array![].span());
            self.erc721.set_token_uri(token_id, token_uri);
        }
    }
}
```

### ERC721 with Royalties

```cairo
#[starknet::contract]
mod MyNFT {
    use openzeppelin_token::erc721::{ERC721Component, ERC721HooksEmptyImpl};
    use openzeppelin_token::common::erc2981::ERC2981Component;

    component!(path: ERC721Component, storage: erc721, event: ERC721Event);
    component!(path: ERC2981Component, storage: erc2981, event: ERC2981Event);

    #[constructor]
    fn constructor(ref self: ContractState, royalty_receiver: ContractAddress) {
        self.erc721.initializer("MyNFT", "MNFT", "");
        // 5% royalty (500 basis points out of 10000)
        self.erc2981.set_default_royalty(royalty_receiver, 500);
    }
}
```

---

## ERC1155 Multi-Tokens

### Basic ERC1155

```cairo
#[starknet::contract]
mod MyMultiToken {
    use openzeppelin_token::erc1155::{ERC1155Component, ERC1155HooksEmptyImpl};
    use starknet::ContractAddress;

    component!(path: ERC1155Component, storage: erc1155, event: ERC1155Event);

    #[abi(embed_v0)]
    impl ERC1155MixinImpl = ERC1155Component::ERC1155MixinImpl<ContractState>;
    impl ERC1155InternalImpl = ERC1155Component::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc1155: ERC1155Component::Storage,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC1155Event: ERC1155Component::Event,
    }

    #[constructor]
    fn constructor(ref self: ContractState) {
        self.erc1155.initializer("https://example.com/api/{id}.json");
    }
}
```

### ERC1155 with Supply Tracking

```cairo
#[starknet::contract]
mod MyMultiToken {
    use openzeppelin_token::erc1155::{ERC1155Component, ERC1155HooksEmptyImpl};
    use openzeppelin_token::erc1155::extensions::ERC1155SupplyComponent;
    use openzeppelin_access::ownable::OwnableComponent;

    component!(path: ERC1155Component, storage: erc1155, event: ERC1155Event);
    component!(path: ERC1155SupplyComponent, storage: erc1155_supply, event: ERC1155SupplyEvent);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    // ... implementations

    #[generate_trait]
    #[abi(per_item)]
    impl ExternalImpl of ExternalTrait {
        #[external(v0)]
        fn mint(
            ref self: ContractState,
            account: ContractAddress,
            id: u256,
            amount: u256,
            data: Span<felt252>
        ) {
            self.ownable.assert_only_owner();
            self.erc1155.mint(account, id, amount, data);
        }

        #[external(v0)]
        fn mint_batch(
            ref self: ContractState,
            to: ContractAddress,
            ids: Span<u256>,
            amounts: Span<u256>,
            data: Span<felt252>
        ) {
            self.ownable.assert_only_owner();
            self.erc1155.batch_mint(to, ids, amounts, data);
        }

        #[external(v0)]
        fn total_supply(self: @ContractState, id: u256) -> u256 {
            self.erc1155_supply.total_supply(id)
        }

        #[external(v0)]
        fn exists(self: @ContractState, id: u256) -> bool {
            self.erc1155_supply.exists(id)
        }
    }
}
```

### ERC1155 with Updatable URI

```cairo
#[generate_trait]
#[abi(per_item)]
impl ExternalImpl of ExternalTrait {
    #[external(v0)]
    fn set_uri(ref self: ContractState, new_uri: ByteArray) {
        self.ownable.assert_only_owner();
        self.erc1155.set_base_uri(new_uri);
    }
}
```
