# Travel Timeline Visualization

*One dot per hour.*

A travel itinerary drawn as its own duration. Every hour of a trip is one
circle, dark through the night and pale through the day, with a coloured bar
marking the stretches where you actually stopped somewhere rather than kept
moving. Underneath, each day repeats on a 24 hour ring.

Nothing is compressed to fit. The band runs at a fixed **24 pixels per hour**,
so distance across the page is literally time: an eight day trip is about
4,700 pixels wide, which is why the canvas scrolls sideways.

This started as a Figma plugin. The page here is that plugin rebuilt to run in
a browser, so anyone can try it without installing anything.

**Live:** <https://beginyanarthur.github.io/travel-timeline-visualization/>

## Repo layout

```
index.html      the published page (built, do not edit by hand)
web/index.html  the page source
build.py        turns web/index.html into index.html
og.png          social preview card, 1200x630
og-card.html    the source of og.png
src/            the Figma plugin itself
samples/        two real trips in the plugin's JSON shape
```

## Why the page is built rather than written directly

`web/index.html` is also published as a Claude Artifact, where the host
supplies the `<head>`. GitHub Pages does not, so `build.py` adds it, along
with the Open Graph tags and a real file download. The Artifact sandbox blocks
page-initiated downloads, so that button can only copy to the clipboard there.

Edit `web/index.html`, never `index.html`, then:

```
python3 build.py
```

Set `PAGES_URL` at the top of `build.py` before the first deploy. Social
previews need an absolute URL, so a relative one will not resolve.

## Regenerating the preview card

```
python3 -m http.server 8931
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless --disable-gpu --hide-scrollbars --virtual-time-budget=6000 \
  --window-size=1200,630 --screenshot=og.png http://localhost:8931/og-card.html
```

## How the plugin was ported

The plugin draws to the Figma canvas, but only ever creates nodes from form
data, never reads existing ones. That maps onto SVG almost one for one:

| Figma | SVG |
| --- | --- |
| `createEllipse` | `<circle>` |
| `arcData` with `innerRadius` | donut sector `<path>` |
| `createVector` + `vectorPaths` | `<path>`, the path strings are already valid SVG |
| `createText` | `<text dominant-baseline="text-before-edge">` |
| `setRangeFontName` | `<tspan>` with its own weight |
| `relativeTransform` `[[a,c,tx],[b,d,ty]]` | `matrix(a,b,c,d,tx,ty)` |

Every `resize()` in the plugin is to the path's own native size, so a
translate is the whole transform. Text lines up because Inter's ascent plus
descent equals its auto line height, which puts Figma's text box top and the
ascender top on the same line.

Type is Inter at 400 and 700 inside the drawing, matching the two weights the
plugin actually applies.

## The plugin

`src/` holds `code.ts`, `ui.html` and `manifest.json`. Import a JSON file from
`samples/`, or anything you export from the web page, to draw the same thing
on a real Figma canvas.
