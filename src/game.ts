import { Tetromino, TetrominoType } from './tetromino.js';
import { AudioService } from './audio.js';
import { Particle } from './particle.js';

export class TetrisGame {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private board: number[][] = [];
    private currentPiece?: Tetromino;
    private score: number = 0;
    private gameOver: boolean = false;
    private audioService: AudioService;
    private particles: Particle[] = [];

    private readonly BLOCK_SIZE = 30;
    private readonly BOARD_WIDTH = 10;
    private readonly BOARD_HEIGHT = 20;

    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        this.audioService = new AudioService();
        
        this.canvas.width = this.BLOCK_SIZE * this.BOARD_WIDTH;
        this.canvas.height = this.BLOCK_SIZE * this.BOARD_HEIGHT;
        
        this.initBoard();
        this.setupEvents();
        this.spawnPiece();
        this.gameLoop();
    }

    private initBoard(): void {
        for (let i = 0; i < this.BOARD_HEIGHT; i++) {
            this.board[i] = new Array(this.BOARD_WIDTH).fill(0);
        }
    }

    private setupEvents(): void {
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;

            switch (e.key) {
                case 'ArrowLeft':
                    this.movePiece(-1, 0);
                    break;
                case 'ArrowRight':
                    this.movePiece(1, 0);
                    break;
                case 'ArrowDown':
                    this.movePiece(0, 1);
                    break;
                case 'ArrowUp':
                    this.rotatePiece();
                    break;
            }
        });
    }

    private spawnPiece(): void {
        const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
        const type = types[Math.floor(Math.random() * types.length)];
        this.currentPiece = new Tetromino(type, 4, 0);
        
        if (this.checkCollision()) {
            this.gameOver = true;
            this.audioService.play('gameOver');
        }
    }

    private checkCollision(): boolean {
        const shape = this.currentPiece!.getShape();
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardX = this.currentPiece!.x + x;
                    const boardY = this.currentPiece!.y + y;

                    if (boardX < 0 || boardX >= this.BOARD_WIDTH ||
                        boardY >= this.BOARD_HEIGHT ||
                        (boardY >= 0 && this.board[boardY][boardX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private movePiece(dx: number, dy: number): boolean {
        this.currentPiece!.x += dx;
        this.currentPiece!.y += dy;

        if (this.checkCollision()) {
            this.currentPiece!.x -= dx;
            this.currentPiece!.y -= dy;
            return false;
        }
        if (dx !== 0) this.audioService.play('move');
        return true;
    }

    private rotatePiece(): void {
        const shape = this.currentPiece!.rotate();
        if (this.checkCollision()) {
            // Undo rotation if it causes collision
            for (let i = 0; i < 3; i++) {
                this.currentPiece!.rotate();
            }
        } else {
            this.audioService.play('rotate');
        }
    }

    private mergePiece(): void {
        const shape = this.currentPiece!.getShape();
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardY = this.currentPiece!.y + y;
                    if (boardY >= 0) {
                        this.board[boardY][this.currentPiece!.x + x] = 1;
                    }
                }
            }
        }
        this.audioService.play('drop');
    }

    private createClearEffect(y: number): void {
        const colors = ['#fff', '#ff0', '#f0f'];
        for (let x = 0; x < this.BOARD_WIDTH; x++) {
            for (let i = 0; i < 5; i++) {
                const color = colors[Math.floor(Math.random() * colors.length)];
                this.particles.push(
                    new Particle(
                        x * this.BLOCK_SIZE,
                        y * this.BLOCK_SIZE,
                        color
                    )
                );
            }
        }
    }

    private clearLines(): void {
        let linesCleared = 0;
        for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell === 1)) {
                this.createClearEffect(y);
                this.board.splice(y, 1);
                this.board.unshift(new Array(this.BOARD_WIDTH).fill(0));
                this.score += 100;
                document.getElementById('score')!.textContent = this.score.toString();
                linesCleared++;
            }
        }
        if (linesCleared > 0) {
            this.audioService.play('clear');
        }
    }

    private drawBlock(x: number, y: number, color: string): void {
        const blockSize = this.BLOCK_SIZE - 1;
        const lightColor = this.adjustColor(color, 50);  // lighter
        const darkColor = this.adjustColor(color, -50);  // darker
        const borderWidth = 2;

        // Main block face
        this.ctx.fillStyle = color;
        this.ctx.fillRect(
            x * this.BLOCK_SIZE,
            y * this.BLOCK_SIZE,
            blockSize,
            blockSize
        );

        // Light edge (top, left)
        this.ctx.fillStyle = lightColor;
        this.ctx.beginPath();
        this.ctx.moveTo(x * this.BLOCK_SIZE, y * this.BLOCK_SIZE);
        this.ctx.lineTo((x * this.BLOCK_SIZE) + blockSize, y * this.BLOCK_SIZE);
        this.ctx.lineTo((x * this.BLOCK_SIZE) + blockSize - borderWidth, (y * this.BLOCK_SIZE) + borderWidth);
        this.ctx.lineTo((x * this.BLOCK_SIZE) + borderWidth, (y * this.BLOCK_SIZE) + borderWidth);
        this.ctx.lineTo((x * this.BLOCK_SIZE) + borderWidth, (y * this.BLOCK_SIZE) + blockSize - borderWidth);
        this.ctx.lineTo(x * this.BLOCK_SIZE, (y * this.BLOCK_SIZE) + blockSize);
        this.ctx.fill();

        // Dark edge (bottom, right)
        this.ctx.fillStyle = darkColor;
        this.ctx.beginPath();
        this.ctx.moveTo((x * this.BLOCK_SIZE) + blockSize, y * this.BLOCK_SIZE);
        this.ctx.lineTo((x * this.BLOCK_SIZE) + blockSize, (y * this.BLOCK_SIZE) + blockSize);
        this.ctx.lineTo(x * this.BLOCK_SIZE, (y * this.BLOCK_SIZE) + blockSize);
        this.ctx.lineTo((x * this.BLOCK_SIZE) + borderWidth, (y * this.BLOCK_SIZE) + blockSize - borderWidth);
        this.ctx.lineTo((x * this.BLOCK_SIZE) + blockSize - borderWidth, (y * this.BLOCK_SIZE) + blockSize - borderWidth);
        this.ctx.lineTo((x * this.BLOCK_SIZE) + blockSize - borderWidth, (y * this.BLOCK_SIZE) + borderWidth);
        this.ctx.fill();
    }

    private adjustColor(color: string, amount: number): string {
        const hex = color.replace('#', '');
        const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    private draw(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw board
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (this.board[y][x]) {
                    this.drawBlock(x, y, '#888');
                }
            }
        }

        // Draw current piece
        if (this.currentPiece) {
            const shape = this.currentPiece.getShape();
            const color = this.currentPiece.getColor();
            
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x]) {
                        this.drawBlock(
                            this.currentPiece.x + x,
                            this.currentPiece.y + y,
                            color
                        );
                    }
                }
            }
        }

        // Draw particles
        this.particles = this.particles.filter(particle => {
            particle.update();
            particle.draw(this.ctx);
            return particle.getLife() > 0;
        });

        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '30px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over', this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    private gameLoop(): void {
        let lastTime = 0;
        let dropCounter = 0;
        const dropInterval = 1000;

        const update = (time = 0) => {
            const deltaTime = time - lastTime;
            lastTime = time;

            dropCounter += deltaTime;
            if (dropCounter > dropInterval) {
                if (!this.movePiece(0, 1)) {
                    this.mergePiece();
                    this.clearLines();
                    this.spawnPiece();
                }
                dropCounter = 0;
            }

            this.draw();
            requestAnimationFrame(update);
        };

        update();
    }
}

new TetrisGame();
