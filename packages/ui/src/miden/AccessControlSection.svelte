<script lang="ts">
  import type { Access } from '@openzeppelin/wizard-miden';

  import ExpandableToggleRadio from '../common/ExpandableToggleRadio.svelte';
  import HelpTooltip from '../common/HelpTooltip.svelte';

  export let access: Access;
  export let required: boolean;
  let defaultValueWhenEnabled: 'roles' | 'ownable' = 'ownable';

  let wasRequired = required;
  let wasAccess = access;

  $: {
    if (wasRequired && !required) {
      access = wasAccess;
    } else {
      wasAccess = access;
      if (access === false && required) {
        access = defaultValueWhenEnabled;
      }
    }

    wasRequired = required;
    if (access !== false) {
      defaultValueWhenEnabled = access;
    }
  }
</script>

<ExpandableToggleRadio
  label="Access Control"
  bind:value={access}
  defaultValue="ownable"
  helpContent="Restrict who can manage the faucet. Without access control, the faucet is a user account authenticated by a single signature, and the key holder is the sole authority. With access control, the faucet is a network account: the network executes the MINT, BURN and config notes sent to it, and privileged procedures are gated by the owner or by roles."
  helpLink="https://docs.miden.xyz/protocol/account/components"
  {required}
>
  <div class="checkbox-group">
    <label class:checked={access === 'ownable'}>
      <input type="radio" bind:group={access} value="ownable" />
      Ownable
      <HelpTooltip>
        Simple mechanism with a single owner account authorized for all privileged actions, with two-step ownership
        transfer.
      </HelpTooltip>
    </label>
    <label class:checked={access === 'roles'}>
      <input type="radio" bind:group={access} value="roles" />
      Roles
      <HelpTooltip>
        Flexible mechanism with a separate role for each privileged action. A role can have many authorized accounts.
        Minting and burning stay gated by the owner-only policies, checked against the initial admin.
      </HelpTooltip>
    </label>
  </div>
</ExpandableToggleRadio>
