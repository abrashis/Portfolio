
(function () {

    'use strict';
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    const body = document.body;
    const NAV_TOGGLE = $('#navbar-theme-toggle');
    const FM_THEME_BTN = $('#fm-theme');
    const THEME_KEY = 'site-theme';

    function applyTheme(theme) {
        if (theme === 'light') body.classList.add('light-theme');
        else body.classList.remove('light-theme');
        try { localStorage.setItem(THEME_KEY, theme); } catch (e) { }
        // update small UI indicators if present
        if (NAV_TOGGLE) NAV_TOGGLE.textContent = theme === 'light' ? '🌙' : '☀️';
        if (FM_THEME_BTN) FM_THEME_BTN.textContent = '🎨';
    }

    function toggleTheme() { applyTheme(body.classList.contains('light-theme') ? 'dark' : 'light'); }

    // init theme
    (function initTheme() {
        const stored = (() => { try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; } })();
        applyTheme(stored || 'dark');
        if (NAV_TOGGLE) NAV_TOGGLE.addEventListener('click', toggleTheme);
        if (FM_THEME_BTN) FM_THEME_BTN.addEventListener('click', () => { toggleTheme(); burst(FM_THEME_BTN); });
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

    const audioEl = $('#bg-audio');
    const FM_AUDIO_BTN = $('#fm-audio');
    let synthFallback = null;

    function createSynthFallback() {
        if (synthFallback) return synthFallback;
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine'; osc.frequency.value = 220;
            gain.gain.value = 0.0;
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            synthFallback = { ctx, osc, gain, playing: false };
        } catch (e) { synthFallback = null; }
        return synthFallback;
    }

    function setAudioBtnPlaying(on) {
        if (!FM_AUDIO_BTN) return;
        FM_AUDIO_BTN.classList.toggle('playing', !!on);
        FM_AUDIO_BTN.title = on ? 'Pause audio' : 'Play audio';
    }

    function toggleSynth() {
        const s = createSynthFallback();
        if (!s) return;
        if (!s.playing) {
            s.ctx.resume().then(() => { s.gain.gain.setTargetAtTime(0.12, s.ctx.currentTime, 0.02); s.playing = true; setAudioBtnPlaying(true); });
        } else { s.gain.gain.setTargetAtTime(0.0, s.ctx.currentTime, 0.02); s.playing = false; setAudioBtnPlaying(false); }
    }

    if (FM_AUDIO_BTN) FM_AUDIO_BTN.disabled = true;

    if (audioEl) {
        
        FM_AUDIO_BTN && (FM_AUDIO_BTN.disabled = false);
        FM_AUDIO_BTN && FM_AUDIO_BTN.addEventListener('click', () => {
            if (audioEl.paused) {
                const p = audioEl.play();
                if (p && p.catch) p.catch(() => { createSynthFallback(); toggleSynth(); });
                else setAudioBtnPlaying(true);
            } else { audioEl.pause(); setAudioBtnPlaying(false); }
        });
        audioEl.addEventListener('play', () => setAudioBtnPlaying(true));
        audioEl.addEventListener('pause', () => setAudioBtnPlaying(false));
        audioEl.addEventListener('error', () => { createSynthFallback(); FM_AUDIO_BTN.disabled = false; });
    } else {
  
        createSynthFallback();
        if (FM_AUDIO_BTN) { FM_AUDIO_BTN.disabled = false; FM_AUDIO_BTN.addEventListener('click', toggleSynth); }
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
        // click toggles play/pause
        v.addEventListener('click', () => { if (v.paused) v.play().catch(() => { }); else v.pause(); });
        // observe parent for autoplaying muted loops
        if (v.muted && v.loop) observer.observe(v.parentElement || v);
        v.addEventListener('error', () => { if (v.src !== fallback) { v.src = fallback; try { v.load(); } catch (e) { } } });
    });

    const FM_TOP = $('#fm-top'); if (FM_TOP) FM_TOP.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

})();

