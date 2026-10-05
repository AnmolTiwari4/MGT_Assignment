/* ====== HERO PARTICLE CANVAS ====== */
(function () {
    const canvas = document.getElementById('heroParticles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];
    const PARTICLE_COUNT = 45;

    function resize() { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight }
    function createParticle() { return { x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.8 + .4, dx: (Math.random() - .5) * .15, dy: -(Math.random() * .2 + .05), opacity: Math.random() * .5 + .1, pulse: Math.random() * Math.PI * 2 } }
    function init() { resize(); particles = []; for (let i = 0; i < PARTICLE_COUNT; i++)particles.push(createParticle()) }

    function draw() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => {
            p.x += p.dx; p.y += p.dy; p.pulse += .015;
            if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w }
            if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
            const glow = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(213,255,63,${glow})`;
            ctx.shadowColor = 'rgba(213,255,63,0.4)';
            ctx.shadowBlur = p.r * 6;
            ctx.fill();
            ctx.shadowBlur = 0;
        });
        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    init(); draw();
})();

/* ====== CORE UTILITIES ====== */
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* Nav scroll */
const nav = $('.nav'); addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 35), { passive: true });

/* Mobile menu */
const menu = $('.menu-btn'), navLinks = $('.nav-links'); menu.addEventListener('click', () => { const open = navLinks.classList.toggle('open'); menu.setAttribute('aria-expanded', open); menu.textContent = open ? '×' : '☰' }); $$('.nav-links a').forEach(a => a.addEventListener('click', () => { navLinks.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.textContent = '☰' }));  /* Reveal on scroll */ const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) } }), { threshold: .12 }); $$('.reveal').forEach(el => io.observe(el));

/* Search tabs */
let mode = 'Buy'; $$('.search-tabs button').forEach(b => b.addEventListener('click', () => { $$('.search-tabs button').forEach(x => x.classList.remove('active')); b.classList.add('active'); mode = b.dataset.mode; $('#prompt').placeholder = mode === 'Rent' ? 'Try: Find a quiet 2BHK for rent near my office, under ₹35,000, with a balcony and pet-friendly society.' : 'Try: Find me a modern 3BHK under ₹1 crore in Bhopal, within 30 minutes of my office, with two parking spaces and a quiet neighbourhood.' }));  /* Example prompts */ $$('.examples button').forEach(b => b.addEventListener('click', () => { const extras = { 'Modern 3BHK under ₹1Cr': 'Find me a modern 3BHK under ₹1 crore in Bhopal, with two parking spaces.', 'Quiet, near schools': 'Find a quiet neighbourhood close to good schools in Bhopal, with a garden and security.', 'Under 30 min commute': 'Find a home in Bhopal within 30 minutes of my office, with good connectivity.' }; $('#prompt').value = extras[b.textContent]; $('#prompt').focus() }));

/* Search parser */
const parseSearch = () => { const text = $('#prompt').value.trim(); if (!text) { $('#prompt').focus(); return } const lower = text.toLowerCase(), chips = [mode]; const bhk = text.match(/(\d+)\s*(?:bhk|bed(?:room)?s?)/i); if (bhk) chips.push(`${bhk[1]} BHK`); const price = text.match(/₹\s?[\d,.]+\s?(?:cr(?:ore)?|l(?:akh)?|k)?/i); if (price) chips.push(`Budget ${price[0]}`); const area = ['bhopal', 'arera colony', 'shahpura', 'bawadiya kalan'].find(x => lower.includes(x)); if (area) chips.push(area.replace(/\b\w/g, x => x.toUpperCase())); if (/quiet|peaceful/.test(lower)) chips.push('Quiet neighbourhood'); if (/office|commute|minutes|min\b/.test(lower)) chips.push('Commute considered'); if (/park/.test(lower)) chips.push('Parking included'); if (/school|university/.test(lower)) chips.push('Nearby education'); if (/pool|gym|garden|balcony|pet/.test(lower)) chips.push('Lifestyle amenities'); if (chips.length === 1) chips.push('Location-aware search', 'Lifestyle preferences'); $('#chips').innerHTML = chips.map((x, i) => `<span class="chip" style="animation-delay:${i * .06}s">${x}</span>`).join(''); rank(text); $('#parsed').classList.add('show'); $('#results').classList.add('show'); setTimeout(() => $('#results').scrollIntoView({ behavior: 'smooth', block: 'start' }), 120) };

$('#searchBtn').addEventListener('click', function (e) {
    e.preventDefault();
    const btn = this, originalText = btn.innerHTML;
    btn.innerHTML = 'Analyzing...';
    btn.style.opacity = '0.7';

    setTimeout(() => {
        parseSearch();
        btn.innerHTML = originalText;
        btn.style.opacity = '1';
    }, 450);
});

$('#prompt').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('#searchBtn').click() } });

/* Compare functionality */
let compare = []; const bar = $('#compareBar'); function refreshCompare() { const count = $('#compareCount'); count.textContent = `${compare.length} home${compare.length === 1 ? '' : 's'} selected`; bar.classList.toggle('visible', compare.length > 0); const nm = ['The Sky Residence', 'Courtyard No. 8', 'The Grove Apartment']; $$('.compare-table tr').forEach(r => [...r.children].forEach((c, i) => i && c.classList.toggle('col-on', compare.includes(nm[i - 1])))); $('.compare-table').classList.toggle('filtered', compare.length > 0); $$('.property').forEach(c => { const b = $('.compare', c); if (b) { const yes = compare.includes(c.dataset.name); b.classList.toggle('selected', yes); b.textContent = yes ? '✓ Added' : '＋ Compare' } }) } $$('.property').forEach(card => { $('.heart', card).addEventListener('click', e => { const b = e.currentTarget; b.classList.toggle('saved'); b.textContent = b.classList.contains('saved') ? '♥' : '♡'; toast(b.classList.contains('saved') ? 'Saved to your shortlist' : 'Removed from shortlist') }); $('.compare', card).addEventListener('click', () => { const name = card.dataset.name; if (compare.includes(name)) compare = compare.filter(x => x !== name); else if (compare.length < 3) compare.push(name); else toast('Compare up to three homes at once'); refreshCompare() }); $('.visit', card).addEventListener('click', () => openVisit(card.dataset.name)) });

$('#clearCompare').addEventListener('click', () => { compare = []; refreshCompare() }); $('#compareJump').addEventListener('click', () => { $('#compare-section').scrollIntoView({ behavior: 'smooth' }); toast(compare.length ? `${compare.length} homes ready to compare` : 'See an example comparison') });

/* Visit modal */
const modal = $('#visitModal'); function openVisit(name) { $('#visitProperty').textContent = `Request a site visit for ${name}. Choose a time and our local broker will follow up.`; modal.classList.add('open') } $$('.modal-close').forEach(b => b.addEventListener('click', () => modal.classList.remove('open'))); modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open') }); $('#visitForm').addEventListener('submit', e => { e.preventDefault(); modal.classList.remove('open'); e.currentTarget.reset(); toast('Visit request noted · Demo interaction') });

/* Toast */
let toastTimer; function toast(message) { const t = $('#toast'); t.textContent = message; t.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2400) }

/* Chat assistant */
const chatReplies = ['The listing details show two covered parking spaces, 24-hour security and a gated entrance.', 'The listing places this home about 18 minutes from the central business district. Commute times can vary by traffic.', 'There are schools, a grocery market and a neighbourhood park nearby, according to the listing details.', 'The Courtyard No. 8 is listed at ₹88 lakh, with 3 bedrooms and 2 covered parking spaces.']; const form = $('#chatForm');

function ask(q) {
    if (!q.trim()) return;
    const body = $('#chatBody'), user = document.createElement('div');
    user.className = 'bubble user'; user.textContent = q; body.append(user);
    $('#chatInput').value = ''; body.scrollTop = body.scrollHeight;

    /* Insert temporary typing indicator */
    const typing = document.createElement('div');
    typing.className = 'bubble ai typing';
    typing.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
    body.append(typing); body.scrollTop = body.scrollHeight;

    /* Simulate network/processing delay */
    setTimeout(() => {
        typing.remove();
        const answer = document.createElement('div');
        answer.className = 'bubble ai';
        answer.textContent = /cheap|lower|similar|price/i.test(q) ? chatReplies[3] : /commute|office|time/i.test(q) ? chatReplies[1] : /near|school|what.*around/i.test(q) ? chatReplies[2] : chatReplies[0];
        body.append(answer); body.scrollTop = body.scrollHeight;
    }, 600 + Math.random() * 500);
}

form.addEventListener('submit', e => { e.preventDefault(); ask($('#chatInput').value) }); $$('.suggestions button').forEach(b => b.addEventListener('click', () => ask(b.textContent)));  /* Smooth scroll for anchor links */ $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => { const target = document.querySelector(a.getAttribute('href')); if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }) } }));

/* ====== NESTIQ REALISTIC ARCHITECTURAL 3D HERO ====== */
(function () {
    const cv = document.getElementById('hero3d'), wrap = document.getElementById('heroWrap');
    if (!cv || !wrap || !window.THREE) return;
    const $ = id => document.getElementById(id);
    const fade = $('heroFade'), text = $('heroText'), hud = $('heroHud'), bar = $('heroBar'), end = $('heroEnd');

    const R = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: false, powerPreference: 'high-performance' });
    R.setPixelRatio(Math.min(devicePixelRatio, 2));
    R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;
    R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.15; R.outputEncoding = THREE.sRGBEncoding;

    const S = new THREE.Scene();
    S.background = new THREE.Color(0x10130f);
    S.fog = new THREE.FogExp2(0x10130f, .012);
    const cam = new THREE.PerspectiveCamera(38, 1, .1, 240);

    /* photographic-style lighting */
    S.add(new THREE.HemisphereLight(0xcfe2ff, 0x172015, .75));
    const sun = new THREE.DirectionalLight(0xffe5c4, 3.0);
    sun.position.set(-18, 28, 20); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 90 });
    S.add(sun);
    const fill = new THREE.DirectionalLight(0x9bbcff, .55); fill.position.set(20, 12, -18); S.add(fill);
    const warm = new THREE.PointLight(0xffb86a, 2.5, 26); warm.position.set(0, 3, 3); S.add(warm);
    const cool = new THREE.PointLight(0x83b7ff, 1.0, 22); cool.position.set(-8, 5, -4); S.add(cool);

    const M = (c, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .72, metalness: 0 }, o));
    const concrete = M(0xc8c9c2, { roughness: .88 });
    const plaster = M(0xe2e0d7, { roughness: .72 });
    const charcoal = M(0x161a18, { roughness: .45, metalness: .12 });
    const wood = M(0x805535, { roughness: .62 });
    const woodDark = M(0x4a3020, { roughness: .72 });
    const stone = M(0x74766e, { roughness: .94 });
    const glass = new THREE.MeshPhysicalMaterial({ color: 0x7faeb2, transparent: true, opacity: .34, roughness: .08, metalness: .08, clearcoat: .7, clearcoatRoughness: .08 });
    const glassDark = new THREE.MeshPhysicalMaterial({ color: 0x15252a, transparent: true, opacity: .72, roughness: .06, metalness: .3, clearcoat: 1 });
    const blackGlass = new THREE.MeshPhysicalMaterial({ color: 0x071012, roughness: .08, metalness: .4, clearcoat: 1 });
    const water = new THREE.MeshPhysicalMaterial({ color: 0x236d78, roughness: .08, metalness: .08, transmission: .18, transparent: true, opacity: .9 });
    const lawn = M(0x26341e, { roughness: 1 });
    const lime = M(0xd5ff3f, { emissive: 0xd5ff3f, emissiveIntensity: 2.0 });
    const lightMat = M(0xffd19a, { emissive: 0xffa85b, emissiveIntensity: 3.2 });

    function mesh(g, m, x = 0, y = 0, z = 0, shadow = true) {
        const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = shadow; o.receiveShadow = true; S.add(o); return o;
    }
    function box(w, h, d, x, y, z, m, bevel = .08) {
        const g = new THREE.BoxGeometry(w, h, d, bevel ? 2 : 1, bevel ? 2 : 1, bevel ? 2 : 1);
        const o = mesh(g, m, x, y, z);
        if (bevel) {
            g.computeVertexNormals();
        }
        return o;
    }
    function plane(w, d, x, y, z, m) { return mesh(new THREE.PlaneGeometry(w, d), m, x, y, z, false) }
    function cyl(r, h, x, y, z, m, seg = 16) { return mesh(new THREE.CylinderGeometry(r, r, h, seg), m, x, y, z) }

    /* site */
    box(120, .25, 120, 0, -.14, 0, M(0x0e110d), .02);
    box(38, .12, 30, 0, .03, 2, lawn, .02);
    box(7.5, .13, 15, 10, .08, 14, stone, .02);
    box(9, .11, 5.2, -7, .08, 7.2, concrete, .04);
    box(8.25, .07, 4.45, -7, .15, 7.2, water, .04);

    /* house foundation and floating slab */
    box(15.4, .5, 9.2, 0, .32, 0, concrete, .12);
    box(16.2, .28, 9.6, 1, 3.7, .2, charcoal, .10);
    box(16.4, .32, 9.8, 1.4, 6.95, .15, charcoal, .10);

    /* ground glass volume */
    box(14.9, 3.15, 8.55, 0, 1.92, 0, glassDark, .04);
    box(.22, 3.25, 8.7, -7.45, 1.95, 0, charcoal, .03);
    box(.22, 3.25, 8.7, 7.45, 1.95, 0, charcoal, .03);

    /* realistic mullions */
    for (let i = -3; i <= 3; i++)box(.07, 3.05, .07, i * 2, 1.95, 4.30, charcoal, .01);
    for (let i = -2; i <= 2; i++)box(.07, 3.05, .07, i * 2.4, 1.95, -4.30, charcoal, .01);

    /* upper volume / cantilever */
    box(10.8, 2.9, 7.3, 3.7, 5.22, .05, plaster, .10);
    box(7.9, 2.65, .10, 3.7, 5.18, 3.72, glassDark, .02);
    for (let i = 0; i < 21; i++)box(.085, 2.55, .18, -.1 + i * .38, 5.18, 3.66, wood, .015);

    /* side privacy fins */
    for (let i = 0; i < 7; i++)box(.13, 2.55, .45, -1.9 + i * .55, 5.2, -3.72, woodDark, .02);

    /* roofline + lime architectural light */
    box(16.6, .18, 9.95, 1.4, 7.18, .15, concrete, .04);
    box(15.8, .055, .08, 1.4, 7.32, 5.0, lime, .01);

    /* entrance portal */
    box(3.3, 2.85, .28, -5.1, 1.8, 4.37, charcoal, .03);
    box(2.55, 2.5, .08, -5.1, 1.72, 4.55, blackGlass, .08);
    /* ---- camera path, render loop, scroll choreography ---- */
    const keys = [[24, 10, 32, 1, 3, 0], [10, 4, 22, -2, 2.4, 2], [-3, 2.4, 13, -5, 1.9, 4.4], [-5.1, 1.8, 7.4, -5.1, 1.75, 4.6]];
    const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), sm = t => t * t * (3 - 2 * t);
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let prog = 0, tgt = 0, mx = 0, my = 0, vis = true, tk = 0;
    const size = () => { const w = cv.clientWidth, h = cv.clientHeight; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix() };
    const scrollP = () => { const r = wrap.getBoundingClientRect(); tgt = cl(-r.top / Math.max(1, r.height - innerHeight)) };
    function frame() {
        requestAnimationFrame(frame); if (!vis) return;
        prog += (tgt - prog) * (still ? 1 : .08);
        const s = prog * (keys.length - 1), i = Math.min(Math.floor(s), keys.length - 2), t = sm(s - i), a = keys[i], b = keys[i + 1], l = k => a[k] + (b[k] - a[k]) * t;
        cam.position.set(l(0) + mx * .8, l(1) + my * .4, l(2)); cam.lookAt(l(3), l(4), l(5));
        warm.intensity = 2.5 + Math.sin(tk += .03) * .2;
        R.render(S, cam);
        text.style.opacity = 1 - cl(prog / .14); text.style.transform = `translateY(${-prog * 60}px)`;
        hud.style.opacity = prog < .04 ? 1 : 0; bar.style.height = prog * 100 + '%';
        end.style.opacity = cl((prog - .8) / .1) * (1 - cl((prog - .95) / .05)); fade.style.opacity = cl((prog - .92) / .08);
    }
    new IntersectionObserver(e => vis = e[0].isIntersecting).observe(wrap);
    addEventListener('resize', size); addEventListener('scroll', scrollP, { passive: true });
    addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = .5 - e.clientY / innerHeight }, { passive: true });
    size(); scrollP(); prog = tgt; frame();
})();

/* ====== NESTIQ ENHANCEMENTS ====== */
/* Rank the shortlist against what the person typed */
function rank(text) {
    const t = text.toLowerCase(), m = t.match(/₹\s?([\d.,]+)\s?(cr(?:ore)?|l(?:akh)?)?/), bd = t.match(/(\d+)\s*(?:bhk|bed)/), un = m && m[2] || '';
    let cap = null; if (m) { const n = parseFloat(m[1].replace(/,/g, '')); cap = /^cr/.test(un) ? n * 100 : /^l/.test(un) ? n : n >= 1e5 ? n / 1e5 : null }
    const grid = $('.property-grid'), kw = { quiet: 'Quiet area', school: 'Schools nearby', garden: 'Garden outlook', gym: 'Gym on site', park: 'Parking', commute: 'Easy commute' };
    $$('.property').map(c => {
        const d = c.dataset, p = +d.price; let s = 70; const r = [];
        if (cap) { if (p <= cap) { s += p <= cap * .9 ? 16 : 12; r.push(p <= cap * .9 ? 'Below budget' : 'Within budget') } else { s -= 14; r.push(`₹${Math.round(p - cap)}L over budget`) } }
        if (bd) { if (+bd[1] === +d.bhk) { s += 8; r.push(`${d.bhk} BHK as asked`) } else s -= 10 }
        if (t.includes(d.area)) { s += 10; r.push(d.area.replace(/\b\w/g, x => x.toUpperCase())) }
        Object.keys(kw).forEach(k => { if (t.includes(k) && d.tags.includes(k)) { s += 5; r.push(kw[k]) } });
        return { c, s: Math.min(98, Math.max(52, s)), r };
    }).sort((a, b) => b.s - a.s).forEach(({ c, s, r }) => { $('.match', c).textContent = s + '% MATCH'; if (r.length) $('.why', c).innerHTML = '<strong>Why it fits:</strong> ' + r.join(' · '); grid.append(c) });
}

/* Keep the shortlist between visits */
(function () {
    let saved = []; try { saved = JSON.parse(localStorage.getItem('nestiq:saved') || '[]') } catch (e) { }
    $$('.property').forEach(c => {
        const h = $('.heart', c);
        if (saved.includes(c.dataset.name)) { h.classList.add('saved'); h.textContent = '♥' }
        h.addEventListener('click', () => { const all = $$('.property').filter(x => $('.heart', x).classList.contains('saved')).map(x => x.dataset.name); try { localStorage.setItem('nestiq:saved', JSON.stringify(all)) } catch (e) { } });
    });
})();

/* Dialog + menu accessibility: Escape closes, scroll lock, focus the first field */
document.addEventListener('keydown', e => { if (e.key === 'Escape') { modal.classList.remove('open'); navLinks.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); menu.textContent = '☰' } });
new MutationObserver(() => { const o = modal.classList.contains('open'); document.body.style.overflow = o ? 'hidden' : ''; if (o) setTimeout(() => $('input', modal).focus(), 60) }).observe(modal, { attributes: true, attributeFilter: ['class'] });
