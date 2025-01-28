import { setupJoystick } from './utils/joystickUtils.js';
import { enableTiltControls } from './utils/tiltUtils.js';
import { addFullscreenButton } from './utils/fullScreenUtils.js';




export default class Level1 extends Phaser.Scene {
    constructor() {
        super({ key: 'Level1' });
        this.tiltCleanup = null;
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
        this.load.audio('level1Music', 'assets/Audio/BlownMoneyAudubonPark.mp3');
        
        console.log("Assets preloaded successfully.");
    }
    
    create() {
        const { width, height } = this.scale;
    
        // Background and music
        this.add.image(width / 2, height / 2, 'level1Background').setDisplaySize(width, height);
        this.levelMusic = this.sound.add('level1Music', { loop: true, volume: 0.5 });
        this.levelMusic.play();
    
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
    
        // Hook up the attack button to fireProjectile
        const attackButton = document.getElementById('attack-button');
        if (attackButton) {
            attackButton.addEventListener('click', () => {
                this.fireProjectile();
            });
        }
    
        // Mobile-specific controls
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isMobile) {
            console.log("Mobile device detected. Initializing controls...");
    
            // Setup mobile controls using the modularized function
            const cleanupMobileControls = setupMobileControls(this.player, {
                smoothingFactor: 0.2,
                deadZone: 6,
                maxTiltPortrait: 90,
                maxTiltLandscape: 20,
                velocity: 320,
            });
    
            // Clean up on shutdown
            this.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanupMobileControls);
    
            // Mobile fullscreen button logic
            const mobileFullscreenButton = document.getElementById('mobile-fullscreen-button');
            if (mobileFullscreenButton) {
                mobileFullscreenButton.addEventListener('click', () => {
                    const fullscreenElement = document.getElementById('fullscreen');
                    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                        fullscreenElement.requestFullscreen().catch((err) => {
                            console.error('Failed to enable fullscreen:', err);
                        });
                    } else {
                        document.exitFullscreen();
                    }
                });
            }
        } else {
            console.log("Desktop detected. Skipping mobile-specific controls.");
        }
    
        // Tap anywhere to attack
        this.input.on('pointerdown', (pointer) => {
            if (!pointer.wasTouch) return;
            this.fireProjectile();
        });
    
        // Swipe up to jump
        let startY = null;
        this.input.on('pointerdown', (pointer) => {
            startY = pointer.y;
        });
    
        this.input.on('pointerup', (pointer) => {
            if (startY !== null && pointer.y < startY - 50 && this.player.body.touching.down) {
                this.player.setVelocityY(-500);
                this.player.play('jump', true);
            }
            startY = null;
        });
    
        // Modularized desktop fullscreen button
        addFullscreenButton(this);
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
    
        // Add input event listeners for desktop and mobile
        const restartLevel = () => {
            this.scene.restart();
        };
    
        // For Desktop
        this.input.keyboard.once('keydown-SPACE', restartLevel);
    
        // For Mobile (tap anywhere)
        this.input.once('pointerdown', restartLevel);
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
    
        // Add input event listeners for desktop and mobile
        const proceedToNextLevel = () => {
            this.scene.start('Level2'); // Assuming 'Level2' is the next level
        };
    
        // For Desktop
        this.input.keyboard.once('keydown-SPACE', proceedToNextLevel);
    
        // For Mobile (tap anywhere)
        this.input.once('pointerdown', proceedToNextLevel);
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
    
    updateHealthUI() {
        const healthPercentage = (this.playerHealth / this.maxHealth) * 100;
        document.getElementById('health-bar-inner').style.width = `${healthPercentage}%`;
    }
    
    updateEnemyCountUI() {
        document.getElementById('enemy-count').innerText = `Enemies Left: ${20 - this.totalEnemiesDefeated}`;
    }      

    shutdown() {
        if (this.tiltCleanup) {
            this.tiltCleanup();
        }
        if (this.levelMusic) this.levelMusic.stop();
        if (this.enemySpawnTimer) this.enemySpawnTimer.remove();
    }

    destroy() {
        this.shutdown(); // Call shutdown when the scene is destroyed
    }
     
}
