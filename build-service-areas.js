/* Builds service-areas.html from index.html.

   The Service Areas page reuses whole sections of the homepage (header,
   ticker, water map, services, CTA band, footer) and adds two of its own
   (page hero, "Reach us"). Rather than copy the shared markup by hand, this
   script lifts it out of index.html, so a change to a shared section only
   has to be made on the homepage and then:   node build-service-areas.js

   Every inner page must carry at least one in-content link to the live
   homepage and one to the live contact page; build fails if either is gone. */
const fs = require('fs');
const path = require('path');
const dir = __dirname;
const HOME = 'https://www.bigeasybathtubs.com/';
const CONTACT = 'https://www.bigeasybathtubs.com/contact/';
const U = HOME + 'wp-content/uploads/';

const src = fs.readFileSync(path.join(dir, 'index.html'), 'utf8').replace(/\r\n/g, '\n');
const cut = (from, to) => {
  const a = src.indexOf(from), b = src.indexOf(to, a + from.length);
  if (a < 0 || b < 0) throw new Error('marker not found: ' + (a < 0 ? from : to));
  return src.slice(a, b);
};
const once = (s, a, b) => {
  const n = s.split(a).length - 1;
  if (n !== 1) throw new Error(`expected 1 match, found ${n}: ${a.slice(0, 70)}`);
  return s.replace(a, b);
};

// ---------- shared pieces, lifted from the homepage ----------
let head = src.slice(0, src.indexOf('</head>'));
head = once(head, /<title>[\s\S]*?<\/title>/.exec(head)[0], '<title>Bathtub Service Areas Near New Orleans | Big Easy Bathtubs</title>');
head = once(head, /<meta name="description" content="[^"]*">/.exec(head)[0],
  '<meta name="description" content="Big Easy Bathtubs serves New Orleans, the Northshore and nearby towns from Baton Rouge to Slidell. Call 504-553-3699 today to see if we cover your area.">');

const header = cut('<!-- ============ HEADER ============ -->', '<main id="main">');
const ticker = cut('<!-- ============ TRUST BAR (ticker)', '<!-- ============ PROCESS');
const services = cut('<!-- ============ SERVICES: showcase split', '<!-- ============ ABOUT / LOCAL');
const ctaBand = cut('<!-- ============ CTA BAND ============ -->', '<!-- ============ SERVICE AREAS: the water map');
let areas = cut('<!-- ============ SERVICE AREAS: the water map', '<!-- ============ FAQ');
const footer = src.slice(src.indexOf('<!-- ============ FOOTER ============ -->'));

// The map section keeps its design; only its words are this page's own.
areas = once(areas, '<h2>Serving <span class="kw">Greater New Orleans</span> and the surrounding parishes</h2>',
  '<h2>Areas we <span class="kw">proudly serve</span></h2>');
areas = once(areas, '<p class="sec-lede">Ten service areas from Baton Rouge to Slidell, all reached from New Orleans. Pick your city on the map or in the list to open its page.</p>',
  '<p class="sec-lede">We provide bathtub installation, refinishing, remodeling and repair across Greater New Orleans and the surrounding parishes. Pick your city on the map or in the list to open its page.</p>');
areas = once(areas, '        <div class="sa-cta">',
  `        <p class="sa-note">Don't see your neighborhood listed? <a href="${CONTACT}">Contact our team</a>. We serve homeowners throughout Greater New Orleans and would be glad to help with your bathtub project.</p>\n        <div class="sa-cta">`);

// ---------- this page's own sections ----------
const heroImg = { file: '2026/06/bath-14-1024x768.jpg', alt: 'Freestanding tub under a window in a gray-blue bathroom' };

const hero = `<!-- ============ PAGE HERO (inner pages) ============
     Same navy ground and headline treatment as the homepage hero. One
     photo, set in a thin sand frame that sits offset behind it, with a
     small label; it settles from a slight zoom as the page opens. -->
<section class="phero" aria-label="Introduction">
  <div class="wrap phero-grid">
    <div class="phero-copy">
      <nav class="crumb fade-seq" style="--d:.1s" aria-label="Breadcrumb"><a href="${HOME}">Home</a><span aria-hidden="true">›</span><span aria-current="page">Service Areas</span></nav>
      <h1 class="hero-title">
        <span class="ht-line fade-seq" style="--d:.25s"><span class="ht-txt">Service Areas</span><svg class="ht-ul" viewBox="0 0 400 12" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M2 8 C 80 3, 160 10, 240 6 S 360 4, 398 7"/></svg></span>
      </h1>
      <p class="hero-lede fade-seq" style="--d:.5s"><a href="${HOME}">Big Easy Bathtubs</a> proudly serves homeowners across Greater New Orleans with expert bathtub installation, refinishing, remodeling and repair.</p>
      <div class="hero-actions fade-seq" style="--d:.7s">
        <a class="btn btn-sand" href="${CONTACT}">Get your free estimate</a>
        <a class="btn btn-line-light" href="tel:+15045533699">Call 504-553-3699</a>
      </div>
    </div>
    <figure class="ph-photo">
      <span class="ph-img"><img src="${U}${heroImg.file}" alt="${heroImg.alt}" fetchpriority="high"></span>
      <figcaption><b>10</b><span>service areas<br>from Baton Rouge to Slidell</span></figcaption>
    </figure>
  </div>
</section>

`;

const reach = `<!-- ============ REACH US (this page only) ============ -->
<section class="reach">
  <div class="wrap">
    <div class="sec-head reveal">
      <p class="eyebrow">Reach us</p>
      <h2>Big Easy Bathtubs, <span class="kw">New Orleans</span></h2>
      <p class="sec-lede">Not sure whether we cover your street? Call us, or <a href="${CONTACT}">send a message through our contact page</a>, and we'll tell you right away.</p>
    </div>
    <dl class="reach-row reveal" style="--d:.1s">
      <div><dt>Location</dt><dd>517 Soraparu St, Suite 103-M<br>New Orleans, LA 70130</dd></div>
      <div><dt>Phone number</dt><dd><a href="tel:+15045533699">504-553-3699</a></dd></div>
      <div><dt>Opening hours</dt><dd>Mon to Fri: 7:00 am to 6:00 pm<small>Sat: 8:00 am to 12:00 pm<br>Sun: 10:00 am to 4:00 pm</small></dd></div>
    </dl>
  </div>
</section>

`;

const page = head + '</head>\n<body class="inner">\n<a class="skip" href="#main">Skip to content</a>\n\n' +
  header + '<main id="main">\n\n' + hero + ticker + areas + services + reach + ctaBand + '</main>\n\n' + footer;

// ---------- checks ----------
const body = page.slice(page.indexOf('<main id="main">'), page.indexOf('</main>'));
const count = (re) => (body.match(re) || []).length;
// "in-content" means inside a paragraph of body copy, not a button or the nav
const paragraphs = body.match(/<p[\s>][\s\S]*?<\/p>/g) || [];
const inCopy = (url) => paragraphs.filter(p => p.includes('href="' + url + '"')).length;
const homeLinks = inCopy(HOME);
const contactLinks = inCopy(CONTACT);
if (homeLinks < 1) throw new Error('interlink rule: no in-content link to the homepage');
if (contactLinks < 1) throw new Error('interlink rule: no in-content (body copy) link to the contact page');
if (count(/<h1[\s>]/g) !== 1) throw new Error('page must have exactly one h1');
if (/id="intro"/.test(page)) throw new Error('the intro overlay belongs to the homepage only');

fs.writeFileSync(path.join(dir, 'service-areas.html'), page);
console.log(`service-areas.html written: ${homeLinks} homepage link(s), ${contactLinks} contact link(s) in body copy, 1 h1`);
