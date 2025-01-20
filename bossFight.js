export default class BossFight extends Phaser.Scene {
    constructor() {
        super({ key: 'BossFight' });
    }

    preload() {
        // Load assets
        this.load.image('finalFightBackground', 'assets/Levels/BackGrounds/finalFight.webp');
        this.load.image('beignetBoss', 'assets/Characters/Enemies/Beignet_Boss.png');
        this.load.image('turboNegroStanding', 'assets/Characters/Character1/TurboNegroStanding/TurboNegroStanding1.png');
        this.load.image('ground', 'assets/Levels/Platforms/ground.png'); // Placeholder for ground
    }

    create() {
        const { width, height } = this.scale;

        // Add background
        this.add.image(width / 2, height / 2, 'finalFightBackground').setDisplaySize(width, height);

        // Create ground
        this.ground = this.physics.add.staticGroup();
        this.ground
            .create(width / 2, height - 50, 'ground')
            .setDisplaySize(width, 100)
            .setOrigin(0.5, 0)
            .refreshBody();

        // Add player character
        this.player = this.physics.add.sprite(100, height - 150, 'turboNegroStanding');
        this.player.setCollideWorldBounds(true);

        // Add Beignet Boss
        this.boss = this.physics.add.sprite(width - 100, height - 150, 'beignetBoss');
        this.boss.setCollideWorldBounds(true);

        // Enable collisions with the ground
        this.physics.add.collider(this.player, this.ground);
        this.physics.add.collider(this.boss, this.ground);

        // Player controls
        this.cursors = this.input.keyboard.createCursorKeys();

        // Boss movement setup
        this.bossDirection = -1; // Boss starts moving left
        this.bossSpeed = 100; // Adjust speed as needed
    }

    update() {
        // Player movement
        this.player.setVelocityX(0);
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-200);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(200);
        }

        // Beignet Boss movement
        this.boss.setVelocityX(this.bossDirection * this.bossSpeed);

        // Reverse direction if the boss hits the screen bounds
        if (this.boss.body.blocked.left || this.boss.body.blocked.right) {
            this.bossDirection *= -1;
        }
    }
}
