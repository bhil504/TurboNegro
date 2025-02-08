export function setupJoystick(scene, player) {
    const joystickArea = document.getElementById('joystick-area');
    let joystickKnob = document.getElementById('joystick-knob');

    if (!joystickKnob) {
        joystickKnob = document.createElement('div');
        joystickKnob.id = 'joystick-knob';
        joystickArea.appendChild(joystickKnob);
    }

    let joystickStartX = 0;
    let joystickStartY = 0;
    let activeInterval;

    joystickArea.addEventListener('touchstart', (event) => {
        const touch = event.touches[0];
        joystickStartX = touch.clientX;
        joystickStartY = touch.clientY;
        joystickKnob.style.transform = `translate(-50%, -50%)`;

        scene.isUsingJoystick = true; // Ensure other inputs are ignored

        activeInterval = setInterval(() => {
            applyJoystickForce(scene, player);
        }, 16); // Run every ~16ms (60 FPS)
    });

    joystickArea.addEventListener('touchmove', (event) => {
        const touch = event.touches[0];
        const deltaX = touch.clientX - joystickStartX;
        const deltaY = touch.clientY - joystickStartY;

        const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
        const maxDistance = 50; // Joystick radius limit

        const clampedX = (deltaX / distance) * Math.min(distance, maxDistance);
        const clampedY = (deltaY / distance) * Math.min(distance, maxDistance);

        joystickKnob.style.transform = `translate(calc(${clampedX}px - 50%), calc(${clampedY}px - 50%))`;

        scene.joystickForceX = clampedX / maxDistance;
        scene.joystickForceY = clampedY / maxDistance;
    });

    joystickArea.addEventListener('touchend', () => {
        joystickKnob.style.transform = `translate(-50%, -50%)`;
        scene.joystickForceX = 0;
        scene.joystickForceY = 0;
        scene.isUsingJoystick = false;

        if (player.body.touching.down) {
            player.anims.play('idle', true);
        }

        clearInterval(activeInterval);
    });

    // Ensure joystick input is properly reset
    scene.joystickForceX = 0;
    scene.joystickForceY = 0;
}

export function applyJoystickForce(scene, player) {
    if (!player || !player.body) return;

    // Tilt is the base movement speed
    let totalForceX = scene.smoothedTilt * 160;

    // Joystick adds speed ONLY if it's pointing in the same direction as tilt
    if (scene.isUsingJoystick) {
        if (
            (scene.smoothedTilt >= 0 && scene.joystickForceX >= 0) || 
            (scene.smoothedTilt <= 0 && scene.joystickForceX <= 0)
        ) {
            totalForceX += scene.joystickForceX * 80; // Boost speed if moving in the same direction
        }
    }

    player.setVelocityX(totalForceX);

    // Handle animations based on movement
    if (player.body.touching.down) {
        if (totalForceX > 0) {
            player.setFlipX(false);
            player.anims.play('walk', true);
        } else if (totalForceX < 0) {
            player.setFlipX(true);
            player.anims.play('walk', true);
        } else {
            player.anims.play('idle', true);
        }
    } else {
        player.anims.play('jump', true);
    }

    // Joystick jump logic
    if (scene.joystickForceY < -0.5 && player.body.touching.down) {
        player.setVelocityY(-500);
        player.anims.play('jump', true);
    }
}
