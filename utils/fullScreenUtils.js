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
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            if (fullscreenElement.requestFullscreen) {
                fullscreenElement.requestFullscreen().catch((err) => {
                    console.error('Error attempting to enable fullscreen:', err);
                });
            } else if (fullscreenElement.webkitRequestFullscreen) {
                fullscreenElement.webkitRequestFullscreen();
            } else {
                console.error('Fullscreen is not supported by this browser.');
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    });

    return fullscreenButton;
}
