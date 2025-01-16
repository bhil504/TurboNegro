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
    
        // Tilt controls for mobile
        const MAX_TILT_ANGLE = 30; // Define maximum tilt angle for full movement speed
        const MOVE_SPEED = 160;   // Match desktop button movement speed
    
        if (window.isMobile) {
            window.addEventListener('deviceorientation', (event) => {
                if (!event.gamma) return;
                
                // Normalize tilt and calculate velocity
                const normalizedTilt = Phaser.Math.Clamp(event.gamma / MAX_TILT_ANGLE, -1, 1);
                const velocityX = normalizedTilt * MOVE_SPEED;
    
                // Apply movement
                this.player.setVelocityX(velocityX);
                this.player.setFlipX(velocityX < 0);
                
                // Update animation
                if (!this.isJumping && Math.abs(velocityX) > 0) {
                    this.player.play('walk', true);
                } else if (!this.isJumping) {
                    this.player.play('idle', true);
                }
            });
        }
    
        // Button controls
        const leftButton = document.getElementById('left');
        const rightButton = document.getElementById('right');
        const jumpButton = document.getElementById('jump');
        const attackButton = document.getElementById('attack');
    
        leftButton.addEventListener('mousedown', () => {
            this.player.setVelocityX(-MOVE_SPEED);
            this.player.setFlipX(true);
            if (!this.isJumping) this.player.play('walk', true);
        });
    
        rightButton.addEventListener('mousedown', () => {
            this.player.setVelocityX(MOVE_SPEED);
            this.player.setFlipX(false);
            if (!this.isJumping) this.player.play('walk', true);
        });
    
        jumpButton.addEventListener('mousedown', () => {
            if (this.player.body.touching.down && !this.isJumping) {
                this.isJumping = true;
                this.player.setVelocityY(-500);
                this.player.play('jump', true);
            }
        });
    
        attackButton.addEventListener('mousedown', () => this.fireProjectile());
    
        // Create a group for health packs
        this.healthPacks = this.physics.add.group();
    
        // Add collision detection for health packs and platforms
        this.physics.add.collider(this.healthPacks, this.platforms);
    
        // Add collision detection for player and health packs
        this.physics.add.overlap(this.player, this.healthPacks, this.handlePlayerHealthPackCollision, null, this);
    
        // Projectile and enemy groups
        this.projectiles = this.physics.add.group({ defaultKey: 'projectileCD' });
        this.enemies = this.physics.add.group();
        this.totalEnemiesDefeated = 0;
    
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
    
        // Collision handlers
        this.physics.add.collider(this.player, this.enemies, this.handlePlayerEnemyCollision, null, this);
        this.physics.add.collider(this.projectiles, this.enemies, this.handleProjectileEnemyCollision, null, this);
        this.physics.add.collider(this.enemies, this.platforms);
    
        this.updateHealthUI(); // Initialize health bar
        this.updateEnemyCountUI(); // Initialize enemy count
    
        // Pointer-based movement for mobile
        this.leftButton = this.add.image(50, 550, 'leftButton').setInteractive();
        this.rightButton = this.add.image(150, 550, 'rightButton').setInteractive();
    
        this.leftButton.on('pointerdown', () => {
            isMovingLeft = true;
        });
    
        this.rightButton.on('pointerdown', () => {
            isMovingRight = true;
        });
    
        this.leftButton.on('pointerup', () => {
            isMovingLeft = false;
        });
    
        this.rightButton.on('pointerup', () => {
            isMovingRight = false;
        });
    
        this.leftButton.on('pointerout', () => {
            isMovingLeft = false;
        });
    
        this.rightButton.on('pointerout', () => {
            isMovingRight = false;
        });
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

        this.time.addEvent({
            delay: 500,
            callback: () => this.enemyAI(enemy),
            loop: true,
        });
    }

    enemyAI(enemy) {
        if (!enemy.body || !this.player.body) return;
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
    
        // Update health bar
        this.updateHealthUI();

    
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
        this.playerHealth = Math.min(this.playerHealth + 5, this.maxHealth);
    
        // Update health bar
        this.updateHealthUI();

    }
    
}
