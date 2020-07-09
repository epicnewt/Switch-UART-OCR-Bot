export type Colour = [number, number, number, number?] | Uint8ClampedArray
const colours: { [name: string]: Colour } = {
    'white': [255, 255, 255],
    'grey': [150, 150, 150],
    'black': [0, 0, 0],
    'red': [255, 0, 0],
    'green': [0, 255, 0],
    'blue': [0, 0, 255],
    'yellow': [255, 255, 0],
    'cyan': [100, 255, 255]
};

export type ColourName = keyof typeof colours;

function manhattan(x: Colour, y: Colour): number {
    return Math.abs(x[0] - y[0]) + Math.abs(x[1] - y[1]) + Math.abs(x[2] - y[2])
}

export function toMatrix(arr: number[], width: number) {
    const rows: number[][] = [];

    for (let i = 0; i < arr.length; i++) {
        if (i % width === 0) {
            rows.push([arr[i]])
        } else {
            rows[rows.length-1].push(arr[i])
        }
    }
}

export class ColourMatcher {
    static closestMatch(c: Colour): ColourName {
        const colourNames: ColourName[] = Object.keys(colours);
        return colourNames[
            colourNames
                .map((value: ColourName): [ColourName, number] => [value, manhattan(colours[value], c)])
                .reduce((previousMax, [key, distance], i, arr) => (arr[i][1] < arr[previousMax][1]) ? i : previousMax, 0)
        ];
    }
}
