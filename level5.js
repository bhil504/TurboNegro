export default class Level5 extends Phaser.Scene {
    constructor() {
        super({ key: 'Level5' });
    }

    preload() {
        console.log("Preloading assets for Level 5...");
        this.load.image('level5Background', 'assets/Levels/BackGrounds/Level5.webp');
        this.load.image('beignetMinion', 'assets/Characters/Enemies/Beignet_Minion.png');
        this.load.image('beignetProjectile', 'assets/Characters/Projectiles/Beignet/Beignet2.png');
        this.load.image('beignetMonster', 'assets/Characters/Enemies/Beignet_Monster.png');
        this.load.image('playerProjectile', 'assets/Characters/Projectiles/CD/CDresize.png');
        this.load.image('platform', 'assets/Levels/Platforms/platform.png');
        this.load.image('turboNegroStanding1', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding1.png');
        this.load.image('turboNegroStanding2', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding2.png');
        this.load.image('turboNegroStanding3', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding3.png');
        this.load.image('turboNegroStanding4', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding4.png');
        this.load.image('turboNegroWalking', 'assets/Characters/Character1/TurboNegroWalking.png');
        this.load.image('turboNegroJump', 'assets/Characters/Character1/TurboNegroJump.png');
        this.load.audio('level5Music', 'assets/Audio/Explosion of Ignorance.mp3');
        this.load.image('healthPack', 'assets/Items/HealthPack.png'); // Health pack asset
    }

    create() {
        const { width, height } = this.scale;

        this.totalEnemiesToDefeat = 45; // Set the goal for level completion
        this.totalEnemiesDefeated = 0;  // Reset defeated enemies count
        this.updateEnemyCountUI();      // Initialize the enemy count UI


        // Background
        this.add.image(width / 2, height / 2, 'level5Background').setDisplaySize(width, height);

        // Music
        this.levelMusic = this.sound.add('level5Music', { loop: true, volume: 0.5 });
        this.levelMusic.play();

        // Player
        this.player = this.physics.add.sprite(100, height - 150, 'turboNegroStanding1');
        this.player.setCollideWorldBounds(true);

        // Animations
        this.anims.create({
            key: 'idle',
            frames: [
                { key: 'turboNegroStanding1' },
                { key: 'turboNegroStanding2' },
                { key: 'turboNegroStanding3' },
                { key: 'turboNegroStanding4' },
            ],
            frameRate: 4,
            repeat: -1,
        });
        this.anims.create({ key: 'walk', frames: [{ key: 'turboNegroWalking' }], frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'jump', frames: [{ key: 'turboNegroJump' }], frameRate: 1 });

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Platforms
        this.platforms = this.physics.add.staticGroup();

        // Add Invisible Ground
        this.ground = this.platforms.create(width / 2, height - 10, null).setDisplaySize(width, 20).setVisible(false).refreshBody();

        // Add Other Platforms (Matching Level 4)
        this.platforms.create(width / 2, height / 2 - 50, 'platform')
            .setDisplaySize(200, 20) // Adjusted size
            .setVisible(true)
            .refreshBody();

        this.platforms.create(50, height / 2, 'platform')
            .setDisplaySize(200, 20) // Adjusted size
            .setVisible(true)
            .refreshBody();

        this.platforms.create(width - 50, height / 2, 'platform')
            .setDisplaySize(200, 20) // Adjusted size
            .setVisible(true)
            .refreshBody();


        this.physics.add.collider(this.player, this.platforms);

        // Groups
        this.projectiles = this.physics.add.group();
        this.beignetProjectiles = this.physics.add.group();
        this.enemies = this.physics.add.group();

        // Collisions
        this.physics.add.collider(this.enemies, this.platforms, (enemy) => {
            if (enemy.body.velocity.x === 0) {
                enemy.setVelocityX(Math.random() < 0.5 ? 100 : -100);
            }
        });
        this.physics.add.overlap(this.player, this.beignetProjectiles, this.handleBeignetHit, null, this);
        this.physics.add.collider(this.projectiles, this.enemies, this.handleProjectileHit, null, this);
        this.physics.add.collider(this.projectiles, this.beignetProjectiles, this.handleProjectileCollision, null, this);

        // Player Health
        this.playerHealth = 10;
        this.maxHealth = 10;
        this.totalEnemiesDefeated = 0;
        this.updateHealthUI();

        // Spawning Enemies
        this.time.addEvent({
            delay: 3000,
            callback: this.spawnBeignetMinion,
            callbackScope: this,
            loop: true,
        });

        this.time.addEvent({
            delay: 4000,
            callback: this.spawnBeignetMonster,
            callbackScope: this,
            loop: true,
        });

        // Create a group for health packs
        this.healthPacks = this.physics.add.group();

        // Add collision detection for health packs and platforms
        this.physics.add.collider(this.healthPacks, this.platforms);

        // Add overlap detection for health packs and player
        this.physics.add.overlap(this.player, this.healthPacks, this.handlePlayerHealthPackCollision, null, this);

        // Mobile-specific controls
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            console.log("Mobile device detected. Initializing controls...");
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                // Request motion permission for iOS
                DeviceOrientationEvent.requestPermission()
                    .then(permissionState => {
                        if (permissionState === 'granted') {
                            this.setupMobileControls();
                        } else {
                            console.warn("Motion access denied. Enabling joystick as fallback.");
                            this.setupJoystick();
                        }
                    })
                    .catch(error => {
                        console.error("Error requesting motion permission:", error);
                        this.setupJoystick(); // Fallback to joystick
                    });
            } else {
                // Enable controls directly for non-iOS or older versions
                this.setupMobileControls();
            }
        } else {
            console.log("Desktop detected. Skipping mobile controls.");
        }

        // Tap anywhere to attack
        this.input.on('pointerdown', (pointer) => {
            if (!pointer.wasTouch) return; // Prevent mouse clicks from triggering on desktop
            this.fireProjectile();
        });

        // Swipe up to jump
        let startY = null;
        this.input.on('pointerdown', (pointer) => {
            startY = pointer.y; // Record starting Y position
        });

        this.input.on('pointerup', (pointer) => {
            if (startY !== null && pointer.y < startY - 50 && this.player.body.touching.down) {
                this.player.setVelocityY(-500); // Jump velocity
                this.player.play('jump', true);
            }
            startY = null; // Reset
        });

        // Tilt controls (accelerometer)
        if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        window.addEventListener('deviceorientation', (event) => {
                            const tiltX = event.gamma; // Horizontal tilt (-90 to +90)
                            if (tiltX < -10) {
                                this.player.setVelocityX(-160);
                                this.player.setFlipX(true);
                                this.player.play('walk', true);
                            } else if (tiltX > 10) {
                                this.player.setVelocityX(160);
                                this.player.setFlipX(false);
                                this.player.play('walk', true);
                            } else {
                                this.player.setVelocityX(0);
                                this.player.play('idle', true);
                            }
                        });
                    }
                })
                .catch((error) => {
                    console.error("Motion permissions denied:", error);
                    this.setupJoystick(); // Fallback to joystick
                });
                } else {
                    console.log("Non-iOS device or motion permissions not required.");
                    this.setupJoystick(); // Fallback for unsupported devices
                }

                
            }

    spawnHealthPack() {
        const { width } = this.scale;
        const x = Phaser.Math.Between(50, width - 50); // Random X position
        const healthPack = this.healthPacks.create(x, 50, 'healthPack'); // Spawn at the top of the screen
        healthPack.setBounce(0.5); // Add bounce for realism
        healthPack.setCollideWorldBounds(true); // Enable collision with world bounds
        console.log("Health pack spawned at:", x);
    }

    handlePlayerHealthPackCollision(player, healthPack) {
        healthPack.destroy(); // Remove the health pack from the scene
        this.playerHealth = Math.min(this.playerHealth + 5, this.maxHealth); // Restore health but not above max
        this.updateHealthUI(); // Update the health bar display
        console.log("Health pack collected! Health:", this.playerHealth);
    }

    updateHealthUI() {
        const healthPercentage = (this.playerHealth / this.maxHealth) * 100;
        document.getElementById('health-bar-inner').style.width = `${healthPercentage}%`;
    }

    update() {
        if (!this.player || !this.cursors) return;
    
        // Reset horizontal velocity
        this.player.setVelocityX(0);
    
        // Handle joystick or tilt input
        if (this.isUsingJoystick) return;
    
        // Keyboard controls
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.setFlipX(true);
            this.player.play('walk', true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.setFlipX(false);
            this.player.play('walk', true);
        } else {
            this.player.play('idle', true);
        }
        
        // Jump
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-500);
            this.player.play('jump', true);
        }
    }      

    fireProjectile() {
        const projectile = this.projectiles.create(this.player.x, this.player.y, 'playerProjectile');
        if (projectile) {
            projectile.body.setAllowGravity(false);
            projectile.setVelocityX(this.player.flipX ? -500 : 500);
            projectile.body.onWorldBounds = true;
            this.physics.world.on('worldbounds', (body) => {
                if (body.gameObject === projectile) {
                    projectile.destroy();
                }
            });
        }
    }

    updateEnemyCountUI() {
        const enemiesLeft = this.totalEnemiesToDefeat - this.totalEnemiesDefeated;
        document.getElementById('enemy-count').innerText = `Enemies Left: ${enemiesLeft}`;
    }
    
    spawnHealthPack() {
        const { width } = this.scale;
        const x = Phaser.Math.Between(50, width - 50); // Random X position
        const healthPack = this.healthPacks.create(x, 50, 'healthPack'); // Spawn at the top of the screen
        healthPack.setBounce(0.5); // Add bounce for realism
        healthPack.setCollideWorldBounds(true); // Enable collision with world bounds
        console.log("Health pack spawned at:", x);
    }
    
    collectHealthPack(player, healthPack) {
        healthPack.destroy(); // Remove the health pack from the scene
        this.playerHealth = Math.min(this.playerHealth + 5, this.maxHealth); // Restore health but not above max
        this.updateHealthUI(); // Update the health bar display
        console.log("Health pack collected! Health:", this.playerHealth);
    }
    
    spawnBeignetMinion() {
        const { width } = this.scale;
        const side = Math.random() < 0.5 ? 0 : width;
        const minion = this.enemies.create(side, 0, 'beignetMinion');

        minion.setCollideWorldBounds(true);
        minion.body.setAllowGravity(true);
        minion.setVelocityX(side === 0 ? 100 : -100);

        this.time.addEvent({
            delay: 2000,
            loop: true,
            callback: () => {
                if (minion.active) this.shootBeignet(minion);
            },
        });
    }

    shootBeignet(minion) {
        const projectile = this.beignetProjectiles.create(minion.x, minion.y, 'beignetProjectile');
        if (projectile) {
            projectile.body.setAllowGravity(false);
            const angle = Phaser.Math.Angle.Between(minion.x, minion.y, this.player.x, this.player.y);
            projectile.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200);
        }
    }

    spawnBeignetMonster() {
        const { width } = this.scale;
        const x = Phaser.Math.Between(50, width - 50);
        const monster = this.enemies.create(x, 0, 'beignetMonster');

        monster.setCollideWorldBounds(true);
        monster.body.setAllowGravity(true);
        monster.setBounce(0.2);
        monster.health = 2;

        this.physics.add.overlap(this.player, monster, this.handleMonsterCollision, null, this);
    }

    handleBeignetHit(player, projectile) {
        projectile.destroy();
        this.playerHealth -= 1;
        this.updateHealthUI();
        if (this.playerHealth <= 0) {
            this.gameOver();
        }
    }

    handleProjectileCollision(playerProjectile, beignetProjectile) {
        playerProjectile.destroy();
        beignetProjectile.destroy();
    }

    handleProjectileHit(projectile, enemy) {
        projectile.destroy();
    
        if (enemy.texture.key === 'beignetMonster') {
            enemy.health -= 1;
            if (enemy.health <= 0) {
                enemy.destroy();
                this.totalEnemiesDefeated++;
            }
        } else {
            enemy.destroy();
            this.totalEnemiesDefeated++;
        }
    
        this.updateEnemyCountUI(); // Update the UI
    
        // Spawn a health pack every 12 enemies defeated
        if (this.totalEnemiesDefeated % 12 === 0) {
            this.spawnHealthPack();
            console.log("Health pack spawned after defeating 12 enemies.");
        }
    
        this.checkLevelCompletion(); // Check if the level is complete
    }

    handleMonsterCollision(player, monster) {
        if (monster.active) {
            monster.destroy();
            this.playerHealth -= 2;
            this.updateHealthUI();
            if (this.playerHealth <= 0) {
                this.gameOver();
            }
        }
    }

    setupJoystick() {
        const joystickArea = document.getElementById('joystick-area');
        let joystickKnob = document.getElementById('joystick-knob');
    
        // Add the knob dynamically if it doesn't exist
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
            joystickKnob.style.transform = `translate(-50%, -50%)`; // Reset to center
    
            // Start a continuous movement interval
            activeInterval = setInterval(() => this.applyJoystickForce(), 16); // Run every ~16ms (60 FPS)
        });
    
        joystickArea.addEventListener('touchmove', (event) => {
            const touch = event.touches[0];
            const deltaX = touch.clientX - joystickStartX;
            const deltaY = touch.clientY - joystickStartY;
    
            const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
            const maxDistance = 50; // Joystick radius limit
    
            // Clamp the knob's movement to the max distance
            const clampedX = (deltaX / distance) * Math.min(distance, maxDistance);
            const clampedY = (deltaY / distance) * Math.min(distance, maxDistance);
    
            // Move the knob visually
            joystickKnob.style.transform = `translate(calc(${clampedX}px - 50%), calc(${clampedY}px - 50%))`;
    
            // Store the clamped values for force application
            this.joystickForceX = clampedX / maxDistance;
            this.joystickForceY = clampedY / maxDistance;
        });
    
        joystickArea.addEventListener('touchend', () => {
            joystickKnob.style.transform = `translate(-50%, -50%)`; // Reset knob position
            this.joystickForceX = 0; // Reset forces
            this.joystickForceY = 0;
    
            if (this.player) {
                this.player.setVelocityX(0); // Stop horizontal movement
                this.player.anims.play('idle', true);
            }
    
            clearInterval(activeInterval); // Stop continuous movement
        });
    
        // Initialize joystick force values
        this.joystickForceX = 0;
        this.joystickForceY = 0;
    }    
    
    setupMobileControls() {
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

    applyJoystickForce() {
        if (this.player) {
            // Apply X-axis movement
            this.player.setVelocityX(this.joystickForceX * 160); // Adjust multiplier for sensitivity
    
            if (this.joystickForceX > 0) this.player.setFlipX(false);
            if (this.joystickForceX < 0) this.player.setFlipX(true);
    
            // Jump if joystick is pushed upwards
            if (this.joystickForceY < -0.5 && this.player.body.touching.down) {
                this.player.setVelocityY(-500); // Jump
            }
    
            // Change animation based on movement
            if (Math.abs(this.joystickForceX) > 0.1 && this.player.body.touching.down) {
                this.player.play('walk', true);
            } else if (this.player.body.touching.down) {
                this.player.play('idle', true);
            }
        }
    } 

    checkLevelCompletion() {
        if (this.totalEnemiesDefeated >= this.totalEnemiesToDefeat) {
            this.levelComplete();
        }
    }

    levelComplete() {
        console.log("Level 5 Complete!");
    
        // Stop music and clean up timers
        if (this.levelMusic) this.levelMusic.stop();
        if (this.enemySpawnTimer) this.enemySpawnTimer.remove();
    
        // Clear active objects
        this.enemies.clear(true, true);
        this.projectiles.clear(true, true);
    
        // Proceed to the boss fight
        this.scene.start('BossFight');
    }
    
    gameOver() {
        console.log("Game Over");
        this.levelMusic.stop();
        this.scene.restart();
    }
}
