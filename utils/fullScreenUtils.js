export function addFullscreenButton(scene) {
    const fullscreenButton = scene.add.text(20, 20, 'Fullscreen', {
        fontSize: '30px', // Increase size for touch accessibility
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { left: 15, right: 15, top: 10, bottom: 10 },
        borderRadius: '8px',
    }).setInteractive();

    fullscreenButton.on('pointerdown', handleFullscreen);
    fullscreenButton.on('touchstart', handleFullscreen);

    function handleFullscreen() {
        const fullscreenElement = document.getElementById('fullscreen'); // Target the specific section
        if (!document.fullscreenElement) {
            fullscreenElement.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }

    if (!document.fullscreenEnabled) {
        console.warn("Fullscreen mode is not supported by your browser.");
    }

    return fullscreenButton;
}
