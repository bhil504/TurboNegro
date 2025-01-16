export default class Level1 extends Phaser.Scene {
    constructor() {
        super({ key: 'Level1' });
    }

    updateHealthUI() {
        const healthPercentage = (this.playerHealth / this.maxHealth) * 100;
        document.getElementById('health-bar-inner').style.width = `${healthPercentage}%`;
    }
    
    updateEnemyCountUI() {
        document.getElementById('enemy-count').innerText = `Enemies Left: ${20 - this.totalEnemiesDefeated}`;
    }
    
    preload() {
        console.log("Preloading assets...");
        this.load.image('level1Background', 'assets/Levels/BackGrounds/Level1.png');
        this.load.image('turboNegroWalking', 'assets/Characters/Character1/TurboNegroWalking/TurboNegroWalking.png');
        this.load.image('turboNegroJump', 'assets/Characters/Character1/TurboNegroJump.png');
        this.load.image('projectileCD', 'assets/Characters/Projectiles/CD/CDresize.png');
        this.load.image('turboNegroStanding1', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding1.png');
        this.load.image('turboNegroStanding2', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding2.png');
        this.load.image('turboNegroStanding3', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding3.png');
        this.load.image('turboNegroStanding4', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding4.png');
        this.load.image('balcony', 'assets/Levels/Platforms/Balcony.png');
        this.load.image('skeleton', 'assets/Characters/Enemies/MardiGrasZombie.png');
        this.load.image('gameOver', 'assets/UI/gameOver.png');
        this.load.image('levelComplete', 'assets/UI/levelComplete.png');
        this.load.image('healthPack', 'assets/Characters/Pickups/HealthPack.png'); // Health pack asset
        this.load.audio('level1Music', 'assets/Audio/BlownMoneyAudubonPark.mp3');
        console.log("Assets preloaded successfully.");
    }

    create() { 
        const { width, height } = this.scale;

        // Play background music
        this.levelMusic = this.sound.add('level1Music', { loop: true, volume: 0.5 });
        this.levelMusic.play();

        // Add background
        this.add.image(width / 2, height / 2, 'level1Background').setDisplaySize(width, height);

        // Add platforms
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(width / 2, height - 20, null)
            .setDisplaySize(width, 20)
            .setVisible(false)
            .refreshBody();

        const balcony = this.platforms.create(width / 2, height - 350, 'balcony')
            .setScale(1)
            .refreshBody();
        balcony.body.setSize(280, 10).setOffset((balcony.displayWidth - 280) / 2, balcony.displayHeight - 75);

        // Player setup
        this.player = this.physics.add.sprite(100, height - 100, 'turboNegroStanding1');
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.platforms);

        // Animations
        this.createAnimations();

        // Input setup
        this.cursors = this.input.keyboard.createCursorKeys();
        this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Calibrate tilt and setup mobile input
        this.calibrateTilt();
        this.setupMobileTilt();

        // Groups for projectiles, health packs, and enemies
        this.healthPacks = this.physics.add.group();
        this.projectiles = this.physics.add.group({ defaultKey: 'projectileCD' });
        this.enemies = this.physics.add.group();
        this.totalEnemiesDefeated = 0;

        // Collision setup
        this.setupCollisions();

        // Enemy spawn timer
        this.enemySpawnTimer = this.time.addEvent({
            delay: 1000,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true,
        });

        // Player health
        this.playerHealth = 10;
        this.maxHealth = 10;
        this.updateHealthUI();
        this.updateEnemyCountUI();
    }
    
    spawnEnemy() {
        const { width, height } = this.scale;
        const spawnLocation = Phaser.Math.Between(0, 2);
        const x = spawnLocation === 0 ? Phaser.Math.Between(50, width - 50) : spawnLocation === 1 ? 0 : width;
        const y = spawnLocation === 0 ? 0 : Phaser.Math.Between(50, height - 100);

        const enemy = this.enemies.create(x, y, 'skeleton');
        enemy.setCollideWorldBounds(true);
        enemy.setBounce(0.2);
        enemy.isJumping = false;

        // Add basic enemy behavior
        this.time.addEvent({
            delay: 500,
            callback: () => this.enemyAI(enemy),
            loop: true,
        });

        // Optional: Log enemy spawn details
        console.log("Enemy spawned at", x, y);
    }

    enemyAI(enemy) {
        // Ensure the enemy and player exist, and the enemy has a valid body
        if (!enemy || !enemy.body || !this.player || !this.player.body) {
            console.warn("Invalid enemy or player object in enemyAI.");
            return;
        }
    
        const playerX = this.player.x;
    
        // Horizontal movement logic
        if (enemy.x < playerX - 10) {
            enemy.setVelocityX(50); // Move right
            enemy.setFlipX(false);  // Face right
        } else if (enemy.x > playerX + 10) {
            enemy.setVelocityX(-50); // Move left
            enemy.setFlipX(true);   // Face left
        } else {
            enemy.setVelocityX(0); // Stop moving when close to player
        }
    
        // Jumping behavior
        if (
            Phaser.Math.Between(0, 100) < 20 && // 20% chance to jump
            enemy.body.touching.down &&        // Only jump if touching the ground
            Math.abs(enemy.x - playerX) < 200  // Jump only if within 200 pixels of the player
        ) {
            enemy.setVelocityY(-300); // Jump velocity
        }
    }    

    handlePlayerEnemyCollision(player, enemy) {
        enemy.destroy();
        this.playerHealth--;

        // Update health bar
        this.updateHealthUI();

        // Add visual feedback for collision (e.g., player flash)
        this.player.setTint(0xff0000);
        this.time.delayedCall(200, () => {
            this.player.clearTint();
        });

        // Check if the player is out of health
        if (this.playerHealth <= 0) {
            this.gameOver();
        }
    }

    handleProjectileEnemyCollision(projectile, enemy) {
        projectile.destroy();
        enemy.destroy();
        this.totalEnemiesDefeated++;
    
        // Spawn a health pack after 12 enemies are defeated
        if (this.totalEnemiesDefeated === 12) {
            this.spawnHealthPack();
        }
    
        // Update enemy countdown
        this.updateEnemyCountUI();

    
        if (this.totalEnemiesDefeated >= 20) {
            this.levelComplete();
        }
    }
    
    gameOver() {
        // Stop background music
        if (this.levelMusic) this.levelMusic.stop();
    
        // Stop spawning enemies
        if (this.enemySpawnTimer) this.enemySpawnTimer.remove();
    
        // Safely clear enemies and projectiles
        this.enemies.clear(true, true); // Destroys all active enemies
        this.projectiles.clear(true, true); // Destroys all active projectiles
    
        // Display game over screen
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'gameOver').setOrigin(0.5);
    
        // Restart the scene after input
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.restart();
        });
    }
    
    levelComplete() {
        // Stop background music
        if (this.levelMusic) this.levelMusic.stop();
    
        // Stop spawning enemies
        if (this.enemySpawnTimer) this.enemySpawnTimer.remove();
    
        // Safely clear enemies and projectiles
        this.enemies.clear(true, true); // Destroys all active enemies
        this.projectiles.clear(true, true); // Destroys all active projectiles
    
        // Display level complete screen
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'levelComplete').setOrigin(0.5);
    
        // Proceed to the next level after input
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('Level2'); // Assuming Level2 is the next scene
        });
    }
    
    update() {
        if (!this.player || !this.cursors) return;

        const sensitivity = 5; // Adjust sensitivity for tilt

        // Mobile Tilt Controls
        if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            const tiltVelocity = Phaser.Math.Clamp(this.tiltValue * sensitivity, -160, 160);
            this.player.setVelocityX(tiltVelocity);

            if (tiltVelocity > 0) {
                this.player.setFlipX(false);
                if (this.player.body.touching.down) this.player.play('walk', true);
            } else if (tiltVelocity < 0) {
                this.player.setFlipX(true);
                if (this.player.body.touching.down) this.player.play('walk', true);
            } else if (this.player.body.touching.down) {
                this.player.play('idle', true);
            }
        } else {
            // Desktop Controls
            this.player.setVelocityX(0);

            if (this.cursors.left.isDown) {
                this.player.setVelocityX(-160);
                this.player.setFlipX(true);
                if (!this.isJumping) this.player.play('walk', true);
            } else if (this.cursors.right.isDown) {
                this.player.setVelocityX(160);
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
        }

        // Reset jump animation when on the ground
        if (this.player.body.touching.down && this.isJumping) {
            this.isJumping = false;
            this.player.play('idle', true);
        }

        // Fire projectiles
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

            // Add a lifespan to the projectile
            this.time.delayedCall(2000, () => {
                if (projectile.active) projectile.destroy();
            });

            // Optional: Add effects for the projectile launch
            console.log("Projectile fired at", this.player.flipX ? "left" : "right");
        }
    }

    spawnHealthPack() {
        const { width } = this.scale;
    
        // Random horizontal position for the health pack
        const x = Phaser.Math.Between(50, width - 50);
    
        // Create the health pack slightly above the ground so it falls naturally
        const healthPack = this.healthPacks.create(x, 50, 'healthPack'); // Start at a higher y position
        healthPack.setBounce(0.5); // Add a bounce for visual effect
        healthPack.setCollideWorldBounds(true);
    
        // Add collision with platforms so the health pack lands on them
        this.physics.add.collider(healthPack, this.platforms);
    }

    handlePlayerHealthPackCollision(player, healthPack) {
        healthPack.destroy(); // Remove the health pack

        // Increase player's health by 5, but not beyond the maximum
        const healthBefore = this.playerHealth;
        this.playerHealth = Math.min(this.playerHealth + 5, this.maxHealth);

        // Provide feedback for health increase
        if (this.playerHealth > healthBefore) {
            console.log("Health increased! Current health:", this.playerHealth);
        }

        // Update health bar
        this.updateHealthUI();
    }
    
    setupMobileTilt() {
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
        if (isMobile && window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (event) => {
                // Subtract the calibrated base tilt (neutral position)
                this.tiltValue = event.gamma - this.baseTiltX || 0; // Gamma controls left/right
            });
        }
    }
    
    calibrateTilt() {
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

        if (isMobile && window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (event) => {
                this.baseTiltX = event.gamma || 0; // Capture the neutral gamma position
            }, { once: true }); // Only calibrate once
        }
    }

    setupMobileTilt() {
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

        if (isMobile && window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (event) => {
                this.tiltValue = event.gamma - this.baseTiltX || 0; // Subtract calibrated base tilt
            });
        }
    }


}
