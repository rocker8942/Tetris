export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export class Tetromino {
    private shapes: { [key in TetrominoType]: number[][] } = {
        'I': [[1, 1, 1, 1]],
        'O': [[1, 1], [1, 1]],
        'T': [[0, 1, 0], [1, 1, 1]],
        'S': [[0, 1, 1], [1, 1, 0]],
        'Z': [[1, 1, 0], [0, 1, 1]],
        'J': [[1, 0, 0], [1, 1, 1]],
        'L': [[0, 0, 1], [1, 1, 1]]
    };

    private colors: { [key in TetrominoType]: string } = {
        'I': '#00f0f0',
        'O': '#f0f000',
        'T': '#a000f0',
        'S': '#00f000',
        'Z': '#f00000',
        'J': '#0000f0',
        'L': '#f0a000'
    };

    constructor(
        public type: TetrominoType,
        public x: number = 0,
        public y: number = 0
    ) {}

    getShape(): number[][] {
        return this.shapes[this.type];
    }

    getColor(): string {
        return this.colors[this.type];
    }

    rotate(): number[][] {
        const shape = this.getShape();
        const newShape: number[][] = [];
        
        for (let i = 0; i < shape[0].length; i++) {
            newShape[i] = [];
            for (let j = shape.length - 1; j >= 0; j--) {
                newShape[i].push(shape[j][i]);
            }
        }
        
        this.shapes[this.type] = newShape;
        return newShape;
    }
}
