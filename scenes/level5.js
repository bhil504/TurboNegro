import { addFullscreenButton } from '/utils/fullScreenUtils.js';
import { setupMobileControls } from '/utils/mobileControls.js';

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
        this.load.audio('level5Music', 'assets/Audio/LevelMusic/mp3/Explosion of Ignorance.mp3');
        this.load.image('healthPack', 'assets/Items/HealthPack.png');

        this.load.audio('playerHit', 'assets/Audio/SoundFX/mp3/playerHit.mp3');
        this.load.audio('playerProjectileFire', 'assets/Audio/SoundFX/mp3/playerprojectilefire.mp3');
        this.load.audio('beignetMinionHit', 'assets/Audio/SoundFX/mp3/beignetminionHit.mp3');
        this.load.audio('beignetMonsterHit', 'assets/Audio/SoundFX/mp3/beignetmonsterHit.mp3');
        this.load.audio('beignetProjectileFire', 'assets/Audio/SoundFX/mp3/beignetprojectilefire.mp3');
    }

    create() {
        const { width, height } = this.scale;
        this.totalEnemiesToDefeat = 45;
        this.totalEnemiesDefeated = 0;
        this.updateEnemyCountUI();

        this.add.image(width / 2, height / 2, 'level5Background').setDisplaySize(width, height);
        this.levelMusic = this.sound.add('level5Music', { loop: true, volume: 0.5 });
        this.levelMusic.play();

        this.playerHitSFX = this.sound.add('playerHit', { volume: 0.6 });
        this.playerProjectileFireSFX = this.sound.add('playerProjectileFire', { volume: 0.6 });
        this.beignetMinionHitSFX = this.sound.add('beignetMinionHit', { volume: 0.8 });
        this.beignetMonsterHitSFX = this.sound.add('beignetMonsterHit', { volume: 0.8 });
        this.beignetProjectileFireSFX = this.sound.add('beignetProjectileFire', { volume: 0.6 });

        this.player = this.physics.add.sprite(100, height - 150, 'turboNegroStanding1');
        this.player.setCollideWorldBounds(true);

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
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.platforms = this.physics.add.staticGroup();
        this.ground = this.platforms.create(width / 2, height - 10, null).setDisplaySize(width, 20).setVisible(false).refreshBody();

        this.platforms.create(width / 2, height / 2 - 50, 'platform').setDisplaySize(200, 20).setVisible(true).refreshBody();
        this.platforms.create(50, height / 2, 'platform').setDisplaySize(200, 20).setVisible(true).refreshBody();
        this.platforms.create(width - 50, height / 2, 'platform').setDisplaySize(200, 20).setVisible(true).refreshBody();

        this.physics.add.collider(this.player, this.platforms);

        this.projectiles = this.physics.add.group();
        this.beignetProjectiles = this.physics.add.group();
        this.enemies = this.physics.add.group();

        this.physics.add.collider(this.enemies, this.platforms);
        this.physics.add.overlap(this.player, this.beignetProjectiles, this.handleBeignetHit, null, this);
        this.physics.add.collider(this.projectiles, this.enemies, this.handleProjectileHit, null, this);
        this.physics.add.collider(this.projectiles, this.beignetProjectiles, this.handleProjectileCollision, null, this);

        this.time.addEvent({ delay: 3000, callback: this.spawnBeignetMinion, callbackScope: this, loop: true });
        this.time.addEvent({ delay: 5000, callback: this.spawnBeignetMonster, callbackScope: this, loop: true });

        addFullscreenButton(this);
        setupMobileControls(this, this.player);
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
        if (healthPack.active) {
            this.playerHealth = Math.min(this.playerHealth + 5, this.maxHealth);
            this.updateHealthUI();
            console.log("Health pack collected! Health:", this.playerHealth);
    
            this.time.delayedCall(100, () => {
                healthPack.destroy();
            }); // Delay destruction to prevent overlapping issues
        }
    }    

    updateHealthUI() {
        const healthPercentage = (this.playerHealth / this.maxHealth) * 100;
        document.getElementById('health-bar-inner').style.width = `${healthPercentage}%`;
    }

    update() {
        if (!this.player || !this.cursors) return;
    
        // Reset horizontal velocity
        this.player.setVelocityX(0);
    
        // Tilt controls
        if (this.isUsingJoystick) return; // Skip if joystick is active
        if (typeof this.joystickForceX !== "undefined" && this.joystickForceX !== 0) {
            this.player.setVelocityX(this.joystickForceX * 160); // Joystick or tilt control velocity
            this.player.setFlipX(this.joystickForceX < 0);
            this.player.play('walk', true);
        } else if (this.tiltX !== undefined && Math.abs(this.tiltX) > 8) {
            this.player.setVelocityX(this.tiltX * 5); // Adjust sensitivity multiplier
            this.player.setFlipX(this.tiltX < 0);
            this.player.play('walk', true);
        } else {
            // Default idle animation
            this.player.play('idle', true);
        }
    
        // Keyboard controls
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.setFlipX(true);
            this.player.play('walk', true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.setFlipX(false);
            this.player.play('walk', true);
        }
    
        // Jump logic
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-500);
            this.player.play('jump', true);
        }
    
        // Fire projectile logic
        if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
            this.fireProjectile();
        }
    
        // Ensure enemies keep moving and don't get stuck
        this.enemies.children.iterate((enemy) => {
            if (enemy.body.velocity.x === 0) {
                enemy.setVelocityX(Phaser.Math.Between(-100, 100)); // Give a new velocity if stopped
            }
        });
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
        const { width, height } = this.scale;
        const side = Math.random() < 0.5 ? 0 : width; // Spawn on left or right side
        const minion = this.enemies.create(side, height / 2, 'beignetMinion');
    
        minion.setCollideWorldBounds(true);
        minion.body.setAllowGravity(true);
        minion.setBounce(1); // Ensure bouncing
        minion.setVelocityX(side === 0 ? 100 : -100); // Move left if right-spawned, and vice versa
    
        // Reverse direction upon hitting a wall
        minion.body.onWorldBounds = true;
        minion.setInteractive();
        minion.body.world.on('worldbounds', (body) => {
            if (body.gameObject === minion) {
                minion.setVelocityX(minion.body.velocity.x > 0 ? -100 : 100);
            }
        });
    
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
            projectile.setVelocity(Math.cos(angle) * 300, Math.sin(angle) * 300);
            this.beignetProjectileFireSFX.play();
        }
    }

    spawnBeignetMonster() {
        const { width, height } = this.scale;
        const x = Phaser.Math.Between(50, width - 50);
        const monster = this.enemies.create(x, height / 3, 'beignetMonster');
    
        monster.setCollideWorldBounds(true);
        monster.body.setAllowGravity(true);
        monster.setBounce(0.2);
        monster.health = 2;
        monster.setVelocityX(Phaser.Math.Between(-150, 150)); // Randomized horizontal movement
    
        // Reverse direction when hitting a wall
        monster.body.onWorldBounds = true;
        monster.setInteractive();
        monster.body.world.on('worldbounds', (body) => {
            if (body.gameObject === monster) {
                monster.setVelocityX(monster.body.velocity.x > 0 ? -150 : 150);
            }
        });
    
        this.physics.add.overlap(this.player, monster, this.handleMonsterCollision, null, this);

        this.physics.add.collider(this.enemies, this.platforms, (enemy) => {
            if (enemy.body.touching.right || enemy.body.touching.left) {
                enemy.setVelocityX(enemy.body.velocity.x * -1); // Reverse direction on collision
            }
        });
        
    }    

    handleBeignetHit(player, projectile) {
        projectile.destroy();
        this.playerHealth -= 1;
        this.updateHealthUI();
        this.playerHitSFX.play();
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
        enemy.destroy();
        this.totalEnemiesDefeated++;
        this.updateEnemyCountUI();

        // Spawn a health pack every 12 enemies defeated
        if (this.totalEnemiesDefeated % 12 === 0) {
            this.spawnHealthPack();
            console.log("Health pack spawned after defeating 12 enemies.");
        }
    
        if (enemy.texture.key === 'beignetMinion') {
            this.beignetMinionHitSFX.play();
        } else if (enemy.texture.key === 'beignetMonster') {
            this.beignetMonsterHitSFX.play();
        } else {
            console.warn("No sound effect assigned for:", enemy.texture.key);
        }
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
