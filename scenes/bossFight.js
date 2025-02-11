import { addFullscreenButton } from '/utils/fullScreenUtils.js';
import { setupMobileControls } from '/utils/mobileControls.js';

export default class BossFight extends Phaser.Scene {
    constructor() {
        super({ key: 'BossFight' });
    }

    preload() {
        this.load.image('finalFightBackground', 'assets/Levels/BackGrounds/finalFight.webp');
        this.load.image('beignetBoss', 'assets/Characters/Enemies/Beignet_Boss.png');
        this.load.image('beignetProjectile', 'assets/Characters/Projectiles/Beignet/Beignet2.png');
        this.load.image('beignetMonster', 'assets/Characters/Enemies/Beignet_Monster.png');
        this.load.image('playerProjectile', 'assets/Characters/Projectiles/CD/CDresize.png');
        this.load.image('turboNegroStanding1', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding1.png');
        this.load.image('turboNegroStanding2', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding2.png');
        this.load.image('turboNegroStanding3', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding3.png');
        this.load.image('turboNegroStanding4', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding4.png');
        this.load.image('turboNegroWalking', 'assets/Characters/Character1/TurboNegroWalking/TurboNegroWalking.png');
        this.load.image('healthPack', 'assets/Characters/Pickups/HealthPack.png');
        this.load.image('fallingHazard', 'assets/Levels/Platforms/fallingHazard.png');
        this.load.image('platform', 'assets/Levels/Platforms/platform.png'); // <-- Load platform image
        this.load.audio('bossMusic', 'assets/Audio/LevelMusic/mp3/SmoothDaggers.mp3');
        this.load.audio('playerProjectileFire', 'assets/Audio/SoundFX/mp3/playerprojectilefire.mp3');
        this.load.audio('bossHit', 'assets/Audio/SoundFX/mp3/bossHit.mp3');
        this.load.audio('playerHit', 'assets/Audio/SoundFX/mp3/playerHit.mp3');
    }

    createMovingPlatform(x, y, width, speed, distance) {
        let platform = this.movingPlatforms.create(x, y, 'platform'); // Use the loaded image
        platform.setDisplaySize(width, 20).setOrigin(0.5, 0.5).refreshBody(); // Adjust display size
    
        this.tweens.add({
            targets: platform,
            x: platform.x + distance,
            duration: speed * 10,
            yoyo: true,
            repeat: -1,
            ease: 'Linear'
        });
    
        return platform;
    }
    
    create() {
        const { width, height } = this.scale;
    
        // **Background Setup**
        this.background = this.add.image(1536, height / 2, 'finalFightBackground')
            .setOrigin(0.5, 0.5)
            .setDisplaySize(3072, height);
    
        // **World & Camera Bounds**
        this.physics.world.setBounds(0, 0, 3072, height);
        this.cameras.main.setBounds(0, 0, 3072, height);
    
        // **Ground Setup**
        this.ground = this.physics.add.staticGroup();
        let groundSprite = this.ground.create(1536, height - 20, null)
            .setDisplaySize(3072, 10)
            .setVisible(false)
            .refreshBody();
    
        // **Moving Platforms Setup**
        this.movingPlatforms = this.physics.add.group({
            allowGravity: false,
            immovable: true
        });
    
        let platform1 = this.createMovingPlatform(800, height - 200, 200, 100, 200);  // Moves 200px left & right
        let platform2 = this.createMovingPlatform(1800, height - 300, 200, 150, 250); // Moves 250px left & right
        let platform3 = this.createMovingPlatform(2500, height - 250, 200, 120, 300); // Moves 300px left & right
    
        // **Player Setup**
        this.player = this.physics.add.sprite(100, height - 150, 'turboNegroStanding1');
        this.player.setCollideWorldBounds(true);
        this.player.setDepth(1);
        this.physics.add.collider(this.player, this.ground);
        this.physics.add.collider(this.player, this.movingPlatforms);
    
        // **Camera Follow**
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    
        // **Boss Fight Music**
        this.bossMusic = this.sound.add('bossMusic', { loop: true, volume: 0.5 });
        this.bossMusic.play();
    
        // **Object Groups**
        this.projectiles = this.physics.add.group({ defaultKey: 'playerProjectile', runChildUpdate: true });
        this.bossProjectiles = this.physics.add.group();
        this.minions = this.physics.add.group();
        this.healthPacks = this.physics.add.group();
        this.hazards = this.physics.add.group(); // **New Hazard Group**
    
        // **Boss Setup**
        this.boss = this.physics.add.sprite(2800, height - 150, 'beignetBoss');
        this.boss.setCollideWorldBounds(true);
        this.boss.body.setAllowGravity(false);
        this.boss.health = 20;
        this.physics.add.collider(this.boss, this.ground);
        this.physics.add.collider(this.boss, this.movingPlatforms);
    
        // **Input Controls**
        this.cursors = this.input.keyboard.createCursorKeys();
        this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
        // **Mobile Controls**
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            setupMobileControls(this, this.player);
        }
    
        // **Fullscreen Button**
        addFullscreenButton(this);
    
        // **Hazard Spawner - Drops Every 5 Seconds**
        this.time.addEvent({
            delay: 5000, // Every 5 seconds
            callback: this.spawnHazard,
            callbackScope: this,
            loop: true
        });

        // **Boss Fires Beignet Projectiles Every 4 Seconds**
        this.time.addEvent({
            delay: 4000, // Fire every 4 seconds
            callback: this.shootProjectiles,
            callbackScope: this,
            loop: true
        });

        // **Boss Spawns a Beignet Monster Every 3 Seconds**
        this.bossMinionCount = 0;
        this.time.addEvent({
            delay: 3000, // Spawn every 3 seconds
            callback: () => {
                this.spawnBeignetMonster();
                this.bossMinionCount++;
                if (this.bossMinionCount >= 5) {
                    this.repositionBoss();
                    this.bossMinionCount = 0; // Reset counter
                }
            },
            callbackScope: this,
            loop: true
        });

        // Ensure player's projectiles can destroy boss's beignet projectiles
        this.physics.add.collider(this.projectiles, this.bossProjectiles, this.handleProjectileCollision, null, this);

        // **Destroy Falling Hazard when Colliding with Platforms**
        this.physics.add.collider(this.hazards, this.movingPlatforms, (hazard) => {
            hazard.destroy();
        });

        // **Destroy Beignet Monster when Hit by Player's Projectile**
        this.physics.add.collider(this.projectiles, this.minions, (projectile, minion) => {
            projectile.destroy();
            minion.health -= 1;
            if (minion.health <= 0) {
                minion.destroy();
            }
        });
    }

    repositionBoss() {
        // Define the safe range for teleportation
        let newX = Phaser.Math.Between(500, 2500); // Keep within the game bounds
        let groundY = this.scale.height - 150; // Ensure boss stays on the ground
    
        // Play a teleport effect (optional, add an effect before disappearing)
        this.boss.setAlpha(0); // Temporarily hide boss for teleportation effect
        this.time.delayedCall(500, () => { // Short delay for teleport effect
            this.boss.setPosition(newX, groundY);
            this.boss.setAlpha(1); // Make the boss visible again
        });
    
        console.log("Boss teleported to:", newX, groundY);
    }
    

    update() {
        this.player.setVelocityX(0);

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160).setFlipX(true);
            this.player.play('walk', true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160).setFlipX(false);
            this.player.play('walk', true);
        } else {
            this.player.play('idle', true);
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-500);
        }

        if (Phaser.Input.Keyboard.JustDown(this.fireKey)) {
            this.fireProjectile();
        }

        // **Fix: Ensure Parallax Background Scrolls Properly**
        this.background.tilePositionX = this.cameras.main.scrollX * 0.5;
    }

    fireProjectile() {
        let projectile = this.projectiles.create(this.player.x, this.player.y, 'playerProjectile');
        if (projectile) {
            projectile.body.setAllowGravity(false);
            projectile.setVelocityX(this.player.flipX ? -500 : 500);
            this.sound.play('playerProjectileFire');
        }
    }

    shootProjectiles() {
        if (!this.player || !this.boss) return;
    
        let projectile = this.bossProjectiles.create(this.boss.x, this.boss.y, 'beignetProjectile');
        if (projectile) {
            projectile.setActive(true).setVisible(true);
            projectile.body.setAllowGravity(false);
    
            // Calculate the angle between the boss and the player
            const angle = Phaser.Math.Angle.Between(this.boss.x, this.boss.y, this.player.x, this.player.y);
    
            // Set velocity to make the projectile move towards the player
            const speed = 250; // Adjust speed as needed
            projectile.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        }
    }    

    spawnMinions() {
        const activeMinions = this.minions.getChildren().filter((minion) => minion.active).length;
        if (activeMinions >= 5) return;
    
        let spawnPoints = [
            { x: 800, y: this.scale.height - 220 },
            { x: 1800, y: this.scale.height - 320 },
            { x: 2500, y: this.scale.height - 270 }
        ];
    
        let randomPoint = Phaser.Utils.Array.GetRandom(spawnPoints);
        
        let minion = this.minions.create(randomPoint.x, randomPoint.y, 'beignetMonster');
        if (minion) {
            minion.setActive(true).setVisible(true);
            minion.setVelocityX(Phaser.Math.Between(-100, 100));
            minion.health = 2;
            this.physics.add.collider(minion, this.ground);
            this.physics.add.collider(minion, this.platforms);
        }
    }  

    spawnBeignetMonster() {
        if (!this.boss || !this.minions) return;
    
        let minion = this.minions.create(this.boss.x, this.boss.y, 'beignetMonster'); // Spawn at boss's position
        if (minion) {
            minion.setActive(true).setVisible(true);
            minion.setCollideWorldBounds(true);
            minion.body.setAllowGravity(true);
            minion.setBounce(0.2);
            minion.health = 2; // **Beignet Monster has 2 health**
    
            // Move toward the player
            const angle = Phaser.Math.Angle.Between(minion.x, minion.y, this.player.x, this.player.y);
            const speed = 100; // Adjust speed as needed
            minion.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    
            // Ensure collision with ground, platforms, and player
            this.physics.add.collider(minion, this.ground);
            this.physics.add.collider(minion, this.platforms);
            this.physics.add.overlap(this.player, minion, this.handleMinionCollision, null, this);
        }
    }
    
    shootMinionProjectile(minion) {
        if (!minion.active) return; // Skip if minion is destroyed
    
        let projectile = this.bossProjectiles.get(minion.x, minion.y, 'beignetProjectile');
        if (projectile) {
            projectile.setActive(true).setVisible(true);
            projectile.body.setAllowGravity(false);
    
            const angle = Phaser.Math.Angle.Between(minion.x, minion.y, this.player.x, this.player.y);
            const speed = Phaser.Math.Between(200, 300); // Randomize projectile speed
            projectile.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        }
    }

    spawnHealthPack() {
        let x = Phaser.Math.Between(50, this.scale.width - 50);
        let healthPack = this.healthPacks.create(x, 50, 'healthPack');
        healthPack.body.setAllowGravity(true);
        healthPack.setBounce(0.5);
    }

    spawnHazard() {
        let x = Phaser.Math.Between(50, this.scale.width - 50);
        let hazard = this.hazards.create(x, 0, 'fallingHazard');
        
        if (hazard) {
            hazard.setActive(true).setVisible(true);
            hazard.body.setAllowGravity(true);
            
            // **Reduced falling speed**
            hazard.setVelocityY(5); // Was 200, now 100 for a slower drop
    
            hazard.setScale(1); // Adjust size if needed
            this.physics.add.collider(hazard, this.ground, () => {
                hazard.destroy(); // Destroy when it hits the ground
            });
    
            this.physics.add.overlap(this.player, hazard, this.handleHazardCollision, null, this);
        }
    }    

    handlePlayerHit(player, projectile) {
        // Handle player getting hit
        this.sound.play('playerHit');
        projectile.destroy();
        this.playerHealth -= 1;
        if (this.playerHealth <= 0) {
            this.scene.start('GameOver');
        }
    }

    handleProjectileCollision(playerProjectile, beignetProjectile) {
        playerProjectile.destroy();
        beignetProjectile.destroy();
        console.log("Player projectile destroyed beignet projectile!");
    }

    handleHazardCollision(player, hazard) {
        hazard.destroy();
        this.playerHealth -= 3; // Damage taken from hazard
        this.updateHealthUI();
        this.sound.play('playerHit');
    
        if (this.playerHealth <= 0) {
            this.scene.start('GameOver');
        }
    }

    handleMinionCollision(player, minion) {
        if (!minion.active) return;
    
        minion.health -= 1; // **Reduce minion health by 1**
        
        if (minion.health <= 0) {
            minion.destroy(); // **Destroy minion if health reaches 0**
        }
    
        this.playerHealth -= 2; // **Player takes 2 damage**
        this.updateHealthUI();
    
        if (this.playerHealth <= 0) {
            this.scene.start('GameOver');
        }
    }
    
    handleHazardCollision(player, hazard) {
        hazard.destroy();
        this.playerHealth -= 3;
        this.updateHealthUI();
        if (this.playerHealth <= 0) {
            this.scene.start('GameOver');
        }
    }

    handleBossHit(projectile, boss) {
        projectile.destroy();
        boss.health -= 1;
        this.sound.play('bossHit');

        if (boss.health <= 0) {
            this.levelComplete();
        }
    }  

    collectHealthPack(player, healthPack) {
        healthPack.destroy();
        this.playerHealth = Math.min(this.playerHealth + 5, 10);
        this.updateHealthUI();
    }

    updateHealthUI() {
        document.getElementById('health-bar-inner').style.width = `${(this.playerHealth / 10) * 100}%`;
    }

    updateEnemyCountUI() {
        const remaining = 20 - this.totalEnemiesDefeated;
        const bossMessage = this.boss.visible
            ? "Boss Active!"
            : `Enemies Left: ${remaining} (Defeat to revive the boss!)`;
        document.getElementById('enemy-count').innerText = bossMessage;
    }

    spawnEnemies(count) {
        for (let i = 0; i < count; i++) {
            let x = Phaser.Math.Between(50, this.scale.width - 50);
            let enemy = this.minions.create(x, 0, 'beignetMonster');
    
            if (enemy) {
                enemy.setActive(true).setVisible(true);
                enemy.setCollideWorldBounds(true);
                enemy.body.setAllowGravity(true);
                enemy.setBounce(0.2);
                this.physics.add.collider(enemy, this.ground);
    
                this.physics.add.overlap(this.projectiles, enemy, (projectile, enemy) => {
                    projectile.destroy();
                    enemy.destroy();
                    this.totalEnemiesDefeated += 1;
                    this.updateEnemyCountUI();
    
                    if (this.totalEnemiesDefeated >= 20 && !this.boss.visible) {
                        this.boss.setVisible(true);
                        this.boss.health = 10;
                    }
                }, null, this);
            }
        }
    }

    spawnHazard() {
        let x = this.player.x + Phaser.Math.Between(-100, 100); // Slightly randomize the drop position
        let hazard = this.hazards.create(x, 0, 'fallingHazard');
        
        if (hazard) {
            hazard.setActive(true).setVisible(true);
            hazard.body.setAllowGravity(true);
            hazard.setVelocityY(300); // Drop speed
            hazard.setScale(1); // Adjust size if needed
            this.physics.add.collider(hazard, this.ground, () => {
                hazard.destroy(); // Destroy when it hits the ground
            });
    
            this.physics.add.overlap(this.player, hazard, this.handleHazardCollision, null, this);
        }
    }
    
    startPhaseTwo() {
        this.bossPhase = 2;
        this.boss.setTint(0xff0000);
        this.boss.setVelocityX(200);
        this.time.addEvent({ delay: 2000, callback: () => {
            this.boss.x = this.boss.x < 0 ? this.scale.width * 2 : 0;
        }, loop: true });
    }

    changeBossPhase() {
        if (this.boss.health <= 15) {
            console.log("Boss entering phase 2!");
            this.boss.setTint(0xff0000); // Visual cue: Boss glows red
            this.time.removeEvent(this.shootProjectiles); // Remove old shooting pattern
    
            // Add a faster, more aggressive shooting pattern
            this.time.addEvent({
                delay: 800, // Faster attacks
                callback: this.shootProjectiles,
                callbackScope: this,
                loop: true,
            });
    
            // Increase boss speed slightly
            this.boss.setVelocityX(this.boss.body.velocity.x * 1.2);
        }
    }

    gameOver() {
        console.log("Game Over!");
        if (this.bossMusic) this.bossMusic.stop();
        if (this.time) this.time.clearPendingEvents();
        this.minions.clear(true, true);
        this.bossProjectiles.clear(true, true);
        this.projectiles.clear(true, true);
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'gameOver').setOrigin(0.5);
    
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.restart();
        });
    }

    levelComplete() {
        // Complete the level
        console.log("Boss Defeated!");
        this.scene.start('VictoryScene');
    }
}