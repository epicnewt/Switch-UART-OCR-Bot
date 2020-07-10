import {ScriptStateRegistry} from './script-state-registry';
import {DraftScriptState, Falsey, ScriptState} from './script-state.model';
import {Observable, pipe, Subject} from 'rxjs';
import {Event} from './script-state-machine.model';
import {bufferCount, filter, map} from 'rxjs/operators';

interface InactiveMachineState<T> {
    status: 'stopped' | 'resume';
}

interface ActiveMachineState<T> {
    status: 'active' | 'paused';
    state: T
}

type MachineState<T> = ActiveMachineState<T> | InactiveMachineState<T>

export class ScriptStateMachine<StateKey extends string> {
    private tape: Subject<Event<StateKey>> = new Subject<Event<StateKey>>();

    constructor(private stateRegistry: ScriptStateRegistry<StateKey>) {
        this.machineState$().subscribe(next => this.onMachineState(next));
    }

    private async onMachineState(next: MachineState<ScriptState<StateKey>>) {
        console.log(next.status, (next.status === 'active' || next.status === 'paused') ? next.state.name : null, next);
        if (next.status === 'active') {
            const state = next.state;
            try {
                this.nextState(await state.action())
            } catch(e) {
                this.nextState(state.onError(e))
            }
        }
    }

    start(state: DraftScriptState<StateKey>) {
        this.warmUpStream();
        this.nextState(this.stateRegistry.getState(state.name));
    }

    private nextState(state: ScriptState<StateKey> | Falsey) {
        if (state) {
            this.tape.next({type: 'change-state', state})
        } else {
            this.stop()
        }
    }

    pause() {
        this.tape.next({type: 'pause'})
    }

    resume() {
        this.tape.next({type: 'resume'})
    }

    stop() {
        this.tape.next({type: 'stop'})
    }

    private warmUpStream() {
        this.stop();
        this.stop();
    }

    private machineState$(): Observable<MachineState<ScriptState<StateKey>>> {
        return this.tape.pipe(
            bufferCount(2, 1),
            filter(removeInvalidTransitions),
            map(convertToPartialMachineState),
            bufferCount(2, 1),
            map(convertToMachineState)
        );

        function removeInvalidTransitions([{type: p}, {type: n}]: Event<StateKey>[]) {
            return ![
                ['pause', 'pause'],
                ['stop', 'pause'],
                ['resume', 'pause'],
                ['stop', 'resume'],
                ['resume', 'resume'],
                ['change-state', 'resume'],
                ['pause', 'change-state'],
            ].includes([p, n])
        }

        function convertToPartialMachineState([previous, current]: Event<StateKey>[]): MachineState<ScriptState<StateKey>> {
            switch (current.type) {
                case 'change-state':
                    return {
                        status: 'active',
                        state: current.state
                    };
                case 'pause':
                    return (previous.type === 'change-state')
                        ? {
                            status: 'paused',
                            state: previous.state
                        }
                        : {
                            status: 'stopped'
                        };
                case 'resume':
                    return {
                        status: 'resume'
                    };
            }

            return {
                status: 'stopped'
            };
        }

        function convertToMachineState(states: MachineState<ScriptState<StateKey>>[]): MachineState<ScriptState<StateKey>> {
            const [p, n]: MachineState<ScriptState<StateKey>>[] = states;
            return n.status === 'resume'
                ? {
                    status: 'active',
                    state: (p as ActiveMachineState<ScriptState<StateKey>>).state
                }
                : n;
        }
    }
}

