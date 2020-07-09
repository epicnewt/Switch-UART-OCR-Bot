import {DraftScriptState, ScriptState} from './script-state.model';

export class ScriptStateRegistry {
    private registry: { [name: string]: ScriptState } = {};

    register(state: DraftScriptState<string>) {
        if (!this.registry[state.name]) {
            this.registry[state.name] = {
                name: state.name,
                action: () => state.action().then((next: string) => this.getState(next)),
                onError: () => this.getState(state.onError)
            };
        } else {
            throw Error('Duplicate state registered')
        }
    }

    getState(name?: string): ScriptState | undefined {
        if (name) {
            return this.registry[name]
        }
    }
}
