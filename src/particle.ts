export class Particle {
    private life: number = 1;
    private velocity = {
        x: (Math.random() - 0.5) * 8,
        y: (Math.random() - 4) * 4
    };

    constructor(
        public x: number,
        public y: number,
        public color: string,
        public size: number = 4
    ) {}

    getLife(): number {
        return this.life;
    }

    update(): boolean {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.velocity.y += 0.2; // gravity
        this.life -= 0.02;
        return this.life > 0;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}
