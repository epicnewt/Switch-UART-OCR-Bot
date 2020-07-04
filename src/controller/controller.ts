import {Payload} from "./payload";
import {Buttons, HAT} from './buttons.model'
import ISerialPort from "serialport";
import {Observable, Subject} from "rxjs";
import {map, share} from "rxjs/operators";

const SerialPort = Electron.remote.require('serialport');

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
    dpad: HAT
}

export class Controller {
    public events$: Observable<ButtonEventData>;

    private payload: Payload = new Payload();
    private port: ISerialPort;
    private eventEmitter: Subject<Payload>;

    constructor(private portPath: string) {
        this.port = new SerialPort(portPath, {baudRate: 9600, autoOpen: true});
        this.eventEmitter = new Subject();
        this.events$ = this.eventEmitter.asObservable().pipe(
            map(data => ({
                leftStick: data.leftStick,
                rightStick: data.rightStick,
                dpad: data.hat,
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

    private async sendPayloadAndReset(timeout = 500/15) {
        async function sleep(milliseconds: number) {
            const end = new Date().getTime() + milliseconds;
            while (new Date().getTime() <= end);
        }

        const reset = () => {
            this.payload.reset();
            this.sendPayload();
        };

        this.sendPayload();
        await sleep(timeout);
        reset();
    }

    private sendPayload() {
        this.eventEmitter.next(this.payload);
        this.port.write(this.payload.asBytes());
        this.port.flush();
    }

    close() {
        this.port.close((err) => {
            console.log('close err:', err)
        });
    }

    async a() {
        await this.pressButton(Buttons.A);
    }

    async b() {
        await this.pressButton(Buttons.B);
    }

    async x() {
        await this.pressButton(Buttons.X);
    }

    async y() {
        await this.pressButton(Buttons.Y);
    }

    async plus() {
        await this.pressButton(Buttons.PLUS);
    }

    async minus() {
        await this.pressButton(Buttons.MINUS);
    }

    async r() {
        await this.pressButton(Buttons.R);
    }

    async zr() {
        await this.pressButton(Buttons.ZR);
    }

    async l() {
        await this.pressButton(Buttons.L);
    }

    async zl() {
        await this.pressButton(Buttons.ZL);
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

