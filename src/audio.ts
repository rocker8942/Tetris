export class AudioService {
    private sounds: { [key: string]: HTMLAudioElement } = {};

    constructor() {
        this.sounds = {
            rotate: new Audio('sounds/rotate.wav'),
            move: new Audio('sounds/move.wav'),
            drop: new Audio('sounds/drop.wav'),
            clear: new Audio('sounds/clear.wav'),
            gameOver: new Audio('sounds/gameover.wav')
        };

        // Preload all sounds
        Object.values(this.sounds).forEach(audio => {
            audio.load();
        });
    }

    play(soundName: keyof typeof this.sounds): void {
        const sound = this.sounds[soundName];
        if (sound) {
            sound.currentTime = 0; // Reset the audio to start
            sound.play().catch(e => console.log('Audio play failed:', e));
        }
    }
}
