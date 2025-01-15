// Main game configuration 
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
let tiltValue = 0;

if (isMobile && window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (event) => {
        tiltValue = event.gamma || 0; // Gamma measures left-right tilt (-90 to 90)
    });
}

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
    
        this.updateHealthUI(); // Initialize health bar
        this.updateEnemyCountUI(); // Initialize enemy count

        // Touch input for mobile
        this.input.on('pointerdown', (pointer) => {
            if (pointer.downY > pointer.upY + 50) {
                // Swipe up to jump
                if (this.player.body.touching.down) {
                    this.player.setVelocityY(-500);
                }
            } else {
                // Tap to attack
                this.fireProjectile();
            }
        });
    }
    
    update() {
        // Movement
        if (isMobile) {
            const sensitivity = 5;
            this.player.setVelocityX(tiltValue * sensitivity);

            if (tiltValue > 0) this.player.setFlipX(false);
            else if (tiltValue < 0) this.player.setFlipX(true);
        } else {
            this.player.setVelocityX(0);

            if (this.cursors.left.isDown) {
                this.player.setVelocityX(-160);
                this.player.setFlipX(true);
            } else if (this.cursors.right.isDown) {
                this.player.setVelocityX(160);
                this.player.setFlipX(false);
            }

            if (this.cursors.up.isDown && this.player.body.touching.down) {
                this.player.setVelocityY(-500); // Jump for desktop
            }

            if (Phaser.Input.Keyboard.JustDown(this.fireKey)) {
                this.fireProjectile(); // Attack for desktop
            }
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
        const enemy = this.enemies.create(x, 0, 'skeleton');
        enemy.setCollideWorldBounds(true);
        enemy.setBounce(1);
    }

    handlePlayerEnemyCollision(player, enemy) {
        enemy.destroy();
        this.playerHealth--;
        this.updateHealthUI();

        if (this.playerHealth <= 0) this.gameOver();
    }

    handleProjectileEnemyCollision(projectile, enemy) {
        projectile.destroy();
        enemy.destroy();
        this.totalEnemiesDefeated++;
        this.updateEnemyCountUI();

        if (this.totalEnemiesDefeated >= 20) this.levelComplete();
    }

    handlePlayerHealthPackCollision(player, healthPack) {
        healthPack.destroy();
        this.playerHealth = Math.min(this.playerHealth + 5, this.maxHealth);
        this.updateHealthUI();
    }

    gameOver() {
        if (this.levelMusic) this.levelMusic.stop();
        if (this.enemySpawnTimer) this.enemySpawnTimer.remove();

        this.enemies.clear(true, true);
        this.projectiles.clear(true, true);

        this.add.image(this.scale.width / 2, this.scale.height / 2, 'gameOver').setOrigin(0.5);
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.restart();
        });
    }

    levelComplete() {
        if (this.levelMusic) this.levelMusic.stop();
        if (this.enemySpawnTimer) this.enemySpawnTimer.remove();

        this.enemies.clear(true, true);
        this.projectiles.clear(true, true);

        this.add.image(this.scale.width / 2, this.scale.height / 2, 'levelComplete').setOrigin(0.5);
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('Level2');
        });
    }
}
