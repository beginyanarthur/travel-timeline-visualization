# Brief: transport modes in the Travel itinerary plugin panel

Changes already made in `src/ui.html` and `src/code.ts`. This describes them
so the plugin's Figma UI can be brought in line.

## Why

The panel had one dropdown with two options, `Flight` and `Train / bus`, but
the tab, every card header, the footer count and the validation alert all said
"Flight" regardless. Pick a bus and the whole panel insisted it was a flight.

Train and bus are also different things, and a real itinerary often contains
neither: a car transfer, a bike leg, a walk between two places.

## 1. The transport table

Seven modes. `flight` and `train` keep their existing ids so trips exported
before this change still import.

| id | label | icon |
| --- | --- | --- |
| `flight` | Flight | ✈️ (U+2708 U+FE0F) |
| `train` | Train | 🚆 (U+1F686) |
| `bus` | Bus | 🚌 (U+1F68C) |
| `boat` | Boat | 🚢 (U+1F6A2) |
| `car` | Car | 🚗 (U+1F697) |
| `bike` | Bike | 🚲 (U+1F6B2) |
| `walk` | Walk | 🚶 (U+1F6B6) |

The plane carries an explicit variation selector, `U+FE0F`. Without it
`U+2708` renders as a flat monochrome glyph and is the only icon in the set
not in colour. Do not strip it.

One table drives four things: the dropdown options, the card header text, the
small icon in the From/To route row, and the icon drawn on the generated
timeline. An eighth mode should be one new entry, not six edits.

## 2. Panel changes

**Tab label.** `✈ Flights` becomes `✈️ Transport`. It has always covered
ground transport; the name did not.

**Dropdown.** Seven options, each `<icon> <label>`, built from the table
rather than hardcoded.

**Card header.** Was always `Flight N`. It now reads the selected type:
`Flight 1`, `Train 2`, `Bus 3`, `Car 4`, `Bike 5`, `Walk 6`. It relabels the
moment the dropdown changes, alongside the route icon that already switched.

**Footer count.** Was `5 flight(s), 4 hotel(s)`. Now `5 legs, 4 hotels`, with
real singular and plural: `1 leg, 1 hotel`.

**Validation alert.** `Flight 2 needs departure and arrival dates` becomes
`Leg 2 needs departure and arrival dates`.

**Timezone shortcut.** Selecting a non-flight mode copies the departure UTC
offset to the arrival, because ground transport usually stays in one zone.
This previously fired only for `train`; it now fires for every mode except
`flight`. Still editable afterwards.

## 3. Generated output

The leg icon drawn on the timeline, at both the departure and arrival
columns, comes from the same table. It was a binary: flight or bus.

Nothing else about the drawing changes. Layout, colours, the day and night
rule, the transit shading and both legends are untouched.

## 4. What must not change

- The `TripData` JSON shape. Only the set of allowed values for `type` grows.
- The ids `flight` and `train`. Renaming either breaks every existing export.
- The two-tab structure, Transport and Hotels.

## 5. Design notes for the panel mock

- Seven options make the dropdown far taller than two did. Worth checking it
  does not overflow the 340px panel awkwardly when opened near the bottom.
- Card headers are now variable width: `Flight 1` is short, `Train 12` is
  longer. The header is `flex-shrink: 0` with the route summary beside it
  taking the remaining space and ellipsing, so the label never truncates.
- Bike and walk legs are typically minutes, not hours. On the generated
  timeline, at 24px per hour, a 20 minute walk is 8px wide. That is honest
  but nearly invisible, and may deserve a minimum width later.

## 6. Later changes, web page only so far

**Reorderable legs and hotels.** Each card has a three line grip at the left
of its header. Not a dot grid: dots are the drawing's own vocabulary,
one per hour, and a dot handle competes with that. Dragging reorders the list, which reorders the trip, since a leg's
position is data. Cards renumber after a drag and after a delete; before this,
deleting Flight 1 left Flight 2 and Flight 3 with no Flight 1.

The grip does not toggle the card open, and an expanded card collapses when
you start dragging it, because a 400px tall card is unpleasant to drag.

**Card surface.** The web page uses `#F5FBFE`, a very pale blue, for the leg
and hotel cards, with the input fills staying white so a field still reads as
a field. Do not hardcode that value in the plugin: the panel follows Figma's
own theme, and a fixed light blue would be wrong in dark mode. Use the
equivalent Figma surface token instead, one step off the panel background.

**Export is disabled while the panel is empty.** Exporting nothing produces a
file with an empty `legs` array, which imports as nothing. Import stays
enabled, since importing is how data gets in.

**Duration and arrival stay in agreement, both ways.** Editing the departure,
the duration or either zone recomputes the arrival, as before. Editing the
arrival date or time now recomputes the duration instead. An arrival earlier
than its departure says so rather than writing a negative duration.

**The reference field follows the mode.** Flights have flight numbers, trains
have train numbers, buses have routes, ferries have names. Car, bike and walk
have none, so the field is hidden and its value cleared, which stops a walk
carrying a flight number into the exported JSON.

## 7. Card layout, web page only so far

The card was drawn for a 340px panel and then stretched to the width of a
tablet, where a date field grew to 369px to hold ten characters. It read as
dense stacked rows and wasted space at once. Four changes, all worth copying
if the plugin panel ever gets a wider layout.

**The form has a maximum width.** 660px, centred, head and footer included.
A panel does not get better by being wider, only emptier. Irrelevant at 340px
in Figma, but it is why the web card stopped sprawling.

**Departure, duration and arrival are three named groups.** They were nine
loose fields separated by two hairlines. They stack chronologically when the
card is narrow and sit side by side once it is wider than about 470px, which
is where most of the height went. Hotels get the same shape for check in and
check out.

**Section headings outrank their field labels.** They were 8px uppercase
tertiary, the smallest and faintest text on a card, while labelling the
largest groups. They are now 11px semibold in the primary text colour. This
one is worth copying to the plugin as is: it costs nothing and the card stops
reading as one undifferentiated block.

**Duration has a heading of its own.** It used to sit unlabelled between
Departure and Arrival and read as part of Departure. Its two fields are now
`[4] h [50] min`, sized to two digits, rather than two more shouted labels
over two stretched inputs.

**The arrival note says only what the fields cannot.** It used to read
`→ 2026-09-04 at 9:20 AM (-2h tz)`, restating the arrival date and time from
the two fields directly above it. It now reads `Arrives the same day, 2 hours
behind.`, which is the part you cannot see anywhere else.

**Smaller things.** The colour swatch has a `Colour` label instead of being an
unexplained coloured block. The rule under the route plane is gone. Date and
time columns are sized to what they hold rather than split evenly, because
`06:30` needs far less room than `04.09.2026` and the year was disappearing
behind the calendar button in the narrow rail.

Copy note: the hotel headings read `Check in` and `Check out` rather than
`Check-in` and `Check-out`, in line with the no dashes rule.

## 8. Renameable legs, and field sizing for touch

**A leg can be renamed.** Click the card title and it becomes an input.
`Flight 1` becomes `Wizz to Hamburg`. A leg is the only card with no name
field of its own, so its title is the only place to put one; hotels already
have `Hotel name`, which is why they were left alone.

Rules that matter if the plugin copies this:

- A name the traveller typed outranks anything generated. Changing the type
  or reordering the list no longer relabels a renamed card.
- Clearing the field hands the name back to the automatic one, so there is
  always a way out of a bad name.
- Escape cancels, Enter and blur commit.
- The title no longer toggles the card open, but the rest of the header
  still does.

**JSON.** A leg gains an optional `label` string, written only when the
traveller named it, so an untouched export is byte for byte what it was and
reimporting does not freeze the automatic names. Old files without the key
import exactly as before. The plugin can ignore the key safely; the drawing
does not use it.

**Fields are 16px on touch.** iOS zooms the whole page in whenever you focus
a field smaller than 16px, and it does not zoom back out when you are done,
which left people stranded mid form. The fix is to size the fields properly:
16px text in 40px rows below 900px, the proportional face rather than the
mono one for dates and times so three fields still fit across a phone, and
rows that wrap rather than squeezing the date until the year hides behind the
calendar button. Below 380px the trip dates stack.

Capping `maximum-scale` in the viewport would also stop the zoom, by taking
pinch zoom away from everyone. That is not a trade worth making, and it fails
WCAG 1.4.4.

The Figma panel runs in a desktop webview, so the zoom problem does not
apply there. The 16px minimum is only worth copying if the panel ever runs on
a touch device.

## 9. One control scale, and a floor under the text

Buttons had been sized by whatever padding looked right at the time, so a
button's importance and its size had stopped matching. Everything is now
driven by a small set of tokens, and importance is the only thing that sets
size.

| Role | desktop | touch |
| --- | --- | --- |
| Primary, Generate | 36px / 13px | 52px / 16px, full width |
| Secondary, Add, Send feedback | 34px / 12.5px | 48px / 15px |
| Quiet, Export, Import, Clear | 30px / 11.5px | 44px / 13px |
| Tabs | 38px / 12px | 48px / 15px |

Every touch value clears 44px, which is the smallest target a finger can be
asked to hit. On a phone the primary action takes the whole width with the
status line above it, rather than sitting in a corner beside text nobody
taps.

The small controls were targets too, and worse than the big ones: the close
button was 20px, the zoom toolbar 26px, the drag grip 12px wide. Their hit
areas grew; the glyphs did not. The zoom toolbar is a full 44px on touch,
which it can afford because on a phone it sits above the canvas rather than
beside the sheet header, so it is not held to the 48px head the two share on
the desk. Below about 340px it wraps onto two rows rather than shortening its
labels.

One trap worth knowing if the plugin copies this. Padding will not enlarge an
`<svg>` while `box-sizing: border-box` is set globally, because the width and
height attributes pin the box and the padding is absorbed. The grip's hit area
lives on a wrapper span now, with the SVG left at 12x14 inside it.

**Text has a floor.** 9px field labels were legible on the desk they were
drawn on and nowhere else. Nothing is below 11px on desktop or 12px on touch,
set through `--fs-label`, `--fs-micro` and `--fs-small` so it stays that way.
Inputs are already 16px on touch for the zoom reason in section 8.


## 10. The Insights section, and the same three regressions

Arthur rebuilt the page: a title with the route across the top, three
sections in stroked containers, and **Insights** ahead of Timeline and Clock
Day carrying six stats and a mode summary. The web renderer now matches, and
the frame grew from 4931 x 1911 to 5367 x 3477 on the sample trip.

**Three things arrived behind the web page for the third time.** They are
easy to lose because they live in different parts of the file from whatever
is being worked on:

- `boat` missing from the type union and the icon table
- `flight: '\u2708'` without the `\uFE0F` that makes the plane render in
  colour rather than as a flat glyph
- the legend reading `Night (6pm - 5am)` and `Day (6am - 5pm)` while the code
  beside it says `hour < 6 || hour >= 21`, which is 9pm to 6am

The corrected values were kept, and the third one is now fixed at the root
rather than corrected again. See section 12.

**One difference worth knowing.** Figma measures each city name and advances
by its width to build the route line. The web draws the whole line as one
text node with the separator between names. Same result, less machinery, but
if you ever want per-city colouring the web version will need splitting.


## 11. The legend swatches, and why LEG_TEXT_X cannot follow PAD_LEFT

The new layout set `LEG_TEXT_X = PAD_LEFT - 2`, which put every legend label
underneath its own swatch: the dots struck through "Black" and "Gray", and the
colour bars struck through "Colored" and "Muted".

It was correct-looking and wrong. The swatches occupy `PAD_LEFT - 2` through
`PAD_LEFT + 40`, so the text has to clear `PAD_LEFT + 40`, not sit at
`PAD_LEFT`. The old value was a hardcoded 202 against a PAD_LEFT of 140,
which is an offset of 62, and that relationship is what actually mattered.

`LEG_TEXT_X = PAD_LEFT + 62` in both. It now moves with PAD_LEFT and keeps
22px of air past the widest swatch.

Worth remembering when the layout next moves: the legend has two columns, and
only one of them is anchored to PAD_LEFT.


## 12. Night is defined once

The legend used to restate the rule in prose, so the two could drift, and
they did three times. There is now a single definition at the top of both
files:

```
NIGHT_FROM = 21
NIGHT_TO   = 6
nightHour(h)  ->  h < NIGHT_TO || h >= NIGHT_FROM
```

The hour dots read it, the clock slices read it, and all four sentences about
it are built from it: both legend labels and both halves of the clock
paragraph. `hourLabel()` turns an hour into "9pm", and the ranges fall out of
the constants, the last night hour being the one before day begins.

Proved by moving it. Setting night to 22:00 and 07:00 and rebuilding changed
the legend to "Night (10pm - 6am)" and "Day (7am - 9pm)" with nothing else
touched, and the dark dots went from 9 a day to 9 a day at the new hours,
72 across the trip. Restored afterwards.

**Worth copying to the plugin exactly.** The prose is now generated, so
editing the words by hand puts the drift back.

---

## 13. The type scale

The drawing had grown fifteen text sizes: 7, 9, 10, 11, 12, 13, 14, 16, 18,
20, 22, 24, 36, 48, 80. None of the odd ones marked a decision. They were
nudges, each one a pixel or two from a neighbour, and 7 versus 9 or 11
versus 12 is a difference no reader can name. Alongside them sat five greys,
two of which, `#1F1F1F` and `#333333`, are eight percent apart and identical
to the eye.

Nine roles now, one weight pair, four inks. Both files declare them at the
top as `TYPE` and `INK`, and no `txt()` call anywhere passes a bare number.

| role | px | typical weight | ink | what wears it |
|---|---|---|---|---|
| `display` | 80 | Bold | `title` | the page title, once |
| `section` | 48 | Bold | `title` | Insights, Timeline, Clock Day |
| `figure` | 36 | Bold | `primary` | the value of a statistic |
| `lead` | 24 | Regular | `title` | the sentence under a section title, and the route |
| `icon` | 20 | Regular | `primary` | an emoji for a hotel or a mode of transport |
| `time` | 18 | Bold | leg colour | a departure or an arrival |
| `label` | 14 | Bold | `primary` / `muted` | names a thing: a city, a hotel, a day, a statistic |
| `meta` | 12 | either | `primary` / `secondary` | detail you read: legend, duration, flight number |
| `micro` | 9 | Regular | `muted` | chrome you glance at: offsets, check in and out, hour ticks |

```
INK.title      #000000   titles and the sentences under them
INK.primary    #333333   anything you are meant to read
INK.secondary  #666666   supporting detail
INK.muted      #999999   chrome
```

Two weights only, Inter Regular and Inter Bold. The plugin used to load
Medium and Semi Bold as well and never drew a character in either, so those
two `loadFontAsync` calls are gone.

Three inks stay outside the set on purpose, because they are painted on top
of something rather than on the page: `#BFBFBF` and `#FFFFFF` for the "00"
and "12" that sit inside a timeline dot, and the leg's own colour for a
departure time.

What moved, and why each merge is safe:

- 22 → `icon` 20. The hotel emoji joins the transport emoji. One icon size.
- 16 → `label` 14. "How to read" appears twice and nowhere else. At 14 Bold
  above 12 Regular it still reads as a heading; weight carries it.
- 13 → `label` 14. A timeline day label and a clock day label name the same
  thing, so they are now the same size.
- 11 → `meta` 12. Flight number and duration join the legend.
- 10 → `micro` 9. UTC offsets and the clock's a/p markers join check in and
  check out.
- 7 → `micro` 9. The hour ticks around the donut were the smallest thing on
  the page by two pixels. They were also placed by subtracting a flat 4 from
  x and y, which centres a two digit hour and leaves a one digit hour
  hanging, so the ring sat lopsided. They are centred on their own measured
  box now, `txtCentre` on the web and `label.x = lx - label.width / 2` in the
  plugin, and drawn in `muted` like the a/p markers they sit beside.
- `#1F1F1F` → `INK.primary`. Statistic values and the clock's "00"/"12".

Checked, not assumed. Rendering the sample trip and taking the bounding box
of all 351 text nodes gives zero text on text overlaps, 176 hour ticks with
none touching a donut ring, and the legend swatches still ending at 375 and
399 against text starting at 421.

**Every Y in the drawing is a hard-coded number,** so a size change is a
collision risk, which is how the hotel name going 11 → 14 once pushed its In
and Out lines from +46/+58 to +50/+63. Measure the boxes after changing a
size. Do not eyeball it.
