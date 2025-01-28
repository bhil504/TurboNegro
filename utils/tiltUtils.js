export function enableTiltControls(player, config = {}) {
    const {
        smoothingFactor = 0.2,
        deadZone = 6,
        maxTiltPortrait = 90,
        maxTiltLandscape = 20,
        velocity = 320,
    } = config;

    let smoothedTilt = 0;
    let tiltForceX = 0;

    const tiltHandler = (event) => {
        let tilt;
        const isLandscape = window.orientation === 90 || window.orientation === -90;
        tilt = isLandscape ? event.beta : event.gamma;

        if (tilt !== null) {
            const maxTilt = isLandscape ? maxTiltLandscape : maxTiltPortrait;
            tilt = Math.max(-maxTilt, Math.min(maxTilt, tilt));

            smoothedTilt += (tilt - smoothedTilt) * smoothingFactor;
            if (Math.abs(smoothedTilt) > deadZone) {
                tiltForceX = (smoothedTilt / maxTilt) * velocity;
            } else {
                tiltForceX = 0;
            }
        }
    };

    window.addEventListener('deviceorientation', tiltHandler);

    return {
        getForce: () => tiltForceX,
        cleanup: () => window.removeEventListener('deviceorientation', tiltHandler),
    };
}

