export function addFullscreenButton(scene) {
    const fullscreenButton = scene.add.text(20, 20, 'Fullscreen', {
        fontSize: '20px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { left: 10, right: 10, top: 5, bottom: 5 },
        borderRadius: '5px',
    }).setInteractive();

    fullscreenButton.on('pointerdown', () => {
        const fullscreenElement = document.getElementById('fullscreen');
        if (!document.fullscreenElement) {
            fullscreenElement.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    });

    return fullscreenButton;
}
