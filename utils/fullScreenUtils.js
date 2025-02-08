export function addFullscreenButton(scene) {
    const fullscreenElement = document.getElementById('fullscreen');
    const gameIframe = document.getElementById('game-iframe');

    if (!fullscreenElement) {
        console.error("⚠️ Fullscreen element not found!");
        return;
    }

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobile) {
        console.log("📱 Mobile detected. Adding fullscreen button.");
        const mobileFullscreenButton = document.getElementById('mobile-fullscreen-button');
        if (mobileFullscreenButton) {
            mobileFullscreenButton.addEventListener('click', () => {
                exitIframeFullscreen(() => toggleFullscreen(fullscreenElement));
            });
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

function adjustScreenForLandscapeFullscreen() {
    const isLandscape = window.innerWidth > window.innerHeight;
    const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const fullscreenElement = document.getElementById('fullscreen');

    if (!fullscreenElement) return;

    if (isMobile && isStandalone) {
        if (isLandscape) {
            console.log("📱 Adjusting for landscape fullscreen...");
            fullscreenElement.style.position = "absolute";
            fullscreenElement.style.top = "0";
            fullscreenElement.style.left = "0";
            fullscreenElement.style.width = "100vw";
            fullscreenElement.style.height = "100vh";
            fullscreenElement.style.justifyContent = "center";
            fullscreenElement.style.alignItems = "center";
        } else {
            console.log("📱 Restoring portrait mode...");
            fullscreenElement.style.position = "relative";
            fullscreenElement.style.width = "100%";
            fullscreenElement.style.height = "100%";
            fullscreenElement.style.justifyContent = "flex-start";
            fullscreenElement.style.alignItems = "flex-start";
        }
    } else if (!isFullscreen) {
        console.log("🔄 Exiting fullscreen mode, resetting position...");
        fullscreenElement.style.position = "relative";
        fullscreenElement.style.width = "100%";
        fullscreenElement.style.height = "auto";
        fullscreenElement.style.justifyContent = "flex-start";
        fullscreenElement.style.alignItems = "flex-start";
    }
}

// Listen for fullscreen and orientation changes
document.addEventListener("fullscreenchange", adjustScreenForLandscapeFullscreen);
document.addEventListener("webkitfullscreenchange", adjustScreenForLandscapeFullscreen);
window.addEventListener("resize", adjustScreenForLandscapeFullscreen);
window.addEventListener("orientationchange", () => {
    setTimeout(adjustScreenForLandscapeFullscreen, 300);
});
