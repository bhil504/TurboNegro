import { setupJoystick, applyJoystickForce } from './joystickUtils.js';
import { enableTiltControls } from './tiltUtils.js';

export function setupMobileControls(scene, player) {
    // Initialize tilt and joystick controls together
    initializeTiltControls(scene, player);
    initializeJoystick(scene, player);

    // Add swipe-to-jump functionality
    setupSwipeJump(scene, player);

    // Add tap-to-attack functionality
    setupTapAttack(scene, player);

    // Add attack button functionality
    setupAttackButton(scene, player);
}

function initializeTiltControls(scene, player) {
    if (window.DeviceOrientationEvent) {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            // iOS-specific permission request
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        enableTiltControls(scene, player);
                    } else {
                        console.warn("Motion access denied. Enabling joystick as fallback.");
                    }
                })
                .catch(error => {
                    console.error("Error requesting motion permission:", error);
                });
        } else {
            // Non-iOS or older versions
            enableTiltControls(scene, player);
        }
    } else {
        console.warn("Tilt controls unavailable.");
    }
}

function initializeJoystick(scene, player) {
    setupJoystick(scene, player);

    // Combine joystick and tilt forces in update loop
    scene.events.on('update', () => {
        if (player) {
            const combinedForceX = (scene.joystickForceX || 0) * 160 + (scene.smoothedTilt || 0);
            player.setVelocityX(combinedForceX);

            // Update animations
            if (combinedForceX > 0) {
                player.setFlipX(false);
                player.play('walk', true);
            } else if (combinedForceX < 0) {
                player.setFlipX(true);
                player.play('walk', true);
            } else if (player.body.touching.down) {
                player.play('idle', true);
            }
        }
    });
}

function setupSwipeJump(scene, player) {
    let startY = null;

    scene.input.on('pointerdown', (pointer) => {
        startY = pointer.y;
    });

    scene.input.on('pointerup', (pointer) => {
        if (startY !== null && pointer.y < startY - 50 && player.body.touching.down) {
            player.setVelocityY(-500); // Jump force
            player.play('jump', true);
        }
        startY = null; // Reset
    });
}

function setupTapAttack(scene, player) {
    scene.input.on('pointerdown', (pointer) => {
        if (!pointer.wasTouch) return; // Ensure it's a touch event
        fireProjectile(scene, player);
    });
}

function setupAttackButton(scene, player) {
    const attackButton = document.getElementById('attack-button');
    if (attackButton) {
        attackButton.addEventListener('click', () => {
            fireProjectile(scene, player);
        });
    } else {
        console.warn("Attack button not found in DOM.");
    }
}

function fireProjectile(scene, player) {
    const projectile = scene.projectiles.create(player.x, player.y, 'projectileCD');
    if (projectile) {
        projectile.setVelocityX(player.flipX ? -500 : 500); // Fire direction
        projectile.body.setAllowGravity(false);

        // Ensure projectiles collide with enemies
        scene.physics.add.collider(projectile, scene.enemies, (proj, enemy) => {
            proj.destroy();
            enemy.destroy();
            scene.totalEnemiesDefeated++;
            scene.updateEnemyCountUI();

            if (scene.totalEnemiesDefeated === 12) {
                scene.spawnHealthPack();
            }

            if (scene.totalEnemiesDefeated >= 20) {
                scene.levelComplete();
            }
        });
    }
}