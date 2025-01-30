export default class StartMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'StartMenu' });
    }

    preload() {
        // Load the background image, logo, and music
        this.load.image('startBackground', 'assets/levels/BackGrounds/StartMenu.webp');
        this.load.image('turboNegroLogo', 'assets/Logo/Turbo Negro.png');
        this.load.audio('menuMusic', 'assets/Audio/LevelMusic/mp3/TurboNegroShortVersion.mp3');
    }

    create() {
        const width = 1100;
        const height = 500;

        const background = this.add.image(width / 2, height / 2, 'startBackground');
        background.setDisplaySize(width, height).setOrigin(0.5);

        const logo = this.add.image(width / 2, height / 2.8, 'turboNegroLogo').setOrigin(0.5).setScale(0.6);

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

        startButton.on('pointerover', () => {
            startButton.setStyle({ fill: '#ffffff', backgroundColor: '#ff0000' });
        });

        startButton.on('pointerout', () => {
            startButton.setStyle({ fill: '#ff0000', backgroundColor: '#000000' });
        });

        startButton.on('pointerdown', () => {
            this.sound.stopAll();
            this.scene.start('Level1'); // Directly starts the game without requesting fullscreen
        });
        

        const music = this.sound.add('menuMusic', { loop: true, volume: 0.6 });
        music.play();
    }
}
