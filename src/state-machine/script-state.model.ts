
export type Falsey = undefined | null | void | 0 | false

export interface DraftScriptState<N extends string> {
    name: N;
    action: () => Promise<N | Falsey>
    onError?: (e: Error) => N,
}

export interface ScriptState<S extends string> {
    name: S;
    action: () => Promise<ScriptState<S> | Falsey>,
    onError: (e: Error) => ScriptState<S> | Falsey
}
