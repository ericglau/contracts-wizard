import { withImplicitArgs } from './common-options';
import { defineFunctions } from './utils/define-functions';
import { defineModules } from './utils/define-modules';
import { getFunctionName } from './utils/module-prefix';
import { toIdentifier } from './utils/to-identifier';

export interface Contract {
  license: string;
  libraries: Library[];
  functions: ContractFunction[];
  constructorCode: string[];
  constructorImplicitArgs?: Argument[];
  constructorArgs: Argument[];
  variables: string[];
  upgradeable: boolean; 
}

export type Value = string | number | { lit: string } | { note: string, value: Value };

export interface Library {
  module: Module;
  functions: string[];
  initializer?: Initializer;
}

export interface Module {
  name: string;
  path: string;
  usePrefix: boolean;
}

export interface Initializer {
  params: Value[];
}

export interface BaseFunction {
  module?: Module;
  name: string;
  implicitArgs?: Argument[];
  args: Argument[];
  returns?: Argument[];
  returnValue?: string;
  kind?: FunctionKind;
  passthrough?: boolean;
  read?: boolean;
  parentFunctionName?: string;
}

export interface ContractFunction extends BaseFunction {
  libraryCalls: BaseFunction[];
  code: string[];
  final: boolean;
}

export type FunctionKind = 'view' | 'external';

export interface Argument {
  name: string;
  type?: string;
}

export interface NatspecTag {
  key: string;
  value: string;
}

export class ContractBuilder implements Contract {
  license: string = 'MIT';
  upgradeable = false;

  readonly constructorArgs: Argument[] = [];
  readonly constructorCode: string[] = [];
  readonly variableSet: Set<string> = new Set();

  /**
   * Map of library prefix to Parent object
   */
  private parentMap: Map<Module, Library> = new Map<Module, Library>();
  private functionMap: Map<string, ContractFunction> = new Map();
  readonly constructorImplicitArgs: Argument[] = withImplicitArgs();

  // TODO create a list of modules
  // in addParentLibrary, lookup from list


  constructor() {
    const modules = defineModules( {
      cairo_builtins: {
        path: 'starkware.cairo.common.cairo_builtins',
        usePrefix: false
      },
    
      uint256: {
        path: 'starkware.cairo.common.uint256',
        usePrefix: false
      },
    })

    const functions = defineFunctions({
      HashBuiltin: {
        module: modules.cairo_builtins,
        args: [],
      },

      Uint256: {
        module: modules.uint256,
        args: [],
      },
    })

    this.addModule(modules.cairo_builtins, [], [functions.HashBuiltin], false);
    this.addModule(modules.uint256, [], [functions.Uint256], false);
  }

  get libraries(): Library[] {
    return [...this.parentMap.values()].sort((a, b) => {
      if (a.module.name === 'Initializable') {
        return -1;
      } else if (b.module.name === 'Initializable') {
        return 1;
      } else {
        return 0;
      }
    });
  }

  get functions(): ContractFunction[] {
    return [...this.functionMap.values()];
  }

  get variables(): string[] {
    return [...this.variableSet];
  }

  addModule(module: Module, params: Value[] = [], functions: BaseFunction[] = [], initializable: boolean = true): boolean {
    const key = module;
    const present = this.parentMap.has(key);
    const initializer = initializable ? { params } : undefined;

    const functionStrings: string[] = [];
    functions.forEach(fn => {
      functionStrings.push(getFunctionName(fn));
    });
    if (initializable) {
      functionStrings.push(getFunctionName({
          module: module, 
          name: 'initializer', 
          args: []
        }))
    }

    this.parentMap.set(module, { module, functions: functionStrings, initializer });
    return !present;
  }

  addModuleFunction(module: Module, addFunction: string) {
    const existing = this.parentMap.get(module);
    if (existing === undefined) {
      throw new Error(`Module ${module} has not been added yet`);
    }
    if (!existing.functions.includes(addFunction)) {
      existing.functions.push(addFunction);
    }
  }

  addLibraryCall(callFn: BaseFunction, baseFn: BaseFunction) {
    const fn = this.addFunction(baseFn);
    if (callFn.module !== undefined) {
      this.addModuleFunction(callFn.module, getFunctionName(callFn));
    }
    if (callFn.args.length > 0) {
      throw new Error(`Library call with functions is not supported yet`);
    }
    fn.libraryCalls.push(callFn);
  }

  addFunction(baseFn: BaseFunction): ContractFunction {
    const signature = [baseFn.name, '(', ...baseFn.args.map(a => a.name), ')'].join('');
    const got = this.functionMap.get(signature);
    if (got !== undefined) {
      return got;
    } else {
      const fn: ContractFunction = {
        libraryCalls: [],
        code: [],
        final: false,
        ...baseFn,
      };
      this.functionMap.set(signature, fn);
      return fn;
    }
  }

  addConstructorArgument(arg: Argument) {
    // TODO use a better way to determine if the constructor already has this arg
    let hasArg = false;
    this.constructorArgs.map(a => {
      if (a.name == arg.name) {
        hasArg = true;
        // TODO can't break out of this
      }
    });
    if (!hasArg) {
      this.constructorArgs.push(arg);
    }
  }

  addConstructorCode(code: string) {
    this.constructorCode.push(code);
  }

  addFunctionCode(code: string, baseFn: BaseFunction) {
    const fn = this.addFunction(baseFn);
    if (fn.final) {
      throw new Error(`Function ${baseFn.name} is already finalized`);
    }
    fn.code.push(code);
  }

  setFunctionBody(code: string[], baseFn: BaseFunction) {
    const fn = this.addFunction(baseFn);
    if (fn.code.length > 0) {
      throw new Error(`Function ${baseFn.name} has additional code`);
    }
    fn.code.push(...code);
    fn.final = true;
  }

}
