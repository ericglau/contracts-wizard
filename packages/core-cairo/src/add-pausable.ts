import { withImplicitArgs } from './common-options';
import type { ContractBuilder, BaseFunction } from './contract';
import { Access, setAccessControl } from './set-access-control';
import { defineFunctions } from './utils/define-functions';
import { defineModules } from './utils/define-modules';
import { defineNamespaces } from './utils/define-namespaces';

export function addPausable(c: ContractBuilder, access: Access, pausableFns: BaseFunction[]) {
  c.addModule(modules.Pausable, [], [functions.pause, functions.unpause], false);

  for (const fn of pausableFns) {
    setPausable(c, fn);
  }

  c.addFunction(functions.paused);

  setAccessControl(c, functions.pause, access);
  setAccessControl(c, functions.unpause, access);
}

const modules = defineModules( {
  Pausable: {
    path: 'openzeppelin/security/pausable', 
    usePrefix: true
  },
});

const namespaces = defineNamespaces( {
  Pausable: {
    module: modules.Pausable,
  },
})

const functions = defineFunctions({

  paused: {
    module: modules.Pausable,
    namespace: namespaces.Pausable,
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [],
    returns: [{ name: 'paused', type: 'felt' }],
    passthrough: true,
    read: true
  },

  pause: {
    module: modules.Pausable,
    namespace: namespaces.Pausable,
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [],
  },

  unpause: {
    module: modules.Pausable,
    namespace: namespaces.Pausable,
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [],
  },

  // --- library-only calls ---

  assert_not_paused: {
    module: modules.Pausable,
    namespace: namespaces.Pausable,
    args: [],
  },
  
});

export function setPausable(c: ContractBuilder, fn: BaseFunction) {
    c.addLibraryCall(functions.assert_not_paused, fn);
}
