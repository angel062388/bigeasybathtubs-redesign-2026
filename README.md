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
| `covington.html` | City page (the example; the other nine are not built yet). Order: hero, What to expect, Services named for the city, Service areas without this city, About the city (Things to Do, Nearby Suburbs, Fun Facts, Public Transportation), FAQs about the service in that city. Client content is in `data/cities/`. "About the city" is new copy; its facts and their sources are listed beside each city in `build-pages.js`, and a city is only built once it has that entry |
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
