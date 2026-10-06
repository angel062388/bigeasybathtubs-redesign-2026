/* Big Easy Bathtubs — 2026 redesign prototype interactions.
   No dependencies. Every effect is skipped or shortened for prefers-reduced-motion. */
(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hero entrance sequence (title fade-ins + underline draw).
  // rAF alone never fires in a background tab, so a timer backs it up.
  var loaded = function () { root.classList.add('is-loaded'); };
  if (root.classList.contains('intro-armed') && !root.classList.contains('intro-out')) {
    // The intro overlay is up: start the hero entrance as it begins to leave.
    document.addEventListener('intro:leaving', loaded);
    setTimeout(loaded, 11000); // safety net if the intro script dies
  } else {
    requestAnimationFrame(loaded);
    setTimeout(loaded, 60);
  }

  // ---------- sticky header ----------
  var head = document.querySelector('[data-head]');
  var onScroll = function () { head.classList.toggle('is-stuck', window.scrollY > 120); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- drop-down menus (Services, Service Areas) ----------
  var megaSetters = [];
  Array.prototype.forEach.call(document.querySelectorAll('.nav-btn[aria-controls]'), function (megaBtn) {
    var mega = document.getElementById(megaBtn.getAttribute('aria-controls'));
    if (!mega) return;
    var setMega = function (open) {
      megaBtn.setAttribute('aria-expanded', String(open));
      mega.classList.toggle('is-open', open);
    };
    megaSetters.push(setMega);
    megaBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = megaBtn.getAttribute('aria-expanded') !== 'true';
      megaSetters.forEach(function (close) { close(false); });
      setMega(open);
    });
    megaBtn.parentElement.addEventListener('mouseenter', function () { setMega(true); });
    megaBtn.parentElement.addEventListener('mouseleave', function () { setMega(false); });
    document.addEventListener('click', function (e) { if (!mega.contains(e.target)) setMega(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMega(false); } });
  });

  // ---------- Service Areas menu: pointing at a city shows that city's service pages ----------
  Array.prototype.forEach.call(document.querySelectorAll('[data-ma]'), function (box) {
    var cityLinks = box.querySelectorAll('[data-ma-city]');
    var panels = box.querySelectorAll('[data-ma-panel]');
    var show = function (key) {
      Array.prototype.forEach.call(cityLinks, function (a) { a.classList.toggle('is-on', a.getAttribute('data-ma-city') === key); });
      Array.prototype.forEach.call(panels, function (p) { p.classList.toggle('is-on', p.getAttribute('data-ma-panel') === key); });
    };
    Array.prototype.forEach.call(cityLinks, function (a) {
      var key = a.getAttribute('data-ma-city');
      a.addEventListener('mouseenter', function () { show(key); });
      a.addEventListener('focus', function () { show(key); });
    });
  });

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

  // ---------- reviews spotlight ----------
  var revs = document.querySelector('[data-revs]');
  if (revs) {
    var rq = revs.querySelectorAll('.rq');
    var rthumbs = revs.querySelectorAll('[data-rev-thumb]');
    var rstage = revs.querySelector('[data-rev-stage]');
    var rbar = revs.querySelector('[data-rev-bar]');
    var rcur = revs.querySelector('[data-rev-cur]');
    var rpause = revs.querySelector('[data-rev-pause]');
    var ri = 0, rtimer = null, rPaused = reduce, rHeld = false, rSeen = false;
    var two = function (n) { return (n < 10 ? '0' : '') + n; };
    var runBar = function (on) {
      rbar.classList.remove('run');
      if (on) { void rbar.offsetWidth; rbar.classList.add('run'); }
    };
    var rPlay = function () {
      clearTimeout(rtimer);
      var go = !rPaused && !rHeld && rSeen && !document.hidden;
      runBar(go);
      if (go) rtimer = setTimeout(function () { rShow(ri + 1, false); }, 7000);
    };
    var rShow = function (i, byUser) {
      ri = (i + rq.length) % rq.length;
      rq.forEach(function (q, n) {
        q.classList.toggle('is-on', n === ri);
        if (n === ri) q.removeAttribute('aria-hidden'); else q.setAttribute('aria-hidden', 'true');
      });
      rthumbs.forEach(function (t, n) {
        t.classList.toggle('is-on', n === ri);
        if (n === ri) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current');
      });
      rcur.textContent = two(ri + 1);
      // announce a change only when the visitor asked for it
      rstage.setAttribute('aria-live', byUser ? 'polite' : 'off');
      rPlay();
    };
    revs.querySelector('[data-rev-prev]').addEventListener('click', function () { rShow(ri - 1, true); });
    revs.querySelector('[data-rev-next]').addEventListener('click', function () { rShow(ri + 1, true); });
    rthumbs.forEach(function (t, n) { t.addEventListener('click', function () { rShow(n, true); }); });
    rpause.addEventListener('click', function () {
      rPaused = !rPaused;
      rpause.textContent = rPaused ? '▶' : '❙❙';
      rpause.setAttribute('aria-label', rPaused ? 'Play reviews' : 'Pause reviews');
      rPlay();
    });
    var spot = revs.querySelector('.revs-spot');
    var rArea = revs.querySelector('.revs-grid');
    rArea.addEventListener('mouseenter', function () { rHeld = true; rPlay(); });
    rArea.addEventListener('mouseleave', function () { rHeld = false; rPlay(); });
    rArea.addEventListener('focusin', function () { rHeld = true; rPlay(); });
    rArea.addEventListener('focusout', function () { rHeld = false; rPlay(); });
    document.addEventListener('visibilitychange', rPlay);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { rSeen = en[0].isIntersecting; rPlay(); }, { threshold: 0.3 }).observe(spot);
    } else { rSeen = true; }
    if (rPaused) { rpause.textContent = '▶'; rpause.setAttribute('aria-label', 'Play reviews'); }
    rPlay();
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

  // ---------- services: the photo follows the category in use ----------
  var svc = document.querySelector('[data-svc]');
  if (svc) {
    var svcImgs = svc.querySelectorAll('.svc-stage img');
    var svcGroups = svc.querySelectorAll('[data-svc-group]');
    var showSvc = function (i) {
      svcGroups.forEach(function (g, n) { g.classList.toggle('is-on', n === i); });
      svcImgs.forEach(function (im, n) {
        if (n === i && im.loading === 'lazy') im.loading = 'eager';
        im.classList.toggle('is-on', n === i);
      });
    };
    svcGroups.forEach(function (g, i) {
      ['mouseenter', 'focusin', 'click'].forEach(function (ev) { g.addEventListener(ev, function () { showSvc(i); }); });
    });
  }

  // ---------- blog list: search + topic filter over the articles on the page ----------
  var blog = document.querySelector('[data-blog]');
  if (blog) {
    var bItems = blog.querySelectorAll('.bpost');
    var bQ = blog.querySelector('[data-blog-q]');
    var bCats = blog.querySelectorAll('[data-blog-cat]');
    var bEmpty = blog.querySelector('[data-blog-empty]');
    var bCat = '';
    var bApply = function () {
      var q = bQ.value.trim().toLowerCase(), shown = 0;
      bItems.forEach(function (it) {
        var ok = (!bCat || it.getAttribute('data-cat') === bCat) && (!q || it.textContent.toLowerCase().indexOf(q) > -1);
        it.hidden = !ok;
        if (ok) shown++;
      });
      bEmpty.hidden = shown > 0;
    };
    bCats.forEach(function (b) {
      b.addEventListener('click', function () {
        bCat = b.getAttribute('data-blog-cat');
        bCats.forEach(function (x) { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
        bApply();
      });
    });
    bQ.addEventListener('input', bApply);
  }

  // ---------- service areas: map markers and list rows light each other up ----------
  var areas = document.querySelector('[data-areas]');
  if (areas) {
    var pair = function (k, on) {
      areas.querySelectorAll('[data-k="' + k + '"]').forEach(function (el) { el.classList.toggle('is-on', on); });
    };
    areas.querySelectorAll('[data-k]').forEach(function (el) {
      var k = el.getAttribute('data-k');
      ['mouseenter', 'focus'].forEach(function (ev) { el.addEventListener(ev, function () { pair(k, true); }); });
      ['mouseleave', 'blur'].forEach(function (ev) { el.addEventListener(ev, function () { pair(k, false); }); });
    });
  }

  // ---------- looping videos (About, CTA band): play only on screen, never for reduced motion ----------
  document.querySelectorAll('[data-about-video],[data-loop-video]').forEach(function (vid) {
    var vbtn = vid.parentElement.querySelector('[data-video-toggle]');
    if (!vbtn) return;
    var userPaused = reduce;
    var setBtn = function () {
      vbtn.textContent = vid.paused ? '▶' : '❙❙';
      vbtn.setAttribute('aria-label', vid.paused ? 'Play video' : 'Pause video');
    };
    if (reduce) { vid.removeAttribute('autoplay'); vid.pause(); }
    vid.addEventListener('play', setBtn);
    vid.addEventListener('pause', setBtn);
    vbtn.addEventListener('click', function () {
      if (vid.paused) { userPaused = false; vid.play().catch(function () {}); }
      else { userPaused = true; vid.pause(); }
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { if (!userPaused) vid.play().catch(function () {}); }
        else vid.pause();
      }, { threshold: 0.25 }).observe(vid);
    }
    setBtn();
  });

  // ---------- subtle parallax on the CTA film ----------
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
