export default class Level3 extends Phaser.Scene {
    constructor() {
        super({ key: 'Level3' });
    }

    preload() {
        console.log("Preloading assets for Level 3...");
        this.load.image('level3Background', 'assets/Levels/BackGrounds/Level3.png');
        this.load.image('ledgeLeft', 'assets/Levels/Platforms/LedgeLeft.png');
        this.load.image('ledgeRight', 'assets/Levels/Platforms/LedgeRight.png');
        this.load.image('balcony', 'assets/Levels/Platforms/Balcony.png');
        this.load.image('turboNegroWalking', 'assets/Characters/Character1/TurboNegroWalking.png');
        this.load.image('turboNegroStanding1', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding1.png');
        this.load.image('turboNegroStanding2', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding2.png');
        this.load.image('turboNegroStanding3', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding3.png');
        this.load.image('turboNegroStanding4', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding4.png');
        this.load.image('projectileCD', 'assets/Characters/Projectiles/CD/CDresize.png');
        this.load.image('MardiGrasBlimp', 'assets/Characters/Enemies/MardiGrasBlimp.png');
        this.load.image('Beads', 'assets/Characters/Projectiles/Beads/Beads.png');
        this.load.image('skeleton', 'assets/Characters/Enemies/MardiGrasZombie.png');
        this.load.image('trumpetSkeleton', 'assets/Characters/Enemies/TrumpetSkeleton.png');
        this.load.audio('level3Music', 'assets/Audio/BhillionDollarAutoBots.mp3');
    }

    create() {
        const { width, height } = this.scale;
    
        console.log("Creating Level 3...");
    
        // Background setup
        this.add.image(800, height / 2, 'level3Background')
            .setDisplaySize(1600, height)
            .setOrigin(0.5);
    
        // Background music
        this.levelMusic = this.sound.add('level3Music', { loop: true, volume: 0.2 });
        this.levelMusic.play();
    
        // Set up physics bounds and camera
        this.cameras.main.setBounds(0, 0, 1600, height);
        this.physics.world.setBounds(0, 0, 1600, height);
    
        // Platforms
        this.platforms = this.physics.add.staticGroup();
    
        // Invisible ground
        this.platforms.create(800, height - 12, null)
            .setDisplaySize(1600, 20)
            .setVisible(false)
            .refreshBody();
    
        // Left ledge platform
        this.platforms.create(100, height - 230, null)
            .setDisplaySize(200, 10)
            .setVisible(false)
            .refreshBody();
        this.add.image(100, height - 180, 'ledgeLeft').setOrigin(0.5, 1).setScale(0.8);
    
        // Right ledge platform
        this.platforms.create(1500, height - 230, null)
            .setDisplaySize(200, 10)
            .setVisible(false)
            .refreshBody();
        this.add.image(1500, height - 180, 'ledgeRight').setOrigin(0.5, 1).setScale(0.8);
    
        // Center balcony platform
        this.platforms.create(800, height - 325, null)
            .setDisplaySize(300, 10) // Adjusted width to better match the balcony
            .setVisible(false)
            .refreshBody();
        this.add.image(800, height - 260, 'balcony').setOrigin(0.5, 1);
    
        // Player setup
        this.player = this.physics.add.sprite(200, height - 100, 'turboNegroStanding1');
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
    
        // Input setup
        this.cursors = this.input.keyboard.createCursorKeys();
        this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
        // Projectiles
        this.projectiles = this.physics.add.group({ defaultKey: 'projectileCD' });
        this.enemyProjectiles = this.physics.add.group({ defaultKey: 'Beads' });
    
        // Camera follow
        this.cameras.main.startFollow(this.player);
    
        // Add Mardi Gras Blimp
        this.mardiGrasBlimp = this.physics.add.sprite(-100, 50, 'MardiGrasBlimp');
        this.mardiGrasBlimp.setVelocityX(100); // Moves across the screen
        this.mardiGrasBlimp.body.allowGravity = false; // No gravity
        this.mardiGrasBlimp.setDepth(2); // Set on top layer
    
        // Disable collisions between the blimp and platforms
        this.physics.add.collider(this.mardiGrasBlimp, this.platforms, null, () => false);
    
        // Fire beads every 5 seconds
        this.time.addEvent({
            delay: 5000,
            loop: true,
            callback: this.fireBeads,
            callbackScope: this,
        });
    
        // Respawn Blimp every 7 seconds
        this.time.addEvent({
            delay: 7000,
            loop: true,
            callback: this.spawnBlimp,
            callbackScope: this,
        });
    
        // Collisions
        this.physics.add.collider(this.projectiles, this.mardiGrasBlimp, this.destroyBlimp, null, this);
        this.physics.add.overlap(this.enemyProjectiles, this.player, this.handleBeadCollision, null, this);
    
        console.log("Level 3 setup complete.");
    }
    
    
    update() {
        if (!this.player || !this.cursors) return;
    
        // Reset player velocity
        this.player.setVelocityX(0);
    
        // Left and right movement
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
    
        // Jumping
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-500);
            console.log("Player jumps!");
        }
    
        // Fire projectile
        if (Phaser.Input.Keyboard.JustDown(this.fireKey)) {
            this.fireProjectile();
        }
    
        // Check blimp position and reset if it goes off the right edge
        if (this.mardiGrasBlimp.x > 1600) {
            // Reset blimp to the left side and randomize its height
            this.mardiGrasBlimp.setPosition(-100, Phaser.Math.Between(50, 150));
            this.mardiGrasBlimp.setVelocityX(100); // Ensure it keeps moving to the right
        }
    }
    
    fireProjectile() {
        const projectile = this.projectiles.create(this.player.x, this.player.y, 'projectileCD');
        if (projectile) {
            projectile.body.setAllowGravity(false);
            projectile.setVelocityX(this.player.flipX ? -500 : 500);
        }
    }

    fireBeads() {
        if (this.mardiGrasBlimp.active) {
            const bead = this.enemyProjectiles.create(this.mardiGrasBlimp.x, this.mardiGrasBlimp.y, 'Beads');
            bead.body.setAllowGravity(false);
    
            // Aim at the player
            const angle = Phaser.Math.Angle.Between(this.mardiGrasBlimp.x, this.mardiGrasBlimp.y, this.player.x, this.player.y);
            bead.setVelocity(Math.cos(angle) * 300, Math.sin(angle) * 300);
        }
    }
    
    spawnBlimp() {
        if (this.blimpRespawning) return; // Prevent duplicate spawns
        this.blimpRespawning = false; // Reset respawn flag

        // Reset blimp properties
        this.mardiGrasBlimp.setPosition(-100, Phaser.Math.Between(50, 150));
        this.mardiGrasBlimp.setActive(true);
        this.mardiGrasBlimp.setVisible(true);
        this.mardiGrasBlimp.setVelocityX(100); // Restart its movement

        // Reapply the collider to ensure no collision with platforms
        this.physics.add.collider(this.mardiGrasBlimp, this.platforms, null, () => false);

        console.log("Blimp respawned!");
    }
    
    
    destroyBlimp(projectile, blimp) {
        if (projectile) projectile.destroy();
    
        if (blimp) {
            blimp.setActive(false);
            blimp.setVisible(false);
            blimp.body.setVelocity(0);
            blimp.body.checkCollision.none = true; // Ensure all collision checks are disabled
            blimp.setPosition(-100, -100); // Move it offscreen
        }
    
        console.log("Blimp destroyed!");
    
        // Set the respawn flag and schedule respawn
        this.blimpRespawning = true;
        this.time.delayedCall(5000, () => {
            this.spawnBlimp();
        });
    }
    
    handleBeadCollision(player, bead) {
        bead.destroy();
        console.log("Player hit by beads! Health -3");
        // Add health reduction logic here
    }

    spawnMardiGrasZombie() {
        const { width } = this.scale;
        const x = Phaser.Math.Between(50, width - 50);
        const enemy = this.enemies.create(x, 0, 'skeleton');
        enemy.setCollideWorldBounds(true).setBounce(0.2);

        // Enemy AI from Level 2
        this.time.addEvent({
            delay: 500,
            callback: () => this.enemyAI(enemy),
            loop: true,
        });
    }

    spawnTrumpetSkeleton() {
        const { width } = this.scale;
        const x = Math.random() < 0.5 ? 0 : width;
        const enemy = this.trumpetEnemies.create(x, 0, 'trumpetSkeleton');
        enemy.setCollideWorldBounds(true);

        // Enemy AI from Level 2
        this.time.addEvent({
            delay: 500,
            callback: () => this.enemyAI(enemy),
            loop: true,
        });
    }

    enemyAI(enemy) {
        if (!enemy.active) return;

        const playerX = this.player.x;

        if (enemy.x < playerX - 10) {
            enemy.setVelocityX(100);
        } else if (enemy.x > playerX + 10) {
            enemy.setVelocityX(-100);
        } else {
            enemy.setVelocityX(0);
        }

        if (Phaser.Math.Between(0, 100) < 20 && enemy.body.touching.down) {
            enemy.setVelocityY(-300);
        }
    }

    handleProjectileEnemyCollision(projectile, enemy) {
        projectile.destroy();
        enemy.destroy();
    }
}
