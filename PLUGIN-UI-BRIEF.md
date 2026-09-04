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

Six modes. `flight` and `train` keep their existing ids so trips exported
before this change still import.

| id | label | icon |
| --- | --- | --- |
| `flight` | Flight | ✈ (U+2708) |
| `train` | Train | 🚆 (U+1F686) |
| `bus` | Bus | 🚌 (U+1F68C) |
| `car` | Car | 🚗 (U+1F697) |
| `bike` | Bike | 🚲 (U+1F6B2) |
| `walk` | Walk | 🚶 (U+1F6B6) |

One table drives four things: the dropdown options, the card header text, the
small icon in the From/To route row, and the icon drawn on the generated
timeline. A seventh mode should be one new entry, not six edits.

## 2. Panel changes

**Tab label.** `✈ Flights` becomes `✈ Transport`. It has always covered
ground transport; the name did not.

**Dropdown.** Six options, each `<icon> <label>`, built from the table rather
than hardcoded.

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

- Six options make the dropdown taller than two did. Worth checking it does
  not overflow the 340px panel awkwardly when opened near the bottom.
- Card headers are now variable width: `Flight 1` is short, `Train 12` is
  longer. The header is `flex-shrink: 0` with the route summary beside it
  taking the remaining space and ellipsing, so the label never truncates.
- Bike and walk legs are typically minutes, not hours. On the generated
  timeline, at 24px per hour, a 20 minute walk is 8px wide. That is honest
  but nearly invisible, and may deserve a minimum width later.
