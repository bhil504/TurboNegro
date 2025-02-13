import { addFullscreenButton } from '/utils/fullScreenUtils.js';
import { setupMobileControls } from '/utils/mobileControls.js';

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
        this.load.image('healthPack', 'assets/Characters/Pickups/HealthPack.png');
        this.load.audio('level1Music', 'assets/Audio/LevelMusic/mp3/BlownMoneyAudubonPark.mp3');

         // Load sound effects
         this.load.audio('playerHit', 'assets/Audio/SoundFX/mp3/playerHit.mp3');
         this.load.audio('playerProjectileFire', 'assets/Audio/SoundFX/mp3/playerprojectilefire.mp3');
         this.load.audio('mardiGrasZombieHit', 'assets/Audio/SoundFX/mp3/MardiGrasZombieHit.mp3');
     
        
        console.log("Assets preloaded successfully.");
    }
    
    create() {
        const { width, height } = this.scale;
    
        // Background and music
        this.add.image(width / 2, height / 2, 'level1Background').setDisplaySize(width, height);
        this.levelMusic = this.sound.add('level1Music', { loop: true, volume: 0.5 });
        this.levelMusic.play();

        // Sound Effects
        this.playerHitSFX = this.sound.add('playerHit', { volume: 0.6 });
        this.playerProjectileFireSFX = this.sound.add('playerProjectileFire', { volume: 0.6 });
        this.mardiGrasZombieHitSFX = this.sound.add('mardiGrasZombieHit', { volume: 0.6 });

        // Platforms setup
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(width / 2, height - 20, null).setDisplaySize(width, 20).setVisible(false).refreshBody();
        const balcony = this.platforms.create(width / 2, height - 350, 'balcony').setScale(1).refreshBody();
        balcony.body.setSize(280, 10).setOffset((balcony.displayWidth - 280) / 2, balcony.displayHeight - 75);
    
        // Player setup
        this.player = this.physics.add.sprite(100, height - 100, 'turboNegroStanding1');
        this.player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.platforms);
    
        // Animations
        this.anims.create({
            key: 'idle',
            frames: [{ key: 'turboNegroStanding1' }, { key: 'turboNegroStanding2' }, { key: 'turboNegroStanding3' }, { key: 'turboNegroStanding4' }],
            frameRate: 4,
            repeat: -1,
        });
        this.anims.create({ key: 'walk', frames: [{ key: 'turboNegroWalking' }], frameRate: 8, repeat: -1 });
        this.anims.create({ key: 'jump', frames: [{ key: 'turboNegroJump' }], frameRate: 1 });
    
        // Input setup
        this.cursors = this.input.keyboard.createCursorKeys();
        this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
        // Health and enemy setup
        this.playerHealth = 10;
        this.maxHealth = 10;
        this.totalEnemiesDefeated = 0;
        this.updateHealthUI();
        this.updateEnemyCountUI();
    
        this.projectiles = this.physics.add.group({ defaultKey: 'projectileCD' });
        this.enemies = this.physics.add.group();
        this.enemySpawnTimer = this.time.addEvent({ delay: 1000, callback: this.spawnEnemy, callbackScope: this, loop: true });
    
        this.healthPacks = this.physics.add.group();
        this.physics.add.collider(this.healthPacks, this.platforms);
        this.physics.add.overlap(this.player, this.healthPacks, this.handlePlayerHealthPackCollision, null, this);
    
        this.physics.add.collider(this.player, this.enemies, this.handlePlayerEnemyCollision, null, this);
        this.physics.add.collider(this.projectiles, this.enemies, this.handleProjectileEnemyCollision, null, this);
        this.physics.add.collider(this.enemies, this.platforms);

        // Setup mobile controls only if it's a mobile device
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            console.log("Mobile device detected. Initializing controls...");
            setupMobileControls(this, this.player);
        } else {
            console.log("Desktop detected. Skipping mobile controls.");
        }
    
        // Add utilities
        addFullscreenButton(this);
       
    }

    update() {
        // Handle keyboard movement
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-165);
            this.player.setFlipX(true);
            this.player.play('walk', true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(165);
            this.player.setFlipX(false);
            this.player.play('walk', true);
        } else if (this.player.body.touching.down) {
            this.player.setVelocityX(0);
            this.player.play('idle', true);
        }
    
        // Handle jump with keyboard
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-500);
            this.player.play('jump', true);
        }
    
        // Handle firing projectiles
        if (Phaser.Input.Keyboard.JustDown(this.fireKey)) {
            this.fireProjectile();
        }
    
        // Handle tilt-based movement (for mobile)
        if (this.smoothedTilt !== undefined) { // Ensure tilt is available
            const velocity = 320; // Maximum velocity for tilt-based movement
            const deadZone = 6; // Tilt dead zone
            const maxTilt = 30; // Max tilt value (adjust based on your needs)
    
            // Calculate velocity based on smoothed tilt
            if (this.smoothedTilt > deadZone) {
                this.player.setVelocityX((this.smoothedTilt / maxTilt) * velocity);
                this.player.setFlipX(false);
                this.player.play('walk', true);
            } else if (this.smoothedTilt < -deadZone) {
                this.player.setVelocityX((this.smoothedTilt / maxTilt) * velocity);
                this.player.setFlipX(true);
                this.player.play('walk', true);
            } else if (this.player.body.touching.down) {
                this.player.setVelocityX(0);
                this.player.play('idle', true);
            }
        }
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
    
    fireProjectile() {
        // Check if the user is on a mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
        if (isMobile) {
            console.warn(`🚫 Prevented level fireProjectile() - Mobile users should use mobileControls.js instead.`);
            return; // Ensure mobile users fire only via mobileControls.js
        }
    
        // Proceed with firing for desktop users only
        const projectile = this.projectiles.create(this.player.x, this.player.y, 'projectileCD');
        if (projectile) {
            projectile.setActive(true);
            projectile.setVisible(true);
            projectile.body.setAllowGravity(false);
            projectile.setVelocityX(this.player.flipX ? -500 : 500);
            this.playerProjectileFireSFX.play();
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

    handlePlayerEnemyCollision(player, enemy) {
        enemy.destroy();
        this.playerHealth--;
        
        // Update health bar
        this.updateHealthUI();
        this.playerHitSFX.play();
        
        if (this.playerHealth <= 0) {
            this.gameOver();
        }
    }
    
    handleProjectileEnemyCollision(projectile, enemy) {
        projectile.destroy();
        enemy.destroy();
        this.totalEnemiesDefeated++;

        if (this.totalEnemiesDefeated % 12 === 0) {
            console.log("Spawning health pack!");
            this.spawnHealthPack();
        }
    
        if (enemy.texture.key === 'skeleton') {
            this.mardiGrasZombieHitSFX.play();
        }
    
        this.updateEnemyCountUI();
    
        if (this.totalEnemiesDefeated >= 20) {
            this.levelComplete();
        } 
    }
    
    handlePlayerHealthPackCollision(player, healthPack) {
        healthPack.destroy(); // Remove the health pack
        
        // Increase player's health by 5, but not beyond the maximum
        this.playerHealth = Math.min(this.playerHealth + 5, this.maxHealth);
        
        // Update health bar
        this.updateHealthUI();
        
    }
    
    gameOver() {
        console.log("Game Over!");
    
        // Stop all sounds and timers
        this.cleanUpLevel();
    
        // Display Game Over screen
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'gameOver').setOrigin(0.5);
    
        // Restart the level on SPACE (desktop) or tap (mobile)
        const restartLevel = () => {
            this.scene.restart();
        };
    
        this.handleLevelTransition(restartLevel);
    }
    
    levelComplete() {
        console.log("Level Complete! Moving to Level 2");
    
        // Stop all sounds and timers
        this.cleanUpLevel();
    
        // Display Level Complete screen
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'levelComplete').setOrigin(0.5);
    
        // Proceed to the next level
        const proceedToNextLevel = () => {
            this.scene.start('Level2'); // Transition to Level 2
        };
    
        this.handleLevelTransition(proceedToNextLevel);
    }
    
    cleanUpLevel() {
        // Stop music if it's playing
        if (this.levelMusic) {
            this.levelMusic.stop();
            this.levelMusic.destroy();
        }
    
        // Remove all enemy and projectile spawn timers
        if (this.enemySpawnTimer) this.enemySpawnTimer.remove();
    
        // Clear all game objects to free up memory
        this.enemies.clear(true, true);
        this.projectiles.clear(true, true);
    
        console.log("Level cleaned up successfully.");
    }
    
    handleLevelTransition(callback) {
        // Desktop: Listen for SPACE key
        this.input.keyboard.once('keydown-SPACE', callback);
    
        // Mobile: Listen for tap anywhere
        this.input.once('pointerdown', callback);
    }
     
}
