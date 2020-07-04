import {Buttons, HAT, Stick} from "./buttons.model";

export class Payload {
    private leftStick: [number, number] = [0, 0];
    private rightStick: [number, number] = [0, 0];
    private hat = 0;
    private buttons = 0;

    private mutable_buffer: Buffer = new Buffer(7);

    constructor() {
        this.reset()
    }

    reset(): void {
        this.leftStick = [Stick.MID, Stick.MID];
        this.rightStick = [Stick.MID, Stick.MID];
        this.hat = HAT.CENTER;
        this.buttons = 0
    }

    asBytes(): Buffer {
        return Buffer.from([
            this.leftStick[0] & 0xFF,
            this.leftStick[1] & 0xFF,
            this.rightStick[0] & 0xFF,
            this.rightStick[1] & 0xFF,
            this.hat & 0xFF,
            this.buttons & 0xFF,
            (this.buttons >> 8) & 0xFF,
        ]);
    }

    applyButton(button: Buttons) {
        this.buttons |= button;
    }
}
