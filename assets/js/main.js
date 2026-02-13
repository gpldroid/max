    // CONFIGURATION (السيرفر الجديد)
        const CONFIG = {
            api: { base: "https://x-api.cc", user: "aPasDGnXhAfw", pass: "xs8D7JSFkJ" }
        };

        const translations = {
            ar: { home: "الرئيسية", about: "من نحن", contact: "اتصل بنا", privacy: "سياسة الخصوصية", download_app: "تحميل التطبيق", live: "مباشر", movies: "أفلام", series: "مسلسلات", all: "الكل", search: "ابحث هنا..." },
            en: { home: "Home", about: "About Us", contact: "Contact", privacy: "Privacy", download_app: "Download App", live: "Live TV", movies: "Movies", series: "Series", all: "All", search: "Search here..." },
            fr: { home: "Accueil", about: "À propos", contact: "Contact", privacy: "Privée", download_app: "Télécharger", live: "Direct", movies: "Films", series: "Séries", all: "Tout", search: "Chercher..." },
            es: { home: "Inicio", about: "Nosotros", contact: "Contacto", privacy: "Privacidad", download_app: "Descargar", live: "En vivo", movies: "Películas", series: "Series", all: "Todo", search: "Buscar..." }
        };

        let currentLang = 'ar';
        let currentMode = 'live';
        let allData = [];
        let displayedCount = 0;
        let hlsInstance = null;
        let plyrPlayer = null;

        // UI Helpers
        function toggleSidebar() {
            document.getElementById('sidebar').classList.toggle('open');
            document.getElementById('overlay').classList.toggle('hidden');
        }

        function openModal(id) {
            document.getElementById('modal-' + id).style.display = 'flex';
            toggleSidebar();
        }

        function closeModal(id) {
            document.getElementById('modal-' + id).style.display = 'none';
        }

        function toggleTheme() {
            document.body.classList.toggle('light-mode');
            const icon = document.getElementById('themeIcon');
            icon.className = document.body.classList.contains('light-mode') ? 'fas fa-sun' : 'fas fa-moon';
        }

        // Language Engine
        function changeLanguage(lang) {
            currentLang = lang;
            document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
            document.querySelectorAll('[data-translate]').forEach(el => {
                el.textContent = translations[lang][el.dataset.translate];
            });
            document.getElementById('searchInput').placeholder = translations[lang].search;
            fetchCategories();
        }

        // Scroll Logic
        window.onscroll = () => {
            const btn = document.getElementById('backToTop');
            btn.classList.toggle('show', window.scrollY > 400);
        };

        // API Fetching
        async function fetchAPI(action, params = {}) {
            const url = new URL(`${CONFIG.api.base}/player_api.php`);
            url.searchParams.append('username', CONFIG.api.user);
            url.searchParams.append('password', CONFIG.api.pass);
            url.searchParams.append('action', action);
            Object.keys(params).forEach(k => url.searchParams.append(k, params[k]));
            
            try {
                const res = await fetch(url);
                return await res.json();
            } catch (e) {
                console.error("Fetch Error:", e);
                return [];
            }
        }

        async function fetchCategories() {
            const action = currentMode === 'live' ? 'get_live_categories' : (currentMode === 'movies' ? 'get_vod_categories' : 'get_series_categories');
            const cats = await fetchAPI(action);
            const container = document.getElementById('categoriesContainer');
            container.innerHTML = `<button onclick="loadCategory('all', this)" class="cat-btn whitespace-nowrap px-5 py-1 rounded-full bg-[var(--accent-color)] text-white text-sm font-bold">${translations[currentLang].all}</button>`;
            cats.forEach(c => {
                container.innerHTML += `<button onclick="loadCategory('${c.category_id}', this)" class="cat-btn whitespace-nowrap px-5 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-color)] text-sm">${c.category_name}</button>`;
            });
            loadCategory('all');
        }

        async function loadCategory(id, btn) {
            if(btn) {
                document.querySelectorAll('.cat-btn').forEach(b => {
                    b.classList.remove('bg-[var(--accent-color)]', 'text-white', 'font-bold');
                    b.classList.add('bg-[var(--bg-card)]');
                });
                btn.classList.add('bg-[var(--accent-color)]', 'text-white', 'font-bold');
            }

            const grid = document.getElementById('contentGrid');
            const loader = document.getElementById('loader');
            grid.innerHTML = '';
            loader.classList.remove('hidden');
            
            const action = currentMode === 'live' ? 'get_live_streams' : (currentMode === 'movies' ? 'get_vod_streams' : 'get_series');
            allData = await fetchAPI(action, id !== 'all' ? { category_id: id } : {});
            
            displayedCount = 0;
            loader.classList.add('hidden');
            loadMore();
        }

        function loadMore() {
            const grid = document.getElementById('contentGrid');
            const nextBatch = allData.slice(displayedCount, displayedCount + 30);
            nextBatch.forEach(item => {
                const card = document.createElement('div');
                card.className = 'media-card';
                card.innerHTML = `<img src="${item.stream_icon || item.cover || 'https://via.placeholder.com/150'}" class="media-logo" onerror="this.src='https://via.placeholder.com/150'"><div class="text-xs font-bold truncate mt-2 text-center">${item.name || item.title}</div>`;
                card.onclick = () => playStream(item.stream_id || item.vod_id || item.series_id, item.container_extension);
                grid.appendChild(card);
            });
            displayedCount += nextBatch.length;
            document.getElementById('loadMoreBtn').style.display = displayedCount < allData.length ? 'block' : 'none';
        }

        function playStream(id, ext) {
            const video = document.getElementById('player');
            // تأكيد المسار المباشر للسيرفر
            let directUrl = currentMode === 'live' 
    ? `${CONFIG.api.base}/live/${CONFIG.api.user}/${CONFIG.api.pass}/${id}.m3u8`
    : `${CONFIG.api.base}/movie/${CONFIG.api.user}/${CONFIG.api.pass}/${id}.${ext || 'mp4'}`;

// تمرير عبر البروكسي
let streamUrl = `proxy.php?url=${encodeURIComponent(directUrl)}`;

            
            if(hlsInstance) hlsInstance.destroy();

            if(Hls.isSupported() && streamUrl.includes('.m3u8')) {
                hlsInstance = new Hls();
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => video.play());
            } else {
                video.src = streamUrl;
                video.play();
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function switchMode(mode) {
            currentMode = mode;
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
            fetchCategories();
        }

        // Search Engine
        document.getElementById('searchInput').addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allData.filter(i => (i.name || i.title || "").toLowerCase().includes(term)).slice(0, 30);
            const grid = document.getElementById('contentGrid');
            grid.innerHTML = '';
            filtered.forEach(item => {
                const card = document.createElement('div');
                card.className = 'media-card';
                card.innerHTML = `<img src="${item.stream_icon || item.cover}" class="media-logo"><div class="text-xs font-bold truncate text-center mt-2">${item.name || item.title}</div>`;
                card.onclick = () => playStream(item.stream_id || item.vod_id);
                grid.appendChild(card);
            });
        });

        document.addEventListener('DOMContentLoaded', () => {
            plyrPlayer = new Plyr('#player');
            document.getElementById('year').textContent = new Date().getFullYear();
            changeLanguage('ar');
        });
