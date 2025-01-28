import { setupJoystick } from './joystickUtils.js';
import { enableTiltControls } from './tiltUtils.js';

export function setupMobileControls(player, config = {}) {
    const {
        smoothingFactor = 0.2,
        deadZone = 6,
        maxTiltPortrait = 90,
        maxTiltLandscape = 20,
        velocity = 320,
    } = config;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
        console.log("Mobile device detected. Initializing controls...");

        // Setup Joystick
        setupJoystick(player);

        // Setup Tilt Controls if supported
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then((permissionState) => {
                    if (permissionState === 'granted') {
                        console.log("Tilt controls granted.");
                        return enableTiltControls(player, { smoothingFactor, deadZone, maxTiltPortrait, maxTiltLandscape, velocity });
                    } else {
                        console.warn("Tilt controls denied. Using joystick only.");
                    }
                })
                .catch((error) => {
                    console.error("Error requesting tilt controls permission:", error);
                });
        } else {
            console.log("Tilt controls not supported. Using joystick only.");
            return setupJoystick(player);
        }
    } else {
        console.log("Non-mobile device detected. Skipping mobile-specific controls.");
        return null;
    }
}
