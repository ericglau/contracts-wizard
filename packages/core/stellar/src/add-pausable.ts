import { getSelfArg } from './common-options';
import type { ContractBuilder } from './contract';
import { Access, requireAccessControl } from './set-access-control';
import { defineFunctions } from './utils/define-functions';

export function addPausable(c: ContractBuilder, name: string, access: Access) {
  c.addUseClause('openzeppelin_pausable', 'self as pausable');
  c.addUseClause('openzeppelin_pausable', 'Pausable');

  const pausableTrait = {
    name: 'Pausable',
    for: name,
    tags: [
      'contractimpl',
    ],
  };

  c.addFunction(pausableTrait, functions.paused);
  c.addFunction(pausableTrait, functions.pause);
  c.addFunction(pausableTrait, functions.unpause);

  requireAccessControl(c, pausableTrait, functions.pause, access, 'caller');
  requireAccessControl(c, pausableTrait, functions.unpause, access, 'caller');
}

const functions = defineFunctions({
  paused: {
    args: [
      getSelfArg(),
    ],
    returns: 'bool',
    code: [
      'pausable::paused(e)'
    ],
  },
  pause: {
    args: [
      getSelfArg(),
      { name: 'caller', type: 'Address' },
    ],
    code: [
      'pausable::pause(e, &caller)'
    ],
  },
  unpause: {
    args: [
      getSelfArg(),
      { name: 'caller', type: 'Address' },
    ],
    code: [
      'pausable::unpause(e, &caller)'
    ],
  },
});