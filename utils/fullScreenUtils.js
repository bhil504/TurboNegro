export function addFullscreenButton(scene) {
    const fullscreenElement = document.getElementById('fullscreen');
    if (!fullscreenElement) {
        console.error("⚠️ Fullscreen element not found!");
        return;
    }

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
        console.log("📱 Mobile detected. Adding fullscreen button.");
        const mobileFullscreenButton = document.getElementById('mobile-fullscreen-button');
        if (mobileFullscreenButton) {
            mobileFullscreenButton.addEventListener('click', () => toggleFullscreen(fullscreenElement));
        } else {
            console.warn("⚠️ Mobile fullscreen button not found.");
        }
    } else {
        console.log("🖥️ Desktop detected. Adding fullscreen button.");
        const fullscreenButton = scene.add.text(20, 20, '[ fullscreen ]', {
            fontSize: '20px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { left: 10, right: 10, top: 5, bottom: 5 },
            borderRadius: '5px',
        }).setInteractive();

        fullscreenButton.on('pointerdown', () => toggleFullscreen(fullscreenElement));

        return fullscreenButton;
    }
}

function toggleFullscreen(element) {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) { // iOS Safari support
            element.webkitRequestFullscreen();
        }
    } else {
        document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen();
    }
}
