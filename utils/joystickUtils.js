// joystickUtils.js
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

    joystickArea.addEventListener('touchstart', (event) => {
        const touch = event.touches[0];
        joystickStartX = touch.clientX;
        joystickStartY = touch.clientY;

        joystickKnob.style.transform = `translate(-50%, -50%)`;

        // Save interval to apply joystick force
        scene.joystickInterval = setInterval(() => applyJoystickForce(scene, player), 16); // ~60 FPS
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

        // Save forces to the scene
        scene.joystickForceX = clampedX / maxDistance;
        scene.joystickForceY = clampedY / maxDistance;
    });

    joystickArea.addEventListener('touchend', () => {
        joystickKnob.style.transform = `translate(-50%, -50%)`;
        scene.joystickForceX = 0;
        scene.joystickForceY = 0;

        player.setVelocityX(0);
        player.play('idle', true);

        clearInterval(scene.joystickInterval);
    });

    scene.joystickForceX = 0;
    scene.joystickForceY = 0;
}

export function applyJoystickForce(scene, player) {
    if (player) {
        player.setVelocityX(scene.joystickForceX * 160);

        if (scene.joystickForceX > 0) {
            player.setFlipX(false);
            player.play('walk', true);
        } else if (scene.joystickForceX < 0) {
            player.setFlipX(true);
            player.play('walk', true);
        } else {
            player.play('idle', true);
        }

        // Jump logic
        if (scene.joystickForceY < -0.5 && player.body.touching.down) {
            player.setVelocityY(-500);
        }
    }
}
