// ⚠️ لا تضع بياناتك الحقيقية هنا في GitHub
const CONFIG = {
    api: {
        base: "http://splus.smartres.net:80",
        user: "12345",
        pass: "54321"
    }
};

let hlsInstance = null;
let plyrPlayer = null;
let currentMode = "live";

document.addEventListener("DOMContentLoaded", () => {
    plyrPlayer = new Plyr("#player", {
        muted: true,
        clickToPlay: true,
        controls: [
            "play-large", "play", "progress",
            "current-time", "mute", "volume",
            "settings", "fullscreen"
        ]
    });
});

function playStream(id, ext = "mp4") {
    const video = document.getElementById("player");

    video.muted = true;

    if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
    }

    if (currentMode === "live") {
        const realUrl = `${CONFIG.api.base}/live/${CONFIG.api.user}/${CONFIG.api.pass}/${id}.m3u8`;

        if (Hls.isSupported()) {
            hlsInstance = new Hls();
            hlsInstance.loadSource(realUrl);
            hlsInstance.attachMedia(video);

            hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch(() => {});
            });
        } else {
            video.src = realUrl;
            video.play();
        }
    } else {
        if (ext !== "mp4") {
            alert("Chrome يدعم MP4 فقط");
            return;
        }

        const realUrl = `${CONFIG.api.base}/movie/${CONFIG.api.user}/${CONFIG.api.pass}/${id}.mp4`;

        plyrPlayer.source = {
            type: "video",
            sources: [{ src: realUrl, type: "video/mp4" }]
        };

        setTimeout(() => plyrPlayer.play().catch(() => {}), 300);
    }
}
