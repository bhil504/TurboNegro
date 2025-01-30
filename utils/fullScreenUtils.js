export function addFullscreenButton(scene) {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
        console.log("Mobile device detected. Adding fullscreen button for mobile.");

        const mobileFullscreenButton = document.getElementById('mobile-fullscreen-button');
        if (mobileFullscreenButton) {
            mobileFullscreenButton.addEventListener('click', () => {
                const fullscreenElement = document.getElementById('fullscreen');

                if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                    if (fullscreenElement.requestFullscreen) {
                        fullscreenElement.requestFullscreen().then(() => {
                            console.log("Fullscreen enabled on standard browsers.");
                        }).catch((err) => {
                            console.error('Failed to enable fullscreen:', err);
                        });
                    } else if (fullscreenElement.webkitRequestFullscreen) { // ✅ iOS Safari Support
                        fullscreenElement.webkitRequestFullscreen().then(() => {
                            console.log("Fullscreen enabled on iOS.");
                        }).catch((err) => {
                            console.error('Failed to enable fullscreen on iOS:', err);
                        });
                    }
                } else {
                    document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen();
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
                if (fullscreenElement.requestFullscreen) {
                    fullscreenElement.requestFullscreen();
                } else if (fullscreenElement.webkitRequestFullscreen) { // ✅ iOS Safari Support
                    fullscreenElement.webkitRequestFullscreen();
                }
            } else {
                document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen();
            }
        });

        return fullscreenButton;
    }
}
