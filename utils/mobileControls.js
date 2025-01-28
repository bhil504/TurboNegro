import { setupJoystick } from './joystickUtils.js';
import { enableTiltControls } from './tiltUtils.js';

export function setupMobileControls(player, config = {}) {
    // Initialize joystick and tilt controls
    const joystick = setupJoystick(player);
    const tilt = enableTiltControls(player, config);

    if (!joystick || !tilt) {
        console.error("Joystick or tilt controls failed to initialize.");
        return () => {}; // Return a no-op cleanup function
    }

    const updatePlayerMovement = () => {
        const joystickForce = joystick.getForce ? joystick.getForce() : { x: 0, y: 0 }; // Safely get joystick force
        const tiltForce = tilt.getForce ? tilt.getForce() : { x: 0, y: 0 }; // Safely get tilt force

        let finalForceX = 0;

        // Combine joystick and tilt forces
        if (joystickForce.x * tiltForce.x < 0) {
            // Opposite directions: prioritize tilt
            finalForceX = tiltForce.x;
        } else {
            // Same direction or no conflict: combine forces
            const boostMultiplier = joystickForce.x !== 0 && tiltForce.x !== 0 ? 1.2 : 1; // Boost if both active
            finalForceX = (joystickForce.x + tiltForce.x * 0.001) * boostMultiplier; // Scale tilt appropriately
        }

        // Apply horizontal movement to the player
        player.setVelocityX(finalForceX * config.velocity);

        // Handle animations
        if (finalForceX > 0) {
            player.setFlipX(false);
            if (player.body.touching.down) player.play('walk', true);
        } else if (finalForceX < 0) {
            player.setFlipX(true);
            if (player.body.touching.down) player.play('walk', true);
        } else if (player.body.touching.down) {
            player.play('idle', true);
        }

        // Handle jumping (joystick only)
        if (joystickForce.y < -0.5 && player.body.touching.down) {
            player.setVelocityY(-500); // Jump
            player.play('jump', true);
        }
    };

    // Update movement every frame (60 FPS)
    const movementInterval = setInterval(updatePlayerMovement, 16);

    // Return cleanup function to remove listeners and stop intervals
    return () => {
        clearInterval(movementInterval);
        if (joystick.cleanup) joystick.cleanup();
        if (tilt.cleanup) tilt.cleanup();
    };
}

