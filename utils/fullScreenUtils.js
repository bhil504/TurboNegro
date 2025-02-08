export function addFullscreenButton(scene) {
    const fullscreenElement = document.getElementById('fullscreen');

    if (!fullscreenElement) {
        console.error("⚠️ Fullscreen element not found!");
        return;
    }

    function adjustFullscreenLayout() {
        const isLandscape = window.innerWidth > window.innerHeight;

        if (isLandscape) {
            fullscreenElement.style.flexDirection = "row"; // Side-by-side layout
            fullscreenElement.style.justifyContent = "center";
            fullscreenElement.style.alignItems = "center";
        } else {
            fullscreenElement.style.flexDirection = "column"; // Stack in portrait
        }
    }

    // Run adjustment when fullscreen is activated
    fullscreenElement.addEventListener("fullscreenchange", adjustFullscreenLayout);

    adjustFullscreenLayout(); // Apply immediately when fullscreen is toggled
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
