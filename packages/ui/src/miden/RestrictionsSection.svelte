<script lang="ts">
  import type { Restrictions } from '@openzeppelin/wizard-miden';

  import ExpandableToggleRadio from '../common/ExpandableToggleRadio.svelte';
  import HelpTooltip from '../common/HelpTooltip.svelte';

  export let restrictions: Restrictions;
</script>

<ExpandableToggleRadio
  label="Transfer Restrictions"
  bind:value={restrictions}
  defaultValue="blocklist"
  helpContent="Restrict who can send or receive the asset through the send and receive policies of the faucet. Enables asset callbacks, so every transfer of the asset is checked against the faucet."
>
  <div class="checkbox-group">
    <label class:checked={restrictions === 'allowlist'}>
      <input type="radio" bind:group={restrictions} value="allowlist" />
      Allowlist
      <HelpTooltip>
        Only accounts on the allowlist can send or receive the asset. Privileged accounts manage the allowlist.
      </HelpTooltip>
    </label>
    <label class:checked={restrictions === 'blocklist'}>
      <input type="radio" bind:group={restrictions} value="blocklist" />
      Blocklist
      <HelpTooltip>
        Accounts on the blocklist can neither send nor receive the asset. Privileged accounts manage the blocklist.
      </HelpTooltip>
    </label>
  </div>
</ExpandableToggleRadio>
