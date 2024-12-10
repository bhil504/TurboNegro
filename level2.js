export default class Level2 extends Phaser.Scene {
    constructor() {
        super({ key: 'Level2' });
    }

    preload() {
        console.log("Preloading assets for Level 2...");
        // Load background and character assets
        this.load.image('level2Background', 'assets/Levels/BackGrounds/Level2.webp');
        this.load.image('turboNegroWalking', 'assets/Characters/Character1/TurboNegroWalking/TurboNegroWalking.png');
        this.load.image('turboNegroJump', 'assets/Characters/Character1/TurboNegroJump.png');
        this.load.image('projectileCD', 'assets/Characters/Projectiles/CD/CDresize.png');
        this.load.image('turboNegroStanding1', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding1.png');
        this.load.image('turboNegroStanding2', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding2.png');
        this.load.image('turboNegroStanding3', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding3.png');
        this.load.image('turboNegroStanding4', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding4.png');
    
        // Load platform assets
        this.load.image('ledgeLeft', 'assets/Levels/Platforms/LedgeLeft.png');
        this.load.image('ledgeRight', 'assets/Levels/Platforms/LedgeRight.png');
    
        // Load enemy assets
        this.load.image('skeleton', 'assets/Characters/Enemies/MardiGrasZombie.png');
        this.load.image('trumpetSkeleton', 'assets/Characters/Enemies/TrumpetSkeleton.png');
    
        // Load UI and pickups
        this.load.image('gameOver', 'assets/UI/gameOver.png');
        this.load.image('levelComplete', 'assets/UI/levelComplete.png');
        this.load.image('healthPack', 'assets/Characters/Pickups/HealthPack.png');
    
        // Load audio
        this.load.audio('level2Music', 'assets/Audio/SeptemberHue.mp3');
        console.log("Assets for Level 2 preloaded successfully.");
    }
    

    create() {
        const { width, height } = this.scale;
    
        // Play background music
        this.levelMusic = this.sound.add('level2Music', { loop: true, volume: 0.5 });
        this.levelMusic.play();
    
        // Add background
        this.add.image(width / 2, height / 2, 'level2Background').setDisplaySize(width, height).setDepth(0); // Background depth
    
        // Add platforms group
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(width / 2, height - 20, null)
            .setDisplaySize(width, 20)
            .setVisible(false)
            .refreshBody();
    
        // Ledge images (visual only)
        const leftLedge = this.add.image(150, height - 400, 'ledgeLeft').setDepth(2); // Railings in front of player
        const rightLedge = this.add.image(width - 150, height - 400, 'ledgeRight').setDepth(2); // Railings in front of player
    
        // Collision platforms aligned with blue line (420px)
        const leftPlatform = this.platforms.create(150, height - 325, null) // Platform below the visual ledge
            .setDisplaySize(300, 10)
            .setVisible(false)
            .refreshBody();
    
        const rightPlatform = this.platforms.create(width - 150, height - 325, null) // Platform below the visual ledge
            .setDisplaySize(300, 10)
            .setVisible(false)
            .refreshBody();
    
        // Player setup
        this.player = this.physics.add.sprite(100, height - 100, 'turboNegroStanding1');
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.platforms);
    
        // Set depth for player to be behind the railings
        this.player.setDepth(1); // Player appears behind the ledge (lower depth)
    
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
    
        // Input setup
        this.cursors = this.input.keyboard.createCursorKeys();
        this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
        // Health packs group
        this.healthPacks = this.physics.add.group();
        this.physics.add.collider(this.healthPacks, this.platforms);
        this.physics.add.overlap(this.player, this.healthPacks, this.handlePlayerHealthPackCollision, null, this);
    
        // Projectile and enemy groups
        this.projectiles = this.physics.add.group({ defaultKey: 'projectileCD' });
        this.enemies = this.physics.add.group();
        this.trumpetEnemies = this.physics.add.group();
        this.totalEnemiesDefeated = 0;
    
        // Enemy spawn timer for Mardi Gras Zombie
        if (!this.enemySpawnTimer) {
            this.enemySpawnTimer = this.time.addEvent({
                delay: 2000,
                callback: this.spawnMardiGrasZombie,
                callbackScope: this,
                loop: true,
            });
        }
    
        // Trumpet Skeleton spawn timer
        if (!this.trumpetSpawnTimer) {
            this.trumpetSpawnTimer = this.time.addEvent({
                delay: 3000,
                callback: this.spawnTrumpetSkeleton,
                callbackScope: this,
                loop: true,
            });
        }
    
        // Player health
        this.playerHealth = 10;
        this.maxHealth = 10;
    
        // Health bar graphics (now at the bottom)
        this.healthBar = this.add.graphics();
        this.updateHealthBar();
    
        // Enemy countdown (now at the bottom, right-aligned)
        this.enemyCountdown = this.add.text(width - 200, height - 30, `Enemies Left: ${30 - this.totalEnemiesDefeated}`, {
            fontSize: '20px',
            fill: '#fff',
            backgroundColor: '#000',
        });
    
        // Collision handlers
        this.physics.add.collider(this.player, this.enemies, this.handlePlayerEnemyCollision, null, this);
        this.physics.add.collider(this.player, this.trumpetEnemies, this.handleTrumpetSkeletonCollision, null, this);
        this.physics.add.collider(this.projectiles, this.enemies, this.handleProjectileEnemyCollision, null, this);
        this.physics.add.collider(this.projectiles, this.trumpetEnemies, this.handleProjectileEnemyCollision, null, this);
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.collider(this.trumpetEnemies, this.platforms);
    }

    update() {
        if (!this.player || !this.cursors) return;

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

    spawnEnemy() {
        const { width } = this.scale;
        const x = Phaser.Math.Between(50, width - 50);
        const y = 0;
    
        const enemy = this.enemies.create(x, y, 'skeleton');
        enemy.setCollideWorldBounds(true);
        enemy.setBounce(0.2);
    
        // Attach AI behavior with a timer
        enemy.aiTimer = this.time.addEvent({
            delay: 500,
            callback: () => {
                if (enemy.active) this.enemyAI(enemy); // Only run AI if enemy is active
            },
            loop: true,
        });
    
        // Cleanup when enemy is destroyed
        enemy.on('destroy', () => {
            if (enemy.aiTimer) enemy.aiTimer.remove(); // Remove the timer if enemy is destroyed
        });
    }
    

    enemyAI(enemy) {
        if (!enemy || !enemy.body || !this.player || !this.player.body) return; // Safeguard: Ensure objects exist
    
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
    

    handlePlayerEnemyCollision(player, enemy) {
        enemy.destroy();
        this.playerHealth--;

        this.updateHealthBar();

        if (this.playerHealth <= 0) {
            this.gameOver();
        }
    }

    handleProjectileEnemyCollision(projectile, enemy) {
        if (!projectile || !enemy) return;
        projectile.destroy();
        enemy.destroy();
        this.totalEnemiesDefeated++;
    
        // Spawn a health pack after every 12 enemy kills
        if (this.totalEnemiesDefeated % 12 === 0) {
            this.spawnHealthPack();
        }
    
        this.enemyCountdown.setText(`Enemies Left: ${30 - this.totalEnemiesDefeated}`);
    
        if (this.totalEnemiesDefeated >= 30) {
            this.levelComplete();
        }
    }
    
    updateHealthBar() {
        this.healthBar.clear();
        const barWidth = 200;
        const barHeight = 20;
        const healthPercentage = this.playerHealth / this.maxHealth;
    
        // Adjust health bar position to the bottom
        const x = 20;
        const y = this.scale.height - 30; // 30 pixels from the bottom
    
        this.healthBar.fillStyle(0x808080);
        this.healthBar.fillRect(x, y, barWidth, barHeight);
    
        this.healthBar.fillStyle(0x00ff00);
        this.healthBar.fillRect(x, y, barWidth * healthPercentage, barHeight);
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
        this.updateHealthBar();
    }

    gameOver() {
        // Stop background music
        if (this.levelMusic) this.levelMusic.stop();
    
        // Stop spawning enemies
        if (this.enemySpawnTimer) this.enemySpawnTimer.remove();
        if (this.trumpetSpawnTimer) this.trumpetSpawnTimer.remove();
    
        // Safely clear enemies and projectiles
        this.enemies.clear(true, true); // Destroys all active enemies
        this.trumpetEnemies.clear(true, true); // Destroys all active trumpet enemies
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
        if (this.trumpetSpawnTimer) this.trumpetSpawnTimer.remove();
    
        // Safely clear enemies and projectiles
        this.enemies.clear(true, true); // Destroys all active enemies
        this.trumpetEnemies.clear(true, true); // Destroys all active trumpet enemies
        this.projectiles.clear(true, true); // Destroys all active projectiles
    
        // Display level complete screen
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'levelComplete').setOrigin(0.5);
    
        // Proceed to the next level after input
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('Level3'); // Transition to Level3
        });
    }

    spawnMardiGrasZombie() {
        const { width } = this.scale;
        const x = Phaser.Math.Between(50, width - 50);
        const y = 0;

        const enemy = this.enemies.create(x, y, 'skeleton');
        enemy.setCollideWorldBounds(true);
        enemy.setBounce(0.2);

        // Attach AI behavior with a timer
        enemy.aiTimer = this.time.addEvent({
            delay: 500,
            callback: () => {
                if (enemy.active) this.enemyAI(enemy); // Only run AI if enemy is active
            },
            loop: true,
        });

        // Cleanup when enemy is destroyed
        enemy.on('destroy', () => {
            if (enemy.aiTimer) enemy.aiTimer.remove(); // Remove the timer if enemy is destroyed
        });
    }

    spawnTrumpetSkeleton() {
        const { width, height } = this.scale;
        const x = Math.random() < 0.5 ? 0 : width; // Spawn from the left or right side
        const y = height - 150; // Start near the ground level
    
        const trumpetSkeleton = this.trumpetEnemies.create(x, y, 'trumpetSkeleton');
        trumpetSkeleton.setCollideWorldBounds(true);
        trumpetSkeleton.body.allowGravity = true;
    
        // Add jumping behavior with a landed state
        trumpetSkeleton.isLanded = true;
    
        // Control jumping behavior
        this.time.addEvent({
            delay: 1500, // Jump every 1.5 seconds if landed
            loop: true,
            callback: () => {
                if (trumpetSkeleton.active && trumpetSkeleton.body && trumpetSkeleton.isLanded) {
                    trumpetSkeleton.setVelocityY(-300); // Jump height
                    const direction = this.player.x > trumpetSkeleton.x ? 150 : -150;
                    trumpetSkeleton.setVelocityX(direction); // Move toward player
                    trumpetSkeleton.isLanded = false; // Mark as not landed during jump
                }
            },
        });
    
        // Attach a collision event to detect landing
        this.physics.add.collider(trumpetSkeleton, this.platforms, () => {
            trumpetSkeleton.setVelocityX(0); // Stop horizontal movement on landing
            trumpetSkeleton.isLanded = true; // Mark as landed
        });
    
        // Attach a periodic attack event when near the player and on the ground
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
    

    trumpetSkeletonAttack(trumpetSkeleton) {
        console.log('Trumpet Skeleton attacks!');
        this.playerHealth -= 2; // Inflict 2 points of damage
        this.updateHealthBar();
    
        if (this.playerHealth <= 0) {
            this.gameOver();
        }
    }

    handleTrumpetSkeletonCollision(player, trumpetSkeleton) {
        console.log('Player hit by Trumpet Skeleton!');
        trumpetSkeleton.destroy(); // Optionally destroy the Trumpet Skeleton on collision
        this.playerHealth--; // Decrease player's health
        this.updateHealthBar();

        if (this.playerHealth <= 0) {
            this.gameOver(); // End game if health is depleted
        }
    }


    
}
