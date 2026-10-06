# Big Easy Bathtubs — Homepage Redesign (2026 prototype)

Static HTML/CSS/JS prototype of a new homepage for **bigeasybathtubs.com**.
Nothing here is deployed; the live WordPress site is untouched.

## How to view

Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8765
```

then visit http://localhost:8765.

## Design references

| Part | Modeled on |
|---|---|
| Hero | mcdonaldremodeling.com: dark navy band, tinted photo card, serif uppercase headline with hand-drawn underlines, overlapping portrait slideshow with arrows |
| Everything below the hero | bigeasybathrooms.com layout system: cream/sand grounds, navy brand color, Fraunces + Outfit type, pill buttons, 22px rounded cards, numbered steps, FAQ accordion |

All copy, photos, reviews, phone, address and hours are **Big Easy Bathtubs' own**, taken from
the current live site. No content from either reference site is reused.

## What moves

- Hero: card and slideshow rise in, photo settles from a slight zoom, headline lines fade up, underlines draw in.
- Slideshow: crossfade every 5 s with a slow zoom, arrows, swipe, pause/play button, pauses on hover/focus.
- Sections fade up as they scroll into view.
- Cards lift on hover; service links slide; CTA photo has a light parallax.
- Services mega menu (desktop), full-screen drawer (mobile).
- All motion is switched off for visitors with "reduce motion" turned on.

## Files

```
index.html            page markup
assets/css/main.css   design tokens + all styles
assets/js/main.js     interactions (no libraries)
```

## Known limits (prototype)

- Images are loaded straight from bigeasybathtubs.com.
- Newsletter form is not connected.
- Page carries `noindex, nofollow` so it can't be indexed if hosted for review.
- Homepage only. Inner pages (services, areas, blog) still need templates.
- Final build target (WordPress theme `bigeasybathtubs-2026`) not yet decided.

## Inner pages

The inner pages are generated, not hand-written:

```bash
node build-pages.js
```

| File | Page |
|---|---|
| `service-areas.html` | Service Areas |
| `about.html` | About |
| `testimonials.html` | Testimonials |
| `blog.html` | Blog list |
| `blog-post.html` | Blog article template, shown with one real article |
| `contact.html` | Contact: hero, address / phone / hours, the estimate form area, the service-area map. The form fields are a picture only and send nothing; on the live site the client's existing LeadConnector form loads in that panel. Exempt from the contact-link rule (it cannot link to itself) |
| `covington.html` and 9 more (`baton-rouge`, `gretna`, `hammond`, `kenner`, `laplace`, `madisonville`, `mandeville`, `slidell`, `st-rose`) | City pages, one template; Covington is the approved example. Order: hero, What to expect, Services named for the city, Service areas without this city, About the city (Things to Do, Nearby Suburbs, Fun Facts, Public Transportation), FAQs about the service in that city. Client content is in `data/cities/`. "About the city" is new copy; its facts and their sources are listed beside each city in `build-pages.js`, and a city is only built once it has that entry |
| `{city}-{service}.html`, 130 pages (e.g. `covington-bathtub-installation.html`, the approved example) | Service + city pages: every service in every city. What the localization changed on each page, and the sentences it deliberately left alone, are listed in `data/service-city-localization.txt` (rewritten on every build). Assembled from the service page (hero line, its second text section, its FAQs) and the city page (services named for the city, about the city, area map), the way Big Easy Bathrooms builds `/service-areas/{city}/{service}/`. Which pairs get built is the `combos` list near the city block in `build-pages.js` |
| `faqs.html` | FAQs: hero, all eight questions from the live FAQ page, Services, CTA band |
| 38 guide pages (e.g. `tub-repairs-cost.html`, `advantages-of-clawfoot-tubs.html`) | The long how-to pages that sit under a service on the live site, plus the six clawfoot guides. One template: hero, the guide with a contents list beside it (client's words, unchanged, from `data/guides/`), more guides on the same subject, Services, CTA band. File name = live path with the slash turned into a hyphen |
| 7 product-style pages (`acrylic-bathroom`, `acrylic-bathtub`, `bathtub-removal-disposal`, `bathtub-wall-surrounds`, `jetted-tub`, `shower-to-tubs-conversion`, `step-in-tubs`) | Built with the service-page template (intro, benefits, why choose us, then the homepage sections and FAQs). Listed under `products` in `data/services/index.json`. They have no city versions and are not in the Services section |
| `types-of-walk-in-tubs.html` | A hub: on the live site this page has a heading and no content, so here it lists its five guides |
| 31 blog category pages (`category-{slug}.html`) | Hero, that topic's articles in the Blog page's row layout, a row of buttons to the other topics, CTA band. Data in `data/categories.json`. Titles and descriptions are new (the live category pages have a bare title and no description). The Blog page carries the same row of topic buttons. Article links still open the live posts |
| Photo credits | City pages, About section. All from Wikimedia Commons (`commons.wikimedia.org/wiki/File:` + the file name in `build-pages.js`). Credit required on the live site for: Covington (Saint Tammany, CC BY 2.0), Gretna (nola.agent, CC BY 2.0), Kenner (Infrogmation of New Orleans, CC BY 2.0), LaPlace (Infrogmation of New Orleans, CC BY-SA 4.0), Mandeville (Susan Popielaski, CC BY-SA 3.0), Slidell (DwayneP, CC BY-SA 3.0), St. Rose (Spatms, CC BY-SA 4.0). No credit needed (public domain): Baton Rouge, Hammond, Madisonville. In the mock-up the credit shows when the photo is hovered |
| `bathtub-installation.html` and 12 more | The 13 service pages (one template). **`bathtub-installation.html` is the approved example**: the other service pages follow it. Navigation (header, mobile menu, footer, the Services chips) links to the prototype's own pages so the mock-up can be clicked through; body-copy links and Contact still go to the live site. Before launch, switch the navigation links back to the real addresses. Three text sections per page from the client's article (the intro plus two more), then the homepage's Services (minus the current page), Service areas, Process, Reviews, FAQ and CTA sections. The rest of the client's article becomes the first FAQ entries; its closing "call us for a quote" section is left out. Each page's words come from `data/services/{slug}.html`, copied unchanged from the live page; titles and descriptions come from `data/services/index.json` |

The script lifts the shared sections (header, ticker, process, services, reviews, water map,
FAQ, CTA band, footer) out of `index.html` and adds the sections that belong to each page
only. Change a shared section on the homepage, then re-run the script. Blog content lives in
`data/` (copied from the live site).

Rule for every inner page: at least one link in body copy to the live homepage and one to the
live contact page. The build fails if either is missing. The contact page itself is exempt
from linking to itself.

Comparison pages kept for reference: `trust-options.html`, `video-options.html`,
`cta-video-options.html`.
