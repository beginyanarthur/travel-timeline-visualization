#!/usr/bin/env python3
"""Generate the GitHub Pages page from the Artifact page.

web/index.html is the source. It has no <head> of its own, because when it is
published as a Claude Artifact the host supplies one. GitHub Pages does not,
so this adds the head and the social preview tags.

It also swaps the export button. The Artifact sandbox blocks downloads a page
starts itself, so the source has a Copy button that works there; on Pages that
becomes a real Download, which matters because the Figma plugin imports from a
file picker and has no paste box.

Edit web/index.html, then run:  python3 build.py
"""
import io, os, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "web", "index.html")
OUT = os.path.join(ROOT, "index.html")

# Your Pages URL, with the trailing slash. Social previews need an absolute
# URL, so LinkedIn cannot resolve a relative one.
PAGES_URL = "https://beginyanarthur.github.io/travel-timeline-visualization/"

HEAD = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="author" content="Arthur Beginyan">
<meta name="description" content="See your whole trip on one timeline. Every hour is one circle, dark through the night and pale through the day. A Figma plugin, rebuilt to run in the browser.">

<meta property="og:type" content="website">
<meta property="og:site_name" content="Travel Timeline Visualization">
<meta property="og:title" content="Travel Timeline Visualization">
<meta property="og:description" content="See your whole trip on one timeline. Every hour is one circle, dark through the night and pale through the day.">
<meta property="og:image" content="%(url)sog.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="A wide band of circles, one for each hour of a trip, dark through the night and pale through the day.">
<meta property="og:url" content="%(url)s">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Travel Timeline Visualization">
<meta name="twitter:description" content="See your whole trip on one timeline. Every hour is one circle.">
<meta name="twitter:image" content="%(url)sog.png">

<script>
/* Runs before the counter, so it can stop the pageview being sent at all.
   Anything opened with ?nocount stays out of the stats for the rest of this
   browsing session, which is the only thing that works in a fresh in-app
   browser: those do not share Safari's storage, so the per-device setting
   does not exist there and your own tap on your own post would count. */
(function () {
  try {
    if (location.search.indexOf('nocount') > -1) sessionStorage.setItem('gcskip', '1');
    if (sessionStorage.getItem('gcskip') === '1' ||
        localStorage.getItem('skipgc') === 't') {
      window.goatcounter = { no_onload: true };
    }
  } catch (e) {}
})();
</script>

<script data-goatcounter="https://traveltimeline.goatcounter.com/count"
        async src="//gc.zgo.at/count.js"></script>

<link rel="icon" type="image/png" sizes="32x32" href="icons/icon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="icons/icon-16.png">
<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
<link rel="apple-touch-icon" sizes="180x180" href="icons/apple-touch-icon.png">

'''

# What the source has, because it works inside the Artifact sandbox.
COPY_HANDLER = """$('copy-btn').addEventListener('click', function () {
  var json = JSON.stringify(collectData(), null, 2);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(json).then(
      function () { toast('Trip JSON copied. Paste it into the Figma plugin.'); },
      function () { showPaste(json, true); }
    );
  } else { showPaste(json, true); }
});"""

# What Pages gets instead.
DOWNLOAD_HANDLER = r"""$('download-btn').addEventListener('click', function () {
  var data = collectData();
  var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  var city = data.legs.length > 0 ? data.legs[0].departureCity : 'trip';
  a.href = url;
  a.download = 'itinerary-' + city.toLowerCase().replace(/\s+/g, '-') + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('Saved. Import this file with the plugin in Figma.');
});"""


def swap(s, old, new, what):
    if old not in s:
        sys.exit("build failed: %s not found in web/index.html" % what)
    return s.replace(old, new, 1)


def main():
    s = io.open(SRC, encoding="utf-8").read()
    if not s.startswith("<title>"):
        sys.exit("build failed: web/index.html should start with its <title>")

    s = (HEAD % {"url": PAGES_URL}) + s

    s = swap(s,
             '</style>\n\n<header class="masthead">',
             '</style>\n</head>\n\n<body>\n\n<header class="masthead">',
             "the style/header boundary")

    s = swap(s,
             '<button class="more-item export" id="copy-btn" type="button">Copy JSON</button>',
             '<button class="more-item export" id="download-btn" type="button">↓ Export JSON</button>',
             "the export button")

    s = swap(s, COPY_HANDLER, DOWNLOAD_HANDLER, "the copy handler")

    io.open(OUT, "w", encoding="utf-8").write(s.rstrip() + "\n\n</body>\n</html>\n")
    print("wrote index.html (%d bytes)" % os.path.getsize(OUT))


if __name__ == "__main__":
    main()
