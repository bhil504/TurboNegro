export function enableTiltControls() {
    window.addEventListener('deviceorientation', (event) => {
        const tilt = event.gamma; // Side-to-side tilt
        if (tilt !== null) {
            if (tilt > 8) {
                this.player.setVelocityX(160);
                this.player.setFlipX(false);
                this.player.play('walk', true);
            } else if (tilt < -8) {
                this.player.setVelocityX(-160);
                this.player.setFlipX(true);
                this.player.play('walk', true);
            } else {
                this.player.setVelocityX(0);
                this.player.play('idle', true);
            }
        }
    });
}

