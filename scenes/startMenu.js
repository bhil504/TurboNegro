import { addFullscreenButton } from '/utils/fullScreenUtils.js';

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
    
        // Create shadow effect by duplicating the logo behind with a slight offset
        const logoShadow = this.add.image(width / 2 + 5, height / 3 + 5, 'turboNegroLogo')
        .setOrigin(0.5)
        .setScale(0.6)
        .setTint(0xffffff) // Set the shadow color to white
        .setAlpha(0.7); // Reduce opacity for shadow effect

        const logo = this.add.image(width / 2, height / 3, 'turboNegroLogo')
        .setOrigin(0.5)
        .setScale(0.6);


    
        const subtitle = this.add.text(width / 2, height / 1.7, 'Saves The French Quarter!!!', {
            fontSize: '42px', // Increased font size for better visibility
            fontFamily: 'Nosifer', // Apply Nosifer font
            color: 'red', // Text color
            align: 'center',
            stroke: '#000000', // Black border
            strokeThickness: 8, // Thickness of the border
            shadow: {
                offsetX: 4, // Horizontal shadow offset
                offsetY: 4, // Vertical shadow offset
                color: 'red', // Shadow color
                blur: 8, // Shadow blur intensity
                stroke: false, // Do not apply shadow to stroke
                fill: true, // Apply shadow to text fill
            },
        })
        .setOrigin(0.5);
        
        
    
        const startButton = this.add.text(width / 2, height / 1.4, 'Start Game', {
            fontSize: '32px',
            fontFamily: 'Nosifer',
            fill: '#00ff00', // Classic arcade green
            backgroundColor: '#000000',
            padding: { left: 20, right: 20, top: 10, bottom: 10 },
            align: 'center',
        })
        .setOrigin(0.5)
        .setInteractive();
        
        // Add blinking animation effect for classic arcade style
        this.tweens.add({
            targets: startButton,
            alpha: 0,
            duration: 500,
            yoyo: true,
            repeat: -1
        });        
    
        startButton.on('pointerover', () => {
            startButton.setStyle({ fill: '#ffffff', backgroundColor: '#ff0000' });
        });
    
        startButton.on('pointerout', () => {
            startButton.setStyle({ fill: '#ff0000', backgroundColor: '#000000' });
        });
    
        startButton.on('pointerdown', () => {
            this.sound.stopAll();
            this.scene.start('Level1');
        });
    
        this.music = this.sound.add('menuMusic', { loop: true, volume: 0.6 });
        this.music.play();
    
        // Add Fullscreen Button
        addFullscreenButton(this);
    }

}
