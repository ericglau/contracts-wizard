<script lang="ts">
  import type { Access } from '@openzeppelin/wizard';

  import ToggleRadio from './inputs/ToggleRadio.svelte';
  import HelpTooltip from './HelpTooltip.svelte';

  export let access: Access;
  export let requireAccessControl: boolean;

  let defaultValueWhenEnabled: 'ownable' | 'roles' = 'ownable';

  let impliedAccess: Access = requireAccessControl ? defaultValueWhenEnabled : false;
  let chosenAccess: Access = access;

  $: {
    if (chosenAccess !== false) {
      defaultValueWhenEnabled = chosenAccess;
    } else {
      impliedAccess = requireAccessControl ? defaultValueWhenEnabled : false;
    }

    access = chosenAccess ? chosenAccess : impliedAccess;
  }
</script>

<section class="controls-section">
  <h1>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="flex items-center tooltip-container pr-2">
      <span>Access Control</span>
      <span class="ml-1">
        <ToggleRadio bind:value={chosenAccess} defaultValue="ownable" disabled={requireAccessControl} />
      </span>
      <HelpTooltip align="right" link="https://docs.openzeppelin.com/contracts/4.x/api/access">
        Restrict who can access the functions of a contract or when they can do it.
      </HelpTooltip>
    </label>
  </h1>

  <div class="checkbox-group">
    <label class:checked={chosenAccess === 'ownable'}>
      <input type="radio" bind:group={chosenAccess} value="ownable">
      Ownable
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/4.x/api/access#Ownable">
        Simple mechanism with a single account authorized for all privileged actions.
      </HelpTooltip>
    </label>
    <label class:checked={chosenAccess === 'roles'}>
      <input type="radio" bind:group={chosenAccess} value="roles">
      Roles
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/4.x/api/access#AccessControl">
        Flexible mechanism with a separate role for each privileged action. A role can have many authorized accounts.
      </HelpTooltip>
    </label>
  </div>

</section>

