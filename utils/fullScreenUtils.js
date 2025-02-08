export function addFullscreenButton(scene) {
    const fullscreenElement = document.getElementById('fullscreen');
    const gameIframe = document.getElementById('game-iframe');

    if (!fullscreenElement) {
        console.error("⚠️ Fullscreen element not found!");
        return;
    }

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isLandscape = window.innerWidth > window.innerHeight;

    if (isMobile) {
        console.log("📱 Mobile detected. Adding fullscreen button.");
        const mobileFullscreenButton = document.getElementById('mobile-fullscreen-button');

        if (mobileFullscreenButton) {
            mobileFullscreenButton.addEventListener('click', () => {
                exitIframeFullscreen(() => toggleFullscreen(fullscreenElement));
            });

            // Adjust positioning for landscape mode
            if (isLandscape) {
                mobileFullscreenButton.style.position = "absolute";
                mobileFullscreenButton.style.right = "20px"; // Adjust right spacing
                mobileFullscreenButton.style.top = "10px"; // Adjust top spacing
            } else {
                mobileFullscreenButton.style.position = "relative";
                mobileFullscreenButton.style.right = "auto";
                mobileFullscreenButton.style.top = "auto";
            }
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

        fullscreenButton.on('pointerdown', () => {
            exitIframeFullscreen(() => toggleFullscreen(fullscreenElement));
        });

        return fullscreenButton;
    }
}

function exitIframeFullscreen(callback) {
    if (document.fullscreenElement === document.getElementById('game-iframe') ||
        document.webkitFullscreenElement === document.getElementById('game-iframe')) {
        console.log("🔄 Exiting iframe fullscreen before entering game fullscreen...");
        document.exitFullscreen().then(() => {
            setTimeout(callback, 300);
        }).catch((err) => {
            console.error("❌ Error exiting iframe fullscreen:", err);
            callback(); // Proceed even if exiting fails
        });
    } else {
        callback();
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
        document.exitFullscreen();
    }
}

window.addEventListener('resize', () => {
    const isLandscape = window.innerWidth > window.innerHeight;
    const mobileFullscreenButton = document.getElementById('mobile-fullscreen-button');

    if (mobileFullscreenButton) {
        if (isLandscape) {
            mobileFullscreenButton.style.position = "absolute";
            mobileFullscreenButton.style.right = "20px";
            mobileFullscreenButton.style.top = "10px";
        } else {
            mobileFullscreenButton.style.position = "relative";
            mobileFullscreenButton.style.right = "auto";
            mobileFullscreenButton.style.top = "auto";
        }
    }
});
