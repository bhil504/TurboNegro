import { addFullscreenButton } from '../utils/fullScreenUtils.js';

export default class Level3 extends Phaser.Scene {
    constructor() {
        super({ key: 'Level3' });
    }
    
    preload() {
        console.log("Preloading assets for Level 3...");
        this.load.image('level3Background', 'assets/Levels/BackGrounds/Level3.png');
        this.load.image('ledgeLeft', 'assets/Levels/Platforms/LedgeLeft.png');
        this.load.image('ledgeRight', 'assets/Levels/Platforms/LedgeRight.png');
        this.load.image('platform', 'assets/Levels/Platforms/platform.png');
        this.load.image('turboNegroWalking', 'assets/Characters/Character1/TurboNegroWalking.png');
        this.load.image('turboNegroStanding1', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding1.png');
        this.load.image('turboNegroStanding2', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding2.png');
        this.load.image('turboNegroStanding3', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding3.png');
        this.load.image('turboNegroStanding4', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding4.png');
        this.load.image('projectileCD', 'assets/Characters/Projectiles/CD/CDresize.png');
        this.load.image('MardiGrasBlimp', 'assets/Characters/Enemies/MardiGrasBlimp.png');
        this.load.image('Beads', 'assets/Characters/Projectiles/Beads/Beads.png');
        this.load.image('skeleton', 'assets/Characters/Enemies/MardiGrasZombie.png');
        this.load.image('trumpetSkeleton', 'assets/Characters/Enemies/TrumpetSkeleton.png');
        this.load.audio('level3Music', 'assets/Audio/BhillionDollarAutoBots.mp3');
    }

    create() {
        const { width, height } = this.scale;
        console.log("Creating Level 3...");
    
        // Add fullscreen button
        addFullscreenButton(this);
    
        // Background setup
        this.add.image(0, 0, 'level3Background')
            .setOrigin(0, 0)
            .setDisplaySize(1600, height);
    
        // Music setup
        this.levelMusic = this.sound.add('level3Music', { loop: true, volume: 0.2 });
        this.levelMusic.play();
    
        // Camera and world bounds
        this.cameras.main.setBounds(0, 0, 1600, height);
        this.physics.world.setBounds(0, 0, 1600, height);
    
        // Platforms setup
        this.platforms = this.physics.add.staticGroup();
    
        // Ground platform
        this.platforms.create(800, height - 12, null)
            .setDisplaySize(1600, 20)
            .setVisible(false)
            .refreshBody();
    
        // Ledges and platforms
        this.setupPlatforms(height);
    
        // Player setup
        this.setupPlayer(height);
    
        // Object groups
        this.projectiles = this.physics.add.group({ defaultKey: 'projectileCD', runChildUpdate: true });
        this.enemyProjectiles = this.physics.add.group();
        this.enemies = this.physics.add.group();
        this.trumpetEnemies = this.physics.add.group();
        this.healthPacks = this.physics.add.group();
    
        // UI and stats setup
        this.playerHealth = 10;
        this.maxHealth = 10;
        this.updateHealthUI();
    
        this.totalEnemiesDefeated = 0;
        this.updateEnemyCountUI();
    
        // Camera follows player
        this.cameras.main.startFollow(this.player);
    
        // Blimp setup
        this.createBlimpPath();
    
        // Physics and collision setup
        this.setupCollisions();
    
        // Enemy spawn timers
        this.setupEnemySpawns();
    
        // Mobile Controls (Tilt or Joystick)
        this.setupMobileControls();
    
        // Tap anywhere to attack
        this.setupPointerAttack();
    
        // Swipe up to jump
        this.setupSwipeJump();
    
        // Bind attack button to fireProjectile
        this.setupAttackButton();
    
        console.log("Level 3 setup complete.");
    }

    setupPlatforms(height) {
        this.platforms.create(100, height - 230, null).setDisplaySize(200, 10).setVisible(false).refreshBody();
        this.add.image(100, height - 180, 'ledgeLeft').setOrigin(0.5, 1).setScale(0.8).setDepth(2);
    
        this.platforms.create(1500, height - 230, null).setDisplaySize(200, 10).setVisible(false).refreshBody();
        this.add.image(1500, height - 180, 'ledgeRight').setOrigin(0.5, 1).setScale(0.8).setDepth(2);
    
        this.platforms.create(800, height - 165, null).setDisplaySize(300, 10).setVisible(false).refreshBody();
        this.add.image(800, height - 148, 'platform').setOrigin(0.5, 1).setDepth(2);
    }

    setupPlayer(height) {
        this.player = this.physics.add.sprite(200, height - 100, 'turboNegroStanding1');
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.platforms);
        this.player.setDepth(1);
    
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
    }

    setupCollisions() {
        this.physics.add.overlap(this.projectiles, this.mardiGrasBlimp, this.destroyBlimp, null, this);
        this.physics.add.overlap(this.enemyProjectiles, this.player, this.handleBeadCollision, null, this);
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.collider(this.trumpetEnemies, this.platforms);
        this.physics.add.collider(this.player, this.trumpetEnemies, this.handleTrumpetSkeletonCollision, null, this);
        this.physics.add.collider(this.player, this.enemies, this.handlePlayerEnemyCollision, null, this);
        this.physics.add.collider(this.projectiles, this.enemies, this.handleProjectileEnemyCollision, null, this);
        this.physics.add.collider(this.projectiles, this.trumpetEnemies, this.handleProjectileEnemyCollision, null, this);
        this.physics.add.collider(this.healthPacks, this.platforms);
        this.physics.add.overlap(this.player, this.healthPacks, this.handlePlayerHealthPackCollision, null, this);
    }

    setupEnemySpawns() {
        this.enemySpawnTimer = this.time.addEvent({
            delay: 2000,
            callback: this.spawnMardiGrasZombie,
            callbackScope: this,
            loop: true,
        });
    
        this.trumpetSpawnTimer = this.time.addEvent({
            delay: 3000,
            callback: this.spawnTrumpetSkeleton,
            callbackScope: this,
            loop: true,
        });
    }

    setupMobileControls() {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            console.log("Mobile device detected. Initializing controls...");
            if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
                // For iOS: Request permission for motion and orientation
                DeviceOrientationEvent.requestPermission()
                    .then((permissionState) => {
                        if (permissionState === 'granted') {
                            this.enableTiltControls();
                        } else {
                            console.warn("Motion access denied. Enabling joystick as fallback.");
                            this.setupJoystick();
                        }
                    })
                    .catch(() => {
                        console.warn("Error requesting motion access. Enabling joystick as fallback.");
                        this.setupJoystick();
                    });
            } else if (window.DeviceOrientationEvent) {
                // For non-iOS devices
                this.enableTiltControls();
            } else {
                console.warn("Tilt controls unavailable. Enabling joystick as fallback.");
                this.setupJoystick();
            }
        } else {
            console.log("Desktop detected. Skipping mobile-specific controls.");
        }
    }

    updateHealthUI() {
        const healthPercentage = (this.playerHealth / this.maxHealth) * 100;
        document.getElementById('health-bar-inner').style.width = `${healthPercentage}%`;
    }

    updateEnemyCountUI() {
        document.getElementById('enemy-count').innerText = `Enemies Left: ${40 - this.totalEnemiesDefeated}`;
    }

    update() {
        // Ensure player and input exist
        if (!this.player || !this.cursors) return;
    
        // Reset player's horizontal velocity
        this.player.setVelocityX(0);
    
        // Horizontal movement: left or right
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-165);
            this.player.setFlipX(true); // Flip sprite for left movement
            if (this.player.body.touching.down) {
                this.player.play('walk', true); // Play walk animation
            }
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(165);
            this.player.setFlipX(false); // Default orientation for right movement
            if (this.player.body.touching.down) {
                this.player.play('walk', true); // Play walk animation
            }
        } else if (this.player.body.touching.down) {
            this.player.play('idle', true); // Play idle animation if not moving
        }
    
        // Jumping logic
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-500); // Apply vertical velocity for jumping
            this.player.play('jump', true); // Play jump animation
            console.log("Player jumps!");
        }
    
        // Handle firing projectiles when the fire key is pressed
        if (Phaser.Input.Keyboard.JustDown(this.fireKey)) {
            this.fireProjectile();
        }
    
        // Additional mobile tilt controls
        if (this.joystickForceX) {
            this.player.setVelocityX(this.joystickForceX * 165); // Apply joystick force for horizontal movement
            if (this.joystickForceX > 0) {
                this.player.setFlipX(false);
            } else if (this.joystickForceX < 0) {
                this.player.setFlipX(true);
            }
            if (this.player.body.touching.down) {
                this.player.play('walk', true);
            }
        }
    
        if (this.joystickForceY < -0.5 && this.player.body.touching.down) {
            this.player.setVelocityY(-500); // Apply upward velocity for jumping via joystick
            this.player.play('jump', true);
        }
    }    

    fireProjectile() {
        const projectile = this.projectiles.create(this.player.x, this.player.y, 'projectileCD');
        if (projectile) {
            projectile.body.setAllowGravity(false);
            projectile.setVelocityX(this.player.flipX ? -500 : 500);
            console.log("Projectile fired!");

            projectile.setCollideWorldBounds(false);
            projectile.body.onWorldBounds = true;

            this.physics.world.on('worldbounds', (body) => {
                if (body.gameObject === projectile && projectile.active) {
                    projectile.destroy();
                    console.log("Projectile destroyed off-screen!");
                }
            });
        }
    }

    handleBeadCollision(player, bead) {
        if (bead) {
            bead.destroy();
            this.playerHealth -= 2;
            console.log("Player hit by bead! Health -2");
            this.updateHealthUI();

            if (this.playerHealth <= 0) {
                this.gameOver();
            }
        }
    }

    destroyBlimp(projectile, blimp) {
        if (projectile) {
            projectile.destroy();
            console.log("Projectile destroyed!");
        }

        if (blimp) {
            blimp.destroy();
            console.log("Blimp destroyed!");

            if (this.fireBeadsTimer) {
                this.fireBeadsTimer.remove();
                this.fireBeadsTimer = null;
            }

            this.time.delayedCall(5000, () => {
                this.createBlimpPath();
            });
        }
    }

    handlePlayerEnemyCollision(player, enemy) {
        if (enemy && enemy.active) {
            enemy.destroy(); // Destroy enemy
            this.playerHealth -= 1; // Decrease player health
            console.log("Player hit by Mardi Gras Zombie! Health -1");
    
            this.updateHealthUI(); // Update health bar UI
            if (this.playerHealth <= 0) {
                this.gameOver(); // End the game if health reaches 0
            }
        }
    }

    handleProjectileEnemyCollision(projectile, enemy) {
        if (projectile && projectile.active) {
            projectile.destroy();
            console.log("Projectile destroyed!");
        }

        if (enemy && enemy.active) {
            console.log(`Enemy destroyed: ${enemy.texture.key}`);
            enemy.destroy();

            this.totalEnemiesDefeated++;
            console.log(`Total Enemies Defeated: ${this.totalEnemiesDefeated}`);

            this.updateEnemyCountUI();

            if (this.totalEnemiesDefeated % 12 === 0) {
                this.spawnHealthPack();
                console.log("Health pack spawned!");
            }

            if (this.totalEnemiesDefeated >= 40) {
                console.log("Level Complete Triggered!");
                this.levelComplete();
            }
        }
    }

    spawnHealthPack() {
        const { width } = this.scale;
        const x = Phaser.Math.Between(50, width - 50);
        const healthPack = this.healthPacks.create(x, 50, 'healthPack');
        healthPack.setBounce(0.5);
        healthPack.setCollideWorldBounds(true);
        console.log("Health pack spawned at:", x);
    }

    handlePlayerHealthPackCollision(player, healthPack) {
        healthPack.destroy();
        this.playerHealth = Math.min(this.playerHealth + 5, this.maxHealth);
        this.updateHealthUI();
        console.log("Health pack collected! Health +5");
    }

    levelComplete() {
        console.log("Level Complete!");
    
        // Stop music and clear timers
        if (this.levelMusic) this.levelMusic.stop();
        if (this.enemySpawnTimer) this.enemySpawnTimer.remove();
        if (this.trumpetSpawnTimer) this.trumpetSpawnTimer.remove();
        if (this.fireBeadsTimer) this.fireBeadsTimer.remove();
    
        // Clear objects
        this.enemies.clear(true, true);
        this.trumpetEnemies.clear(true, true);
        this.projectiles.clear(true, true);
        if (this.mardiGrasBlimp) {
            this.mardiGrasBlimp.destroy();
            this.mardiGrasBlimp = null;
        }
    
        // Display Level Complete screen
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'levelComplete').setOrigin(0.5);
    
        // Proceed to the next level
        const nextLevel = () => {
            this.scene.start('Level4'); // Adjust to the actual next level key
        };
    
        // Add input handlers for both desktop and mobile
        this.input.keyboard.once('keydown-SPACE', nextLevel);
        this.input.once('pointerdown', nextLevel);
    }
    
    gameOver() {
        console.log("Game Over!");
    
        // Stop music and clear timers
        if (this.levelMusic) this.levelMusic.stop();
        if (this.enemySpawnTimer) this.enemySpawnTimer.remove();
        if (this.trumpetSpawnTimer) this.trumpetSpawnTimer.remove();
        if (this.fireBeadsTimer) this.fireBeadsTimer.remove();
    
        // Clear objects
        this.enemies.clear(true, true);
        this.trumpetEnemies.clear(true, true);
        this.projectiles.clear(true, true);
        if (this.mardiGrasBlimp) {
            this.mardiGrasBlimp.destroy();
            this.mardiGrasBlimp = null;
        }
    
        // Display Game Over screen
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'gameOver').setOrigin(0.5);
    
        // Restart the level
        const restartLevel = () => {
            this.scene.restart();
        };
    
        // Add input handlers for both desktop and mobile
        this.input.keyboard.once('keydown-SPACE', restartLevel);
        this.input.once('pointerdown', restartLevel);
    }         

    updateHealthBar() {
        if (!this.healthBar) return;

        this.healthBar.clear();

        const barWidth = 200;
        const barHeight = 20;
        const healthPercentage = Phaser.Math.Clamp(this.playerHealth / this.maxHealth, 0, 1);

        const barColor = healthPercentage > 0.5 ? 0x00ff00 : healthPercentage > 0.25 ? 0xffff00 : 0xff0000;

        this.healthBar.fillStyle(0x808080);
        this.healthBar.fillRect(20, 20, barWidth, barHeight);

        this.healthBar.fillStyle(barColor);
        this.healthBar.fillRect(20, 20, barWidth * healthPercentage, barHeight);
    }

    createBlimpPath() {
    const path = [
        { x: 100, y: 50 },
        { x: 1400, y: 100 },
        { x: 1200, y: 500 },
        { x: 200, y: 400 },
    ];

    let currentPoint = 0;

    const moveBlimp = () => {
        if (!this.mardiGrasBlimp || !this.mardiGrasBlimp.active) {
            return; // Exit if the blimp no longer exists
        }

        const nextPoint = path[currentPoint];
        this.tweens.add({
            targets: this.mardiGrasBlimp,
            x: nextPoint.x,
            y: nextPoint.y,
            duration: 3000,
            ease: 'Linear',
            onComplete: () => {
                currentPoint = (currentPoint + 1) % path.length;
                moveBlimp(); // Continue moving the blimp
            },
        });
    };

    if (this.mardiGrasBlimp) {
        this.mardiGrasBlimp.destroy();
    }

    this.mardiGrasBlimp = this.physics.add.sprite(path[0].x, path[0].y, 'MardiGrasBlimp');
    this.mardiGrasBlimp.setDepth(3);
    this.mardiGrasBlimp.body.setAllowGravity(false);
    this.mardiGrasBlimp.body.setImmovable(true);

    moveBlimp();

    this.physics.add.overlap(
        this.projectiles,
        this.mardiGrasBlimp,
        this.destroyBlimp,
        null,
        this
    );

    if (this.fireBeadsTimer) {
        this.fireBeadsTimer.remove();
    }

    this.fireBeadsTimer = this.time.addEvent({
        delay: 5000,
        loop: true,
        callback: this.fireBeads,
        callbackScope: this,
    });
    }

    fireBeads() {
        if (this.mardiGrasBlimp.active) {
            const bead = this.enemyProjectiles.create(this.mardiGrasBlimp.x, this.mardiGrasBlimp.y, 'Beads');
            bead.body.setAllowGravity(false);

            const angle = Phaser.Math.Angle.Between(
                this.mardiGrasBlimp.x,
                this.mardiGrasBlimp.y,
                this.player.x,
                this.player.y
            );
            bead.setVelocity(Math.cos(angle) * 300, Math.sin(angle) * 300);
        }
    }

    spawnMardiGrasZombie() {
        const { width } = this.scale;
        const x = Phaser.Math.Between(50, width - 50);

        const zombie = this.enemies.create(x, 0, 'skeleton');
        zombie.setCollideWorldBounds(true);
        zombie.setBounce(0.2);
        zombie.setVelocityX(Phaser.Math.Between(-100, 100));

        this.time.addEvent({
            delay: 500,
            callback: () => {
                if (zombie && zombie.active) {
                    this.zombieAI(zombie);
                }
            },
            loop: true,
        });
    }

    spawnTrumpetSkeleton() {
        const { width, height } = this.scale;
        const x = Math.random() < 0.5 ? 0 : width; // Spawn on the left or right edge
        const y = height - 150; // Near the ground level
    
        const trumpetSkeleton = this.trumpetEnemies.create(x, y, 'trumpetSkeleton');
        trumpetSkeleton.setCollideWorldBounds(true);
        trumpetSkeleton.body.allowGravity = true;
    
        // Add jumping behavior
        trumpetSkeleton.isLanded = true;
    
        this.time.addEvent({
            delay: 1500, // Jump every 1.5 seconds if landed
            loop: true,
            callback: () => {
                if (trumpetSkeleton.active && trumpetSkeleton.body && trumpetSkeleton.isLanded) {
                    trumpetSkeleton.setVelocityY(-300); // Jump height
                    const direction = this.player.x > trumpetSkeleton.x ? 150 : -150; // Move toward player
                    trumpetSkeleton.setVelocityX(direction); // Adjust velocity
                    trumpetSkeleton.isLanded = false; // Mark as jumping
                }
            },
        });
    
        // Detect landing on platforms
        this.physics.add.collider(trumpetSkeleton, this.platforms, () => {
            trumpetSkeleton.setVelocityX(0);
            trumpetSkeleton.isLanded = true;
        });
    
        // Attack player when near
        this.time.addEvent({
            delay: 1000, // Attack every 1 second
            loop: true,
            callback: () => {
                if (
                    trumpetSkeleton.active &&
                    trumpetSkeleton.body &&
                    trumpetSkeleton.isLanded &&
                    Phaser.Math.Distance.Between(this.player.x, this.player.y, trumpetSkeleton.x, trumpetSkeleton.y) < 150
                ) {
                    this.trumpetSkeletonAttack(trumpetSkeleton);
                }
            },
        });
    }

    zombieAI(zombie) {
        if (!zombie || !zombie.body || !this.player || !this.player.body) return;
    
        const playerX = this.player.x;
    
        if (zombie.x < playerX - 10) {
            zombie.setVelocityX(100);
            zombie.setFlipX(false);
        } else if (zombie.x > playerX + 10) {
            zombie.setVelocityX(-100);
            zombie.setFlipX(true);
        } else {
            zombie.setVelocityX(0);
        }
    
        if (
            Phaser.Math.Between(0, 100) < 20 &&
            zombie.body.touching.down &&
            Math.abs(zombie.x - playerX) < 200
        ) {
            zombie.setVelocityY(-300);
        }
    }    

    handleTrumpetSkeletonCollision(player, trumpetSkeleton) {
        if (trumpetSkeleton && trumpetSkeleton.active) {
            trumpetSkeleton.destroy(); // Destroy enemy
            this.playerHealth -= 1; // Trumpet Skeleton deals more damage
            console.log("Player hit by Trumpet Skeleton! Health -2");
    
            this.updateHealthUI(); // Update health bar UI
            if (this.playerHealth <= 0) {
                this.gameOver(); // End the game if health reaches 0
            }
        }
    
    }

    trumpetSkeletonAttack(trumpetSkeleton) {
        console.log('Trumpet Skeleton attacks!');
        this.playerHealth -= 2; // Inflict 2 points of damage
        this.updateHealthBar();
    
        if (this.playerHealth <= 0) {
            this.gameOver();
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
    
    enableTiltControls() {
        window.addEventListener('deviceorientation', (event) => {
            const tilt = event.gamma; // Side-to-side tilt (-90 to +90)
            if (tilt !== null) {
                if (tilt > 8) { // Tilted to the right
                    this.player.setVelocityX(160);
                    this.player.setFlipX(false);
                    this.player.play('walk', true);
                } else if (tilt < -8) { // Tilted to the left
                    this.player.setVelocityX(-160);
                    this.player.setFlipX(true);
                    this.player.play('walk', true);
                } else { // Neutral tilt
                    this.player.setVelocityX(0);
                    this.player.play('idle', true);
                }
            }
        });
    }
    
}