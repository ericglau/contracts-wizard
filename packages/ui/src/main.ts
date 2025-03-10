import './common/styles/global.css';

import type {} from 'svelte';
import SolidityApp from './solidity/App.svelte';
import CairoApp from './cairo/App.svelte';
import CairoNextApp from './cairo-next/App.svelte';
import StellarApp from './stellar/App.svelte';
import StylusApp from './stylus/App.svelte';
import { postMessage } from './common/post-message';
import UnsupportedVersion from './common/UnsupportedVersion.svelte';
import semver from 'semver';
import { compatibleContractsSemver as soliditySemver } from '@openzeppelin/wizard';
import { compatibleContractsSemver as cairoSemver } from '@openzeppelin/wizard-cairo';
import { compatibleContractsSemver as cairoNextSemver } from '@openzeppelin/wizard-cairo-next';
import { compatibleContractsSemver as stellarSemver } from '@openzeppelin/wizard-stellar';
import { compatibleContractsSemver as stylusSemver } from '@openzeppelin/wizard-stylus';
import type { InitialOptions } from './common/initial-options.ts';

function postResize() {
  const { height } = document.documentElement.getBoundingClientRect();
  postMessage({ kind: 'oz-wizard-resize', height });
}

window.onload = postResize;

const resizeObserver = new ResizeObserver(postResize);
resizeObserver.observe(document.body);

const params = new URLSearchParams(window.location.search);

const initialTab = params.get('tab') ?? undefined;
const lang = params.get('lang') ?? undefined;
const requestedVersion = params.get('version') ?? undefined;

const initialOpts: InitialOptions = {
  name: params.get('name') ?? undefined,
  symbol: params.get('symbol') ?? undefined,
  premint: params.get('premint') ?? undefined,
};

const appTypes = ['solidity', 'cairo', 'cairo-next', 'stellar', 'stylus'] as const;
type AppType = typeof appTypes[number];

interface CompatibleSelection {
  compatible: true;
  appType: AppType;
}

interface IncompatibleSelection {
  compatible: false;
  compatibleVersionsSemver: string;
}

function evalutateSelection(lang: string | undefined, requestedVersion: string | undefined): CompatibleSelection | IncompatibleSelection {
  switch (lang) {
    case 'cairo': {
      if (requestedVersion === undefined) {
        return { compatible: true, appType: 'cairo' };
      } else if (semver.satisfies(requestedVersion, cairoNextSemver)) {
        return { compatible: true, appType: 'cairo-next' };
      } else if (semver.satisfies(requestedVersion, cairoSemver)) {
        return { compatible: true, appType: 'cairo' };
      } else {
        return { compatible: false, compatibleVersionsSemver: `${cairoNextSemver} || ${cairoSemver}` };
      }
    }
    case 'stellar': {
      if (requestedVersion === undefined || semver.satisfies(requestedVersion, stellarSemver)) {
        return { compatible: true, appType: 'stellar' };
      } else {
        return { compatible: false, compatibleVersionsSemver: stellarSemver };
      }
    }
    case 'stylus': {
      if (requestedVersion === undefined || semver.satisfies(requestedVersion, stylusSemver)) {
        return { compatible: true, appType: 'stylus' };
      } else {
        return { compatible: false, compatibleVersionsSemver: stylusSemver };
      }
    }
    case 'solidity':
    case undefined:
    default: {
      if (requestedVersion === undefined || semver.satisfies(requestedVersion, soliditySemver)) {
        return { compatible: true, appType: 'solidity' };
      } else {
        return { compatible: false, compatibleVersionsSemver: soliditySemver };
      }
    }
  }
};

let app;
const selection = evalutateSelection(lang, requestedVersion);

if (!selection.compatible) {
  if (requestedVersion === undefined) { // Should never happen, since undefined should lead to a compatible selection
    throw new Error('requestedVersion is undefined');
  }

  postMessage({ kind: 'oz-wizard-unsupported-version' });
  app = new UnsupportedVersion({
    target: document.body,
    props: { requestedVersion: requestedVersion!, compatibleVersionSemver: selection.compatibleVersionsSemver },
  });
} else {
  switch (selection.appType) {
    case 'cairo':
      app = new CairoApp({
        target: document.body,
        props: { initialTab, initialOpts },
      });
      break;
    case 'cairo-next':
      app = new CairoNextApp({
        target: document.body,
        props: { initialTab, initialOpts },
      });
      break;
    case 'stellar':
      app = new StellarApp({ target: document.body, props: { initialTab, initialOpts } });
      break;
    case 'stylus':
      app = new StylusApp({ target: document.body, props: { initialTab, initialOpts } });
      break;
    case 'solidity':
      app = new SolidityApp({
        target: document.body,
        props: { initialTab, initialOpts },
      });
      break;
    default: {
      const _: never = selection.appType;
      throw new Error('Unknown app type');
    }
  }
}

app.$on('tab-change', (e: CustomEvent) => {
  postMessage({ kind: 'oz-wizard-tab-change', tab: e.detail.toLowerCase() });
});

export default app;
