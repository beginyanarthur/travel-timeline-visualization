#!/usr/bin/env python3
"""Generate the GitHub Pages page from the Artifact page.

web/index.html is the Artifact source: it has no <head> of its own, because
the Artifact host supplies one. GitHub Pages does not, so this adds the head,
the social preview tags, and a real file download (the Artifact sandbox blocks
page-initiated downloads, so that button is Copy-only there).

Edit web/index.html, then run:  python3 build.py
"""
import io, os, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "web", "index.html")
OUT = os.path.join(ROOT, "index.html")

# Set this to your Pages URL, with the trailing slash. Social previews need an
# absolute URL, so LinkedIn cannot resolve a relative one.
PAGES_URL = "https://beginyanarthur.github.io/travel-timeline-visualization/"

HEAD = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="author" content="Arthur Beginyan">
<meta name="description" content="A travel itinerary drawn as its own duration: one circle per hour, dark through the night and pale through the day. A Figma plugin, rebuilt to run in the browser.">

<meta property="og:type" content="website">
<meta property="og:site_name" content="Travel Timeline Visualization">
<meta property="og:title" content="Travel Timeline Visualization">
<meta property="og:description" content="A trip drawn as its own duration. Every hour of the journey is a circle. A Figma plugin, rebuilt to run in the browser so you can try it without installing anything.">
<meta property="og:image" content="%(url)sog.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="A wide band of circles, one for each hour of a trip, dark through the night and pale through the day.">
<meta property="og:url" content="%(url)s">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Travel Timeline Visualization">
<meta name="twitter:description" content="A trip drawn as its own duration. Every hour of the journey is a circle.">
<meta name="twitter:image" content="%(url)sog.png">

<link rel="icon" href="data:image/svg+xml,%%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%%3E%%3Ccircle cx='17' cy='16' r='13' fill='%%23FF5630'/%%3E%%3Ccircle cx='4.5' cy='16' r='3.5' fill='%%23000'/%%3E%%3C/svg%%3E">

'''

DOWNLOAD_HANDLER = r'''$('download-btn').addEventListener('click', function () {
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
});

'''


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
             '          <button class="io-btn" id="copy-btn">Copy JSON</button>\n'
             '          <button class="io-btn" id="paste-btn">Paste JSON</button>\n'
             '          <button class="io-btn" id="file-btn">Open file</button>',
             '          <button class="io-btn" id="download-btn">Download</button>\n'
             '          <button class="io-btn" id="copy-btn">Copy</button>\n'
             '          <button class="io-btn" id="paste-btn">Paste</button>\n'
             '          <button class="io-btn" id="file-btn">Open file</button>',
             "the import/export button bar")

    pin = "$('paste-btn').addEventListener('click', function () { showPaste('', false); });"
    s = swap(s, pin, DOWNLOAD_HANDLER + pin, "the paste button handler")

    s = s.replace("with <code>Paste JSON</code>.", "with <code>Paste</code>.")
    s = swap(s,
             "<strong>Copy JSON</strong> puts the current trip on your clipboard in the exact shape the\n"
             "      real plugin reads, so anything you build here imports straight into Figma.",
             "<strong>Download</strong> hands you a .json file in the exact shape the real plugin reads, so\n"
             "      anything you build here imports straight into Figma. <strong>Copy</strong> puts the same\n"
             "      thing on your clipboard.",
             "the export paragraph")

    io.open(OUT, "w", encoding="utf-8").write(s.rstrip() + "\n\n</body>\n</html>\n")
    print("wrote index.html (%d bytes)" % os.path.getsize(OUT))
    if "__PAGES_URL__" in PAGES_URL:
        print("note: PAGES_URL is still a placeholder, so social previews will not resolve.")


if __name__ == "__main__":
    main()
