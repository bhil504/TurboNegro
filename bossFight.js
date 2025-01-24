export default class BossFight extends Phaser.Scene {
    constructor() {
        super({ key: 'BossFight' });
    }

    preload() {
        // Loading assets
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
    }

    create() {
        const { width, height } = this.scale;

        // Background
        this.add.image(width, height / 2, 'finalFightBackground').setDisplaySize(width * 2, height);
        this.physics.world.setBounds(0, 0, width * 2, height);
        this.cameras.main.setBounds(0, 0, width * 2, height);

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

        // Ground
        this.ground = this.physics.add.staticGroup();
        this.ground.create(width, height - 20, null).setDisplaySize(width * 2, 10).setVisible(false).refreshBody();

        // Groups
        this.projectiles = this.physics.add.group({ classType: Phaser.GameObjects.Sprite, maxSize: 20 });
        this.bossProjectiles = this.physics.add.group({ classType: Phaser.GameObjects.Sprite, maxSize: 30 });
        this.minions = this.physics.add.group({ classType: Phaser.GameObjects.Sprite, maxSize: 20 });
        this.healthPacks = this.physics.add.group();
        this.hazards = this.physics.add.group();

        // Boss setup
        this.boss = this.physics.add.sprite(width * 1.5, height - 200, 'beignetBoss');
        this.boss.setCollideWorldBounds(true);
        this.boss.setScale(1);
        this.boss.setAlpha(1);
        this.boss.body.setAllowGravity(true);
        this.boss.health = 20;

        // Collisions
        this.physics.add.collider(this.boss, this.ground);
        this.physics.add.collider(this.player, this.ground);
        this.physics.add.collider(this.minions, this.ground);

        // Input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Collision effects
        this.physics.add.collider(this.player, this.bossProjectiles, this.handlePlayerHit, null, this);
        this.physics.add.collider(this.projectiles, this.boss, this.handleBossHit, null, this);
        this.physics.add.collider(this.player, this.minions, this.handleMinionCollision, null, this);
        this.physics.add.overlap(this.player, this.healthPacks, this.collectHealthPack, null, this);
        this.physics.add.overlap(this.player, this.hazards, this.handleHazardCollision, null, this);

        // Timed events
        this.time.addEvent({ delay: 2000, callback: this.shootProjectiles, callbackScope: this, loop: true });
        this.time.addEvent({ delay: 5000, callback: this.spawnMinions, callbackScope: this, loop: true });
    }

    update() {
        // Player controls
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
    }


    fireProjectile() {
        // Fire player's projectile
        let projectile = this.projectiles.get(this.player.x, this.player.y, 'playerProjectile');
        if (projectile) {
            projectile.setActive(true).setVisible(true);
            projectile.body.setAllowGravity(false);
            projectile.setVelocityX(this.player.flipX ? -500 : 500);
        }
    }

    shootProjectiles() {
        // Boss projectile pattern
        for (let angle = -30; angle <= 30; angle += 15) {
            let projectile = this.bossProjectiles.get(this.boss.x, this.boss.y, 'beignetProjectile');
            if (projectile) {
                projectile.setActive(true).setVisible(true);
                projectile.body.setAllowGravity(false);
                const rad = Phaser.Math.DegToRad(angle);
                projectile.setVelocity(300 * Math.cos(rad), 300 * Math.sin(rad));
            }
        }
    }   

    spawnMinions() {
        // Spawn beignet minions
        const activeMinions = this.minions.getChildren().filter((minion) => minion.active).length;
        if (activeMinions >= 5) return;

        let minion = this.minions.get(this.boss.x - 100, this.boss.y, 'beignetMonster');
        if (minion) {
            minion.setActive(true).setVisible(true);
            minion.setVelocityX(Phaser.Math.Between(-100, 100));
            minion.health = 2;
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
        hazard.body.setAllowGravity(true);
        hazard.setVelocityY(200);
        hazard.body.setImmovable(true);

        // Destroy hazard when off-screen
        hazard.body.onWorldBounds = true;
        hazard.body.world.on('worldbounds', () => hazard.destroy());
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
        // Handle boss getting hit
        this.sound.play('bossHit');
        projectile.destroy();
        boss.health -= 1;

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

    setupJoystick() {
        const joystickArea = document.getElementById('joystick-area');
        let joystickKnob = document.getElementById('joystick-knob');

        if (!joystickKnob) {
            joystickKnob = document.createElement('div');
            joystickKnob.id = 'joystick-knob';
            joystickArea.appendChild(joystickKnob);
        }

        let joystickStartX = 0, joystickStartY = 0, activeInterval;

        joystickArea.addEventListener('touchstart', (event) => {
            const touch = event.touches[0];
            joystickStartX = touch.clientX;
            joystickStartY = touch.clientY;

            activeInterval = setInterval(() => this.applyJoystickForce(), 16); // 60 FPS
        });

        joystickArea.addEventListener('touchmove', (event) => {
            const touch = event.touches[0];
            const deltaX = touch.clientX - joystickStartX;
            const deltaY = touch.clientY - joystickStartY;
            const maxDistance = 50; // Joystick radius
            const distance = Math.min(maxDistance, Math.sqrt(deltaX ** 2 + deltaY ** 2));
            const clampedX = (deltaX / distance) * Math.min(distance, maxDistance);
            const clampedY = (deltaY / distance) * Math.min(distance, maxDistance);

            joystickKnob.style.transform = `translate(calc(${clampedX}px - 50%), calc(${clampedY}px - 50%))`;
            this.joystickForceX = clampedX / maxDistance;
            this.joystickForceY = clampedY / maxDistance;
        });

        joystickArea.addEventListener('touchend', () => {
            joystickKnob.style.transform = `translate(-50%, -50%)`;
            this.joystickForceX = 0;
            this.joystickForceY = 0;
            clearInterval(activeInterval);

            if (this.player) {
                this.player.setVelocityX(0);
                this.player.anims.play('idle', true);
            }
        });

        this.joystickForceX = 0;
        this.joystickForceY = 0;
    }

    applyJoystickForce() {
        if (this.player) {
            this.player.setVelocityX(this.joystickForceX * 160);
    
            if (this.joystickForceX > 0) this.player.setFlipX(false);
            if (this.joystickForceX < 0) this.player.setFlipX(true);
    
            if (this.joystickForceY < -0.5 && this.player.body.touching.down) {
                this.player.setVelocityY(-500);
            }
    
            if (Math.abs(this.joystickForceX) > 0.1 && this.player.body.touching.down) {
                this.player.play('walk', true);
            } else if (this.player.body.touching.down) {
                this.player.play('idle', true);
            }
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