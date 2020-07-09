export enum Buttons {
    Y = 0x01,
    B = 0x02,
    A = 0x04,
    X = 0x08,
    L = 0x10,
    R = 0x20,
    ZL = 0x40,
    ZR = 0x80,
    MINUS = 0x100,
    PLUS = 0x200,
    LCLICK = 0x400,
    RCLICK = 0x800,
    HOME = 0x1000,
    CAPTURE = 0x2000
}

export enum HAT {
    TOP = 0x00,
    TOP_RIGHT = 0x01,
    RIGHT = 0x02,
    BOTTOM_RIGHT = 0x03,
    BOTTOM = 0x04,
    BOTTOM_LEFT = 0x05,
    LEFT = 0x06,
    TOP_LEFT = 0x07,
    CENTER = 0x08
}

export enum Stick {
    MIN = 0,
    MID = 128,
    MAX = 255
}
