const CONFIG = {
    api: {
        base: "https://xapi-ie.org",
        user: "DyYqau1DhoT",
        pass: "Dc7ygaZvvzv2"
    }
};

let hlsInstance = null;
let plyrPlayer = null;

document.addEventListener("DOMContentLoaded", () => {
    // تهيئة Plyr أول مرة
    const video = document.querySelector("#player");
    plyrPlayer = new Plyr(video, {
        captions: { active: true, update: true, language: 'en' },
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'fullscreen']
    });
});

function playStream(id, ext = "mp4") {
    const video = document.querySelector("#player");
    const sourceUrl = generateUrl(id, ext);
    
    // تنظيف المشغل القديم
    if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
    }

    // 1. التعامل مع صيغ البث (m3u8, ts, m3u, m3u_plus, mkv)
    if (["m3u8", "ts", "m3u", "m3u_plus", "mkv"].includes(ext.toLowerCase())) {
        if (Hls.isSupported()) {
            hlsInstance = new Hls();
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
            
            // ربط HLS بـ Plyr للتحكم في الجودة من واجهة Plyr
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                const levels = hlsInstance.levels.map(l => l.height);
                // تحديث خيارات الجودة في Plyr (اختياري)
                plyrPlayer.play();
            });
        } 
        else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
        }
    } 
    // 2. التعامل مع ملفات الفيديو المباشرة (mp4, mkv, flv, avi)
    else {
        // ملاحظة: mkv/avi قد لا تعمل في كل المتصفحات إلا إذا قام السيرفر بعمل تحويل مباشر (Transcoding)
        plyrPlayer.source = {
            type: 'video',
            sources: [{
                src: sourceUrl,
                type: getMimeType(ext)
            }]
        };
        plyrPlayer.play();
    }
}

// دالة توليد الرابط بناءً على النوع
function generateUrl(id, ext) {
    const type = ["m3u8", "ts", "m3u", "m3u_plus"].includes(ext) ? "live" : "movie";
    return `${CONFIG.api.base}/${type}/${CONFIG.api.user}/${CONFIG.api.pass}/${id}.${ext}`;
}

// دالة تحديد نوع الملف للمتصفح
function getMimeType(ext) {
    const types = {
        'mp4': 'video/mp4',
        'mkv': 'video/x-matroska',
        'avi': 'video/x-msvideo',
        'flv': 'video/x-flv'
    };
    return types[ext.toLowerCase()] || 'video/mp4';
}
