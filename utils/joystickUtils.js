export function setupJoystick(player) {
    const joystickArea = document.getElementById('joystick-area');
    const joystickKnob = document.getElementById('joystick-knob');

    if (!joystickArea || !joystickKnob) {
        console.error("Joystick elements not found in the DOM.");
        return;
    }

    let joystickStartX = 0;
    let joystickStartY = 0;
    let joystickForceX = 0;
    let joystickForceY = 0;
    let activeInterval;

    joystickArea.addEventListener('touchstart', (event) => {
        const touch = event.touches[0];
        joystickStartX = touch.clientX;
        joystickStartY = touch.clientY;

        joystickKnob.style.transform = `translate(-50%, -50%)`; // Reset to center

        activeInterval = setInterval(() => applyJoystickForce(player, joystickForceX, joystickForceY), 16);
    });

    joystickArea.addEventListener('touchmove', (event) => {
        const touch = event.touches[0];
        const deltaX = touch.clientX - joystickStartX;
        const deltaY = touch.clientY - joystickStartY;

        const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
        const maxDistance = 50;

        const clampedX = (deltaX / distance) * Math.min(distance, maxDistance);
        const clampedY = (deltaY / distance) * Math.min(distance, maxDistance);

        joystickKnob.style.transform = `translate(calc(${clampedX}px - 50%), calc(${clampedY}px - 50%))`;

        joystickForceX = clampedX / maxDistance;
        joystickForceY = clampedY / maxDistance;
    });

    joystickArea.addEventListener('touchend', () => {
        joystickKnob.style.transform = `translate(-50%, -50%)`;
        joystickForceX = 0;
        joystickForceY = 0;

        if (player) {
            player.setVelocityX(0);
            player.anims.play('idle', true);
        }

        clearInterval(activeInterval);
    });
}

function applyJoystickForce(player, forceX, forceY) {
    if (!player) return;

    const velocityMultiplier = 160;
    player.setVelocityX(forceX * velocityMultiplier);

    if (forceX > 0) player.setFlipX(false);
    if (forceX < 0) player.setFlipX(true);

    if (forceY < -0.5 && player.body.touching.down) {
        player.setVelocityY(-500); // Jump
    }

    if (Math.abs(forceX) > 0.1 && player.body.touching.down) {
        player.play('walk', true);
    } else if (player.body.touching.down) {
        player.play('idle', true);
    }
}
