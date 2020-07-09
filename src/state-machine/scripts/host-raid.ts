import {DraftScriptState} from '../script-state.model';

const wildArea= {
    connectionIndicator: [5/1012, 556/570, 1, 1],
};

type HostRaidStates = 'check-internet-connection' | 'connect-to-the-internet' |
    'open-den' | 'invite-others'

export const hostRaidStates: DraftScriptState<HostRaidStates>[] = [{
    name: 'check-internet-connection',
    action: async () => {

        return 'connect-to-the-internet'
    }
}, {
    name: 'connect-to-the-internet',
    action: async () => {
        return 'connect-to-the-internet'
    }
}];
