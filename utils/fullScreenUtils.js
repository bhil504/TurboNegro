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
                fullscreenElement.requestFullscreen().then(() => {
                    if (screen.orientation && screen.orientation.lock) {
                        screen.orientation.lock('landscape').catch((err) => {
                            console.warn('Failed to lock orientation:', err);
                        });
                    }
                });
            } else if (fullscreenElement.webkitRequestFullscreen) {
                fullscreenElement.webkitRequestFullscreen();
            } else {
                console.error('Fullscreen not supported by this browser.');
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
