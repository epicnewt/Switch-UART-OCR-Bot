import {DraftScriptState, Falsey, ScriptState} from './script-state.model';

export class ScriptStateRegistry<StateKey extends string> {
    private registry: { [name: string]: ScriptState<StateKey> } = {};

    register(state: DraftScriptState<StateKey>) {
        if (!this.registry[state.name]) {
            this.registry[state.name] = {
                name: state.name,
                action: () => state.action().then((next: StateKey | Falsey) => (
                    (next) ? this.getState(next) : null
                )),
                onError: (e) => state.onError ? this.getState(state.onError(e)) : null
            };
        } else {
            throw Error('Duplicate state registered')
        }
    }

    getState(name?: StateKey): ScriptState<StateKey> | undefined {
        if (name) {
            return this.registry[name]
        }
    }
}
