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
