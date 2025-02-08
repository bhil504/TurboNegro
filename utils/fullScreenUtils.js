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
                exitIframeFullscreen(() => {
                    toggleFullscreen(fullscreenElement);
                    setTimeout(adjustScreenForLandscapeFullscreen, 500);
                });
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
            exitIframeFullscreen(() => {
                toggleFullscreen(fullscreenElement);
                setTimeout(adjustScreenForLandscapeFullscreen, 500);
            });
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
    const fullscreenElement = document.getElementById('fullscreen');
    const gameCanvas = document.querySelector("canvas");

    if (!fullscreenElement || !gameCanvas) return;

    if (isLandscape) {
        console.log("📱 Adjusting game size for landscape...");
        
        // Increase game screen size slightly in landscape mode
        gameCanvas.style.width = "95vw";  // Slightly wider
        gameCanvas.style.height = "90vh"; // Slightly taller

        fullscreenElement.style.position = "fixed";
        fullscreenElement.style.top = "0";
        fullscreenElement.style.left = "50%";
        fullscreenElement.style.transform = "translateX(-50%)";
        fullscreenElement.style.width = "100vw";
        fullscreenElement.style.height = "100vh";
        fullscreenElement.style.display = "flex";
        fullscreenElement.style.justifyContent = "center";
        fullscreenElement.style.alignItems = "center";
        fullscreenElement.style.overflow = "hidden";
        
    } else {
        console.log("📱 Adjusting game size for portrait...");
        
        // Reset to normal size in portrait mode
        gameCanvas.style.width = "100vw";
        gameCanvas.style.height = "100vh";

        fullscreenElement.style.position = "relative";
        fullscreenElement.style.width = "100%";
        fullscreenElement.style.height = "auto";
        fullscreenElement.style.display = "flex";
        fullscreenElement.style.justifyContent = "center";
        fullscreenElement.style.alignItems = "center";
        fullscreenElement.style.overflow = "hidden";
    }
}

// 🖥️ Listen for fullscreen, resize, and orientation changes
document.addEventListener("fullscreenchange", adjustScreenForLandscapeFullscreen);
document.addEventListener("webkitfullscreenchange", adjustScreenForLandscapeFullscreen);
window.addEventListener("resize", adjustScreenForLandscapeFullscreen);
window.addEventListener("orientationchange", () => {
    setTimeout(adjustScreenForLandscapeFullscreen, 300);
});

// 🔄 Run the function initially on load
window.onload = adjustScreenForLandscapeFullscreen;

