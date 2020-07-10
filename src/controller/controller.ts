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
    public events$: Observable<ButtonEventData>;

    private payload: Payload = new Payload();
    private port: ISerialPort;
    private eventEmitter: Subject<Payload>;

    constructor(private portPath: string) {
        const controllerRef = remote.getGlobal('portRef');
        if (controllerRef.current) {
            if (controllerRef.current.path === portPath) {
                this.port = controllerRef.current;
            } else {
                controllerRef.current.close();
                this.port = new SerialPort(portPath, {baudRate: 9600, autoOpen: true});
            }
        } else {
            this.port = new SerialPort(portPath, {baudRate: 9600, autoOpen: true});
            controllerRef.current = this.port
        }

        this.eventEmitter = new Subject();
        this.events$ = this.eventEmitter.asObservable().pipe(
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
        )
    }

    reset() {
        this.payload.reset();
        this.sendPayload();
    };

    private async sendPayloadAndReset(timeout = 250) {
        this.sendPayload();
        await asyncSleep(timeout);
        this.reset();
    }

    private sendPayload() {
        this.eventEmitter.next(this.payload);
        this.port.write(this.payload.asBytes());
        this.port.flush();
        this.port.read();
    }

    close() {
        this.port.close((err) => {
            console.log('close err:', err)
        });
    }

    home = Controller.repeatable((() => this.pressButton(Buttons.HOME)));
    capture = Controller.repeatable((() => this.pressButton(Buttons.CAPTURE)));
    a = Controller.repeatable((() => this.pressButton(Buttons.A)));
    b = Controller.repeatable((() => this.pressButton(Buttons.B)));
    x = Controller.repeatable((() => this.pressButton(Buttons.X)));
    y = Controller.repeatable((() => this.pressButton(Buttons.Y)));
    plus = Controller.repeatable((() => this.pressButton(Buttons.PLUS)));
    minus = Controller.repeatable((() => this.pressButton(Buttons.MINUS)));
    rClick = Controller.repeatable((() => this.pressButton(Buttons.RCLICK)));
    r = Controller.repeatable((() => this.pressButton(Buttons.R)));
    zr = Controller.repeatable((() => this.pressButton(Buttons.ZR)));
    lClick = Controller.repeatable((() => this.pressButton(Buttons.LCLICK)));
    l = Controller.repeatable((() => this.pressButton(Buttons.L)));
    zl = Controller.repeatable((() => this.pressButton(Buttons.ZL)));
    top = Controller.repeatable((() => this.applyDPad(HAT.TOP)));
    topRight = Controller.repeatable((() => this.applyDPad(HAT.TOP_RIGHT)));
    right = Controller.repeatable((() => this.applyDPad(HAT.RIGHT)));
    bottomRight = Controller.repeatable((() => this.applyDPad(HAT.BOTTOM_RIGHT)));
    bottom = Controller.repeatable((() => this.applyDPad(HAT.BOTTOM)));
    bottomLeft = Controller.repeatable((() => this.applyDPad(HAT.BOTTOM_LEFT)));
    left = Controller.repeatable((() => this.applyDPad(HAT.LEFT)));
    topLeft = Controller.repeatable((() => this.applyDPad(HAT.TOP_LEFT)));
    center = Controller.repeatable((() => this.applyDPad(HAT.CENTER)));

    async leftStick(x: number, y: number) {
        this.payload.leftStick[0] = x;
        this.payload.leftStick[1] = y;
        await this.sendPayload();
    }

    async rightStick(x: number, y: number) {
        this.payload.rightStick[0] = x;
        this.payload.rightStick[1] = y;
        await this.sendPayload();
    }

    private async applyDPad(button: HAT) {
        this.payload.hat = button;
        await this.sendPayloadAndReset()
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

    async pressButton(...buttons: Buttons[]) {
        for (const button of buttons) {
            this.payload.applyButton(button)
        }
        await this.sendPayloadAndReset();
    }

    transaction(fn: (c: Controller) => (Promise<void> | void)) {
        fn(this)
    }

    asBytes(): Buffer {
        return this.payload.asBytes();
    }
}

