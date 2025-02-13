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
        this.load.image('mardiGrasZombie', 'assets/Characters/Enemies/MardiGrasZombie.png');
        this.load.image('turboNegroStanding1', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding1.png');
        this.load.image('turboNegroStanding2', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding2.png');
        this.load.image('turboNegroStanding3', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding3.png');
        this.load.image('turboNegroStanding4', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding4.png');
        this.load.image('turboNegroWalking', 'assets/Characters/Character1/TurboNegroWalking/TurboNegroWalking.png');
        this.load.image('healthPack', 'assets/Characters/Pickups/HealthPack.png');
        this.load.image('fallingHazard', 'assets/Levels/Platforms/fallingHazard.png');
        this.load.image('platform', 'assets/Levels/Platforms/platform.png'); // <-- Load platform image
        this.load.image('forceField', 'assets/Effects/forceField.png'); // Adjust the path accordingly
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
        this.movingPlatforms = this.physics.add.group({ allowGravity: false, immovable: true });
    
        let platform1 = this.createMovingPlatform(800, height - 200, 200, 100, 200);  
        let platform2 = this.createMovingPlatform(1800, height - 300, 200, 150, 250);
        let platform3 = this.createMovingPlatform(2500, height - 250, 200, 120, 300);
    
        // **Player Setup**
        this.player = this.physics.add.sprite(100, height - 150, 'turboNegroStanding1');
        this.player.setCollideWorldBounds(true);
        this.player.setDepth(1);
        this.physics.add.collider(this.player, this.ground);
        this.physics.add.collider(this.player, this.movingPlatforms);
    
        this.playerHealth = 10;
        this.maxHealth = 10;
        this.updateHealthUI();
    
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
        this.hazards = this.physics.add.group(); 
    
        // **Boss Setup**
        this.boss = this.physics.add.sprite(2800, height - 150, 'beignetBoss');
        this.boss.setCollideWorldBounds(true);
        this.boss.body.setAllowGravity(false);
        this.boss.health = 20;
        document.getElementById('boss-health-bar-container').style.display = 'block';
        this.physics.add.collider(this.boss, this.ground);
        this.physics.add.collider(this.boss, this.movingPlatforms);
    
        // **Ensure collision between the player and boss projectiles**
        this.physics.add.overlap(this.player, this.bossProjectiles, this.handleBeignetProjectileCollision, null, this);
    
        // **Boss Walking Animation**
        this.tweens.add({
            targets: this.boss,
            x: this.boss.x - 300,
            duration: 3000,
            ease: 'Linear',
            yoyo: true,
            repeat: -1,
            onStart: () => {
                this.boss.setFlipX(true);
            },
            onUpdate: (tween, target, time, delta) => {
                const progress = tween.progress;
                this.boss.setFlipX(progress > 0.5 ? false : true);
            }
        });
    
        // **Ensure force field is correctly positioned from the start**
        this.forceField = this.add.image(this.boss.x, this.boss.y, 'forceField')
            .setVisible(false)
            .setScale(1.5)
            .setDepth(2)
            .setAlpha(0.5);
    
        // **Input Controls**
        this.cursors = this.input.keyboard.createCursorKeys();
        this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
         // ✅ Fix: Declare isMobile before using it
         const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

         // Setup mobile controls only if it's a mobile device
         if (isMobile) {
             console.log("📱 Mobile detected. Using mobileControls.js for shooting.");
             setupMobileControls(this, this.player);
         } else {
             console.log("💻 Desktop detected. Using spacebar for shooting.");
             
             // **Enable spacebar shooting ONLY for desktop**
             this.input.keyboard.on('keydown-SPACE', () => {
                 this.fireProjectile(); // Only trigger fireProjectile() on desktop
             });
         }
    
        // **Fullscreen Button**
        addFullscreenButton(this);
    
        // **Hazard Spawner**
        this.time.addEvent({
            delay: 5000,
            callback: this.spawnHazard,
            callbackScope: this,
            loop: true
        });
    
        // **Boss Fires Beignet Projectiles**
        this.time.addEvent({
            delay: 2000,
            callback: this.shootProjectiles,
            callbackScope: this,
            loop: true
        });
    
        // **Boss Spawns a Beignet Monster**
        this.bossMinionCount = 0;
        this.time.addEvent({
            delay: 3000,
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
                this.handleEnemyDeath(minion); // ✅ Centralized enemy death handling
            }
        });
    
        // **Ensure player's projectiles can destroy boss's beignet projectiles**
        this.physics.add.collider(this.projectiles, this.bossProjectiles, this.handleProjectileCollision, null, this);
    
        // **New: Collision Logic from Previous Levels**
        this.physics.add.collider(this.minions, this.minions);
    
        // **🔥 Player Takes Damage and Beignet Monster is Destroyed**
        this.physics.add.overlap(this.player, this.minions, (player, enemy) => {
            if (!player.active || !enemy.active) return;
    
            console.log(`🚨 Player hit by ${enemy.texture.key}`);
    
            let damage = enemy.texture.key === 'beignetMonster' ? 2 : 1;
            this.playerHealth -= damage;
            console.log(`🩸 Player health reduced to ${this.playerHealth}`);
    
            // Update UI
            this.updateHealthUI();
    
            // Game Over Check
            if (this.playerHealth <= 0) {
                console.log("💀 Player killed by enemy!");
                this.gameOver();
                return;
            }
    
            // **Destroy Beignet Monster Immediately**
            if (enemy.texture.key === 'beignetMonster') {
                console.log("🔥 Beignet Monster destroyed after collision!");
                enemy.destroy();
            }
    
            // Knockback effect
            let knockback = enemy.x < player.x ? 200 : -200;
            player.setVelocityX(knockback);
    
            // Destroy zombie upon impact
            if (enemy.texture.key === 'mardiGrasZombie') {
                enemy.destroy();
            }
        }, null, this);
    
        // **Zombie AI - Move toward the player**
        this.minions.children.iterate((zombie) => {
            if (zombie.active) {
                const speed = 100;
                const direction = Math.sign(this.player.x - zombie.x);
                zombie.setVelocityX(direction * speed);
    
                // Random jump mechanic
                if (Phaser.Math.Between(1, 100) > 95 && zombie.body.touching.down) {
                    zombie.setVelocityY(-250);
                }
    
                // Ensure zombie flips direction
                zombie.setFlipX(direction < 0);
            }
        });
    
        // ✅ Initialize the enemy count correctly
        this.updateEnemyCountUI();
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
        if (!this.player || !this.player.body) return; // Ensure player exists before updating
    
        this.player.setVelocityX(0);
    
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160).setFlipX(true);
            if (this.anims.exists('walk')) {
                this.player.play('walk', true);
            }
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160).setFlipX(false);
            if (this.anims.exists('walk')) {
                this.player.play('walk', true);
            }
        } else {
            if (this.anims.exists('idle')) {
                this.player.play('idle', true);
            }
        }
    
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-500);
        }
    
        if (Phaser.Input.Keyboard.JustDown(this.fireKey)) {
            this.fireProjectile();
        }
    
        // Ensure force field exists before updating position
        if (this.forceFieldActive && this.forceField) {
            this.forceField.setPosition(this.boss.x, this.boss.y);
        }
    
        if (this.minions) {
            this.minions.children.iterate((zombie) => {
                if (zombie && zombie.active) {
                    const speed = 100;
                    const direction = this.player ? Math.sign(this.player.x - zombie.x) : 1;
                    zombie.setVelocityX(direction * speed);
    
                    // Random jump mechanic
                    if (Phaser.Math.Between(1, 100) > 95 && zombie.body.touching.down) {
                        zombie.setVelocityY(-250);
                    }
    
                    // Ensure zombie flips direction
                    zombie.setFlipX(direction < 0);
                }
            });
    
            // Debugging: Log only active zombies
            this.minions.children.iterate((zombie) => {
                if (zombie && zombie.active) {
                    console.log(`🧟 Zombie at (${zombie.x}, ${zombie.y}), Active: ${zombie.active}`);
                }
            });
        }
    
        // **Fix: Ensure Parallax Background Scrolls Properly**
        if (this.background) {
            this.background.tilePositionX = this.cameras.main.scrollX * 0.5;
        }
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
    
        if (this.forceFieldActive) {
            this.forceFieldHealth -= amount;
            console.log(`🛡️ Force Field Hit! Remaining Durability: ${this.forceFieldHealth}`);
    
            if (this.forceFieldHealth <= 0) {
                console.log("💥 Force Field Destroyed!");
                this.forceField.setVisible(false);
                this.forceFieldActive = false; // Disable force field
                
                // 🔥 Teleport the boss after force field is destroyed
                this.repositionBoss();
            }
            return; // Prevent boss from taking damage while force field is up
        }
    
        // Boss takes damage normally
        this.boss.health -= amount;
        this.bossHitCount = (this.bossHitCount || 0) + 1; // Track hit count
    
        console.log(`🔥 Boss hit! Health: ${this.boss.health}, Hit Count: ${this.bossHitCount}`);
    
        if (this.bossHitCount >= 5) {
            console.log("🧟‍♂️ Spawning Mardi Gras Zombies!");
            this.spawnMardiGrasZombies(); // ✅ Call spawn function here
            this.activateForceField(); // ✅ Activate force field
            this.bossHitCount = 0; // Reset hit count
        }
    
        if (this.boss.health <= 0) {
            console.log("💀 Boss Defeated!");
            this.boss.health = 0;
            this.boss.setVisible(false);
            this.checkBossDefeat();
        }
    
        this.updateBossHealthUI(); // Update health bar after damage
    }
    
    activateForceField() {
        this.forceFieldHealth = 5; // Set force field durability
        this.forceFieldActive = true; // Enable force field
    
        this.forceField.setPosition(this.boss.x, this.boss.y); // Align with boss
        this.forceField.setVisible(true);
        this.forceField.setAlpha(0.5); // Ensure opacity remains 50%
    
        console.log("🛡️ Force Field Activated! It will absorb 5 hits.");
    }    
    
    repositionBoss() {
        let currentX = this.boss.x;
        let minX = 500;
        let maxX = 2500;
        let minTeleportDistance = 1000;
        let maxTeleportDistance = 1800;
        let newX;
    
        if (this.bossTween) {
            this.bossTween.stop();
        }
    
        // Stop attacks and minion spawning during teleport
        this.boss.setAlpha(0);
        this.boss.setActive(false);
        this.boss.body.enable = false;
        this.time.removeAllEvents();
    
        // Ensure teleportation stays within bounds
        do {
            let offset = Phaser.Math.Between(minTeleportDistance, maxTeleportDistance);
            newX = (Math.random() > 0.5) ? currentX + offset : currentX - offset;
        } while (newX < minX || newX > maxX);
    
        let groundY = this.scale.height - 150;
    
        this.time.delayedCall(1500, () => { // 1.5 sec delay
            this.boss.setPosition(newX, groundY);
            this.boss.setAlpha(1);
            this.boss.setActive(true);
            this.boss.body.enable = true;
    
            console.log(`🔮 Boss teleported from ${currentX} to ${newX}`);
    
            // Restart movement tween after teleport
            this.bossTween = this.tweens.add({
                targets: this.boss,
                x: newX - 300,
                duration: 3000,
                ease: 'Linear',
                yoyo: true,
                repeat: -1,
                onStart: () => this.boss.setFlipX(true),
                onUpdate: (tween) => {
                    this.boss.setFlipX(tween.progress > 0.5 ? false : true);
                }
            });
    
            // 🔥 Restart attacks & minion spawning
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
            const speed = 300; // Adjust speed as needed
            projectile.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        }
    }    

    handleBeignetProjectileCollision(player, projectile) {
        projectile.destroy();
        this.playerHealth -= 1;
        this.updateHealthUI();
        this.sound.play('playerHit');
    
        if (this.playerHealth <= 0) {
            this.gameOver();
        }
    }

    //EnemySpawns
    spawnMardiGrasZombies() {
        const { width, height } = this.scale;
        const numZombies = 5;
        const spawnSpacing = width / (numZombies + 1); // Distribute evenly
    
        for (let i = 0; i < numZombies; i++) {
            let spawnX = spawnSpacing * (i + 1); // Ensure even spacing
            let spawnY = height - 150; // Ensure they spawn near the ground
    
            let zombie = this.physics.add.sprite(spawnX, spawnY, 'mardiGrasZombie');
    
            if (zombie) {
                zombie.setVisible(true);
                zombie.setActive(true);
                zombie.setCollideWorldBounds(true);
                zombie.body.setAllowGravity(true);
                zombie.setBounce(0.2);
                zombie.health = 1;
    
                // Increase movement speed & randomly decide movement direction
                let speed = 100; // 🔥 Faster zombies
                let direction = Phaser.Math.Between(0, 1) === 0 ? -1 : 1; // Random left or right
                zombie.setVelocityX(direction * speed);
                zombie.setFlipX(direction < 0);
    
                // Add to minion group
                this.minions.add(zombie);
    
                // Ensure collision with ground & platforms
                this.physics.add.collider(zombie, this.ground);
                this.physics.add.collider(zombie, this.movingPlatforms);
                this.physics.add.overlap(this.player, zombie, this.handleMinionCollision, null, this);
    
                console.log(`🧟‍♂️ Zombie spawned at (${spawnX}, ${spawnY})`);
            } else {
                console.log("❌ Zombie failed to spawn!");
            }
        }

        this.updateEnemyCountUI();

    }
      
    spawnBeignetMonster() {
        if (!this.boss || !this.minions) return;
    
        let patrolPoints = [500, 1000, 1500, 2000, 2500]; // Define patrol points
        let x;
    
        // Ensure Beignet Monster does NOT spawn too close to the player
        do {
            x = Phaser.Math.RND.pick(patrolPoints);
        } while (Math.abs(x - this.player.x) < 150); // Avoid spawning too close
    
        let monster = this.minions.create(x, this.scale.height - 150, 'beignetMonster'); // Spawn at patrol point
        if (monster) {
            monster.setActive(true).setVisible(true);
            monster.setCollideWorldBounds(true);
            monster.body.setAllowGravity(true);
            monster.setBounce(0.2);
            monster.health = 2;
    
            // Patrol logic
            this.tweens.add({
                targets: monster,
                x: x + 300,
                duration: 3000,
                yoyo: true,
                repeat: -1,
                ease: 'Linear'
            });
    
            // Ensure collision with ground and platforms
            this.physics.add.collider(monster, this.ground);
            this.physics.add.collider(monster, this.movingPlatforms);
            this.physics.add.overlap(this.player, monster, this.handleMinionCollision, null, this);
        }

        this.updateEnemyCountUI();

    }
    
    //UI
    updateHealthUI() {
        document.getElementById('health-bar-inner').style.width = `${(this.playerHealth / 10) * 100}%`;
    }

    updateEnemyCountUI() {
        document.getElementById('enemy-count').innerText = `Enemies Left: ${this.minions.countActive(true)}`;
    }
    
    handleEnemyDeath(minion) {
        minion.destroy();
        this.updateEnemyCountUI(); // Update the count when an enemy dies
    }

    gameOver() {
        if (this.isGameOver) return;  // Prevent running twice
        this.isGameOver = true;
        
        console.log("🚨 Game Over! Cleaning up...");
    
        // Remove Input Listeners to Avoid Repeated Calls
        this.input.keyboard.removeAllListeners();
        this.input.removeAllListeners();
    
        // Clean Up Before Restarting
        this.cleanUpLevel();
    
        // Show Game Over Screen
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'gameOver').setOrigin(0.5);
    
        // Restart Scene with Delay to Avoid Input Spamming
        this.time.delayedCall(2000, () => {
            this.scene.restart();
        });
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
        console.log("🧹 Cleaning up level...");
    
        if (this.isCleaningUp) return;
        this.isCleaningUp = true;
    
        // 🛑 Stop & Kill Everything
        this.tweens.killAll();
        this.time.removeAllEvents();
        this.physics.world.colliders.destroy();
        this.input.keyboard.removeAllListeners();
        this.input.removeAllListeners();
    
        // 🎵 Stop Music
        if (this.bossMusic) {
            console.log("🎵 Stopping boss music...");
            this.bossMusic.stop();
            this.bossMusic.destroy();
            this.bossMusic = null;
        }
    
        // 🔥 Clear Physics Objects (Enemies, Projectiles, Hazards)
        const objectGroups = [this.minions, this.projectiles, this.bossProjectiles, this.hazards, this.healthPacks];
    
        objectGroups.forEach(group => {
            if (group && group.children) {
                group.children.iterate(child => child && child.destroy());
                group.clear(true, true);
            }
        });
    
        // 💀 Destroy Boss & Force Field (if exist)
        if (this.boss) {
            console.log("💀 Destroying boss...");
            this.boss.destroy();
            this.boss = null;
        }
    
        if (this.forceField) {
            console.log("🛡️ Removing force field...");
            this.forceField.destroy();
            this.forceField = null;
        }
    
        console.log("✅ Cleanup Complete!");
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