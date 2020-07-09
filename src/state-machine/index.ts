import {ScriptStateRegistry} from './script-state-registry';
import {hostRaidStates} from './scripts/host-raid'

export const stateRegistry = new ScriptStateRegistry();

hostRaidStates.forEach(stateRegistry.register);
