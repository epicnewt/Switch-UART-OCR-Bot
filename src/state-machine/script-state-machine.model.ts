import {ScriptState} from './script-state.model';

interface ExternalEvent<StateKey extends string> {
    type: 'pause' | 'resume' | 'stop'
}

interface StateChange<StateKey extends string> {
    type: 'change-state',
    state: ScriptState<StateKey>
}

export type Event<StateKey extends string> = StateChange<StateKey> | ExternalEvent<StateKey>
