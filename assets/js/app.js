const CONFIG = {
    api: {
        base: "https://xapi-ie.org",
        user: "DyYqau1DhoT",
        pass: "Dc7ygaZvvzv2"
    },
    proxy: "proxy.php?url=" // مسار ملف البروكسي
};

// 1. دالة جلب قائمة القنوات (تجاوز حظر CORS)
async function fetchCategories() {
    const targetUrl = `${CONFIG.api.base}/player_api.php?username=${CONFIG.api.user}&password=${CONFIG.api.pass}&action=get_live_categories`;
    
    try {
        const response = await fetch(CONFIG.proxy + encodeURIComponent(targetUrl));
        const data = await response.json();
        renderCategories(data);
    } catch (error) {
        console.error("خطأ في جلب التصنيفات:", error);
    }
}

// 2. دالة تشغيل القنوات والافلام (فك تشفير TS و تجاوز قيود المتصفح)
function playStream(id, ext = "ts") {
    const video = document.querySelector("#player");
    let rawUrl = "";

    // بناء الرابط بناءً على النوع
    if (ext === "ts" || ext === "m3u8") {
        rawUrl = `${CONFIG.api.base}/live/${CONFIG.api.user}/${CONFIG.api.pass}/${id}.${ext}`;
    } else {
        rawUrl = `${CONFIG.api.base}/movie/${CONFIG.api.user}/${CONFIG.api.pass}/${id}.${ext}`;
    }

    // تمرير الرابط عبر البروكسي إذا كان السيرفر لا يدعم HTTPS أو CORS
    const proxiedUrl = CONFIG.proxy + encodeURIComponent(rawUrl);

    if (hlsInstance) {
        hlsInstance.destroy();
    }

    // استخدام HLS.js لفك تشفير ملفات .ts و .m3u8
    if (ext === "ts" || ext === "m3u8" || Hls.isSupported()) {
        hlsInstance = new Hls({
            debug: false,
            // مهم جداً لملفات TS: السماح بتحويل القطع (Fragments)
            enableWorker: true,
            lowLatencyMode: true
        });

        hlsInstance.loadSource(proxiedUrl);
        hlsInstance.attachMedia(video);
        
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(e => console.log("التشغيل التلقائي محظور، اضغط Play"));
        });

        // معالجة الأخطاء وإعادة المحاولة تلقائياً
        hlsInstance.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
                hlsInstance.recoverMediaError();
            }
        });
    } 
    // دعم Safari (iPhone/Mac) الذي يشغل HLS أصلياً
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = proxiedUrl;
        video.play();
    }
}
