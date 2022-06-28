<script lang="ts">
  import type { Access } from '@openzeppelin/wizard';

  import ToggleRadio from './inputs/ToggleRadio.svelte';
  import HelpTooltip from './HelpTooltip.svelte';

  export let access: Access;
  export let requireAccessControl: boolean;
  let defaultValueWhenEnabled: 'ownable' | 'roles' = 'ownable';

  let wasRequireAccessControl = requireAccessControl;
  let wasAccess = access;''

  $: {


    if (wasRequireAccessControl && !requireAccessControl) {
      access = defaultValueWhenEnabled; // restore to chosen option
    } else if (!wasRequireAccessControl && requireAccessControl) {
      let currentAccess = access;
      if (access === false) {
        access = wasAccess; // restore to chosen option
      }
      wasAccess = currentAccess; // save chosen option
    } else if (wasAccess !== access) {
      wasAccess = access;
    }

    // wasRequireAccessControl = requireAccessControl;
    if (access !== false) {
      defaultValueWhenEnabled = access;
    }


    // if (chosenAccess !== false) {
    //   defaultValueWhenEnabled = chosenAccess;
    // }
    // impliedAccess = requireAccessControl ? defaultValueWhenEnabled : false;
    

    // if (impliedAccess === false) {
    //   access = false;
    // }

    // //access = chosenAccess ? chosenAccess : impliedAccess;

    // chosenAccess = access;
    // if (access === false) {
    //   if (impliedAccess !== false) {
    //     access = impliedAccess;
    //   } else {
    //     access = false;
    //   }
    // }
  }
</script>

<section class="controls-section">
  <h1>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="flex items-center tooltip-container pr-2">
      <span>Access Control</span>
      <span class="ml-1">
        <ToggleRadio bind:value={access} defaultValue="ownable" disabled={requireAccessControl} />
      </span>
      <HelpTooltip align="right" link="https://docs.openzeppelin.com/contracts/4.x/api/access">
        Restrict who can access the functions of a contract or when they can do it.
      </HelpTooltip>
    </label>
  </h1>

  <div class="checkbox-group">
    <label class:checked={access === 'ownable'}>
      <input type="radio" bind:group={access} value="ownable" >
      Ownable
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/4.x/api/access#Ownable">
        Simple mechanism with a single account authorized for all privileged actions.
      </HelpTooltip>
    </label>
    <label class:checked={access === 'roles'}>
      <input type="radio" bind:group={access} value="roles">
      Roles
      <HelpTooltip link="https://docs.openzeppelin.com/contracts/4.x/api/access#AccessControl">
        Flexible mechanism with a separate role for each privileged action. A role can have many authorized accounts.
      </HelpTooltip>
    </label>
  </div>

</section>

