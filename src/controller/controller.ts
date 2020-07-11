import {Payload} from './payload';
import {Buttons, HAT} from './buttons.model'
import ISerialPort from 'serialport';
import {Observable, Subject} from 'rxjs';
import {map, share} from 'rxjs/operators';


// @ts-ignore
const remote = Electron.remote;
const SerialPort = remote.require('serialport');

async function asyncSleep(milliseconds: number) {
    const end = performance.now() + milliseconds;
    return new Promise<void>(resolve => {
        function check(now: number) {
            if (now <= end) {
                requestAnimationFrame(check);
            } else {
                resolve();
            }
        }

        requestAnimationFrame(check)
    })
}

export interface ButtonEventData {
    leftStick: [number, number];
    rightStick: [number, number];
    a: boolean;
    b: boolean;
    x: boolean;
    y: boolean;
    plus: boolean;
    minus: boolean;
    r: boolean;
    zr: boolean;
    l: boolean;
    zl: boolean;
    lClick: boolean;
    rClick: boolean;
    home: boolean;
    capture: boolean;
    dpad: Record<'up' | 'down' | 'right' | 'left', boolean>
}


export class Controller {
    private static eventEmitter: Subject<Payload> = new Subject();
    public static events$: Observable<ButtonEventData> = Controller.eventEmitter.asObservable().pipe(
        map(data => ({
            leftStick: data.leftStick,
            rightStick: data.rightStick,
            dpad: {
                up: [HAT.TOP, HAT.TOP_LEFT, HAT.TOP_RIGHT].includes(data.hat),
                left: [HAT.LEFT, HAT.TOP_LEFT, HAT.BOTTOM_LEFT].includes(data.hat),
                right: [HAT.RIGHT, HAT.TOP_RIGHT, HAT.BOTTOM_RIGHT].includes(data.hat),
                down: [HAT.BOTTOM, HAT.BOTTOM_RIGHT, HAT.BOTTOM_LEFT].includes(data.hat)
            },
            a: !!(data.buttons & Buttons.A),
            b: !!(data.buttons & Buttons.B),
            x: !!(data.buttons & Buttons.X),
            y: !!(data.buttons & Buttons.Y),
            plus: !!(data.buttons & Buttons.PLUS),
            minus: !!(data.buttons & Buttons.MINUS),
            r: !!(data.buttons & Buttons.R),
            zr: !!(data.buttons & Buttons.ZR),
            l: !!(data.buttons & Buttons.L),
            zl: !!(data.buttons & Buttons.ZL),
            lClick: !!(data.buttons & Buttons.LCLICK),
            rClick: !!(data.buttons & Buttons.RCLICK),
            home: !!(data.buttons & Buttons.HOME),
            capture: !!(data.buttons & Buttons.CAPTURE),
        })),
        share()
    );
    private static payload: Payload = new Payload();
    private static port: ISerialPort;

    static connect(portPath: string) {
        const controllerRef = remote.getGlobal('portRef');
        if (controllerRef.current) {
            if (controllerRef.current.path === portPath) {
                Controller.port = controllerRef.current;
            } else {
                controllerRef.current.close();
                Controller.port = new SerialPort(portPath, {baudRate: 9600, autoOpen: true});
            }
        } else {
            Controller.port = new SerialPort(portPath, {baudRate: 9600, autoOpen: true});
            controllerRef.current = Controller.port
        }
    }

    static reset() {
        Controller.payload.reset();
        Controller.sendPayload();
    };

    private static async sendPayloadAndReset(timeout = 230) {
        Controller.sendPayload();
        await asyncSleep(timeout);
        Controller.reset();
    }

    private static sendPayload() {
        Controller.eventEmitter.next(Controller.payload);
        Controller.port.write(Controller.payload.asBytes());
        Controller.port.flush();
        Controller.port.read();
    }

    static close() {
        Controller.port.close((err) => {
            console.log('close err:', err)
        });
    }

    static home = Controller.repeatable((() => Controller.pressButton(Buttons.HOME)));
    static capture = Controller.repeatable((() => Controller.pressButton(Buttons.CAPTURE)));
    static a = Controller.repeatable((() => Controller.pressButton(Buttons.A)));
    static b = Controller.repeatable((() => Controller.pressButton(Buttons.B)));
    static x = Controller.repeatable((() => Controller.pressButton(Buttons.X)));
    static y = Controller.repeatable((() => Controller.pressButton(Buttons.Y)));
    static plus = Controller.repeatable((() => Controller.pressButton(Buttons.PLUS)));
    static minus = Controller.repeatable((() => Controller.pressButton(Buttons.MINUS)));
    static rClick = Controller.repeatable((() => Controller.pressButton(Buttons.RCLICK)));
    static r = Controller.repeatable((() => Controller.pressButton(Buttons.R)));
    static zr = Controller.repeatable((() => Controller.pressButton(Buttons.ZR)));
    static lClick = Controller.repeatable((() => Controller.pressButton(Buttons.LCLICK)));
    static l = Controller.repeatable((() => Controller.pressButton(Buttons.L)));
    static zl = Controller.repeatable((() => Controller.pressButton(Buttons.ZL)));
    static up = Controller.repeatable((() => Controller.applyDPad(HAT.TOP)));
    static upRight = Controller.repeatable((() => Controller.applyDPad(HAT.TOP_RIGHT)));
    static right = Controller.repeatable((() => Controller.applyDPad(HAT.RIGHT)));
    static downRight = Controller.repeatable((() => Controller.applyDPad(HAT.BOTTOM_RIGHT)));
    static down = Controller.repeatable((() => Controller.applyDPad(HAT.BOTTOM)));
    static downLeft = Controller.repeatable((() => Controller.applyDPad(HAT.BOTTOM_LEFT)));
    static left = Controller.repeatable((() => Controller.applyDPad(HAT.LEFT)));
    static upLeft = Controller.repeatable((() => Controller.applyDPad(HAT.TOP_LEFT)));
    static center = Controller.repeatable((() => Controller.applyDPad(HAT.CENTER)));

    static async leftStick(x: number, y: number) {
        Controller.payload.leftStick[0] = x;
        Controller.payload.leftStick[1] = y;
        await Controller.sendPayload();
    }

    static async rightStick(x: number, y: number) {
        Controller.payload.rightStick[0] = x;
        Controller.payload.rightStick[1] = y;
        await Controller.sendPayload();
    }

    private static async applyDPad(button: HAT) {
        Controller.payload.hat = button;
        await Controller.sendPayloadAndReset()
    }

    private static repeatable(action: () => Promise<any>): (times?: number) => Promise<any> {
        return async function repeat(times = 1) {
            await action();
            for (let i = 1; i < times; i++) {
                await asyncSleep(4 / 60);
                await action();
            }
        };
    }

    static async pressButton(...buttons: Buttons[]) {
        for (const button of buttons) {
            Controller.payload.applyButton(button)
        }
        await Controller.sendPayloadAndReset();
    }

    static transaction(fn: (c: Controller) => (Promise<void> | void)) {
        fn(this)
    }

    static asBytes(): Buffer {
        return Controller.payload.asBytes();
    }
}

