import {DraftScriptState} from '../script-state.model';

const wildArea= {
    connectionIndicator: [5/1012, 556/570, 1, 1],
}


export const hostRaidStates: DraftScriptState[] = [{
    name: 'open-den',
    next: 'invite-others',
    action: async () => {


        return
    }
}, {
    name: 'invite-others',
    next: 'invite-others',
    action: async () => {
        return
    }
}];
