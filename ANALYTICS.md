# Reading the numbers

The dashboard at `traveltimeline.goatcounter.com` shows a lot. You need three
things from it. This is what the page sends, what to look at, and what to
ignore.

## What the page sends

Exactly three things, and nothing else.

| What | When |
| --- | --- |
| A visit | someone opens the page |
| `generated` | someone presses Generate **and it actually draws** |
| `sample-loaded` | someone presses **Try a sample trip** |
| `feedback-sent` | someone submits the feedback form |

`sample-loaded` is deliberately not counted as `generated`, even though it
draws. Rolling them together would flatter the one number that says whether
anyone builds a trip of their own, which is the number worth having.

No cookies, no identifiers, nothing that follows anyone between sites. The
trip data never leaves the browser; the events carry no content, only that
they happened.

The events appear alongside pages in the dashboard's list, as rows named
`generated` and `feedback-sent`. They are not separate screens.

## The only number that matters

**Visits → `generated`.**

Pageviews on their own will flatter you and tell you nothing. Someone who
opens the link, looks at the empty state and leaves counts exactly the same
as someone who built a five leg trip. The gap between those two numbers is
the whole story.

The page still opens empty, with nothing loaded, which was the right call for
honest feedback and is a real filter. The sample button does not change that:
it is opt in, one press, and it reports separately. This ratio is still how you
find out how expensive the empty opening is.

```
100 visits, 3 generated   →  the empty state is stopping people
100 visits, 25 generated  →  it is working, and you have 25 real opinions
```

Neither number is good or bad on its own. The ratio is a reading on your
first screen, not on your post.

## What to look at, in order

**1. The referrer list.** LinkedIn arrives as `lnkd.in`, their shortener,
rather than `linkedin.com`, and mobile app traffic can look different again.
Anything else is people who found it another way, which is worth knowing
separately.

**2. Mobile versus desktop.** A lot of work went into the bottom sheet. If
most visitors are on phones, that work mattered and the mobile numbers are
the ones to trust. If almost nobody is, it did not, and you learned something
cheap.

**3. The visits to `generated` ratio.** As above.

**4. `sample-loaded` against `generated`.** The sample button exists because
inventing plausible dates and timezones is real work for someone who only
wants to see the idea. These two together tell you how the page is being
used:

```
lots of sample, little generated   →  people look, they do not stay to build
lots of generated, little sample   →  the empty state was never the obstacle
both healthy                       →  the sample is doing its job as a way in
```

Someone who loads the sample, edits it and presses Generate fires both, which
is right: they did build something.

## What to ignore

**Time on page and bounce rate.** GoatCounter does not really measure them
and neither does anything else, honestly. A single page tool defeats both.

**Countries, browsers, screen sizes.** Interesting once, useless as a
recurring number. Look at them the first week and then stop.

**Total visits as a success metric.** It measures your post's reach, which
LinkedIn already tells you more accurately in its own post analytics. Use
LinkedIn for reach and GoatCounter for what happened after the click. They
answer different questions and neither replaces the other.

## Stop counting yourself

Every time you open the page you add a visit, and on a small sample that is
noise you will misread. Open this once on each device and browser you use:

```
https://beginyanarthur.github.io/travel-timeline-visualization/#toggle-goatcounter
```

It writes a flag into that browser's local storage and GoatCounter skips you
from then on. Verified: after visiting it, the counter reports
`disabled with #toggle-goatcounter` instead of counting, and it survives
later plain visits with no hash on the URL.

## The link to use when you are testing

```
https://beginyanarthur.github.io/travel-timeline-visualization/?nocount
```

Open that and nothing is reported for the rest of that browsing session: not
the visit, not Generate, not the sample. Reloads and navigation inside the
session stay silent too, so the query string only has to be there once.

This is the one that works everywhere. The per browser setting below lives in
that browser's storage, and a fresh in-app browser does not share it, so
tapping your own link from inside the LinkedIn app counts you as a visitor no
matter what you set in Safari. Same for a private window, and same for any
device you have not set up. `?nocount` needs none of that.

Use it as your bookmark for the site.

It has a second advantage. A query string is enough to bypass a cached copy,
and Pages caches hard: a device holding yesterday's copy of the page does not
have any of this in it yet. The `#goatcounter-` switches below are only a
hash, which does not bypass the cache, so on a device that has been here
before, open `?nocount` once first.

## Stop counting a browser for good

**If you are not sure whether you already did it, do not open that URL to
check.** It toggles, so checking undoes it. Open one of these instead. They
set the state outright, they say what they did, and they are safe to open
twice:

```
.../travel-timeline-visualization/#goatcounter-status   what is this browser doing
.../travel-timeline-visualization/#goatcounter-off      stop counting me here
.../travel-timeline-visualization/#goatcounter-on       count me here again
```

Each shows a message at the bottom of the screen for a few seconds, which is
the only way to check this on a phone, where there is no console to look in.
The visit that carries the hash may still be counted itself, since the
counter can fire before the setting lands. Every visit after it obeys.

Three things about GoatCounter's own toggle:

- **It is a toggle.** Open it twice and you are counted again. Once per
  browser is all it takes.
- **It is per browser, per device.** Your Mac, your phone and your iPad each
  need their own visit, and Chrome and Safari on the same machine count as
  two.
- **Clearing site data resets it**, and a private window never had it.

Do it before you post the link, not after.

Test traffic is in there too, both yours and mine. Treat the totals from
before you post as noise rather than a baseline.

## Two caveats worth holding

**Ad blockers eat some of this.** A meaningful share of visits will never be
counted. Your real traffic is higher than the number shown, by an amount you
cannot know. This does not matter for the ratio, because it undercounts both
sides roughly equally, which is another reason the ratio is the better
measure.

**A small sample is not a finding.** Twenty visits will produce a ratio that
looks meaningful and is mostly luck. Wait for a few hundred before you
conclude anything about the empty state.

## Adding another event

One line, in `web/index.html`:

```js
track('event-name', 'A readable description');
```

`track()` no-ops when GoatCounter is absent, which is how the Artifact build
stays script free. Then run `python3 build.py`.

Worth adding later if you want it: whether people press **Fit width** on
mobile, which would tell you whether the sideways scroll is landing.
