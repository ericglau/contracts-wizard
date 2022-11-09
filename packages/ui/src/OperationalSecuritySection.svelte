<script lang="ts">
  import type { OpSec } from '@openzeppelin/wizard';
  import { opSecDefaults } from '@openzeppelin/wizard';

  import HelpTooltip from './HelpTooltip.svelte';

  export let opSec: OpSec;
</script>

<section class="controls-section">
  <h1>Operational Security</h1>

  <div class="checkbox-group">
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class:checked={opSec.defender}>
    <label>
      <input type="checkbox" bind:checked={opSec.defender} default={opSecDefaults.defender}>
      Defender
      <HelpTooltip>
        TODO
      </HelpTooltip>
    </label>
  </div>

  <button class="learn-button">
    <b>&#9432;</b>&nbsp;&nbsp;Explore security features
  </button>
</section>

