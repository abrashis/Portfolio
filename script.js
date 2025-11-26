
(function () {

    'use strict';
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    const body = document.body;
    const NAV_TOGGLE = $('#navbar-theme-toggle');
    const FM_THEME_BTN = $('#fm-theme');
    const FM_AUDIO_BTN = $('#fm-audio');
    const THEME_KEY = 'site-theme';

    const MOON_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor"/></svg>';
    const SUN_SVG = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M12 4V2M12 22v-2M4.93 4.93L3.51 3.51M20.49 20.49l-1.42-1.42M4 12H2M22 12h-2M4.93 19.07l-1.42 1.42M20.49 3.51l-1.42 1.42M12 8a4 4 0 100 8 4 4 0 000-8z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    function applyTheme(theme) {
        if (theme === 'light') body.classList.add('light-theme');
        else body.classList.remove('light-theme');
        try { localStorage.setItem(THEME_KEY, theme); } catch (e) { }

        if (NAV_TOGGLE) {
            const iconEl = NAV_TOGGLE.querySelector('.theme-icon');
            if (iconEl) iconEl.innerHTML = theme === 'light' ? SUN_SVG : MOON_SVG;
            else NAV_TOGGLE.innerHTML = theme === 'light' ? SUN_SVG : MOON_SVG;
        }
        if (FM_THEME_BTN) FM_THEME_BTN.textContent = '👌';
    }

    function toggleTheme() { applyTheme(body.classList.contains('light-theme') ? 'dark' : 'light'); }

    let techRunning = false;
    let techTimer = null;
    let techContainer = null;

    function createTechOverlay() {
        if (techContainer) return techContainer;
        const container = document.createElement('div');
        container.className = 'tech-overlay';
        container.style.position = 'fixed';
        container.style.left = '0';
        container.style.top = '0';
        container.style.width = '100vw';
        container.style.height = '100vh';
        container.style.pointerEvents = 'none';
        container.style.zIndex = '9998';
        document.body.appendChild(container);
        techContainer = container;
        return container;
    }

    function populateTechOverlay() {
        const container = createTechOverlay();
        container.innerHTML = '';
        const ww = window.innerWidth;
        const hh = window.innerHeight;
        const cols = Math.ceil(ww / 28);
        const rows = Math.ceil(hh / 28);
        const total = cols * rows;
        for (let i = 0; i < total; i++) {
            const span = document.createElement('span');
            span.textContent = Math.random() > 0.5 ? '1' : '0';
            span.style.position = 'absolute';
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = (col + 0.5) / cols * 100;
            const y = (row + 0.5) / rows * 100;
            const jitterX = (Math.random() - 0.5) * (100 / cols * 0.4);
            const jitterY = (Math.random() - 0.5) * (100 / rows * 0.4);
            span.style.left = `${x + jitterX}%`;
            span.style.top = `${y + jitterY}%`;
            span.style.transform = 'translate(-50%, -50%)';
            span.style.color = 'rgba(126,243,208,0.95)';
            span.style.fontFamily = 'monospace, system-ui';
            span.style.fontSize = `${12 + Math.floor(Math.random() * 10)}px`;
            span.style.opacity = '0';
            span.style.transition = `opacity ${0.6 + Math.random() * 0.8}s ease, transform ${0.8 + Math.random() * 0.8}s ease`;
            container.appendChild(span);
            setTimeout(() => { span.style.opacity = '1'; }, Math.random() * 600);
        }
    }

    function mutateTechOverlay() {
        if (!techContainer) return;
        const children = Array.from(techContainer.children);
        children.forEach((span, idx) => {
            if (Math.random() < 0.08) span.textContent = Math.random() > 0.5 ? '1' : '0';
            if (Math.random() < 0.06) {
                span.style.transform = `translate(-50%, -50%) translate(${(Math.random() - 0.5) * 24}px, ${(Math.random() - 0.5) * 24}px) scale(${0.9 + Math.random() * 0.3})`;
            } else {
                span.style.transform = 'translate(-50%, -50%) scale(1)';
            }
            if (Math.random() < 0.02) span.style.opacity = String(0.2 + Math.random() * 0.9);
            else span.style.opacity = '1';
        });
    }

    function startTechFill() {
        if (techRunning) return;
        techRunning = true;
        populateTechOverlay();
        techTimer = setInterval(mutateTechOverlay, 220);
        window.addEventListener('resize', populateTechOverlay);
        if (FM_THEME_BTN) FM_THEME_BTN.textContent = '⏸️';
    }

    function stopTechFill() {
        if (!techRunning) return;
        techRunning = false;
        if (techTimer) { clearInterval(techTimer); techTimer = null; }
        if (techContainer) { techContainer.remove(); techContainer = null; }
        window.removeEventListener('resize', populateTechOverlay);
        if (FM_THEME_BTN) FM_THEME_BTN.textContent = '👌';
    }

    function toggleTechFill() { if (techRunning) stopTechFill(); else startTechFill(); }

    (function initTheme() {
        const stored = (() => { try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; } })();
        applyTheme(stored || 'dark');
        if (NAV_TOGGLE) NAV_TOGGLE.addEventListener('click', () => { toggleTheme(); });
        if (FM_THEME_BTN) FM_THEME_BTN.addEventListener('click', () => { toggleTechFill(); });
    })();

    function burst(btn) {
        if (!btn) return;
        const colors = ['#CFA8FF', '#FFD68A', '#9EE7E6', '#FFB6E6'];
        const count = 6;
        for (let i = 0; i < count; i++) {
            const el = document.createElement('span');
            el.className = 'burst-item';
            el.style.background = colors[i % colors.length];
            const angle = (i / count) * Math.PI * 2;
            const dist = 28 + Math.random() * 18;
            el.style.left = '50%'; el.style.top = '50%';
            el.style.transform = `translate(-50%,-50%) translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`;
            btn.appendChild(el);
            setTimeout(() => el.remove(), 700);
        }
    }

    const BG_AUDIO = $('#bg-audio');

    function updateAudioButton() {
        if (!FM_AUDIO_BTN) return;
        try {
            if (!BG_AUDIO || BG_AUDIO.paused) {
                FM_AUDIO_BTN.textContent = '▶️';
                FM_AUDIO_BTN.title = 'Play audio';
            } else {
                FM_AUDIO_BTN.textContent = '⏸️';
                FM_AUDIO_BTN.title = 'Pause audio';
            }
        } catch (e) { }
    }

    function toggleAudio() {
        if (!BG_AUDIO) return;
        if (BG_AUDIO.paused) {
            BG_AUDIO.play().catch(() => { });
        } else {
            BG_AUDIO.pause();
        }
        updateAudioButton();
    }

    if (FM_AUDIO_BTN) {
        FM_AUDIO_BTN.addEventListener('click', toggleAudio);
    }
    if (BG_AUDIO) {
        BG_AUDIO.addEventListener('play', updateAudioButton);
        BG_AUDIO.addEventListener('pause', updateAudioButton);
        BG_AUDIO.addEventListener('ended', updateAudioButton);
        updateAudioButton();
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) e.target.classList.add('visible');
        });
    }, { threshold: 0.18, rootMargin: '0px 0px -80px 0px' });
    $$('.fade-in').forEach(el => observer.observe(el));

    $$('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (ev) => {
            const href = a.getAttribute('href'); if (!href || href === '#') return;
            const target = document.querySelector(href); if (!target) return;
            ev.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    (function initContact() {
        const form = $('#contactForm'); if (!form) return;
        form.addEventListener('submit', (ev) => {
            ev.preventDefault();
            const to = 'abrashis777@gmail.com';
            const name = ($('#name')?.value || '').trim();
            const email = ($('#email')?.value || '').trim();
            const message = ($('#message')?.value || '').trim();
            const subject = name ? `Portfolio message from ${name}` : 'Portfolio message';
            const body = encodeURIComponent(`${message}\n\nSender: ${email}`);
            const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${body}`;
            window.open(url, '_blank');
            const btn = form.querySelector('button[type="submit"]');
            if (btn) { btn.textContent = 'Opening Gmail...'; btn.disabled = true; setTimeout(() => { btn.textContent = 'Send Message'; btn.disabled = false; }, 2500); }
        });
    })();

    function initMiniCanvas(canvas) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let DPR = Math.max(1, window.devicePixelRatio || 1);
        function resize() {
            const w = canvas.clientWidth || 200; const h = canvas.clientHeight || 120;
            canvas.width = Math.floor(w * DPR); canvas.height = Math.floor(h * DPR);
            canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
            ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.scale(DPR, DPR);
        }
        let t = Math.random() * 1000;
        function draw() {
            const w = canvas.clientWidth, h = canvas.clientHeight;
            ctx.clearRect(0, 0, w, h);
            const g = ctx.createLinearGradient(0, 0, w, h);
            g.addColorStop(0, 'rgba(168,110,255,0.04)'); g.addColorStop(1, 'rgba(255,255,255,0.02)');
            ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
            for (let i = 0; i < 5; i++) {
                const angle = (t / 40) + i * 1.2;
                const x = w / 2 + Math.cos(angle + i) * (w / 3 - i * 6);
                const y = h / 2 + Math.sin(angle + i * 0.9) * (h / 4 - i * 4);
                ctx.beginPath(); ctx.fillStyle = `rgba(255,255,255,${0.06 + i * 0.03})`; ctx.arc(x, y, 8 - i, 0, Math.PI * 2); ctx.fill();
            }
            t += 1; requestAnimationFrame(draw);
        }
        window.addEventListener('resize', () => { DPR = Math.max(1, window.devicePixelRatio || 1); resize(); });
        resize(); draw();
    }
    $$('.mini-canvas').forEach(c => {
        if (c.classList.contains('me-canvas')) return;
        initMiniCanvas(c);
    });

    function initMeCanvas(canvas) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const input = $('#me-text-input');
        let DPR = Math.max(1, window.devicePixelRatio || 1);
        function resize() {
            const w = canvas.clientWidth || 420; const h = canvas.clientHeight || 180;
            canvas.width = Math.floor(w * DPR); canvas.height = Math.floor(h * DPR);
            canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
            ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.scale(DPR, DPR);
        }
        function renderText() {
            const w = canvas.clientWidth, h = canvas.clientHeight;
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = 'rgba(255,255,255,0.02)'; ctx.fillRect(0, 0, w, h);
            const txt = (input?.value || 'Hello — I\'m Ashis.').trim() || 'Hello — I\'m Ashis.';
            ctx.fillStyle = '#eae6ff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            const fontSize = Math.max(14, Math.min(36, Math.floor(w / Math.max(10, txt.length))));
            ctx.font = `bold ${fontSize}px system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue'`;
            ctx.fillText(txt, w / 2, h / 2);
        }
        window.addEventListener('resize', () => { DPR = Math.max(1, window.devicePixelRatio || 1); resize(); renderText(); });
        if (input) input.addEventListener('input', renderText);
        resize(); renderText();
    }
    $$('.me-canvas').forEach(c => initMeCanvas(c));

    $$('.hover-swap[data-video-src]').forEach(wrapper => {
        const src = wrapper.getAttribute('data-video-src'); if (!src) return;
        const img = wrapper.querySelector('img'); let vid = null;
        function makeVideo() {
            vid = document.createElement('video'); vid.src = src; vid.muted = true; vid.loop = true; vid.playsInline = true; vid.preload = 'auto';
            vid.style.width = '100%'; vid.style.height = '100%'; vid.style.objectFit = 'cover'; vid.style.position = 'absolute'; vid.style.left = '0'; vid.style.top = '0'; vid.style.opacity = '0'; vid.style.transition = 'opacity .36s ease';
            wrapper.appendChild(vid);
        }
        wrapper.addEventListener('mouseenter', async () => { if (!vid) makeVideo(); try { await vid.play(); } catch (e) { } wrapper.classList.add('playing'); vid.style.opacity = '1'; if (img) img.style.opacity = '0'; });
        wrapper.addEventListener('mouseleave', () => { if (!vid) return; vid.pause(); vid.style.opacity = '0'; if (img) img.style.opacity = '1'; wrapper.classList.remove('playing'); });
    });

    const VIDEO_FALLBACK = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
    async function chooseVideoSource(localUrl, fallbackUrl = VIDEO_FALLBACK) {
        if (!localUrl) return fallbackUrl;
        try {
            const h = await fetch(localUrl, { method: 'HEAD' }); if (h && h.ok) return localUrl;
        } catch (e) { /* ignore */ }
        try {
            const r = await fetch(localUrl, { method: 'GET', headers: { Range: 'bytes=0-0' } });
            if (r && (r.status === 206 || r.status === 200)) return localUrl;
        } catch (e) { /* ignore */ }
        return fallbackUrl;
    }

    $$('video[data-local-src]').forEach(async (v) => {
        const local = v.getAttribute('data-local-src'); const fallback = v.getAttribute('data-fallback-src') || VIDEO_FALLBACK;
        const chosen = await chooseVideoSource(local, fallback); try { v.src = chosen; v.load(); } catch (e) { }

        v.addEventListener('click', () => { if (v.paused) v.play().catch(() => { }); else v.pause(); });
        if (v.muted && v.loop) observer.observe(v.parentElement || v);
        v.addEventListener('error', () => { if (v.src !== fallback) { v.src = fallback; try { v.load(); } catch (e) { } } });
    });


    (function ensureReelPreview() {
        const meVideo = document.getElementById('me-video');
        if (!meVideo) return;
        try {
            meVideo.preload = 'metadata';
            const attr = meVideo.getAttribute('data-start-preview');
            const start = Math.max(0.05, parseFloat(attr) || 0.1);

            function safeSeek() {
                try {
                    meVideo.currentTime = start;
                } catch (err) {
                }
            }

            meVideo.addEventListener('loadedmetadata', function onMeta() {
                safeSeek();
            }, { once: true });

            meVideo.addEventListener('loadeddata', function onData() {
                safeSeek();
            }, { once: true });

            meVideo.addEventListener('seeked', function onSeek() {
                try { meVideo.removeAttribute('poster'); } catch (e) { }
                try { if (!meVideo.paused) meVideo.pause(); } catch (e) { }
            });

            setTimeout(safeSeek, 120);
        } catch (e) { }
    })();

    const FM_TOP = $('#fm-top'); if (FM_TOP) FM_TOP.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    function initMarquees() {
        $$('.work-marquee').forEach(wrapper => {
            const tracks = $$('.marquee-track', wrapper);
            if (tracks.length === 1) {
                const clone = tracks[0].cloneNode(true);
                clone.setAttribute('aria-hidden', 'true');
                wrapper.appendChild(clone);
            }
        });
    }


    initMarquees();

})();

