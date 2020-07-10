import {ScriptStateRegistry} from './script-state-registry';
import {HostRaidStates, hostRaidStates} from './scripts/host-raid'
import {ScriptStateMachine} from './script-state-machine';

type StateNames = HostRaidStates

const stateRegistry = new ScriptStateRegistry<StateNames>();

export const stateMachine = new ScriptStateMachine(stateRegistry);

hostRaidStates.forEach(stateRegistry.register);

export const initialStates = [hostRaidStates].map(arr => arr[0]);
