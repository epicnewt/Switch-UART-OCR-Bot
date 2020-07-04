import {Buttons, HAT, Stick} from "./buttons.model";

export class Payload {
    leftStick: [number, number] = [0, 0];
    rightStick: [number, number] = [0, 0];
    hat = 0;
    buttons = 0;

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
        this.mutable_buffer[0] = this.leftStick[0] & 0xFF;
        this.mutable_buffer[1] = this.leftStick[1] & 0xFF;
        this.mutable_buffer[2] = this.rightStick[0] & 0xFF;
        this.mutable_buffer[3] = this.rightStick[1] & 0xFF;
        this.mutable_buffer[4] = this.hat & 0xFF;
        this.mutable_buffer[5] = this.buttons & 0xFF;
        this.mutable_buffer[6] = (this.buttons >> 8) & 0xFF;
        return this.mutable_buffer;
    }

    applyButton(button: Buttons) {
        this.buttons |= button;
    }
}
