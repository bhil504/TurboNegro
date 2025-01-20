export default class BossFight extends Phaser.Scene {
    constructor() {
        super({ key: 'BossFight' });
    }

    preload() {
        // Loading assets as before
        this.load.image('finalFightBackground', 'assets/Levels/BackGrounds/finalFight.webp');
        this.load.image('beignetBoss', 'assets/Characters/Enemies/Beignet_Boss.png');
        this.load.image('beignetProjectile', 'assets/Characters/Projectiles/Beignet/Beignet2.png');
        this.load.image('beignetMonster', 'assets/Characters/Enemies/Beignet_Monster.png');
        this.load.image('playerProjectile', 'assets/Characters/Projectiles/CD/CDresize.png');
        this.load.image('turboNegroStanding1', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding1.png');
        this.load.image('turboNegroStanding2', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding2.png');
        this.load.image('turboNegroStanding3', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding3.png');
        this.load.image('turboNegroStanding4', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding4.png');
        this.load.image('turboNegroWalking', 'assets/Characters/Character1/TurboNegroWalking.png');
        this.load.image('healthPack', 'assets/Items/HealthPack.png');
        this.load.image('fallingHazard', 'assets/Levels/Platforms/fallingHazard.png');
        this.load.audio('bossMusic', 'assets/Audio/SmoothDaggers.mp3');
        this.load.audio('bossHit', 'assets/Audio/BossHit.mp3');
        this.load.audio('playerHit', 'assets/Audio/PlayerHit.mp3');
        this.load.spritesheet('bossAnimation', 'assets/Characters/Enemies/Beignet_Boss_Animation.png', { frameWidth: 100, frameHeight: 100 });
    }

    create() {
        const { width, height } = this.scale;

        // Setup scene
        this.physics.world.setBounds(0, 0, width * 2, height);
        this.cameras.main.setBounds(0, 0, width * 2, height);
        this.add.image(width, height / 2, 'finalFightBackground').setDisplaySize(width * 2, height);

        // Music
        this.bossMusic = this.sound.add('bossMusic', { loop: true, volume: 0.5 });
        this.bossMusic.play();

        // Player setup
        this.player = this.physics.add.sprite(100, height - 150, 'turboNegroStanding1');
        this.player.setCollideWorldBounds(true);
        this.playerHealth = 10;
        this.cameras.main.startFollow(this.player);

        // Player animations
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('turboNegroStanding1', { start: 0, end: 3 }),
            frameRate: 4,
            repeat: -1,
        });
        this.anims.create({ key: 'walk', frames: [{ key: 'turboNegroWalking' }], frameRate: 8, repeat: -1 });

        // Ground for collision
        this.ground = this.physics.add.staticGroup();
        this.ground.create(width, height - 20, null).setDisplaySize(width * 2, 10).setVisible(false).refreshBody();

        // Groups
        this.projectiles = this.physics.add.group({ classType: Phaser.GameObjects.Sprite, maxSize: 20 });
        this.bossProjectiles = this.physics.add.group({ classType: Phaser.GameObjects.Sprite, maxSize: 30 });
        this.minions = this.physics.add.group({ classType: Phaser.GameObjects.Sprite, maxSize: 20 });
        this.healthPacks = this.physics.add.group();
        this.hazards = this.physics.add.group();

        // Boss setup with animations
        this.boss = this.physics.add.sprite(width * 1.5, height - 200, 'bossAnimation');
        this.boss.setCollideWorldBounds(true);
        this.boss.setScale(1);
        this.boss.setVisible(true);
        this.boss.setAlpha(1);
        this.boss.body.setAllowGravity(true);
        this.boss.health = 20;
        this.anims.create({
            key: 'bossIdle',
            frames: this.anims.generateFrameNumbers('bossAnimation', { start: 0, end: 3 }),
            frameRate: 5,
            repeat: -1
        });
        this.boss.play('bossIdle');

        this.totalEnemiesDefeated = 0;
        this.remainingEnemies = 20;
        this.updateEnemyCountUI();

        // Collisions
        this.physics.add.collider(this.boss, this.ground);
        this.physics.add.collider(this.player, this.ground);
        this.physics.add.collider(this.minions, this.ground);

        // Debug
        // this.debugGraphics = this.add.graphics().setAlpha(0.75);
        // this.physics.world.createDebugGraphic();
        // this.physics.world.drawDebug = true;

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Collisions with effects
        this.physics.add.collider(this.player, this.bossProjectiles, this.handlePlayerHit, null, this);
        this.physics.add.collider(this.projectiles, this.boss, this.handleBossHit, null, this);
        this.physics.add.collider(this.player, this.minions, this.handleMinionCollision, null, this);
        this.physics.add.overlap(this.player, this.healthPacks, this.collectHealthPack, null, this);
        this.physics.add.overlap(this.player, this.hazards, this.handleHazardCollision, null, this);

        // Boss actions with phases
        this.time.addEvent({ delay: 2000, callback: this.shootProjectiles, callbackScope: this, loop: true });
        this.time.addEvent({ delay: 5000, callback: this.spawnMinions, callbackScope: this, loop: true });
        this.time.addEvent({ delay: 15000, callback: this.spawnHealthPack, callbackScope: this, loop: true });
        this.time.addEvent({ delay: 3000, callback: this.spawnHazard, callbackScope: this, loop: true });

        // Boss phase change
        this.time.addEvent({ delay: 10000, callback: this.changeBossPhase, callbackScope: this, loop: true });
    }

    update() {
        if (!this.player || !this.cursors) return;

        this.player.setVelocityX(0);
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160).setFlipX(true).play('walk', true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160).setFlipX(false).play('walk', true);
        } else {
            this.player.play('idle', true);
        }
        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-500);
        }
        if (Phaser.Input.Keyboard.JustDown(this.fireKey)) {
            this.fireProjectile();
        }

        // Boss movement
        if (this.boss.active && this.boss.visible) {
            if (this.boss.x < this.scale.width * 0.75) {
                this.boss.setVelocityX(50);
            } else if (this.boss.x > this.scale.width * 1.25) {
                this.boss.setVelocityX(-50);
            }
        }
    }

    fireProjectile() {
        let projectile = this.projectiles.get(this.player.x, this.player.y, 'playerProjectile');
        if (projectile) {
            projectile.setActive(true).setVisible(true);
            projectile.body.setAllowGravity(false);
            projectile.setVelocityX(this.player.flipX ? -500 : 500);
        }
    }

    shootProjectiles() {
        const pattern = Phaser.Math.Between(0, 1);
        if (pattern === 0) {
            for (let angle = -30; angle <= 30; angle += 15) {
                let projectile = this.bossProjectiles.get(this.boss.x, this.boss.y, 'beignetProjectile');
                if (projectile) {
                    projectile.setActive(true).setVisible(true);
                    projectile.body.setAllowGravity(false);
                    const rad = Phaser.Math.DegToRad(angle);
                    projectile.setVelocity(300 * Math.cos(rad), 300 * Math.sin(rad));
                }
            }
        } else {
            let projectile = this.bossProjectiles.get(this.boss.x, this.boss.y, 'beignetProjectile');
            if (projectile) {
                projectile.setActive(true).setVisible(true);
                projectile.body.setAllowGravity(false);
                const angle = Phaser.Math.Angle.Between(this.boss.x, this.boss.y, this.player.x, this.player.y);
                projectile.setVelocity(Math.cos(angle) * 300, Math.sin(angle) * 300);
            }
        }
    }

    spawnMinions() {
        let minion = this.minions.get(this.boss.x - 100, this.boss.y, 'beignetMonster');
        if (minion) {
            minion.setActive(true).setVisible(true);
            minion.setVelocityX(-100);
            minion.health = 2;
            this.time.addEvent({
                delay: 3000,
                callback: () => this.shootMinionProjectile(minion),
                loop: true
            });
        }
    }

    shootMinionProjectile(minion) {
        let projectile = this.bossProjectiles.get(minion.x, minion.y, 'beignetProjectile');
        if (projectile) {
            projectile.setActive(true).setVisible(true);
            projectile.body.setAllowGravity(false);
            const angle = Phaser.Math.Angle.Between(minion.x, minion.y, this.player.x, this.player.y);
            projectile.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200);
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
        hazard.body.setAllowGravity(true);
        hazard.setVelocityY(200);
        hazard.body.setImmovable(true);

        // Destroy hazard when off-screen
        hazard.body.onWorldBounds = true;
        hazard.body.world.on('worldbounds', () => hazard.destroy());
    }

    handlePlayerHit(player, projectile) {
        this.sound.play('playerHit');
        projectile.destroy();
        this.playerHealth -= 1;
        this.updateHealthUI();
        if (this.playerHealth <= 0) {
            this.scene.start('GameOver'); // Assuming you have a 'GameOver' scene
        }
    }

    handleMinionCollision(player, minion) {
        minion.destroy();
        this.playerHealth -= 2;
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
        this.sound.play('bossHit');
        projectile.destroy();
        boss.health -= 1;

        if (boss.health <= 10 && this.boss.visible) {
            this.boss.setVisible(false);
            this.spawnEnemies(20);
        }

        if (boss.health <= 0 && !this.boss.visible && this.totalEnemiesDefeated >= 20) {
            this.boss.setVisible(true);
            boss.health = 10;
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
        document.getElementById('enemy-count').innerText = `Enemies Left: ${20 - this.totalEnemiesDefeated}`;
    }

    spawnEnemies(count) {
        for (let i = 0; i < count; i++) {
            let x = Phaser.Math.Between(50, this.scale.width - 50);
            let enemy = this.minions.get(x, 0, 'beignetMonster');
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

    changeBossPhase() {
        // Example of changing boss behavior, could be expanded
        if (this.boss.health <= 15) {
            this.time.removeEvent(this.shootProjectiles);
            this.time.addEvent({ delay: 1000, callback: this.shootProjectiles, callbackScope: this, loop: true });
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
        console.log("Boss Defeated!");
        if (this.bossMusic) this.bossMusic.stop();
        if (this.time) this.time.clearPendingEvents();
        this.minions.clear(true, true);
        this.bossProjectiles.clear(true, true);
        this.projectiles.clear(true, true);
        if (this.boss) {
            this.boss.destroy();
            this.boss = null;
        }
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'levelComplete').setOrigin(0.5);
    
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('VictoryScene'); // Assuming a victory scene follows
        });
    }
}
// Beignet projectiles as boss lasers
this.time.addEvent({
    delay: 2000, // Fire every 2 seconds
    callback: () => {
        let laser = this.physics.add.sprite(this.boss.x, this.boss.y, 'beignetProjectile');
        laser.setVelocityX(-300); // Move toward the player
        this.physics.add.collider(laser, this.player, this.handlePlayerHit, null, this);
    },
    loop: true
});

// Spawn beignet minions at 10 health
this.boss.on('healthChange', (health) => {
    if (health === 10 && !this.minionSpawned) {
        this.minionSpawned = true;
        this.time.addEvent({
            delay: 1500, // Spawn every 1.5 seconds
            callback: () => {
                let minion = this.physics.add.sprite(Phaser.Math.Between(100, 700), 0, 'beignetMinion');
                minion.setVelocityY(200); // Fall from the sky
                this.physics.add.collider(minion, this.player, this.handlePlayerHit, null, this);
            },
            repeat: 4 // Spawn 5 minions total
        });
    }
});

// Random falling hazards
this.time.addEvent({
    delay: 3000, // Fall every 3 seconds
    callback: () => {
        let hazard = this.physics.add.sprite(Phaser.Math.Between(100, 700), 0, 'fallingHazard');
        hazard.setVelocityY(400); // Drop speed
        this.physics.add.collider(hazard, this.player, this.handlePlayerHit, null, this);
    },
    loop: true
});

// Moving platforms
this.platform1 = this.physics.add.image(400, 300, 'platform').setImmovable(true).setVelocityY(50);
this.platform2 = this.physics.add.image(200, 300, 'platform').setImmovable(true).setVelocityY(-50);
this.platform1.body.allowGravity = false;
this.platform2.body.allowGravity = false;

this.time.addEvent({
    delay: 5000, // Change direction every 5 seconds
    callback: () => {
        this.platform1.setVelocityY(this.platform1.body.velocity.y * -1);
        this.platform2.setVelocityY(this.platform2.body.velocity.y * -1);
    },
    loop: true
});

// Boss health display
this.bossHealthText = this.add.text(16, 16, 'Boss Health: 20', { fontSize: '24px', fill: '#fff' });
this.boss.on('healthChange', (health) => {
    this.bossHealthText.setText(`Boss Health: ${health}`);
    let tintIntensity = Math.floor(255 - (health / 20) * 255); // Calculate red tint
    this.boss.setTint(Phaser.Display.Color.GetColor(tintIntensity, 0, 0));
});
