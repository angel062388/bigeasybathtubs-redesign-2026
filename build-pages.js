/* Builds every inner page from index.html:   node build-pages.js

   Inner pages reuse whole sections of the homepage (header, ticker, process,
   services, reviews, water map, FAQ, CTA band, footer) and add a few of
   their own. The shared markup is lifted out of index.html, so a change to
   a shared section is made once, on the homepage, and then this is re-run.

   House rule, enforced below: every inner page carries at least one link in
   body copy to the live homepage and one to the live contact page. (The
   contact page itself, when it is built, is exempt from linking to itself.) */
const fs = require('fs');
const path = require('path');
const dir = __dirname;
const HOME = 'https://www.bigeasybathtubs.com/';
const CONTACT = HOME + 'contact/';
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
const esc = (s) => s.replace(/&(?!amp;|#\d+;|[a-z]+;)/g, '&amp;').replace(/"/g, '&quot;');
const kw = (s) => `<span class="kw">${s}</span>`;

// ---------- shared pieces, lifted from the homepage ----------
const headBase = src.slice(0, src.indexOf('</head>'));
const head = (title, desc) => {
  let h = once(headBase, /<title>[\s\S]*?<\/title>/.exec(headBase)[0], `<title>${title}</title>`);
  return once(h, /<meta name="description" content="[^"]*">/.exec(h)[0], `<meta name="description" content="${esc(desc)}">`);
};
const header = cut('<!-- ============ HEADER ============ -->', '<main id="main">');
const ticker = cut('<!-- ============ TRUST BAR (ticker)', '<!-- ============ PROCESS');
const process_ = cut('<!-- ============ PROCESS ============ -->', '<!-- ============ SERVICES: showcase split');
const services = cut('<!-- ============ SERVICES: showcase split', '<!-- ============ ABOUT / LOCAL');
const aboutHome = cut('<!-- ============ ABOUT / LOCAL ============ -->', '<!-- ============ REVIEWS: spotlight');
const reviews = cut('<!-- ============ REVIEWS: spotlight', '<!-- ============ CTA BAND ============ -->');
const ctaBand = cut('<!-- ============ CTA BAND ============ -->', '<!-- ============ SERVICE AREAS: the water map');
const areasHome = cut('<!-- ============ SERVICE AREAS: the water map', '<!-- ============ FAQ');
const faq = cut('<!-- ============ FAQ ============ -->', '<!-- ============ BLOG ============ -->');
const footer = src.slice(src.indexOf('<!-- ============ FOOTER ============ -->'));

// ---------- the inner-page hero: one framed photo ----------
function pageHero({ crumbs, title, lede, img, alt, caption, post }) {
  const trail = [`<a href="${HOME}">Home</a>`].concat(crumbs.map((c, i) =>
    i === crumbs.length - 1 ? `<span aria-current="page">${c[0]}</span>` : `<a href="${c[1]}">${c[0]}</a>`))
    .join('<span aria-hidden="true">›</span>');
  const lines = [].concat(title);
  const h1 = post
    ? `      <p class="post-meta fade-seq" style="--d:.2s">${post.meta}</p>\n      <h1 class="post-title fade-seq" style="--d:.3s">${lines[0]}</h1>`
    // long titles get a smaller size so each line still fits beside the photo
    : `      <h1 class="hero-title${lines.some(t => t.length > 16) ? ' ht-long' : ''}">\n` + lines.map((t, i) =>
      `        <span class="ht-line fade-seq" style="--d:${(0.25 + i * 0.18).toFixed(2)}s"><span class="ht-txt">${t}</span><svg class="ht-ul" viewBox="0 0 400 12" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="${i % 2 ? 'M2 6 C 90 9, 170 3, 250 7 S 350 9, 398 5' : 'M2 8 C 80 3, 160 10, 240 6 S 360 4, 398 7'}"/></svg></span>`).join('\n') + '\n      </h1>';
  return `<!-- ============ PAGE HERO (inner pages) ============
     Same navy ground and headline treatment as the homepage hero. One
     photo, set in a thin sand frame that sits offset behind it, with a
     small label; it settles from a slight zoom as the page opens. -->
<section class="phero${post ? ' phero-post' : ''}" aria-label="Introduction">
  <div class="wrap phero-grid">
    <div class="phero-copy">
      <nav class="crumb fade-seq" style="--d:.1s" aria-label="Breadcrumb">${trail}</nav>
${h1}
${lede ? `      <p class="hero-lede fade-seq" style="--d:.6s">${lede}</p>\n` : ''}      <div class="hero-actions fade-seq" style="--d:.8s">
        <a class="btn btn-sand" href="${CONTACT}">Get your free estimate</a>
        <a class="btn btn-line-light" href="tel:+15045533699">Call 504-553-3699</a>
      </div>
    </div>
    <figure class="ph-photo">
      <span class="ph-img"><img src="${U}${img}" alt="${esc(alt)}" fetchpriority="high"></span>
${caption ? `      <figcaption>${caption}</figcaption>\n` : ''}    </figure>
  </div>
</section>

`;
}

// ---------- assemble + check ----------
const built = [];
function write(file, { title, desc, sections, exemptContact }) {
  const page = head(title, desc) + '</head>\n<body class="inner">\n<a class="skip" href="#main">Skip to content</a>\n\n' +
    header + '<main id="main">\n\n' + sections.join('') + '</main>\n\n' + footer;
  const body = page.slice(page.indexOf('<main id="main">'), page.indexOf('</main>'));
  // "in body copy" means inside a paragraph, not a button or the nav
  const paragraphs = body.match(/<p[\s>][\s\S]*?<\/p>/g) || [];
  const inCopy = (url) => paragraphs.filter(p => p.includes('href="' + url + '"')).length;
  const nHome = inCopy(HOME), nContact = inCopy(CONTACT);
  if (nHome < 1) throw new Error(file + ': interlink rule, no body-copy link to the homepage');
  if (!exemptContact && nContact < 1) throw new Error(file + ': interlink rule, no body-copy link to the contact page');
  const h1s = (body.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) throw new Error(file + ': must have exactly one h1, has ' + h1s);
  if (/id="intro"/.test(page)) throw new Error(file + ': the intro overlay belongs to the homepage only');
  if (/—/.test(body.replace(/<!--[\s\S]*?-->/g, ''))) throw new Error(file + ': em dash in page copy');
  const ids = [...body.matchAll(/ id="([^"]+)"/g)].map(m => m[1]);
  const dup = ids.filter((v, i) => ids.indexOf(v) !== i);
  if (dup.length) throw new Error(file + ': duplicate ids ' + dup.join(', '));
  fs.writeFileSync(path.join(dir, file), page);
  built.push(`${file}: ${nHome} homepage + ${nContact} contact link(s) in body copy`);
}

/* =====================================================================
   SERVICE AREAS
   ===================================================================== */
{
  let areas = once(areasHome, `<h2>Serving ${kw('Greater New Orleans')} and the surrounding parishes</h2>`, `<h2>Areas we ${kw('proudly serve')}</h2>`);
  areas = once(areas, '<p class="sec-lede">Ten service areas from Baton Rouge to Slidell, all reached from New Orleans. Pick your city on the map or in the list to open its page.</p>',
    '<p class="sec-lede">We provide bathtub installation, refinishing, remodeling and repair across Greater New Orleans and the surrounding parishes. Pick your city on the map or in the list to open its page.</p>');
  areas = once(areas, '        <div class="sa-cta">',
    `        <p class="sa-note">Don't see your neighborhood listed? <a href="${CONTACT}">Contact our team</a>. We serve homeowners throughout Greater New Orleans and would be glad to help with your bathtub project.</p>\n        <div class="sa-cta">`);
  const reach = `<!-- ============ REACH US (this page only) ============ -->
<section class="reach">
  <div class="wrap">
    <div class="sec-head reveal">
      <p class="eyebrow">Reach us</p>
      <h2>Big Easy Bathtubs, ${kw('New Orleans')}</h2>
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
  write('service-areas.html', {
    title: 'Bathtub Service Areas Near New Orleans | Big Easy Bathtubs',
    desc: 'Big Easy Bathtubs serves New Orleans, the Northshore and nearby towns from Baton Rouge to Slidell. Call 504-553-3699 today to see if we cover your area.',
    sections: [
      pageHero({
        crumbs: [['Service Areas']], title: 'Service Areas',
        lede: `<a href="${HOME}">Big Easy Bathtubs</a> proudly serves homeowners across Greater New Orleans with expert bathtub installation, refinishing, remodeling and repair.`,
        img: '2026/06/bath-14-1024x768.jpg', alt: 'Freestanding tub under a window in a gray-blue bathroom',
        caption: '<b>10</b><span>service areas<br>from Baton Rouge to Slidell</span>',
      }), ticker, areas, services, reach, ctaBand],
  });
}

/* =====================================================================
   ABOUT
   ===================================================================== */
{
  // the homepage About layout (video beside copy), with this page's own words
  const a = aboutHome.indexOf('    <div class="about-copy reveal"'), b = aboutHome.indexOf('  </div>\n</section>');
  if (a < 0 || b < 0) throw new Error('about copy markers');
  const welcome = (aboutHome.slice(0, a) + `    <div class="about-copy reveal" style="--d:.1s">
      <p class="eyebrow">Welcome</p>
      <h2>Welcome to ${kw('Big Easy Bathtubs')}</h2>
      <p>Big Easy Bathtubs is your premier destination for bathtub installation and renovation services. Our team of experts specializes in transforming your bathtub into a luxurious, seamless centerpiece, guaranteed to impress your friends and family.</p>
      <p>With years of experience as a bathtub contractor in New Orleans, we have a comprehensive knowledge of the bathtub industry. Our highly trained professionals excel at both installation and remodeling, so your bathtub receives the utmost care and attention to detail.</p>
      <ul class="ticks">
        <li>Simple, mess-free bathtub installation</li>
        <li>Free estimates on all services</li>
        <li>Sustainable, comfortable and functional bathtubs</li>
      </ul>
    </div>
` + aboutHome.slice(b)).replace('<!-- ============ ABOUT / LOCAL ============ -->', '<!-- ============ WELCOME (About page; homepage About layout) ============ -->');

  const what = `<!-- ============ WHAT WE DO (About page only) ============ -->
<section class="what">
  <div class="wrap what-grid">
    <div class="what-head reveal">
      <p class="eyebrow">What we do</p>
      <h2>Professional bathtub installation and ${kw('remodeling services')} in New Orleans</h2>
      <ul class="tags" aria-label="Tub styles we install">
        <li>Traditional tubs</li><li>Soaking tubs</li><li>Walk-in bathtubs</li><li>Freestanding tubs</li><li>Custom solutions</li>
      </ul>
    </div>
    <div class="what-copy reveal" style="--d:.1s">
      <p>At Big Easy Bathtubs, we provide expert bathtub installation, replacement, remodeling, and renovation services for homeowners throughout New Orleans and the surrounding areas. Whether you're upgrading an outdated bathtub, improving accessibility with a walk-in tub, or creating a modern spa-like bathroom, our experienced team delivers quality craftsmanship and exceptional results.</p>
      <p>With years of industry experience, we specialize in installing a wide range of bathtub styles, including traditional tubs, soaking tubs, walk-in bathtubs, freestanding tubs, and custom bathtub solutions. Our team works closely with every customer to ensure the perfect combination of comfort, functionality, durability, and style.</p>
      <p>From the initial consultation to the final installation, we focus on providing a seamless experience, using high-quality materials and proven installation techniques to ensure long-lasting performance. No matter the size or scope of your project, we are committed to helping you create a beautiful and comfortable bathroom that adds value to your home.</p>
    </div>
  </div>
</section>

`;
  const trust = [
    ['Quality products and professional installation', 'We offer premium bathtub solutions installed by experienced professionals who prioritize precision, safety, and customer satisfaction.'],
    ['Customized bathroom solutions', 'Every home is different. We help you select the right bathtub style, size, and features to match your space, budget, and lifestyle needs.'],
    ['Experienced bathtub specialists', 'Our knowledgeable team has extensive experience handling bathtub installations, replacements, remodels, and accessibility upgrades throughout New Orleans.'],
    ['Long-lasting performance', 'We use quality materials and proven installation methods to ensure your bathtub remains durable, attractive, and functional for years to come.'],
    ['Customer-focused service', 'From consultation to project completion, we provide clear communication, dependable service, and attention to every detail.'],
  ];
  const why = `<!-- ============ WHY HOMEOWNERS TRUST US (About page only) ============ -->
<section class="trustus">
  <div class="wrap">
    <div class="sec-head reveal">
      <p class="eyebrow">Why choose us</p>
      <h2>Why homeowners trust ${kw('Big Easy Bathtubs')}</h2>
    </div>
    <ol class="numlist reveal" style="--d:.1s">
${trust.map(([t, p], i) => `      <li><span class="numlist-n">0${i + 1}</span><h3>${t}</h3><p>${p}</p></li>`).join('\n')}
    </ol>
    <p class="trustus-close reveal"><a href="${CONTACT}">Contact Big Easy Bathtubs</a> today to schedule your free estimate and discover why homeowners trust us for professional bathtub installation, replacement, and remodeling services in New Orleans and surrounding areas.</p>
  </div>
</section>

`;
  write('about.html', {
    title: 'About Our New Orleans Bathtub Team | Big Easy Bathtubs',
    desc: 'Meet the Big Easy Bathtubs team and learn how we help New Orleans homeowners plan, install and care for the right tub. Contact us today to discuss your project.',
    sections: [
      pageHero({
        crumbs: [['About']], title: ['Your Bathtub', 'Transformation Experts'],
        lede: `<a href="${HOME}">New Orleans' trusted bathtub specialists</a>: expert installation, refinishing, remodels and repairs for modern tubs, walk-in tubs and timeless clawfoot tubs.`,
        img: '2026/06/bath-13-1024x768.jpg', alt: 'Classic bathroom with a chandelier, framed art and a bathtub',
      }), ticker, welcome, what, why, process_, areasHome, faq, ctaBand],
  });
}

/* =====================================================================
   TESTIMONIALS
   ===================================================================== */
{
  write('testimonials.html', {
    title: 'Customer Reviews &amp; Testimonials | Big Easy Bathtubs',
    desc: 'Read what New Orleans homeowners say about their bathtub installation, remodel and repair projects. Call Big Easy Bathtubs today for your free estimate.',
    sections: [
      pageHero({
        crumbs: [['Testimonials']], title: 'Testimonials',
        lede: `Real reviews from New Orleans homeowners who trusted <a href="${HOME}">Big Easy Bathtubs</a> with their installation, refinishing, remodeling and repair projects. Ready to start yours? <a href="${CONTACT}">Contact our team</a>.`,
        img: '2026/06/tubhd_9-1024x768.jpg', alt: 'White clawfoot tub with gold feet',
        caption: '<b class="stars" aria-label="5 out of 5 stars">★★★★★</b><span>5-star reviews<br>on Google and Facebook</span>',
      }), ticker, reviews, services, ctaBand],
  });
}

/* =====================================================================
   BLOG (list) and BLOG ARTICLE (template, shown with one real article)
   ===================================================================== */
{
  const data = JSON.parse(fs.readFileSync(path.join(dir, 'data', 'posts.json'), 'utf8'));
  const posts = data.posts;
  const fmt = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  const thumb = (u) => u.replace(HOME + 'wp-content/uploads/', '');
  const cats = [...new Set(posts.map(p => p.category))];
  const item = (p, i) => `      <a class="bpost${i === 0 ? ' bpost-lead' : ''}" href="${p.link}" data-cat="${esc(p.category)}">
        <span class="bpost-img"><img src="${p.image}" alt="" loading="${i === 0 ? 'eager' : 'lazy'}"></span>
        <span class="bpost-body"><span class="post-meta">${fmt(p.date)} · ${p.category}</span><strong>${p.title}</strong><span class="bpost-ex">${p.excerpt}</span><span class="bpost-more">Read article</span></span>
      </a>`;
  const list = `<!-- ============ ARTICLES (Blog page only) ============
     Search and category filter work on the articles printed here (the nine
     newest); older ones are one click away on the live archive. No cards:
     photo, a line of detail, the title and a sentence. -->
<section class="blogx" data-blog>
  <div class="wrap">
    <div class="blogx-bar reveal">
      <label class="blogx-search"><span class="sr">Search articles</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="21" y2="21"/></svg>
        <input type="search" placeholder="Search articles" data-blog-q autocomplete="off">
      </label>
      <ul class="blogx-cats" aria-label="Filter by topic">
        <li><button type="button" class="is-on" data-blog-cat="">All</button></li>
${cats.map(c => `        <li><button type="button" data-blog-cat="${esc(c)}">${c}</button></li>`).join('\n')}
      </ul>
    </div>
    <div class="blogx-list reveal" style="--d:.1s" aria-live="polite">
${posts.map(item).join('\n')}
    </div>
    <p class="blogx-empty" data-blog-empty hidden>No articles match that search.</p>
    <div class="blogx-foot reveal">
      <p>Showing the ${posts.length} newest of ${data.totalPublished} articles. Have a question we haven't covered? <a href="${CONTACT}">Ask our team</a> and we'll point you to the right answer.</p>
      <a class="btn btn-line" href="${HOME}blog/page/2/">Older articles</a>
    </div>
  </div>
</section>

`;
  write('blog.html', {
    title: 'Bathtub Blog: Tips &amp; Guides | Big Easy Bathtubs',
    desc: 'Read bathtub tips, cost guides and design ideas from the Big Easy Bathtubs team in New Orleans. Contact us today when you are ready to start your own project.',
    sections: [
      pageHero({
        crumbs: [['Blog']], title: 'Blog',
        lede: `Tips, guides and inspiration for your bathtub project, from the <a href="${HOME}">Big Easy Bathtubs</a> team in New Orleans.`,
        img: '2026/06/tubhd_2-1024x683.jpg', alt: 'Freestanding tub with a chrome floor-mounted faucet',
        caption: `<b>${data.totalPublished}</b><span>articles<br>and guides</span>`,
      }), ticker, list, ctaBand],
  });

  // ----- one real article in the article template -----
  const post = posts.find(p => p.id === data.sample.id);
  let art = fs.readFileSync(path.join(dir, 'data', `post-${post.id}.html`), 'utf8').replace(/\r\n/g, '\n').trim();
  const toc = [];
  art = art.replace(/<h2>([\s\S]*?)<\/h2>/g, (m, t) => {
    const text = t.replace(/<[^>]+>/g, '').trim();
    const id = 's-' + text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
    toc.push([id, text]);
    return `<h2 id="${id}">${t}</h2>`;
  });
  art = art.replace(/<table>/g, '<div class="prose-table"><table>').replace(/<\/table>/g, '</table></div>').replace(/<img /g, '<img loading="lazy" ');
  const related = posts.filter(p => p.id !== post.id).slice(0, 3);
  const article = `<!-- ============ ARTICLE (article pages only) ============
     Contents list on the left, the article on the right. The article's
     words are the client's own, exactly as published. -->
<section class="art">
  <div class="wrap art-grid">
    <aside class="art-rail" aria-label="In this article">
      <p class="art-rail-h">In this article</p>
      <ol>
${toc.map(([id, t]) => `        <li><a href="#${id}">${t}</a></li>`).join('\n')}
      </ol>
      <a class="btn btn-navy" href="${CONTACT}">Get a free estimate</a>
    </aside>
    <article class="prose">
${art}
    </article>
  </div>
</section>

<!-- ============ MORE READING (article pages only) ============ -->
<section class="blog more">
  <div class="wrap">
    <div class="sec-head row reveal">
      <div>
        <p class="eyebrow">More reading</p>
        <h2>From the Big Easy Bathtubs ${kw('blog')}</h2>
      </div>
      <a class="btn btn-line" href="${HOME}blog/">View all articles</a>
    </div>
    <div class="blog-grid">
${related.map((p, i) => `      <a class="post reveal" style="--d:${(0.05 + i * 0.07).toFixed(2)}s" href="${p.link}">
        <div class="post-img"><img src="${p.image}" alt="" loading="lazy"></div>
        <p class="post-meta">${fmt(p.date)} · ${p.category}</p>
        <h3>${p.title}</h3>
      </a>`).join('\n')}
    </div>
  </div>
</section>

`;
  write('blog-post.html', {
    title: 'Guest Bathroom Tub Ideas, New Orleans | Big Easy Bathtubs',
    desc: 'The right guest bathroom tub balances space, versatility and easy care for visiting family. Compare styles, then get a free estimate from Big Easy Bathtubs.',
    sections: [
      pageHero({
        crumbs: [['Blog', HOME + 'blog/'], ['Article']], title: post.title, post: { meta: `${fmt(post.date)} · ${post.category}` },
        img: thumb(post.image), alt: '',
      }), article, areasHome, ctaBand],
  });
}

console.log(built.join('\n'));
