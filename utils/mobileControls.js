import { setupJoystick } from './utils/joystickUtils.js';
import { enableTiltControls } from './utils/tiltUtils.js';

export function setupMobileControls() {
    if (window.DeviceOrientationEvent) {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            // Request permission for iOS devices
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        this.enableTiltControls();
                    } else {
                        console.warn("Motion access denied. Enabling joystick as fallback.");
                        this.setupJoystick(); // Fallback to joystick
                    }
                })
                .catch(error => {
                    console.error("Error requesting motion permission:", error);
                    this.setupJoystick(); // Fallback to joystick
                });
        } else {
            // Non-iOS or older versions
            this.enableTiltControls();
        }
    } else {
        console.warn("Tilt controls unavailable. Enabling joystick as fallback.");
        this.setupJoystick();
    }
}

