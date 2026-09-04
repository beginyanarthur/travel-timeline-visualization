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

**Reorderable legs and hotels.** Each card has a six dot grip at the left of
its header. Dragging reorders the list, which reorders the trip, since a leg's
position is data. Cards renumber after a drag and after a delete; before this,
deleting Flight 1 left Flight 2 and Flight 3 with no Flight 1.

The grip does not toggle the card open, and an expanded card collapses when
you start dragging it, because a 400px tall card is unpleasant to drag.

**Card surface.** The web page uses `#F5FBFE`, a very pale blue, for the leg
and hotel cards, with the input fills staying white so a field still reads as
a field. Do not hardcode that value in the plugin: the panel follows Figma's
own theme, and a fixed light blue would be wrong in dark mode. Use the
equivalent Figma surface token instead, one step off the panel background.
