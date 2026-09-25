/* Big Easy Bathtubs — 2026 redesign prototype interactions.
   No dependencies. Every effect is skipped or shortened for prefers-reduced-motion. */
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hero entrance sequence (title fade-ins + underline draw).
  // rAF alone never fires in a background tab, so a timer backs it up.
  var loaded = function () { root.classList.add('is-loaded'); };
  requestAnimationFrame(loaded);
  setTimeout(loaded, 60);

  // ---------- sticky header ----------
  var head = document.querySelector('[data-head]');
  var onScroll = function () { head.classList.toggle('is-stuck', window.scrollY > 120); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- services mega menu ----------
  var megaBtn = document.querySelector('.nav-btn');
  var mega = document.getElementById('mega');
  if (megaBtn && mega) {
    var setMega = function (open) {
      megaBtn.setAttribute('aria-expanded', String(open));
      mega.classList.toggle('is-open', open);
    };
    megaBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      setMega(megaBtn.getAttribute('aria-expanded') !== 'true');
    });
    megaBtn.parentElement.addEventListener('mouseenter', function () { setMega(true); });
    megaBtn.parentElement.addEventListener('mouseleave', function () { setMega(false); });
    document.addEventListener('click', function (e) { if (!mega.contains(e.target)) setMega(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMega(false); } });
  }

  // ---------- mobile drawer ----------
  var burger = document.querySelector('[data-burger]');
  var drawer = document.querySelector('[data-drawer]');
  if (burger && drawer) {
    var setDrawer = function (open) {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      drawer.hidden = !open;
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', function () { setDrawer(drawer.hidden); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !drawer.hidden) setDrawer(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 1180 && !drawer.hidden) setDrawer(false); });
  }

  // ---------- hero slideshow (crossfade, autoplay with pause) ----------
  var slider = document.querySelector('[data-slider]');
  if (slider) {
    var slides = slider.querySelectorAll('.slide');
    var cur = 0, timer = null, paused = reduce;
    var curEl = slider.querySelector('[data-cur]');
    var totalEl = slider.querySelector('[data-total]');
    var pauseBtn = slider.querySelector('[data-pause]');
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    totalEl.textContent = pad(slides.length);

    var go = function (i) {
      slides[cur].classList.remove('is-active');
      cur = (i + slides.length) % slides.length;
      slides[cur].classList.add('is-active');
      curEl.textContent = pad(cur + 1);
      // Load the next image early so the crossfade never shows a blank frame.
      var nxt = slides[(cur + 1) % slides.length].querySelector('img');
      if (nxt && nxt.loading === 'lazy') nxt.loading = 'eager';
    };
    var play = function () {
      clearInterval(timer);
      if (!paused) timer = setInterval(function () { go(cur + 1); }, 5000);
    };
    var setPaused = function (p) {
      paused = p;
      pauseBtn.textContent = p ? '▶' : '❙❙';
      pauseBtn.setAttribute('aria-label', p ? 'Play slideshow' : 'Pause slideshow');
      play();
    };
    slider.querySelector('[data-prev]').addEventListener('click', function () { go(cur - 1); play(); });
    slider.querySelector('[data-next]').addEventListener('click', function () { go(cur + 1); play(); });
    pauseBtn.addEventListener('click', function () { setPaused(!paused); });
    slider.addEventListener('mouseenter', function () { clearInterval(timer); });
    slider.addEventListener('mouseleave', play);
    slider.addEventListener('focusin', function () { clearInterval(timer); });
    slider.addEventListener('focusout', play);
    // Touch swipe
    var x0 = null;
    slider.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) { go(cur + (dx < 0 ? 1 : -1)); play(); }
      x0 = null;
    });
    document.addEventListener('visibilitychange', function () { document.hidden ? clearInterval(timer) : play(); });
    setPaused(paused);
  }

  // ---------- reviews carousel buttons ----------
  var track = document.querySelector('[data-rev-track]');
  if (track) {
    var step = function (dir) {
      var card = track.querySelector('.rev');
      var w = card ? card.getBoundingClientRect().width + 24 : track.clientWidth;
      track.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    };
    document.querySelector('[data-rev-prev]').addEventListener('click', function () { step(-1); });
    document.querySelector('[data-rev-next]').addEventListener('click', function () { step(1); });
  }

  // ---------- scroll reveal ----------
  var reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  // ---------- trust bar: bath fill + rising bubbles ----------
  var trust = document.querySelector('[data-trust]');
  if (trust) {
    var foam = trust.querySelector('[data-foam]');
    if (foam && !reduce) {
      var rnd = function (a, b) { return a + Math.random() * (b - a); };
      for (var f = 0; f < 16; f++) {
        var b = document.createElement('i');
        b.style.cssText = '--x:' + rnd(2, 97).toFixed(1) + '%;--s:' + rnd(6, 22).toFixed(1) + 'px;' +
          '--fd:' + rnd(4.5, 9.5).toFixed(2) + 's;--fdelay:-' + rnd(0, 9).toFixed(2) + 's;' +
          '--drift:' + Math.round(rnd(-40, 40)) + 'px;--o:' + rnd(.3, .8).toFixed(2);
        foam.appendChild(b);
      }
    }
    if (reduce || !('IntersectionObserver' in window)) {
      trust.classList.add('go');
    } else {
      var tio = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { trust.classList.add('go'); tio.disconnect(); }
      }, { threshold: 0.35 });
      tio.observe(trust);
    }
  }

  // ---------- subtle parallax on the CTA photo ----------
  var ctaBg = document.querySelector('.cta-bg');
  if (ctaBg && !reduce) {
    var band = ctaBg.parentElement, ticking = false;
    var par = function () {
      var r = band.getBoundingClientRect();
      if (r.bottom > 0 && r.top < window.innerHeight) {
        var p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
        ctaBg.style.transform = 'translate3d(0,' + (p * -60).toFixed(1) + 'px,0)';
      }
      ticking = false;
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(par); } }, { passive: true });
    par();
  }
})();
