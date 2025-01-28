import { setupJoystick } from './joystickUtils.js';
import { enableTiltControls } from './tiltUtils.js';

export function setupMobileControls(player, config = {}) {
    const joystick = setupJoystick(player);
    const tilt = enableTiltControls(player, config);

    const updatePlayerMovement = () => {
        const joystickForce = joystick.getForce(); // { x: joystickForceX, y: joystickForceY }
        const tiltForceX = tilt.getForce(); // Tilt force on X-axis

        let finalForceX = 0;

        // Check for conflict (opposite directions)
        if (joystickForce.x * tiltForceX < 0) {
            // Opposite directions: use only tilt
            finalForceX = tiltForceX;
        } else {
            // Same direction or no conflict: combine forces
            const boostMultiplier = joystickForce.x !== 0 && tiltForceX !== 0 ? 1.2 : 1; // Boost if both are active
            finalForceX = (joystickForce.x + tiltForceX * 0.001) * boostMultiplier; // Scale tilt appropriately
        }

        // Apply movement to the player
        player.setVelocityX(finalForceX);

        // Handle animations
        if (finalForceX > 0) {
            player.setFlipX(false);
            player.play('walk', true);
        } else if (finalForceX < 0) {
            player.setFlipX(true);
            player.play('walk', true);
        } else {
            player.play('idle', true);
        }

        // Jump handling from joystick
        if (joystickForce.y < -0.5 && player.body.touching.down) {
            player.setVelocityY(-500); // Jump
        }
    };

    setInterval(updatePlayerMovement, 16); // Update movement every frame (60 FPS)

    return () => {
        tilt.cleanup();
        clearInterval(updatePlayerMovement);
    };
}
