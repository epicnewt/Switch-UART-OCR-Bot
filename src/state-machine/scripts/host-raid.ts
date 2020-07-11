import {DraftScriptState} from '../script-state.model';
import {imageData, recogniseText, ScreenRect} from '../../video-stream/ocr-pipeline';
import {ColourMatcher, ColourName} from '../../video-stream/colour-matcher';
import {Controller} from '../../controller/controller';
import {messagePublisher} from '../../messages/message-publisher';
import {uniq} from 'lodash-es';

const wildArea = {
    connectionIndicator: [5 / 1012, 556 / 570, 1, 1] as ScreenRect
};

const yComm = {
    header: [59 / 1067, 6 / 601, 187 / 1067, 37 / 601] as ScreenRect,
    prompt: [270 / 1067, 484 / 601, 529 / 1067, 77 / 601] as ScreenRect
};

const raidDen = {
    inviteOthers: [692 / 1067, 365 / 601, 306 / 1067, 33 / 601] as ScreenRect,
    readyToEnterCode: [95 / 1067, 34 / 601, 432 / 1067, 45 / 601] as ScreenRect,
    prompt: [251 / 979, 445 / 551, 478 / 979, 69 / 551] as ScreenRect,
    finalParticipant: [649 / 979, 322 / 551, 135 / 979, 18 / 551] as ScreenRect,
    readyToBattle: [634 / 979, 379 / 551, 285 / 979, 31 / 551] as ScreenRect,
    startMenu: [640 / 979, 393 / 551, 0 / 979, 0 / 551] as ScreenRect,
};

const battle = {
    run: [804 / 979, 501 / 551, 80 / 979, 32 / 551] as ScreenRect
};

const state = {
    code: '',
    start: -1
};

async function matchText(location: ScreenRect, pattern: RegExp | string, timeoutInSeconds = 30): Promise<void> {
    return new Promise((resolve, reject) => {
        const end = timeoutInSeconds * 1000 + Date.now();

        async function loop() {
            const text: string | undefined = (await recogniseText(location))?.text;
            const match = text?.match(pattern);

            if (match?.length) {
                resolve();
                return
            }

            if (Date.now() > end) {
                if (timeoutInSeconds > 0) {
                    console.error(`Timed out trying to match "${pattern}". Latest result "${text}"`);
                }
                reject(new Error(`Timed out trying to match "${pattern}". Latest result "${text}"`))
            } else {
                setTimeout(loop, 1000 / 15)
            }
        }

        setTimeout(loop, 0)
    })
}

function range(length: number) {
    return Array.from(Array(length).keys());
}

function toMatrix(data: Uint8ClampedArray): Uint8ClampedArray[] {
    return range(data.length / 4)
        .map(i => i * 4)
        .map(i => data.slice(i, i + 4));
}

async function matchColour(location: ScreenRect, colour: ColourName, timeoutInSeconds = 30): Promise<void> {
    return new Promise((resolve, reject) => {
        const end = timeoutInSeconds * 1000 + Date.now();

        async function loop() {
            const rawData = imageData(location).data;
            const matrix = toMatrix(rawData);
            const colours = matrix
                .map(c => ColourMatcher.closestMatch(c));

            const match = colours.find(c => c === colour);

            if (match) {
                resolve();
            } else if (Date.now() > end) {
                if (timeoutInSeconds > 0) {
                    console.error(`Timed out trying to match "${colour}". Latest result "${uniq(colours).join(',')}"`);
                }
                reject(new Error(`Timed out trying to match "${colour}". Latest result "${uniq(colours).join(',')}"`))
            } else {
                setTimeout(loop, 1000 / 15)
            }
        }

        setTimeout(loop, 0)
    })
}

async function delay(milliseconds: number) {
    return new Promise<void>(resolve => {
        setTimeout(() => resolve(), milliseconds)
    })
}

export type HostRaidStates =
    'start::host-raid'
    | 'check-internet-connection'
    | 'connect-to-the-internet'
    | 'open-den'
    | 'invite-others'
    | 'enter-code'
    | 'exit'
    | 'exit-ycomm'
    | 'enter-code::start'
    | 'enter-code::code'
    | 'enter-code::confirm'
    | 'wait-for-participants-1'
    | 'wait-for-participants-2'
    | 'wait-for-participants-to-be-ready'
    | 'get-ready-for-raid'
    | 'wait-for-battle-to-start'
    | 'pick-move'
    | 'wait-for-communication'
    | 'close-game'
    | 'open-profile'
    | 'open-friend-requests'
    | 'accept-friend-requests'
    | 'open-game'
    | 'wait-to-be-in-wild-area'

function asBool(promise: any): Promise<boolean> {
    return promise
        .then(() => true)
        .catch(() => false);
}

export const hostRaidStates: DraftScriptState<HostRaidStates>[] = [{
    name: 'start::host-raid',
    action: async (): Promise<HostRaidStates> => 'check-internet-connection',
    // action: async (): Promise<HostRaidStates> => 'open-game',
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
    action: async (): Promise<HostRaidStates> => {
        await Controller.y();
        await matchText(yComm.header, /y-comm/i);
        await Controller.plus();
        await matchText(yComm.prompt, /You.?re now connected to the internet/i, 40);
        await Controller.a();
        return 'exit-ycomm'
    },
    onError: () => 'connect-to-the-internet'
}, {
    name: 'exit-ycomm',
    action: async (): Promise<HostRaidStates> => {
        const connectionColour: ColourName = ColourMatcher.closestMatch(imageData(wildArea.connectionIndicator).data);
        if (connectionColour === 'blue')
            return 'open-den';
        await Controller.b();
        return 'exit-ycomm'
    }
}, {
    name: 'open-den',
    action: async (): Promise<HostRaidStates> => {
        await Controller.a();
        await matchText(raidDen.inviteOthers, /invite others/i, 10);
        return 'enter-code::start'
    },
    onError: () => 'open-den'
}, {
    name: 'enter-code::start',
    action: async (): Promise<HostRaidStates> => {
        await Controller.plus();
        await matchText(raidDen.readyToEnterCode, /link code/i, 10);
        return 'enter-code::code'
    },
    onError: e => 'enter-code::start'
}, {
    name: 'enter-code::code',
    action: async (): Promise<HostRaidStates> => {
        // TODO Add onResume for this state
        const num = () => `000${Math.random() % 10000}`.slice(-4);
        state.code = `${num()} ${num()}`;

        console.log('code:', state.code);

        const numbers = Array.from(`1${state.code.replace(' ', '')}`).map((n: string) => parseInt(n, undefined));

        for (let i = 1; i < numbers.length; i++) {
            const previousValue = numbers[i - 1];
            const currentValue = numbers[i];

            const sx = ((previousValue || 11) - 1) % 3;
            const sy = Math.floor(((previousValue || 11) - 1) / 3);
            const dx = sx - ((currentValue || 11) - 1) % 3;
            const dy = sy - Math.floor(((currentValue || 11) - 1) / 3);

            const x = (dx < 0) ? Controller.right : Controller.left;
            const y = (dy < 0) ? Controller.down : Controller.up;

            const repeat = async (direction: () => Promise<any>, times: number) => {
                if (times === 0) {
                    return
                }
                await direction();
                await delay(200);
                await repeat(direction, times - 1);
            };

            if (dy < 0) {
                await repeat(x, Math.abs(dx));
                await repeat(y, Math.abs(dy));
            } else {
                await repeat(y, Math.abs(dy));
                await repeat(x, Math.abs(dx));
            }
            await Controller.a();
            await delay(200);
        }

        return 'enter-code::confirm'
    },
    onError: e => 'enter-code::start'
}, {
    name: 'enter-code::confirm',
    action: async (): Promise<HostRaidStates> => {
        await Controller.plus();
        await matchText(raidDen.prompt, /correct link code/i);
        await Controller.a();
        await matchColour([497 / 979, 505 / 551, 1, 1], 'white');
        return 'invite-others'
    },
    onError: e => 'enter-code::start'
}, {
    name: 'invite-others',
    action: async (): Promise<HostRaidStates> => {
        await Controller.a();
        await matchText(raidDen.readyToBattle, /ready to battle/i, 10);
        return 'wait-for-participants-1'
    },
    onError: () => 'invite-others'
}, {
    name: 'wait-for-participants-1',
    action: async (): Promise<HostRaidStates> => {
        // const participants = async () => await Promise.all(Array.from(Array(3).keys()).map((async (i) => {
        //     return (await recogniseText([651/979, (238 + i * 44)/551, 134/979, 17/551])).text
        // })));
        state.start = Date.now();
        setTimeout(() => messagePublisher.publishPrivately(state.code));
        await matchText(raidDen.finalParticipant, /^\s+(?!\s*searching\s*)/i, 30);
        return 'wait-for-participants-to-be-ready'
    },
    onError: () => {
        setTimeout(() => messagePublisher.publishPublicly(state.code));
        return 'wait-for-participants-2'
    }
}, {
    name: 'wait-for-participants-2',
    action: async (): Promise<HostRaidStates> => {
        state.start = Date.now();
        await matchText(raidDen.finalParticipant, /^\s+(?!\s*searching\s*)/i, 10);
        return 'get-ready-for-raid'
    },
    onError: () => 'close-game'
}, {
    name: 'get-ready-for-raid',
    action: async (): Promise<HostRaidStates> => {
        await Controller.up();
        await Controller.a();
        return 'wait-for-participants-to-be-ready'
    }
}, {
    name: 'wait-for-participants-to-be-ready',
    action: async (): Promise<HostRaidStates> => {
        const secondsPassed = (Date.now() - state.start) / 1000;
        await matchColour(raidDen.startMenu, 'black', 3 * 60 - secondsPassed);
        await Controller.a();
        return 'wait-for-battle-to-start'
    },
    onError: () => 'wait-for-battle-to-start' // One person wasn't ready and the raid started
}, {
    name: 'wait-for-battle-to-start',
    action: async (): Promise<HostRaidStates> => {
        await matchText(battle.run, /run/i, 60);
        return 'pick-move'
    },
    onError: () => 'close-game'
}, {
    name: 'pick-move',
    action: async (): Promise<HostRaidStates> => {
        await Controller.a(40);
        return 'close-game'
    },
    onError: () => 'close-game'
}, {
    name: 'close-game',
    action: async (): Promise<HostRaidStates> => {
        await Controller.home();
        await matchText([663 / 979, 509 / 551, 138 / 979, 29 / 551], /close software/i, 10);
        await Controller.x();
        await matchText([532 / 979, 361 / 551, 200 / 979, 36 / 551], /close/i);
        await Controller.a();
        return 'open-profile'
    },
    onError: () => 'close-game'
}, {
    name: 'open-profile',
    action: async (): Promise<HostRaidStates> => {
        await Controller.up();
        await matchText([897 / 979, 511 / 551, 48 / 979, 26 / 551], /ok/i, 5);
        await Controller.a();
        return 'accept-friend-requests'
    },
    onError: () => 'open-profile'
}, {
    name: 'open-friend-requests',
    action: async (): Promise<HostRaidStates> => {
        await matchText([798 / 979, 508 / 551, 58 / 979, 27 / 551], /back/i);
        const selected: boolean[] = await Promise.all(
            range(5)
                .map(i => [48 / 979, (101 + i * 54) / 551, 9 / 979, 2] as ScreenRect)
                .map(c => asBool(matchColour(c, 'blue', -1)))
        );
        const selectedIndex = selected.indexOf(true);
        if (selectedIndex === -1) {
            return 'open-friend-requests'
        } else if (selectedIndex === 5) {
            await Controller.up();
        } else {
            for (let i = selectedIndex; i < 4; i++) {
                await Controller.down();
                await delay(200);
            }
            while (!await asBool(matchText([43/979, 20/551, 297/979, 37/551], /Received Friend Requests/i, -1))) {
                await Controller.a();
                await delay(200);
            }
        }
        await matchText([403 / 979, 110 / 551, 258 / 979, 35 / 551], /Received Friend Requests/i, 5);
        return 'accept-friend-requests';
    }
}, {
    name: 'accept-friend-requests',
    action: async (): Promise<HostRaidStates> => {
        const end = Date.now() + 60 * 1000;
        while (Date.now() < end && !await asBool(matchText([227/979, 263/551, 528/979, 28/551], /You have not received any friend requests at this time/i, -1))) {
            await Controller.a()
        }
        return 'open-game';
    }
}, {
    name: 'open-game',
    action: async (): Promise<HostRaidStates> => {
        await Controller.home();
        await matchText([888/979, 515/551, 48/979, 21/551], /start/i, 10);
        await Controller.a(7);
        await matchColour(wildArea.connectionIndicator, 'black', 30);
        await delay(5000);
        await matchColour([414/979, 511/551, 21/979, 20/551] , 'white', 30);
        await Controller.a(2);
        return 'wait-to-be-in-wild-area'
    },
    onError: () => 'open-game'
}, {
    name: 'wait-to-be-in-wild-area',
    action: async (): Promise<HostRaidStates> => {
        await matchColour(wildArea.connectionIndicator, 'white', 20);
        return 'start::host-raid'
    }
}, {
    name: 'exit',
    action: async () => {
        return undefined
    }
}];
