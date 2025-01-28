export function setupJoystick(player) {
    const joystickArea = document.getElementById('joystick-area');
    const joystickKnob = document.getElementById('joystick-knob');

    if (!joystickArea || !joystickKnob) {
        console.error("Joystick elements not found in the DOM.");
        return { getForce: () => ({ x: 0, y: 0 }) }; // Return default forces
    }

    let joystickForceX = 0;
    let joystickForceY = 0;

    joystickArea.addEventListener('touchstart', (event) => {
        joystickKnob.style.transform = `translate(-50%, -50%)`; // Reset knob position
    });

    joystickArea.addEventListener('touchmove', (event) => {
        const touch = event.touches[0];
        const deltaX = touch.clientX - joystickArea.offsetLeft;
        const deltaY = touch.clientY - joystickArea.offsetTop;
        const maxDistance = 50; // Max distance the joystick can move
        const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

        // Calculate normalized joystick forces
        joystickForceX = (deltaX / maxDistance) * Math.min(distance, maxDistance) / maxDistance;
        joystickForceY = (deltaY / maxDistance) * Math.min(distance, maxDistance) / maxDistance;

        // Move the knob visually
        const limitedX = Math.min(maxDistance, Math.max(-maxDistance, deltaX));
        const limitedY = Math.min(maxDistance, Math.max(-maxDistance, deltaY));
        joystickKnob.style.transform = `translate(${limitedX}px, ${limitedY}px)`;
    });

    joystickArea.addEventListener('touchend', () => {
        joystickForceX = 0;
        joystickForceY = 0;

        // Reset knob position visually
        joystickKnob.style.transform = `translate(-50%, -50%)`;
    });

    return {
        // Expose joystick forces to external logic
        getForce: () => ({ x: joystickForceX, y: joystickForceY }),
    };
}
