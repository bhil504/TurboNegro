export function enableTiltControls(player, config = {}) {
    const {
        smoothingFactor = 0.2,
        deadZone = 6,
        maxTiltPortrait = 90,
        maxTiltLandscape = 20,
        velocity = 320,
    } = config;

    let smoothedTilt = 0;

    const tiltHandler = (event) => {
        let tilt;
        const isLandscape = window.orientation === 90 || window.orientation === -90;
        const isClockwise = window.orientation === 90;

        // Use gamma for portrait, beta for landscape
        tilt = isLandscape ? event.beta : event.gamma;

        if (tilt !== null) {
            const maxTilt = isLandscape ? maxTiltLandscape : maxTiltPortrait;

            // Normalize and clamp tilt values
            tilt = Math.max(-maxTilt, Math.min(maxTilt, tilt));

            // Reverse tilt for counterclockwise landscape mode
            if (isLandscape && !isClockwise) {
                tilt = -tilt;
            }

            // Apply smoothing
            smoothedTilt += (tilt - smoothedTilt) * smoothingFactor;

            // Movement logic
            if (smoothedTilt > deadZone) {
                player.setVelocityX(((smoothedTilt - deadZone) / (maxTilt - deadZone)) * velocity);
                player.setFlipX(false);
                if (player.anims.currentAnim?.key !== 'walk') player.play('walk', true);
            } else if (smoothedTilt < -deadZone) {
                player.setVelocityX(((smoothedTilt + deadZone) / (maxTilt - deadZone)) * velocity);
                player.setFlipX(true);
                if (player.anims.currentAnim?.key !== 'walk') player.play('walk', true);
            } else {
                player.setVelocityX(0);
                if (player.anims.currentAnim?.key !== 'idle') player.play('idle', true);
            }
        }
    };

    window.addEventListener('deviceorientation', tiltHandler);

    return () => {
        window.removeEventListener('deviceorientation', tiltHandler);
    };
}
