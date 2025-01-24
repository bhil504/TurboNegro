export default class StartMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'StartMenu' });
    }

    preload() {
        // Load the background image and logo
        this.load.image('startBackground', 'assets/levels/BackGrounds/StartMenu.webp');
        this.load.image('turboNegroLogo', 'assets/Logo/Turbo Negro.png'); // Logo path

        // Load background music
        this.load.audio('menuMusic', 'assets/Audio/TurboNegroShortVersion.mp3');
    }

    create() {
        const width = 1100; // Fixed width
        const height = 500; // Fixed height

        // Add and scale the background
        const background = this.add.image(width / 2, height / 2, 'startBackground');
        background.setDisplaySize(width, height).setOrigin(0.5);

        // Add the logo at the center of the screen
        const logo = this.add.image(width / 2, height / 2.8, 'turboNegroLogo');
        logo.setOrigin(0.5).setScale(0.6); // Adjust scale for proper fit

        // Add the subtitle below the logo
        const subtitle = this.add.text(width / 3, height / 1.9, 'Saves The French Quarter!!!', {
            fontSize: '30px',
            fontFamily: 'Bangers',
            color: 'white',
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: '#000000',
                blur: 0,
                stroke: true,
                fill: true,
            },
        }).setOrigin(-0.1);

        // Add the "Start Game" button below the subtitle
        const startButton = this.add.text(width / 2, height / 1.5, 'Start Game', {
            fontSize: '30px',
            fontStyle: 'bold',
            fill: '#ff0000',
            backgroundColor: '#000000',
            padding: { left: 20, right: 20, top: 10, bottom: 10 },
            align: 'center',
        })
            .setOrigin(0.5)
            .setInteractive();

        // Hover effects for the button
        startButton.on('pointerover', () => {
            startButton.setStyle({ fill: '#ffffff', backgroundColor: '#ff0000' });
        });

        startButton.on('pointerout', () => {
            startButton.setStyle({ fill: '#ff0000', backgroundColor: '#000000' });
        });

        // Start the game on button click
        startButton.on('pointerdown', () => {
            this.sound.stopAll(); // Stop the menu music
            this.scene.start('Level1');
        });

        // Keyboard shortcuts for quick level testing
        this.input.keyboard.on('keydown-ONE', () => {
            this.scene.start('Level1');
        });
        this.input.keyboard.on('keydown-TWO', () => {
            this.scene.start('Level2');
        });
        this.input.keyboard.on('keydown-THREE', () => {
            this.scene.start('Level3');
        });
        this.input.keyboard.on('keydown-FOUR', () => {
            this.scene.start('Level4');
        });
        this.input.keyboard.on('keydown-FIVE', () => {
            this.scene.start('Level5');
        });
        this.input.keyboard.on('keydown-B', () => {
            this.scene.start('BossFight');
        });

        // Play background music
        const music = this.sound.add('menuMusic', { loop: true, volume: 0.6 });
        music.play();
    }
}
