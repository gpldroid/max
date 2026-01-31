// ================= CONFIGURATION =================
const CONFIG = {
    api: {
        base: "https://xapi-ie.org", // استبدل برابط الهوست الحقيقي
        user: "DyYqau1DhoT",
        pass: "Dc7ygaZvvzv2"
    }
};

// ================= STATE VARIABLES =================
let hlsInstance = null;
let plyrPlayer = null;
let currentMode = "live"; // live, movies, series
let dataCache = []; // لتخزين القنوات للبحث

// ================= INITIALIZATION =================
document.addEventListener("DOMContentLoaded", () => {
    initPlayer();
    
    // تحميل بيانات تجريبية (يجب استبدالها بـ Fetch API حقيقي)
    loadMockData(currentMode);
    
    // تفعيل زر البحث
    document.getElementById('searchInput').addEventListener('input', (e) => {
        filterContent(e.target.value);
    });
    
    // تعيين السنة في الفوتر
    document.getElementById('year').textContent = new Date().getFullYear();
});

// ================= PLAYER LOGIC (UPDATED) =================
function initPlayer() {
    const video = document.querySelector("#player");
    plyrPlayer = new Plyr(video, {
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'fullscreen'],
        settings: ['quality', 'speed']
    });
}

function playStream(id, ext = "mp4", name = "Video") {
    const video = document.querySelector("#player");
    const sourceUrl = generateUrl(id, ext);
    
    // التمرير للأعلى عند التشغيل
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // تنظيف HLS القديم
    if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
    }

    // السيناريو 1: ملفات البث (HLS)
    if (["m3u8", "ts"].includes(ext)) {
        if (Hls.isSupported()) {
            hlsInstance = new Hls();
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play();
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
            video.play();
        }
    } 
    // السيناريو 2: ملفات الفيديو المباشرة
    else {
        plyrPlayer.source = {
            type: 'video',
            title: name,
            sources: [{ src: sourceUrl, type: getMimeType(ext) }]
        };
        plyrPlayer.play();
    }
}

function generateUrl(id, ext) {
    const type = ["m3u8", "ts"].includes(ext) ? "live" : "movie";
    // ملاحظة: تأكد من هيكل الرابط الخاص بالسيرفر لديك
    return `${CONFIG.api.base}/${type}/${CONFIG.api.user}/${CONFIG.api.pass}/${id}.${ext}`;
}

function getMimeType(ext) {
    const types = { 'mp4': 'video/mp4', 'mkv': 'video/x-matroska', 'avi': 'video/x-msvideo' };
    return types[ext] || 'video/mp4';
}

// ================= UI LOGIC =================
function switchMode(mode) {
    currentMode = mode;
    
    // تحديث الأزرار النشطة
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    
    // إعادة تحميل المحتوى
    loadMockData(mode);
}

function loadMockData(mode) {
    const grid = document.getElementById('contentGrid');
    const loader = document.getElementById('loader');
    
    grid.innerHTML = '';
    loader.classList.remove('hidden');

    // محاكاة طلب API (استبدل هذا بـ fetch حقيقي)
    setTimeout(() => {
        dataCache = generateDummyData(mode); // بيانات وهمية للتجربة
        renderContent(dataCache);
        loader.classList.add('hidden');
    }, 500);
}

function renderContent(items) {
    const grid = document.getElementById('contentGrid');
    grid.innerHTML = items.map(item => `
        <div class="channel-card" onclick="playStream('${item.stream_id}', '${item.container_extension}', '${item.name}')">
            <div class="channel-img-container ${currentMode !== 'live' ? 'movie-poster' : ''}">
                <img src="${item.stream_icon}" alt="${item.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/300?text=No+Image'">
                <div class="play-icon-overlay">
                    <i class="fas fa-play text-4xl text-white"></i>
                </div>
            </div>
            <div class="p-3">
                <h3 class="font-bold text-sm truncate text-[var(--text-main)]">${item.name}</h3>
                <p class="text-xs text-[var(--text-secondary)] mt-1">ID: ${item.stream_id}</p>
            </div>
        </div>
    `).join('');
}

function filterContent(query) {
    const filtered = dataCache.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
    renderContent(filtered);
}

// دالة توليد بيانات وهمية (لأغراض العرض فقط)
function generateDummyData(mode) {
    const items = [];
    const ext = mode === 'live' ? 'm3u8' : 'mp4';
    const count = 20;
    
    for(let i=1; i<=count; i++) {
        items.push({
            stream_id: 1000 + i,
            name: `${mode === 'live' ? 'Channel' : 'Movie'} ${i} HD`,
            stream_icon: `https://picsum.photos/300/400?random=${i}`,
            container_extension: ext
        });
    }
    return items;
}

// ================= SIDEBAR & THEME =================
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
    const overlay = document.getElementById('overlay');
    overlay.classList.toggle('hidden');
}

function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    body.setAttribute('data-theme', newTheme);
    document.getElementById('themeIcon').className = newTheme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
}

function openModal(id) {
    document.getElementById(`modal-${id}`).classList.add('active');
}

function closeModal(id) {
    document.getElementById(`modal-${id}`).classList.remove('active');
}

// Language (Simple Implementation)
const translations = {
    ar: { home: "الرئيسية", live: "مباشر", movies: "أفلام", series: "مسلسلات" },
    en: { home: "Home", live: "Live TV", movies: "Movies", series: "Series" }
};

function changeLanguage(lang) {
    document.dir = lang === 'ar' ? 'rtl' : 'ltr';
    const texts = translations[lang] || translations['ar'];
    
    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if(texts[key]) el.textContent = texts[key];
    });
}
