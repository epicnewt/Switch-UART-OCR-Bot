import {DraftScriptState} from '../script-state.model';
import {imageData, ScreenRect} from '../../video-stream/ocr-pipeline';
import {ColourMatcher, ColourName} from '../../video-stream/ColourMatcher';

const wildArea: {[name: string]: ScreenRect}= {
    connectionIndicator: [5/1012, 556/570, 1, 1],
};

export type HostRaidStates = 'start::host-raid' | 'check-internet-connection' | 'connect-to-the-internet' |
    'open-den' | 'invite-others' | 'exit'

export const hostRaidStates: DraftScriptState<HostRaidStates>[] = [{
    name: 'start::host-raid',
    action: async (): Promise<HostRaidStates> => 'check-internet-connection',
}, {
    name: 'check-internet-connection',
    action: async (): Promise<HostRaidStates> => {
        const connectionColour: ColourName = ColourMatcher.closestMatch(imageData(wildArea.connectionIndicator).data);
        if (connectionColour === 'white')
            return 'connect-to-the-internet';
        else if (connectionColour === 'blue')
            return 'open-den';
        throw new Error('Cannot determine internet connection status')
    }
}, {
    name: 'connect-to-the-internet',
    action: async () => {
        return 'exit'
    }
}, {
    name: 'open-den',
    action: async () => {
        return 'exit'
    }
}, {
    name: 'exit',
    action: async () => { return undefined }
}];
