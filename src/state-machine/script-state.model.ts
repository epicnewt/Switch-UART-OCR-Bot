
export interface DraftScriptState<N extends string> {
    name: N;
    onError?: string,
    action: () => Promise<string>
}

export interface ScriptState {
    name: string;
    action: () => Promise<ScriptState | undefined>,
    onError?: () => ScriptState | undefined
}
