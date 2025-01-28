export function addFullscreenButton(scene) {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
        console.log("Mobile device detected. Adding fullscreen button for mobile.");

        const mobileFullscreenButton = document.getElementById('mobile-fullscreen-button');
        if (mobileFullscreenButton) {
            mobileFullscreenButton.addEventListener('click', () => {
                const fullscreenElement = document.getElementById('fullscreen');
                if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                    fullscreenElement.requestFullscreen().catch((err) => {
                        console.error('Failed to enable fullscreen:', err);
                    });
                } else {
                    document.exitFullscreen();
                }
            });
        } else {
            console.warn("Mobile fullscreen button not found in DOM.");
        }
    } else {
        console.log("Desktop detected. Adding fullscreen button for desktop.");

        const fullscreenButton = scene.add.text(20, 20, '[ fullscreen ]', {
            fontSize: '20px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { left: 10, right: 10, top: 5, bottom: 5 },
            borderRadius: '5px',
        }).setInteractive();

        fullscreenButton.on('pointerdown', () => {
            const fullscreenElement = document.getElementById('fullscreen');
            if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                fullscreenElement.requestFullscreen().catch((err) => {
                    console.error('Error attempting to enable fullscreen:', err);
                });
            } else {
                document.exitFullscreen();
            }
        });

        return fullscreenButton;
    }
}