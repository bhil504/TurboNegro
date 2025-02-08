export function enableTiltControls(scene, player) {
    let smoothedTilt = 0;
    const smoothingFactor = 0.25; // Slightly increased for better control

    window.addEventListener('deviceorientation', (event) => {
        const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
        if (!isStandalone) return; // Ensure tilt only works in standalone mode

        let tilt;
        const isLandscape = window.innerWidth > window.innerHeight;
        const isClockwise = window.orientation === 90;

        tilt = isLandscape ? event.beta : event.gamma;

        if (tilt !== null) {
            const maxTilt = isLandscape ? 30 : 90;
            const deadZone = 5;
            const baseVelocity = 340; // Slightly higher for a better feel
            const velocityMultiplier = isLandscape ? 1 : 1.8;
            const adjustedVelocity = baseVelocity * velocityMultiplier;

            tilt = Math.max(-maxTilt, Math.min(maxTilt, tilt));

            if (isLandscape && !isClockwise) {
                tilt = -tilt;
            }

            smoothedTilt += (tilt - smoothedTilt) * smoothingFactor;

            if (smoothedTilt > deadZone) {
                player.setVelocityX((smoothedTilt - deadZone) / (maxTilt - deadZone) * adjustedVelocity);
                player.setFlipX(false);
                if (player.anims.currentAnim?.key !== 'walk') player.play('walk', true);
            } else if (smoothedTilt < -deadZone) {
                player.setVelocityX((smoothedTilt + deadZone) / (maxTilt - deadZone) * adjustedVelocity);
                player.setFlipX(true);
                if (player.anims.currentAnim?.key !== 'walk') player.play('walk', true);
            } else {
                player.setVelocityX(0);
                if (player.anims.currentAnim?.key !== 'idle') player.play('idle', true);
            }
        }
    });
}

