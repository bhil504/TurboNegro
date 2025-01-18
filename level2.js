export default class Level2 extends Phaser.Scene {
    constructor() {
        super({ key: 'Level2' });
    }

    updateHealthUI() {
        const healthPercentage = (this.playerHealth / this.maxHealth) * 100;
        document.getElementById('health-bar-inner').style.width = `${healthPercentage}%`;
    }

    updateEnemyCountUI() {
        document.getElementById('enemy-count').innerText = `Enemies Left: ${30 - this.totalEnemiesDefeated}`;
    }

    preload() {
        console.log("Preloading assets for Level 2...");
        this.load.image('level2Background', 'assets/Levels/BackGrounds/Level2.webp');
        this.load.image('turboNegroWalking', 'assets/Characters/Character1/TurboNegroWalking/TurboNegroWalking.png');
        this.load.image('turboNegroJump', 'assets/Characters/Character1/TurboNegroJump.png');
        this.load.image('projectileCD', 'assets/Characters/Projectiles/CD/CDresize.png');
        this.load.image('turboNegroStanding1', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding1.png');
        this.load.image('turboNegroStanding2', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding2.png');
        this.load.image('turboNegroStanding3', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding3.png');
        this.load.image('turboNegroStanding4', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding4.png');
        this.load.image('ledgeLeft', 'assets/Levels/Platforms/LedgeLeft.png');
        this.load.image('ledgeRight', 'assets/Levels/Platforms/LedgeRight.png');
        this.load.image('skeleton', 'assets/Characters/Enemies/MardiGrasZombie.png');
        this.load.image('trumpetSkeleton', 'assets/Characters/Enemies/TrumpetSkeleton.png');
        this.load.image('gameOver', 'assets/UI/gameOver.png');
        this.load.image('levelComplete', 'assets/UI/levelComplete.png');
        this.load.image('healthPack', 'assets/Characters/Pickups/HealthPack.png');
        this.load.audio('level2Music', 'assets/Audio/SeptemberHue.mp3');
        console.log("Assets for Level 2 preloaded successfully.");
    }

    create() {
        const { width, height } = this.scale;

        this.levelMusic = this.sound.add('level2Music', { loop: true, volume: 0.5 });
        this.levelMusic.play();

        this.add.image(width / 2, height / 2, 'level2Background').setDisplaySize(width, height).setDepth(0);

        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(width / 2, height - 20, null).setDisplaySize(width, 20).setVisible(false).refreshBody();

        const leftLedge = this.add.image(150, height - 400, 'ledgeLeft').setDepth(2);
        const rightLedge = this.add.image(width - 150, height - 400, 'ledgeRight').setDepth(2);

        const leftPlatform = this.platforms.create(150, height - 325, null).setDisplaySize(300, 10).setVisible(false).refreshBody();
        const rightPlatform = this.platforms.create(width - 150, height - 325, null).setDisplaySize(300, 10).setVisible(false).refreshBody();

        this.player = this.physics.add.sprite(100, height - 100, 'turboNegroStanding1');
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
        this.anims.create({ key: 'jump', frames: [{ key: 'turboNegroJump' }], frameRate: 1 });

        this.cursors = this.input.keyboard.createCursorKeys();
        this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.healthPacks = this.physics.add.group();
        this.physics.add.collider(this.healthPacks, this.platforms);
        this.physics.add.overlap(this.player, this.healthPacks, this.handlePlayerHealthPackCollision, null, this);

        this.projectiles = this.physics.add.group({ defaultKey: 'projectileCD' });
        this.enemies = this.physics.add.group();
        this.trumpetEnemies = this.physics.add.group();
        this.totalEnemiesDefeated = 0;

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

        this.playerHealth = 10;
        this.maxHealth = 10;

        this.updateHealthUI();
        this.updateEnemyCountUI();

        this.physics.add.collider(this.player, this.enemies, this.handlePlayerEnemyCollision, null, this);
        this.physics.add.collider(this.player, this.trumpetEnemies, this.handleTrumpetSkeletonCollision, null, this);
        this.physics.add.collider(this.projectiles, this.enemies, this.handleProjectileEnemyCollision, null, this);
        this.physics.add.collider(this.projectiles, this.trumpetEnemies, this.handleProjectileEnemyCollision, null, this);
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.collider(this.trumpetEnemies, this.platforms);

         // Hook up the attack button to fireProjectile
         const attackButton = document.getElementById('attack-button');
         if (attackButton) {
             attackButton.addEventListener('click', () => {
                 this.fireProjectile();
             });
         }
 
         // Mobile-specific controls
         if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
             console.log("Mobile device detected. Initializing controls...");
             this.setupMobileControls();
             this.setupJoystick();
         } else {
             console.log("Desktop detected. Skipping mobile controls.");
         }
 
         // Tap anywhere to attack (Mobile or Desktop)
         this.input.on('pointerdown', (pointer) => {
             if (!pointer.wasTouch) return;
             this.fireProjectile();
         });
 
         // Swipe up to jump
         let startY = null;
         this.input.on('pointerdown', (pointer) => {
             startY = pointer.y;
         });
 
         this.input.on('pointerup', (pointer) => {
             if (startY !== null && pointer.y < startY - 50 && this.player.body.touching.down) {
                 this.player.setVelocityY(-500);
                 this.player.play('jump', true);
             }
             startY = null;
         });
    }
    
    update() {
        if (!this.player || !this.cursors) return;

        this.player.setVelocityX(0);

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-165);
            this.player.setFlipX(true);
            if (!this.isJumping) this.player.play('walk', true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(165);
            this.player.setFlipX(false);
            if (!this.isJumping) this.player.play('walk', true);
        } else if (this.player.body.touching.down && !this.isJumping) {
            this.player.play('idle', true);
        }

        if (this.cursors.up.isDown && this.player.body.touching.down && !this.isJumping) {
            this.isJumping = true;
            this.player.setVelocityY(-500);
            this.player.play('jump', true);
        }

        if (this.player.body.touching.down && this.isJumping) {
            this.isJumping = false;
            this.player.play('idle', true);
        }

        if (Phaser.Input.Keyboard.JustDown(this.fireKey)) {
            this.fireProjectile();
        }
    }

    fireProjectile() {
        const projectile = this.projectiles.create(this.player.x, this.player.y, 'projectileCD');
        if (projectile) {
            projectile.setActive(true);
            projectile.setVisible(true);
            projectile.body.setAllowGravity(false);
            projectile.setVelocityX(this.player.flipX ? -500 : 500);
        }
    }

    handlePlayerEnemyCollision(player, enemy) {
        enemy.destroy();
        this.playerHealth--;
        this.updateHealthUI();

        if (this.playerHealth <= 0) {
            this.gameOver();
        }
    }

    handleProjectileEnemyCollision(projectile, enemy) {
        if (!projectile || !enemy) return;
        projectile.destroy();
        enemy.destroy();
        this.totalEnemiesDefeated++;

        if (this.totalEnemiesDefeated % 12 === 0) {
            this.spawnHealthPack();
        }

        this.updateEnemyCountUI();

        if (this.totalEnemiesDefeated >= 30) {
            this.levelComplete();
        }
    }

    spawnHealthPack() {
        const { width } = this.scale;
        const x = Phaser.Math.Between(50, width - 50);
        const healthPack = this.healthPacks.create(x, 50, 'healthPack');
        healthPack.setBounce(0.5);
        this.physics.add.collider(healthPack, this.platforms);
    }

    handlePlayerHealthPackCollision(player, healthPack) {
        healthPack.destroy();
        this.playerHealth = Math.min(this.playerHealth + 5, this.maxHealth);
        this.updateHealthUI();
    }

    gameOver() {
        // Stop background music
        if (this.levelMusic) this.levelMusic.stop();
    
        // Stop enemy and projectile spawns
        if (this.enemySpawnTimer) this.enemySpawnTimer.remove();
        if (this.trumpetSpawnTimer) this.trumpetSpawnTimer.remove();
    
        // Clear active game objects
        this.enemies.clear(true, true);
        this.trumpetEnemies.clear(true, true);
        this.projectiles.clear(true, true);
    
        // Display game over screen
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'gameOver').setOrigin(0.5);
    
        // Restart the level on SPACE (desktop) or tap (mobile)
        const restartLevel = () => {
            this.scene.restart();
        };
    
        // Desktop: Listen for SPACE key
        this.input.keyboard.once('keydown-SPACE', restartLevel);
    
        // Mobile: Listen for tap
        this.input.once('pointerdown', restartLevel);
    }

    levelComplete() {
        // Stop background music
        if (this.levelMusic) this.levelMusic.stop();
    
        // Stop enemy and projectile spawns
        if (this.enemySpawnTimer) this.enemySpawnTimer.remove();
        if (this.trumpetSpawnTimer) this.trumpetSpawnTimer.remove();
    
        // Clear active game objects
        this.enemies.clear(true, true);
        this.trumpetEnemies.clear(true, true);
        this.projectiles.clear(true, true);
    
        // Display level complete screen
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'levelComplete').setOrigin(0.5);
    
        // Move to the next level on SPACE (desktop) or tap (mobile)
        const proceedToNextLevel = () => {
            this.scene.start('Level3'); // Proceed to Level 3
        };
    
        // Desktop: Listen for SPACE key
        this.input.keyboard.once('keydown-SPACE', proceedToNextLevel);
    
        // Mobile: Listen for tap
        this.input.once('pointerdown', proceedToNextLevel);
    }

    spawnMardiGrasZombie() {
        const { width } = this.scale;
        const x = Phaser.Math.Between(50, width - 50);
        const y = 0;

        const enemy = this.enemies.create(x, y, 'skeleton');
        enemy.setCollideWorldBounds(true);
        enemy.setBounce(0.2);

        enemy.aiTimer = this.time.addEvent({
            delay: 500,
            callback: () => {
                if (enemy.active) this.enemyAI(enemy);
            },
            loop: true,
        });

        enemy.on('destroy', () => {
            if (enemy.aiTimer) enemy.aiTimer.remove();
        });
    }

    spawnTrumpetSkeleton() {
        const { width, height } = this.scale;
        const x = Math.random() < 0.5 ? 0 : width;
        const y = height - 150;

        const trumpetSkeleton = this.trumpetEnemies.create(x, y, 'trumpetSkeleton');
        trumpetSkeleton.setCollideWorldBounds(true);
        trumpetSkeleton.body.allowGravity = true;

        trumpetSkeleton.isLanded = true;

        this.time.addEvent({
            delay: 1500,
            loop: true,
            callback: () => {
                if (trumpetSkeleton.active && trumpetSkeleton.body && trumpetSkeleton.isLanded) {
                    trumpetSkeleton.setVelocityY(-300);
                    const direction = this.player.x > trumpetSkeleton.x ? 150 : -150;
                    trumpetSkeleton.setVelocityX(direction);
                    trumpetSkeleton.isLanded = false;
                }
            },
        });

        this.physics.add.collider(trumpetSkeleton, this.platforms, () => {
            trumpetSkeleton.setVelocityX(0);
            trumpetSkeleton.isLanded = true;
        });

        this.time.addEvent({
            delay: 1000,
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

    trumpetSkeletonAttack(trumpetSkeleton) {
        console.log('Trumpet Skeleton attacks!');
        this.playerHealth -= 2;
        this.updateHealthUI();

        if (this.playerHealth <= 0) {
            this.gameOver();
        }
    }

    handleTrumpetSkeletonCollision(player, trumpetSkeleton) {
        console.log('Player hit by Trumpet Skeleton!');
        trumpetSkeleton.destroy();
        this.playerHealth--;
        this.updateHealthUI();

        if (this.playerHealth <= 0) {
            this.gameOver();
        }
    }

    enemyAI(enemy) {
        if (!enemy || !enemy.body || !this.player || !this.player.body) return;

        const playerX = this.player.x;

        if (enemy.x < playerX - 10) {
            enemy.setVelocityX(100);
            enemy.setFlipX(false);
        } else if (enemy.x > playerX + 10) {
            enemy.setVelocityX(-100);
            enemy.setFlipX(true);
        } else {
            enemy.setVelocityX(0);
        }

        if (Phaser.Math.Between(0, 100) < 20 && enemy.body.touching.down && Math.abs(enemy.x - playerX) < 200) {
            enemy.setVelocityY(-300);
        }
    }

    setupMobileControls() {
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (event) => {
                const tilt = event.gamma;
    
                if (tilt !== null) {
                    if (tilt > 8) {
                        this.player.setVelocityX(160);
                        this.player.setFlipX(false);
                        this.player.play('walk', true);
                    } else if (tilt < -8) {
                        this.player.setVelocityX(-160);
                        this.player.setFlipX(true);
                        this.player.play('walk', true);
                    } else {
                        this.player.setVelocityX(0);
                        this.player.play('idle', true);
                    }
                }
            });
        } else {
            console.warn("Tilt controls unavailable. Enabling joystick as fallback.");
            this.setupJoystick();
        }
    }    

    setupJoystick() {
        const joystickArea = document.getElementById('joystick-area');
        let joystickStartX = 0;
        let joystickStartY = 0;

        joystickArea.addEventListener('touchstart', (event) => {
            const touch = event.touches[0];
            joystickStartX = touch.clientX;
            joystickStartY = touch.clientY;
        });

        joystickArea.addEventListener('touchmove', (event) => {
            const touch = event.touches[0];
            const deltaX = touch.clientX - joystickStartX;
            const deltaY = touch.clientY - joystickStartY;

            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const maxDistance = 50;

            const forceX = deltaX / Math.max(distance, maxDistance);
            const forceY = deltaY / Math.max(distance, maxDistance);

            if (this.player) {
                this.player.setVelocityX(forceX * 160);
                if (forceX > 0) this.player.setFlipX(false);
                if (forceX < 0) this.player.setFlipX(true);

                if (forceY < -0.5 && this.player.body.touching.down) {
                    this.player.setVelocityY(-500); // Jump
                }
            }
        });

        joystickArea.addEventListener('touchend', () => {
            if (this.player) {
                this.player.setVelocityX(0);
                this.player.anims.play('idle', true);
            }
        });
    }
}
