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
    const iframe = document.getElementById('game-iframe');
    
    if (document.fullscreenElement === iframe ||
        document.webkitFullscreenElement === iframe) {
        console.log("🔄 Exiting iframe fullscreen before entering game fullscreen...");
        document.exitFullscreen().then(() => {
            setTimeout(() => {
                iframe.style.width = `${window.innerWidth}px`;
                iframe.style.height = `${window.innerHeight}px`;
                callback();
            }, 500);
        }).catch((err) => {
            console.error("❌ Error exiting iframe fullscreen:", err);
            callback();
        });
    } else {
        callback();
    }
}

function toggleFullscreen(element) {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        }
    } else {
        document.exitFullscreen();
    }
}

function adjustScreenForLandscapeFullscreen() {
    const isLandscape = window.matchMedia("(orientation: landscape)").matches;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const fullscreenElement = document.getElementById('fullscreen');

    if (!fullscreenElement) return;

    fullscreenElement.style.position = "absolute";
    fullscreenElement.style.top = "0";
    fullscreenElement.style.left = "0";
    fullscreenElement.style.width = "100vw";
    fullscreenElement.style.height = "100vh";
    fullscreenElement.style.display = "flex";
    fullscreenElement.style.justifyContent = "center";
    fullscreenElement.style.alignItems = "center";
    fullscreenElement.style.overflow = "hidden";

    if (isMobile && isLandscape) {
        console.log("📱 Adjusting fullscreen for mobile landscape mode...");
        fullscreenElement.style.width = "100vw";
        fullscreenElement.style.height = "100vh";
        fullscreenElement.style.transform = "none";
    } else {
        console.log("🔄 Adjusting fullscreen for normal mode...");
        fullscreenElement.style.position = "relative";
        fullscreenElement.style.width = "100%";
        fullscreenElement.style.height = "auto";
        fullscreenElement.style.transform = "none";
    }

    // Ensure Phaser canvas resizes properly
    const gameCanvas = document.querySelector("canvas");
    if (gameCanvas) {
        gameCanvas.style.width = "100%";
        gameCanvas.style.height = "100%";
    }
    if (window.game && window.game.scale) {
        window.game.scale.resize(window.innerWidth, window.innerHeight);
    }
}

// Listen for fullscreen and orientation changes
document.addEventListener("fullscreenchange", adjustScreenForLandscapeFullscreen);
document.addEventListener("webkitfullscreenchange", adjustScreenForLandscapeFullscreen);
window.addEventListener("resize", adjustScreenForLandscapeFullscreen);
window.addEventListener("orientationchange", () => {
    console.log("🔄 Orientation changed. Resetting controls...");

    if (window.game && window.game.scene) {
        const currentScene = window.game.scene.getScenes(true)[0];
        if (currentScene && currentScene.player) {
            currentScene.player.setVelocityX(0);
            currentScene.player.anims.play('idle', true);
        }
    }

    // Reset joystick and tilt input
    if (window.game) {
        window.game.joystickForceX = 0;
        window.game.joystickForceY = 0;
    }

    // Ensure Phaser canvas and game scale adjust properly
    setTimeout(() => {
        adjustScreenForLandscapeFullscreen();
        if (window.game && window.game.scale) {
            window.game.scale.resize(window.innerWidth, window.innerHeight);
        }
    }, 500);
});

