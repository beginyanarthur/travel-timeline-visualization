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
noise you will misread. GoatCounter has a setting that sets a flag in your
browser so your own visits are skipped. Do it once per browser and per
device, and do it before you post the link, not after.

Mine are in there too, from testing.

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
