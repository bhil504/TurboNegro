import { setupJoystick } from '/utils/joystickUtils.js';
import { enableTiltControls } from '/utils/tiltUtils.js';

export function setupMobileControls(scene, player) {
    if (window.DeviceOrientationEvent) {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            // iOS-specific permission request
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        enableTiltControls(scene, player);
                    } else {
                        console.warn("Motion access denied. Enabling joystick as fallback.");
                        setupJoystick(scene, player);
                    }
                })
                .catch(error => {
                    console.error("Error requesting motion permission:", error);
                    setupJoystick(scene, player);
                });
        } else {
            // Non-iOS or older versions
            enableTiltControls(scene, player);
        }
    } else {
        console.warn("Tilt controls unavailable. Enabling joystick as fallback.");
        setupJoystick(scene, player);
    }
}
