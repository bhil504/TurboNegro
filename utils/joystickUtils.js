function setupJoystick(player) {
    const joystickArea = document.getElementById('joystick-area');
    const joystickKnob = document.getElementById('joystick-knob');

    if (!joystickArea || !joystickKnob) {
        console.error("Joystick elements not found in the DOM.");
        return null;
    }

    let joystickForceX = 0;
    let joystickForceY = 0;
    let isActive = false;

    const maxDistance = 50; // Maximum distance for the joystick knob to move

    const updatePlayerMovement = () => {
        if (player) {
            const velocityX = joystickForceX * 160; // Adjust sensitivity as needed
            player.setVelocityX(velocityX);

            if (velocityX > 0) {
                player.setFlipX(false);
                if (player.body.touching.down) player.play('walk', true);
            } else if (velocityX < 0) {
                player.setFlipX(true);
                if (player.body.touching.down) player.play('walk', true);
            } else if (player.body.touching.down) {
                player.play('idle', true);
            }

            if (joystickForceY < -0.5 && player.body.touching.down) {
                player.setVelocityY(-500); // Jump
                player.play('jump', true);
            }
        }
    };

    const calculateJoystickForces = (touch) => {
        const rect = joystickArea.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = touch.clientX - centerX;
        const deltaY = touch.clientY - centerY;
        const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

        const clampedX = (deltaX / distance) * Math.min(distance, maxDistance);
        const clampedY = (deltaY / distance) * Math.min(distance, maxDistance);

        joystickForceX = clampedX / maxDistance;
        joystickForceY = clampedY / maxDistance;

        joystickKnob.style.transform = `translate(calc(${clampedX}px - 50%), calc(${clampedY}px - 50%))`;
    };

    const handleTouchStart = (event) => {
        isActive = true;
        calculateJoystickForces(event.touches[0]);
        updatePlayerMovement();
    };

    const handleTouchMove = (event) => {
        if (!isActive) return;
        calculateJoystickForces(event.touches[0]);
        updatePlayerMovement();
    };

    const handleTouchEnd = () => {
        isActive = false;
        joystickForceX = 0;
        joystickForceY = 0;
        joystickKnob.style.transform = `translate(-50%, -50%)`;

        if (player) {
            player.setVelocityX(0);
            if (player.body.touching.down) player.play('idle', true);
        }
    };

    joystickArea.addEventListener('touchstart', handleTouchStart);
    joystickArea.addEventListener('touchmove', handleTouchMove);
    joystickArea.addEventListener('touchend', handleTouchEnd);

    // Cleanup function to remove event listeners
    return () => {
        joystickArea.removeEventListener('touchstart', handleTouchStart);
        joystickArea.removeEventListener('touchmove', handleTouchMove);
        joystickArea.removeEventListener('touchend', handleTouchEnd);
    };
}


export function integrateControls(player, config = {}) {
    const joystickCleanup = setupJoystick(player);
    const tiltCleanup = enableTiltControls(player, config);

    let animationFrameId;

    const updatePlayerMovement = () => {
        if (joystickCleanup) {
            const joystickForce = {
                x: joystickForceX,
                y: joystickForceY,
            }; // { x, y }

            // Apply joystick force
            if (joystickForce.x !== 0) {
                player.setVelocityX(joystickForce.x * 320);
                player.setFlipX(joystickForce.x < 0);
                if (player.body.touching.down) player.play('walk', true);
            } else {
                player.setVelocityX(0);
                if (player.body.touching.down) player.play('idle', true);
            }

            // Handle jump
            if (joystickForce.y < -0.5 && player.body.touching.down) {
                player.setVelocityY(-500); // Jump
            }
        }

        animationFrameId = requestAnimationFrame(updatePlayerMovement);
    };

    animationFrameId = requestAnimationFrame(updatePlayerMovement);

    return () => {
        cancelAnimationFrame(animationFrameId);
        if (joystickCleanup) joystickCleanup();
        if (tiltCleanup) tiltCleanup();
    };
}


