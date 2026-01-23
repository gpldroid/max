        :root {
            --bg-body: #050505; --bg-card: #121212; --bg-sidebar: rgba(18, 18, 18, 0.98);
            --text-main: #ffffff; --text-secondary: #a1a1aa; --accent-color: #d4af37;
            --border-color: rgba(212, 175, 55, 0.15); --gradient-accent: linear-gradient(135deg, #d4af37 0%, #bf953f 100%);
        }
        .light-mode {
            --bg-body: #F0F2F5; --bg-card: #FFFFFF; --bg-sidebar: #FFFFFF;
            --text-main: #050505; --text-secondary: #65676B; --accent-color: #1877F2; --border-color: #dddfe2;
        }
        body { background-color: var(--bg-body); color: var(--text-main); font-family: 'Cairo', sans-serif; transition: 0.3s; overflow-x: hidden; }
        
        /* Sidebar */
        .sidebar { position: fixed; top: 0; right: -300px; width: 280px; height: 100%; background: var(--bg-sidebar); backdrop-filter: blur(15px); z-index: 1000; transition: 0.4s; padding: 20px; box-shadow: -5px 0 20px rgba(0,0,0,0.5); }
        .sidebar.open { right: 0; }
        html[dir="ltr"] .sidebar { right: auto; left: -300px; }
        html[dir="ltr"] .sidebar.open { left: 0; }
        .sidebar-link { display: flex; align-items: center; gap: 15px; padding: 12px; border-radius: 12px; cursor: pointer; transition: 0.3s; color: var(--text-main); }
        .sidebar-link:hover { background: rgba(212, 175, 55, 0.1); color: var(--accent-color); }

        /* Floating buttons */
        .whatsapp-btn { position: fixed; bottom: 30px; left: 30px; width: 60px; height: 60px; background: #25d366; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); z-index: 999; }
        .back-to-top { position: fixed; bottom: 105px; left: 35px; width: 50px; height: 50px; background: var(--accent-color); color: white; border-radius: 50%; display: none; align-items: center; justify-content: center; font-size: 20px; cursor: pointer; z-index: 998; transition: 0.3s; }
        .back-to-top.show { display: flex; }

        .media-card { background: var(--bg-card); border-radius: 12px; padding: 10px; border: 1px solid var(--border-color); transition: 0.3s; cursor: pointer; }
        .media-card:hover { border-color: var(--accent-color); transform: translateY(-5px); }
        .mode-btn.active { background: var(--gradient-accent); color: white; }
        
        .modal { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: none; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
        .modal-content { background: var(--bg-card); padding: 30px; border-radius: 20px; max-width: 500px; width: 100%; border: 1px solid var(--accent-color); text-align: center; }
