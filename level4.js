export default class Level4 extends Phaser.Scene {
    constructor() {
        super({ key: 'Level4' });
    }

    preload() {
        console.log("Preloading assets for Level 4...");
        this.load.image('level4Background', 'assets/Levels/BackGrounds/Level4.webp');
        this.load.image('platform', 'assets/Levels/Platforms/platform.png');
        this.load.image('mardiGrasZombie', 'assets/Characters/Enemies/MardiGrasZombie.png');
        this.load.image('trumpetSkeleton', 'assets/Characters/Enemies/TrumpetSkeleton.png');
        this.load.image('beignetMinion', 'assets/Characters/Enemies/Beignet_Minion.png');
        this.load.image('beignetProjectile', 'assets/Characters/Projectiles/Beignet/Beignet2.png');
        this.load.image('turboNegroStanding1', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding1.png');
        this.load.image('turboNegroStanding2', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding2.png');
        this.load.image('turboNegroStanding3', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding3.png');
        this.load.image('turboNegroStanding4', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding4.png');
        this.load.image('turboNegroWalking', 'assets/Characters/Character1/TurboNegroWalking/TurboNegroWalking.png');
        this.load.image('playerProjectile', 'assets/Characters/Projectiles/CD/CDresize.png');
        this.load.image('healthPack', 'assets/Items/HealthPack.png');
        this.load.audio('level4Music', 'assets/Audio/Danza.mp3');
    }

    updateHealthUI() {
        const healthPercentage = (this.playerHealth / this.maxHealth) * 100;
        document.getElementById('health-bar-inner').style.width = `${healthPercentage}%`;
    }

    updateEnemyCountUI() {
        document.getElementById('enemy-count').innerText = `Enemies Left: ${45 - this.totalEnemiesDefeated}`;
    }
    
    create() {
        const { width, height } = this.scale;

        // Background and Music
        this.add.image(width / 2, height / 2, 'level4Background').setDisplaySize(width, height);
        this.levelMusic = this.sound.add('level4Music', { loop: true, volume: 0.5 });
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


        // Add Other Platforms
        this.platforms.create(width / 2, height / 2 - 50, 'platform')
            .setDisplaySize(150, 20)
            .setVisible(true)
            .refreshBody();

        this.platforms.create(50, height / 2, 'platform')
            .setDisplaySize(150, 20)
            .setVisible(true)
            .refreshBody();

        this.platforms.create(width - 50, height / 2, 'platform')
            .setDisplaySize(150, 20)
            .setVisible(true)
            .refreshBody();


        this.physics.add.collider(this.player, this.platforms);

        // Groups
        this.projectiles = this.physics.add.group();
        this.enemies = this.physics.add.group();
        this.trumpetEnemies = this.physics.add.group();
        this.beignetProjectiles = this.physics.add.group();
        this.healthPacks = this.physics.add.group();

        // Collisions
        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.collider(this.trumpetEnemies, this.platforms);
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.projectiles, this.enemies, this.handleProjectileHit, null, this);
        this.physics.add.collider(this.projectiles, this.trumpetEnemies, this.handleProjectileHit, null, this);
        this.physics.add.collider(this.player, this.enemies, this.handleEnemyCollision, null, this);
        this.physics.add.collider(this.player, this.trumpetEnemies, this.handleEnemyCollision, null, this);
        this.physics.add.overlap(this.player, this.beignetProjectiles, this.handleBeignetHit, null, this);
        this.physics.add.collider(this.projectiles, this.beignetProjectiles, this.handleProjectileCollision, null, this);
        this.physics.add.overlap(this.player, this.healthPacks, this.collectHealthPack, null, this);

        // Player Health
        this.playerHealth = 10;
        this.maxHealth = 10;
        this.totalEnemiesDefeated = 0;
        this.updateHealthUI();
        this.updateEnemyCountUI();

        // Enemy Spawns
        this.time.addEvent({
            delay: 2000,
            callback: this.spawnMardiGrasZombie,
            callbackScope: this,
            loop: true,
        });

        this.time.addEvent({
            delay: 3000,
            callback: this.spawnTrumpetSkeleton,
            callbackScope: this,
            loop: true,
        });

        this.time.addEvent({
            delay: 4000,
            callback: this.spawnBeignetMinion,
            callbackScope: this,
            loop: true,
        });
    }

    update() {
        if (!this.player || !this.cursors) return;

        this.player.setVelocityX(0);

        // Movement
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.setFlipX(true);
            if (this.player.body.touching.down) this.player.play('walk', true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.setFlipX(false);
            if (this.player.body.touching.down) this.player.play('walk', true);
        } else if (this.player.body.touching.down) {
            this.player.play('idle', true);
        }

        // Jump
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            console.log("Jump triggered");
            this.player.setVelocityY(-500);
            this.player.play('jump', true);
        }

        // Attack
        if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
            this.fireProjectile();
        }
    }

    fireProjectile() {
        const projectile = this.projectiles.create(this.player.x, this.player.y, 'playerProjectile');
        if (projectile) {
            projectile.setVelocityX(this.player.flipX ? -500 : 500);
            projectile.setCollideWorldBounds(false);
            projectile.body.setAllowGravity(false);
        }
    }

    spawnMardiGrasZombie() {
        const zombie = this.enemies.create(Phaser.Math.Between(50, 750), 0, 'mardiGrasZombie');
        zombie.setCollideWorldBounds(true).setBounce(0.2);

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
    }

    spawnBeignetMinion() {
        // Check the number of active Beignet Minions in the enemies group
        const activeBeignetMinions = this.enemies.getChildren().filter(enemy => enemy.texture.key === 'beignetMinion' && enemy.active);
    
        if (activeBeignetMinions.length >= 2) return; // Limit to 2 active minions
    
        const { width, height } = this.scale;
        const side = Math.random() < 0.5 ? 0 : width; // Randomly spawn on the left or right side
        const minion = this.enemies.create(side, this.ground.y - 10, 'beignetMinion'); // Spawn at ground level
    
        minion.setCollideWorldBounds(true); // Enable collision with world bounds
        minion.body.setAllowGravity(false); // Disable gravity for the minion
        minion.setVelocityX(side === 0 ? 100 : -100); // Move left or right based on spawn side
    
        this.physics.add.collider(minion, this.platforms); // Ensure collision with the ground
    
        // Dynamic movement AI
        this.time.addEvent({
            delay: 500,
            loop: true,
            callback: () => {
                if (minion && minion.active) {
                    this.zombieAI(minion); // Reuse zombieAI logic for movement
                }
            },
        });
    
        // Set a timer to make the minion shoot projectiles
        this.time.addEvent({
            delay: 2000, // Fire projectiles every 2 seconds
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
            projectile.setVelocity(Math.cos(angle) * 300, Math.sin(angle) * 300);
        }
    }

    spawnHealthPack() {
        const { width } = this.scale;
        const x = Phaser.Math.Between(50, width - 50); // Random X position
        const healthPack = this.healthPacks.create(x, 0, 'healthPack'); // Spawn at the top of the screen
        healthPack.setCollideWorldBounds(true); // Enable collision with world bounds
        healthPack.setBounce(0.5); // Add bounce for realism
        healthPack.body.setAllowGravity(true); // Enable gravity
    }
    
    collectHealthPack(player, healthPack) {
        healthPack.destroy();
        this.playerHealth = Math.min(this.playerHealth + 5, this.maxHealth); // Restore 5 health points
        this.updateHealthUI();
        console.log("Health Pack Collected! Health:", this.playerHealth);
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
        console.log("Player projectile and Beignet Minion projectile destroyed!");
    }

    handleProjectileHit(projectile, enemy) {
        projectile.destroy();
        enemy.destroy();
        this.totalEnemiesDefeated++;
        this.updateEnemyCountUI();
    
        if (this.totalEnemiesDefeated % 12 === 0) {
            this.spawnHealthPack();
        }
    
        if (this.totalEnemiesDefeated >= 45) { // Updated to require 45 enemies for level completion
            this.levelComplete();
        }
    }
    
    handleEnemyCollision(player, enemy) {
        enemy.destroy();
        this.playerHealth -= 1;
        this.updateHealthUI();
        if (this.playerHealth <= 0) {
            this.gameOver();
        }
    }

    levelComplete() {
        console.log("Level Complete!");
        if (this.levelMusic) this.levelMusic.stop();
        if (this.enemySpawnTimer) this.enemySpawnTimer.remove();
        if (this.trumpetSpawnTimer) this.trumpetSpawnTimer.remove();
        this.enemies.clear(true, true);
        this.trumpetEnemies.clear(true, true);
        this.beignetProjectiles.clear(true, true);
        this.projectiles.clear(true, true);
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'levelComplete').setOrigin(0.5);
    
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('Level5');
        });
    }   
    
    gameOver() {
        console.log("Game Over!");
        if (this.levelMusic) this.levelMusic.stop();
        if (this.enemySpawnTimer) this.enemySpawnTimer.remove();
        if (this.trumpetSpawnTimer) this.trumpetSpawnTimer.remove();
        this.enemies.clear(true, true);
        this.trumpetEnemies.clear(true, true);
        this.beignetProjectiles.clear(true, true);
        this.projectiles.clear(true, true);
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'gameOver').setOrigin(0.5);
    
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.restart();
        });
    }  
    
}
