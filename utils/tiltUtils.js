export function enableTiltControls(scene, player) {
    let smoothedTilt = 0; // Smoothed tilt value for stabilization
    const smoothingFactor = 0.2; // Adjust for tilt responsiveness (higher is slower smoothing)

    window.addEventListener('deviceorientation', (event) => {
        let tilt;
        const isLandscape = window.orientation === 90 || window.orientation === -90;
        const isClockwise = window.orientation === 90; // Determine if in clockwise landscape mode

        // Use gamma for portrait and beta for landscape
        tilt = isLandscape ? event.beta : event.gamma;

        if (tilt !== null) {
            const maxTilt = isLandscape ? 20 : 90; // Normalize tilt ranges: beta (landscape) vs gamma (portrait)
            const deadZone = 6; // Dead zone for movement initiation
            const velocity = 320; // Match velocity for consistent gameplay feel

            // Clamp tilt values to ensure responsiveness within the defined range
            tilt = Math.max(-maxTilt, Math.min(maxTilt, tilt));

            // Reverse tilt for counterclockwise landscape mode
            if (isLandscape && !isClockwise) {
                tilt = -tilt;
            }

            // Apply smoothing to the tilt value
            smoothedTilt += (tilt - smoothedTilt) * smoothingFactor;

            // Handle movement logic based on smoothed tilt
            if (smoothedTilt > deadZone) {
                // Move right
                player.setVelocityX((smoothedTilt - deadZone) / (maxTilt - deadZone) * velocity);
                player.setFlipX(false);

                // Trigger animation only if it has changed
                if (player.anims.currentAnim?.key !== 'walk') {
                    player.play('walk', true);
                }
            } else if (smoothedTilt < -deadZone) {
                // Move left
                player.setVelocityX((smoothedTilt + deadZone) / (maxTilt - deadZone) * velocity);
                player.setFlipX(true);

                // Trigger animation only if it has changed
                if (player.anims.currentAnim?.key !== 'walk') {
                    player.play('walk', true);
                }
            } else {
                // Stay idle if tilt is within the dead zone
                player.setVelocityX(0);

                // Trigger animation only if it has changed
                if (player.anims.currentAnim?.key !== 'idle') {
                    player.play('idle', true);
                }
            }
        }
    });
}