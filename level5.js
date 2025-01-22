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

        this.player.setVelocityX(0);

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

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-500);
            this.player.play('jump', true);
        }

        if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
            this.fireProjectile();
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

    updateHealthUI() {
        const healthPercentage = (this.playerHealth / this.maxHealth) * 100;
        document.getElementById('health-bar-inner').style.width = `${healthPercentage}%`;
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

    checkLevelCompletion() {
        if (this.totalEnemiesDefeated >= this.totalEnemiesToDefeat) {
            this.levelComplete();
        }
    }
    
    levelComplete() {
        console.log("Level Complete!");
        if (this.levelMusic) this.levelMusic.stop();
        if (this.enemySpawnTimer) this.enemySpawnTimer.remove();
        this.enemies.clear(true, true);
        this.beignetProjectiles.clear(true, true);
        this.projectiles.clear(true, true);
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'levelComplete').setOrigin(0.5);
    
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('BossFight');
        });
    }

    gameOver() {
        console.log("Game Over!");
        if (this.levelMusic) this.levelMusic.stop();
        if (this.enemySpawnTimer) this.enemySpawnTimer.remove();
        this.enemies.clear(true, true);
        this.beignetProjectiles.clear(true, true);
        this.projectiles.clear(true, true);
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'gameOver').setOrigin(0.5);
    
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.restart();
        });
    }
}
