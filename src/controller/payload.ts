import {Buttons, HAT, Stick} from './buttons.model';

export class Payload {
    leftStick: [number, number] = [0, 0];
    rightStick: [number, number] = [0, 0];
    hat = 0;
    buttons = 0;

    private mutableBuffer: Buffer = new Buffer(7);

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
        this.mutableBuffer[0] = this.leftStick[0] & 0xFF;
        this.mutableBuffer[1] = this.leftStick[1] & 0xFF;
        this.mutableBuffer[2] = this.rightStick[0] & 0xFF;
        this.mutableBuffer[3] = this.rightStick[1] & 0xFF;
        this.mutableBuffer[4] = this.hat & 0xFF;
        this.mutableBuffer[5] = this.buttons & 0xFF;
        this.mutableBuffer[6] = (this.buttons >> 8) & 0xFF;
        return this.mutableBuffer;
    }

    applyButton(button: Buttons) {
        this.buttons |= button;
    }
}
