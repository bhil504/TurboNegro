import { addFullscreenButton } from '/utils/fullScreenUtils.js';
import { setupMobileControls } from '/utils/mobileControls.js';

export default class BossFight extends Phaser.Scene {
    constructor() {
        super({ key: 'BossFight' });
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

        this.playerHealth = 10; // Set initial player health
        this.maxHealth = 10; // Define max health
        this.updateHealthUI(); // Update UI

    
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
        document.getElementById('boss-health-bar-container').style.display = 'block'; // Make sure the health bar is visible
        this.physics.add.collider(this.boss, this.ground);
        this.physics.add.collider(this.boss, this.movingPlatforms);

        // Inside the `create()` method, where you set up the boss's walking animation:
        this.tweens.add({
            targets: this.boss,
            x: this.boss.x - 300,  // Move boss 300px to the left
            duration: 3000,        // Duration of the movement (3 seconds)
            ease: 'Linear',
            yoyo: true,            // Make the movement go back after it finishes
            repeat: -1,            // Repeat the movement infinitely
            onStart: () => {
                this.boss.setFlipX(true); // Flip boss to the left initially
            },
            onUpdate: (tween, target, time, delta) => {
                const progress = tween.progress;  // Get the progress directly from tween
                if (progress > 0.5) {
                    this.boss.setFlipX(false); // Flip to face right
                } else {
                    this.boss.setFlipX(true);  // Flip to face left
                }
            }
        });
    
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
            delay: 3000, // Fire every 4 seconds
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
            },
            callbackScope: this,
            loop: true
        });

        // **Destroy Beignet Monster when Hit by Player's Projectile**
        this.physics.add.collider(this.projectiles, this.minions, (projectile, minion) => {
            projectile.destroy();
            minion.health -= 1;
            if (minion.health <= 0) {
                minion.destroy();
            }
        });

       // Ensure player's projectiles can destroy boss's beignet projectiles
        this.physics.add.collider(this.projectiles, this.bossProjectiles, this.handleProjectileCollision, null, this);


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
        
    //Player functions
    fireProjectile() {
        let projectile = this.projectiles.create(this.player.x, this.player.y, 'playerProjectile');
        if (projectile) {
            projectile.body.setAllowGravity(false);
            projectile.setVelocityX(this.player.flipX ? -500 : 500);
            this.sound.play('playerProjectileFire');

            // Check if the projectile hits the boss
            this.physics.add.overlap(projectile, this.boss, () => {
                this.takeBossDamage(1); // Reduce boss health by 1 for each hit
                projectile.destroy(); // Destroy projectile after hit
            });
        }
    }

    checkPlayerHealth() {
        if (this.playerHealth <= 0) {
            this.gameOver();
        }
    }

    //Hazard functions
    spawnHazard() {
        let x = this.player.x; // Spawn directly above the player
        let y = 0; // Start from the top of the screen
    
        let hazard = this.hazards.create(x, y, 'fallingHazard');
    
        if (hazard) {
            hazard.setActive(true).setVisible(true);
            hazard.body.setAllowGravity(true);
            hazard.body.setImmovable(false); // Ensure it's affected by physics
    
            // Debugging: Check if hazard has a body
            console.log(`🛠️ Hazard spawned at (${hazard.x}, ${hazard.y})`);
    
            // Set falling speed
            hazard.setVelocityY(200);
    
            hazard.setScale(1); // Adjust size if needed
    
            // **Destroy hazard when it collides with the ground**
            this.physics.add.collider(hazard, this.ground, () => {
                console.log("💥 Hazard hit the ground and was destroyed.");
                hazard.destroy();
            });
    
            // **Destroy hazard when it collides with the player**
            this.physics.add.collider(this.player, hazard, (player, hazard) => {
                console.log("🔥 Hazard collided with player!"); // Debugging
                hazard.destroy();
                this.handleHazardCollision(player);
            });
    
            // **Destroy hazard when it collides with a platform**
            this.physics.add.collider(hazard, this.movingPlatforms, () => {
                console.log("🛑 Hazard hit a platform and was destroyed.");
                hazard.destroy();
            });
        }
    }    

    handleHazardCollision(player) {
        console.log("⚠️ Hazard hit player! Reducing health...");
        
        this.playerHealth -= 1; // Reduce player health
        this.updateHealthUI(); // Update the UI
    
        if (this.playerHealth <= 0) {
            console.log("❌ Player health depleted! Game over.");
            this.gameOver();
        }
    }

    handleProjectileCollision(playerProjectile, bossProjectile) {
        playerProjectile.destroy();
        bossProjectile.destroy();
    }

    //Boss functions
    updateBossHealthUI() {
        const healthPercentage = (this.boss.health / 20) * 100;  // Assuming max health is 20
        const healthBar = document.getElementById('boss-health-bar-inner');
        
        if (healthBar) {
            healthBar.style.width = `${healthPercentage}%`;  // Set the width of the health bar
        }
    }

    takeBossDamage(amount) {
        if (!this.boss || this.boss.health <= 0) return;
        
        this.boss.health -= amount;
        this.bossHitCount = (this.bossHitCount || 0) + 1; // Track hit count
    
        if (this.bossHitCount >= 5) {
            this.repositionBoss();
            this.bossHitCount = 0; // Reset hit count after teleporting
        }
    
        if (this.boss.health <= 0) {
            this.boss.health = 0;
            this.boss.setVisible(false); // Hide the boss if health is 0
            this.checkBossDefeat(); // Ensure level completion check
        }
    
        this.updateBossHealthUI(); // Update health bar after damage
    }

    repositionBoss() {
        let currentX = this.boss.x;
        let minX = 500;
        let maxX = 2500;
        let minTeleportDistance = 1000; // Ensure boss teleports at least this far
        let maxTeleportDistance = 1800; // Maximum teleport distance
        let newX;
    
        // Stop the movement tween if it exists
        if (this.bossTween) {
            this.bossTween.stop();
        }
    
        // Stop attacks and minion spawning
        this.boss.setAlpha(0); // Hide boss
        this.boss.setActive(false); // Disable physics interactions
        this.boss.body.enable = false; // Disable physics body
    
        this.time.removeAllEvents(); // Stop shooting and spawning events
    
        // Ensure teleportation moves the boss a significant distance and stays within bounds
        do {
            let offset = Phaser.Math.Between(minTeleportDistance, maxTeleportDistance);
            newX = (Math.random() > 0.5) ? currentX + offset : currentX - offset; // Move left or right
        } while (newX < minX || newX > maxX); // Ensure within bounds
    
        let groundY = this.scale.height - 150; // Keep boss on the ground
    
        // **Delay before reappearing (simulating a teleport effect)**
        this.time.delayedCall(1500, () => { // 1.5 seconds delay
            this.boss.setPosition(newX, groundY);
            this.boss.setAlpha(1); // Make boss visible again
            this.boss.setActive(true); // Reactivate physics interactions
            this.boss.body.enable = true; // Re-enable physics body
    
            console.log(`Boss teleported from ${currentX} to ${newX}`);
    
            // Restart movement tween after teleport
            this.bossTween = this.tweens.add({
                targets: this.boss,
                x: newX - 300,  // Move boss 300px to the left
                duration: 3000,  // Duration of movement
                ease: 'Linear',
                yoyo: true,      // Make the movement go back after finishing
                repeat: -1,      // Repeat infinitely
                onStart: () => {
                    this.boss.setFlipX(true); // Flip boss to the left initially
                },
                onUpdate: (tween, target, time, delta) => {
                    const progress = tween.progress;
                    if (progress > 0.5) {
                        this.boss.setFlipX(false); // Flip to face right
                    } else {
                        this.boss.setFlipX(true);  // Flip to face left
                    }
                }
            });
    
            // **Restart boss attacks and minion spawning after teleport**
            this.startBossActions();
        });
    }
    
    startBossActions() {
        // **Restart Boss Shooting**
        this.time.addEvent({
            delay: 4000, // Fire every 4 seconds
            callback: this.shootProjectiles,
            callbackScope: this,
            loop: true
        });
    
        // **Restart Beignet Monster Spawning**
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
    
    //UI
    gameOver() {
        console.log("Game Over!");
        this.cleanUpLevel();
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'gameOver').setOrigin(0.5);
        this.handleLevelTransition(() => this.scene.restart());
    }
    
    levelComplete() {
        console.log("Final Boss Defeated! Game Complete!");
        this.cleanUpLevel();
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'levelComplete').setOrigin(0.5);
    
        this.time.delayedCall(2000, () => { // 2-second delay
            console.log("Transitioning to StartMenu...");
            this.scene.start('StartMenu');
        });
    }
    
    
    cleanUpLevel() {
        console.log("Cleaning up level...");
        if (this.bossMusic) {
            this.bossMusic.stop();
            this.bossMusic.destroy();
        }
        this.time.removeAllEvents();
        
        if (this.enemies) {
            console.log("Clearing enemies...");
            this.enemies.clear(true, true);
        } else {
            console.log("Warning: this.enemies is undefined!");
        }

        if (this.projectiles) {
            console.log("Clearing projectiles...");
            this.projectiles.clear(true, true);
        } else {
            console.log("Warning: this.projectiles is undefined!");
        }

        if (this.bossProjectiles) {
            console.log("Clearing boss projectiles...");
            this.bossProjectiles.clear(true, true);
        } else {
            console.log("Warning: this.bossProjectiles is undefined!");
        }
        console.log("Boss Fight cleaned up.");
    }
    
    handleLevelTransition(callback) {
        this.input.keyboard.once('keydown-SPACE', callback);
        this.input.once('pointerdown', callback);
    }

    checkBossDefeat() {
        if (this.boss.health <= 0) {
            this.levelComplete();
        }
    }
}