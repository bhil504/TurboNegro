export default class BossFight extends Phaser.Scene {
    constructor() {
        super({ key: 'BossFight' });
    }

    preload() {
        // Load assets
        this.load.image('finalFightBackground', 'assets/Levels/BackGrounds/finalFight.webp');
        this.load.image('beignetBoss', 'assets/Characters/Enemies/Beignet_Boss.png');
        this.load.image('turboNegroStanding1', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding1.png');
        this.load.image('turboNegroStanding2', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding2.png');
        this.load.image('turboNegroStanding3', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding3.png');
        this.load.image('turboNegroStanding4', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding4.png');
        this.load.image('turboNegroWalking', 'assets/Characters/Character1/TurboNegroWalking.png');
        this.load.image('ground', 'assets/Levels/Platforms/ground.png');
    }

    create() {
        const { width, height } = this.scale;

        // Add background
        this.background = this.add.tileSprite(0, 0, 3072, 1024, 'finalFightBackground')
            .setOrigin(0, 0)
            .setScrollFactor(0);

        // Create ground
        this.ground = this.physics.add.staticGroup();
        this.ground.create(1536, height - 50, 'ground') // Positioned in the middle of the scene
            .setDisplaySize(3072, 50) // Full width of the background
            .refreshBody();

        // Add player character
        this.player = this.physics.add.sprite(200, height - 100, 'turboNegroStanding1');
        this.player.setCollideWorldBounds(true);

        // Add Beignet Boss
        this.boss = this.physics.add.sprite(width - 200, height - 100, 'beignetBoss');
        this.boss.setCollideWorldBounds(true);

        // Enable collisions with the ground
        this.physics.add.collider(this.player, this.ground);
        this.physics.add.collider(this.boss, this.ground);

        // Player animations
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

        // Player input setup
        this.cursors = this.input.keyboard.createCursorKeys();

        // Boss movement setup
        this.bossDirection = -1; // Boss starts moving left
        this.bossSpeed = 100; // Adjust speed as needed

        // Camera setup for parallax
        this.cameras.main.setBounds(0, 0, 3072, height);
        this.cameras.main.startFollow(this.player);

        // Set world bounds
        this.physics.world.setBounds(0, 0, 3072, height);
    }

    update() {
        // Scroll the background for parallax effect
        this.background.tilePositionX = this.cameras.main.scrollX * 0.5;

        // Player movement
        this.player.setVelocityX(0);

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-165);
            this.player.setFlipX(true);
            this.player.play('walk', true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(165);
            this.player.setFlipX(false);
            this.player.play('walk', true);
        } else if (this.player.body.touching.down) {
            this.player.play('idle', true);
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-500);
        }

        // Beignet Boss movement
        this.boss.setVelocityX(this.bossDirection * this.bossSpeed);

        // Reverse direction if the boss hits the screen bounds
        if (this.boss.body.blocked.left || this.boss.body.blocked.right) {
            this.bossDirection *= -1;
        }
    }
}
