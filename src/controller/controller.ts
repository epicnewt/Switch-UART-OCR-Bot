import {Payload} from "./payload";
import {Buttons} from './buttons.model'
import ISerialPort from "serialport";
import {timeInterval, timeout} from "rxjs/operators";

const SerialPort = Electron.remote.require('serialport');

export class Controller {
    private payload: Payload = new Payload();
    private port: ISerialPort;

    constructor(private portPath: string) {
        this.port = new SerialPort(portPath, {baudRate: 9600, autoOpen: false});
        this.port.open((err) => {
            console.log('open err:', err)
        });
        console.log('isOpen', this.port.isOpen);
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
        this.port.write(this.payload.asBytes());
        this.port.flush();
    }

    close() {
        this.port.close((err) => {
            console.log('close err:', err)
        });
    }

    async a() {
        this.pressButton(Buttons.A);
        await this.sendPayloadAndReset();
    }

    async b() {
        this.pressButton(Buttons.B);
        await this.sendPayloadAndReset();
    }

    async x() {
        this.pressButton(Buttons.X);
        await this.sendPayloadAndReset();
    }

    async y() {
        this.pressButton(Buttons.Y);
        await this.sendPayloadAndReset();
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

