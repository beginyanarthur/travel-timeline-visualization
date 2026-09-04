const TOOL_ID = '235a1040-2c07-4d29-8fc2-de65d0af8173'
const DISPLAY_NAME = 'Travel itinerary'

// ── Types ──────────────────────────────────────────────────────────────
interface FlightLeg {
  type: 'flight' | 'train' | 'bus' | 'boat' | 'car' | 'bike' | 'walk'
  departureCity: string
  departureTime: string
  departureDate: string
  departureUtc: number
  flightNumber: string
  durationHours: number
  durationMinutes: number
  arrivalCity: string
  arrivalTime: string
  arrivalDate: string
  arrivalUtc: number
  color: string
}
interface Hotel {
  name: string
  checkInDate: string
  checkInTime: string
  checkOutDate: string
  checkOutTime: string
}
interface TripData {
  startDate: string
  endDate: string
  legs: FlightLeg[]
  hotels: Hotel[]
}
type Msg =
  | { type: 'generate'; data: TripData }
  | { type: 'resize'; height: number }

// ── Helpers ────────────────────────────────────────────────────────────
function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '')
  return { r: parseInt(h.slice(0, 2), 16) / 255, g: parseInt(h.slice(2, 4), 16) / 255, b: parseInt(h.slice(4, 6), 16) / 255 }
}
function sp(hex: string): SolidPaint { return { type: 'SOLID', color: hexToRgb(hex) } }
function spRgb(v: number): SolidPaint { return { type: 'SOLID', color: { r: v, g: v, b: v } } }

function localToAbsoluteMs(date: string, time: string, utcOffset: number): number {
  const [hStr, mStr] = time.split(':')
  const d = new Date(date + 'T00:00:00Z')
  d.setUTCHours(parseInt(hStr, 10) - utcOffset, parseInt(mStr, 10), 0, 0)
  return d.getTime()
}
function fmt12(time: string): string {
  const [hStr, mStr] = time.split(':')
  let h = parseInt(hStr, 10)
  const ap = h >= 12 ? 'p' : 'a'
  if (h > 12) h -= 12
  if (h === 0) h = 12
  return `${String(h).padStart(2, '0')}:${mStr}${ap}`
}
function fmtDur(hours: number, minutes: number): string {
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
}
function fmtUtc(offset: number): string {
  return `UTC${offset >= 0 ? '+' : ''}${offset}`
}
function dayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  const m = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  return `${m[d.getMonth()]} ${d.getDate()}`
}

// ── Layout ─────────────────────────────────────────────────────────────
const DOT = 22
const DOT_GAP = 2
const HOUR_W = DOT + DOT_GAP  // 24px per hour
const PAD_LEFT = 140

// Section 1: Timeline
const TIMELINE_TITLE_Y = 124
const TIMELINE_DESC_Y = 198
const HOTEL_TOP = 331
const _HOTEL_BOTTOM = 451
const TIMELINE_Y = 481
const LEG_TOP = 521
const _LEG_BOTTOM = 721

// Section 2: Clock Day
const CLOCK_DAY_TITLE_Y = 1064
const CLOCK_DAY_DESC_Y = 1138
const CLOCK_TOP = 1320
const CLOCK_D = 140
const CLOCK_GAP = 90

// Leg icons, keyed by transport type
const LEG_ICONS: { [k: string]: string } = {
  flight: '\u2708\uFE0F',
  train: '\u{1F686}',
  bus: '\u{1F68C}',
  boat: '\u{1F6A2}',
  car: '\u{1F697}',
  bike: '\u{1F6B2}',
  walk: '\u{1F6B6}',
}
function legIcon(type: string): string { return LEG_ICONS[type] || LEG_ICONS.flight }

// ── Clock zone icon vector paths (Material Design: clear_day & wb_twilight) ──
const ICON_SUNSET_PATH = 'M 6.86 2.48 C 6.73 2.35 6.67 2.19 6.67 2.0 L 6.67 0.67 C 6.67 0.48 6.73 0.32 6.86 0.19 C 6.99 0.06 7.14 0 7.33 0 C 7.52 0 7.68 0.06 7.81 0.19 C 7.94 0.32 8.0 0.48 8.0 0.67 L 8.0 2.0 C 8.0 2.19 7.94 2.35 7.81 2.48 C 7.68 2.6 7.52 2.67 7.33 2.67 C 7.14 2.67 6.99 2.6 6.86 2.48 Z M 10.63 4.03 C 10.51 3.91 10.45 3.76 10.45 3.58 C 10.45 3.39 10.51 3.23 10.63 3.1 L 11.57 2.15 C 11.7 2.02 11.86 1.95 12.04 1.95 C 12.23 1.95 12.38 2.02 12.52 2.15 C 12.64 2.27 12.7 2.43 12.7 2.62 C 12.7 2.81 12.64 2.96 12.52 3.08 L 11.57 4.03 C 11.44 4.16 11.29 4.22 11.1 4.22 C 10.91 4.22 10.76 4.16 10.63 4.03 Z M 12.67 8.0 C 12.48 8.0 12.32 7.94 12.19 7.81 C 12.06 7.68 12.0 7.52 12.0 7.33 C 12.0 7.14 12.06 6.99 12.19 6.86 C 12.32 6.73 12.48 6.67 12.67 6.67 L 14.0 6.67 C 14.19 6.67 14.35 6.73 14.48 6.86 C 14.6 6.99 14.67 7.14 14.67 7.33 C 14.67 7.52 14.6 7.68 14.48 7.81 C 14.35 7.94 14.19 8.0 14.0 8.0 L 12.67 8.0 Z M 6.86 14.48 C 6.73 14.35 6.67 14.19 6.67 14.0 L 6.67 12.67 C 6.67 12.48 6.73 12.32 6.86 12.19 C 6.99 12.06 7.14 12.0 7.33 12.0 C 7.52 12.0 7.68 12.06 7.81 12.19 C 7.94 12.32 8.0 12.48 8.0 12.67 L 8.0 14.0 C 8.0 14.19 7.94 14.35 7.81 14.48 C 7.68 14.6 7.52 14.67 7.33 14.67 C 7.14 14.67 6.99 14.6 6.86 14.48 Z M 3.1 4.03 L 2.15 3.1 C 2.02 2.97 1.95 2.81 1.95 2.62 C 1.95 2.43 2.02 2.27 2.15 2.15 C 2.27 2.03 2.43 1.97 2.62 1.97 C 2.81 1.97 2.96 2.03 3.08 2.15 L 4.03 3.1 C 4.16 3.22 4.22 3.38 4.22 3.57 C 4.22 3.76 4.16 3.91 4.03 4.03 C 3.9 4.16 3.74 4.22 3.57 4.22 C 3.39 4.22 3.23 4.16 3.1 4.03 Z M 11.57 12.52 L 10.63 11.57 C 10.51 11.43 10.45 11.28 10.45 11.09 C 10.45 10.91 10.51 10.76 10.63 10.63 C 10.76 10.51 10.91 10.45 11.09 10.45 C 11.28 10.45 11.43 10.51 11.57 10.63 L 12.52 11.57 C 12.65 11.69 12.71 11.84 12.71 12.03 C 12.7 12.22 12.64 12.38 12.52 12.52 C 12.38 12.65 12.22 12.72 12.03 12.72 C 11.84 12.72 11.69 12.65 11.57 12.52 Z M 0.67 8.0 C 0.48 8.0 0.32 7.94 0.19 7.81 C 0.06 7.68 0 7.52 0 7.33 C 0 7.14 0.06 6.99 0.19 6.86 C 0.32 6.73 0.48 6.67 0.67 6.67 L 2.0 6.67 C 2.19 6.67 2.35 6.73 2.48 6.86 C 2.6 6.99 2.67 7.14 2.67 7.33 C 2.67 7.52 2.6 7.68 2.48 7.81 C 2.35 7.94 2.19 8.0 2.0 8.0 L 0.67 8.0 Z M 2.15 12.52 C 2.03 12.39 1.97 12.24 1.97 12.05 C 1.97 11.86 2.03 11.71 2.15 11.58 L 3.1 10.63 C 3.22 10.51 3.38 10.45 3.56 10.45 C 3.74 10.45 3.9 10.51 4.03 10.63 C 4.17 10.77 4.23 10.93 4.23 11.11 C 4.23 11.29 4.17 11.45 4.03 11.58 L 3.1 12.52 C 2.97 12.65 2.81 12.72 2.62 12.72 C 2.43 12.72 2.27 12.65 2.15 12.52 Z M 4.5 10.17 C 3.72 9.39 3.33 8.44 3.33 7.33 C 3.33 6.22 3.72 5.28 4.5 4.5 C 5.28 3.72 6.22 3.33 7.33 3.33 C 8.44 3.33 9.39 3.72 10.17 4.5 C 10.94 5.28 11.33 6.22 11.33 7.33 C 11.33 8.44 10.94 9.39 10.17 10.17 C 9.39 10.94 8.44 11.33 7.33 11.33 C 6.22 11.33 5.28 10.94 4.5 10.17 Z M 9.22 9.22 C 9.74 8.69 10.0 8.07 10.0 7.33 C 10.0 6.6 9.74 5.97 9.22 5.45 C 8.69 4.93 8.07 4.67 7.33 4.67 C 6.6 4.67 5.97 4.93 5.45 5.45 C 4.93 5.97 4.67 6.6 4.67 7.33 C 4.67 8.07 4.93 8.69 5.45 9.22 C 5.97 9.74 6.6 10.0 7.33 10.0 C 8.07 10.0 8.69 9.74 9.22 9.22 Z'
const ICON_SUNSET_W = 14.67
const ICON_SUNSET_H = 14.67

const ICON_SUNRISE_PATH = 'M 11.87 2.17 C 11.99 2.29 12.05 2.44 12.05 2.63 C 12.05 2.82 11.99 2.98 11.87 3.1 L 11.38 3.58 C 11.25 3.72 11.09 3.78 10.91 3.78 C 10.73 3.78 10.57 3.72 10.43 3.58 C 10.3 3.45 10.24 3.29 10.24 3.11 C 10.25 2.93 10.32 2.77 10.45 2.63 L 10.93 2.15 C 11.07 2.03 11.23 1.97 11.41 1.98 C 11.59 1.98 11.74 2.04 11.87 2.17 Z M 0.67 10.67 C 0.48 10.67 0.32 10.6 0.19 10.48 C 0.06 10.35 0 10.19 0 10.0 C 0 9.81 0.06 9.65 0.19 9.53 C 0.32 9.4 0.48 9.33 0.67 9.33 L 12.67 9.33 C 12.86 9.33 13.01 9.4 13.14 9.53 C 13.27 9.65 13.33 9.81 13.33 10.0 C 13.33 10.19 13.27 10.35 13.14 10.48 C 13.01 10.6 12.86 10.67 12.67 10.67 L 0.67 10.67 Z M 7.14 0.19 C 7.27 0.32 7.33 0.48 7.33 0.67 L 7.33 1.33 C 7.33 1.52 7.27 1.68 7.14 1.81 C 7.01 1.94 6.86 2.0 6.67 2.0 C 6.48 2.0 6.32 1.94 6.19 1.81 C 6.06 1.68 6.0 1.52 6.0 1.33 L 6.0 0.67 C 6.0 0.48 6.06 0.32 6.19 0.19 C 6.32 0.06 6.48 0 6.67 0 C 6.86 0 7.01 0.06 7.14 0.19 Z M 1.5 2.13 C 1.62 2.01 1.78 1.95 1.97 1.95 C 2.16 1.95 2.31 2.01 2.43 2.13 L 2.92 2.62 C 3.05 2.75 3.12 2.91 3.12 3.09 C 3.12 3.28 3.05 3.43 2.92 3.57 C 2.78 3.69 2.62 3.75 2.43 3.75 C 2.24 3.75 2.09 3.68 1.97 3.55 L 1.48 3.07 C 1.36 2.93 1.3 2.78 1.31 2.59 C 1.31 2.41 1.38 2.26 1.5 2.13 Z M 3.62 6.67 L 9.72 6.67 C 9.46 6.07 9.06 5.58 8.52 5.22 C 7.97 4.85 7.36 4.67 6.67 4.67 C 5.98 4.67 5.36 4.85 4.82 5.22 C 4.27 5.58 3.87 6.07 3.62 6.67 Z M 2.0 8.0 C 2.0 6.7 2.45 5.6 3.36 4.69 C 4.26 3.79 5.37 3.33 6.67 3.33 C 7.97 3.33 9.07 3.79 9.98 4.69 C 10.88 5.6 11.33 6.7 11.33 8.0 L 2.0 8.0 Z'
const ICON_SUNRISE_W = 13.33
const ICON_SUNRISE_H = 10.67
const ZONE_ICON_BOX = 16  // logical bounding box for both icons

// Half-sunset icon (sun dipping below horizon, no rays) — used at 6pm (left)
const ICON_HALF_SUNSET_PATH = 'M 0.67 7.34 C 0.48 7.34 0.32 7.27 0.19 7.15 C 0.06 7.02 0 6.86 0 6.67 C 0 6.48 0.06 6.32 0.19 6.2 C 0.32 6.07 0.48 6 0.67 6 L 12.67 6 C 12.86 6 13.01 6.07 13.14 6.2 C 13.27 6.32 13.33 6.48 13.33 6.67 C 13.33 6.86 13.27 7.02 13.14 7.15 C 13.01 7.27 12.86 7.34 12.67 7.34 L 0.67 7.34 Z M 3.62 3.34 L 9.72 3.34 C 9.46 2.74 9.06 2.25 8.52 1.89 C 7.97 1.52 7.36 1.34 6.67 1.34 C 5.98 1.34 5.36 1.52 4.82 1.89 C 4.27 2.25 3.87 2.74 3.62 3.34 Z M 2 4.67 C 2 3.37 2.45 2.27 3.36 1.36 C 4.26 0.46 5.37 0 6.67 0 C 7.97 0 9.07 0.46 9.98 1.36 C 10.88 2.27 11.33 3.37 11.33 4.67 L 2 4.67 Z'
const ICON_HALF_SUNSET_W = 13.33
const ICON_HALF_SUNSET_H = 7.34

// Bedtime / crescent moon icon — used at midnight (top)
const ICON_BEDTIME_PATH = 'M 5.91 11.56 C 5.09 11.56 4.32 11.4 3.6 11.1 C 2.88 10.79 2.25 10.37 1.72 9.84 C 1.18 9.3 0.76 8.67 0.46 7.95 C 0.15 7.23 0 6.46 0 5.64 C 0 4.38 0.36 3.24 1.08 2.22 C 1.8 1.2 2.74 0.48 3.91 0.05 C 4.12 -0.03 4.31 -0.01 4.49 0.11 C 4.66 0.24 4.75 0.4 4.74 0.6 C 4.72 1.45 4.85 2.27 5.15 3.04 C 5.45 3.81 5.89 4.5 6.49 5.11 C 7.1 5.7 7.78 6.14 8.56 6.42 C 9.33 6.71 10.14 6.83 10.99 6.8 C 11.21 6.79 11.38 6.86 11.51 7.02 C 11.63 7.17 11.65 7.35 11.58 7.55 C 11.16 8.75 10.42 9.72 9.38 10.46 C 8.34 11.19 7.19 11.56 5.91 11.56 Z M 5.92 10.46 C 6.81 10.46 7.64 10.23 8.39 9.77 C 9.15 9.32 9.74 8.7 10.18 7.9 C 9.31 7.82 8.5 7.62 7.75 7.28 C 6.99 6.95 6.31 6.48 5.7 5.87 C 5.09 5.26 4.61 4.57 4.27 3.81 C 3.92 3.04 3.72 2.23 3.65 1.38 C 2.87 1.81 2.25 2.4 1.79 3.16 C 1.33 3.92 1.1 4.74 1.1 5.64 C 1.1 7.0 1.56 8.15 2.48 9.07 C 3.41 9.99 4.55 10.46 5.92 10.46 Z'
const ICON_BEDTIME_W = 11.62
const ICON_BEDTIME_H = 11.56
const ICON_BEDTIME_BOX = 14.67  // bounding box for bedtime icon

// Left-side arc (split open arc, hangs downward from left icon)
const SUN_ARC_LEFT_PATH = 'M 201.96 0 C 199.86 23.75 189.54 46.13 172.62 63.12 C 157.73 78.09 138.68 87.93 118.19 91.5 M 0 2.5 C 2.58 25.32 12.76 46.73 29.08 63.12 C 45.06 79.18 65.82 89.33 88 92.18'
const SUN_ARC_LEFT_H = 92.18

// Right-side arc (split open arc, flipped 180° to curve upward from right icon)
const SUN_ARC_RIGHT_PATH = 'M 201.96 0 C 199.86 23.75 189.54 46.13 172.62 63.12 C 156.83 79.0 136.36 89.1 114.46 92.08 M 0 2.5 C 2.58 25.32 12.76 46.73 29.08 63.12 C 44.57 78.69 64.55 88.7 85.96 91.9'
const SUN_ARC_RIGHT_H = 92.08

// Shared arc width
const SUN_ARC_W = 201.96

async function buildItinerary(data: TripData): Promise<FrameNode> {
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' })
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' })
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' })
  await figma.loadFontAsync({ family: 'Inter', style: 'Semi Bold' })

  // Use the first leg's departure timezone as the display timezone
  // so the dot timeline aligns with local times shown in labels
  const displayUtcOffset = data.legs.length > 0 ? data.legs[0].departureUtc : 0

  // t0 = midnight in the display timezone (not midnight UTC)
  const t0 = new Date(new Date(data.startDate + 'T00:00:00Z').getTime() - displayUtcOffset * 3600000)
  const t1End = new Date(new Date(data.endDate + 'T00:00:00Z').getTime() - displayUtcOffset * 3600000)
  t1End.setUTCDate(t1End.getUTCDate() + 1)
  const t1 = t1End
  const totalHours = Math.ceil((t1.getTime() - t0.getTime()) / 3600000)
  const numDays = Math.ceil(totalHours / 24)
  const W = PAD_LEFT + totalHours * HOUR_W + 183
  const clocksW = PAD_LEFT + numDays * (CLOCK_D + CLOCK_GAP)
  const totalW = Math.max(W, clocksW, 900)

  const root = figma.createFrame()
  root.name = 'Travel Itinerary'
  root.fills = [spRgb(1)]

  function xMs(ms: number): number {
    return PAD_LEFT + ((ms - t0.getTime()) / 3600000) * HOUR_W
  }

  async function txt(text: string, x: number, y: number, size: number, style: string, color: string): Promise<TextNode> {
    const t = figma.createText()
    t.fontName = { family: 'Inter', style }
    t.characters = text
    t.fontSize = size
    t.fills = [sp(color)]
    t.textAutoResize = 'WIDTH_AND_HEIGHT'
    root.appendChild(t)
    t.x = x
    t.y = y
    return t
  }

  function rect(x: number, y: number, w: number, h: number, fill: string): RectangleNode {
    const r = figma.createRectangle()
    r.resize(Math.max(1, w), Math.max(1, h))
    root.appendChild(r)
    r.x = x
    r.y = y
    r.fills = [sp(fill)]
    return r
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 1: TIMELINE
  // ═══════════════════════════════════════════════════════════════════════

  // Section title background
  rect(91, TIMELINE_TITLE_Y - 46, 1274, 201, '#F5FBFE')

  // Section title and description
  await txt('Timeline', PAD_LEFT - 1, TIMELINE_TITLE_Y, 48, 'Bold', '#000000')
  await txt('A linear hour-by-hour strip spanning the entire trip.', PAD_LEFT - 1, TIMELINE_DESC_Y, 24, 'Regular', '#000000')

  // ═══════════════════════════════════════════════════════════════════════
  // 1. HOURLY DOT TIMELINE
  // ═══════════════════════════════════════════════════════════════════════
  for (let day = 0; day <= numDays; day++) {
    const dayMs = t0.getTime() + day * 86400000
    if (dayMs > t1.getTime()) break
    // dayMs is midnight in the display timezone; convert to local date string
    const localDate = new Date(dayMs + displayUtcOffset * 3600000)
    const dStr = dayLabel(localDate.toISOString().slice(0, 10))
    const dx = xMs(dayMs)

    // Date label above the first dot of each day
    await txt(dStr, dx, TIMELINE_Y - 30, 13, 'Bold', '#333333')

    for (let hour = 0; hour < 24; hour++) {
      const hMs = dayMs + hour * 3600000
      if (hMs >= t1.getTime()) break

      const cx = xMs(hMs)
      const isNight = hour < 6 || hour >= 21  // 9pm–6am night, 6am–8pm day

      const dot = figma.createEllipse()
      dot.resize(DOT, DOT)
      root.appendChild(dot)
      dot.x = cx
      dot.y = TIMELINE_Y
      dot.fills = [spRgb(isNight ? 0.15 : 0.75)]

      // "00" label centered on midnight dot
      if (hour === 0) {
        const label = await txt('00', 0, 0, 9, 'Bold', '#BFBFBF')
        label.x = cx + DOT / 2 - label.width / 2
        label.y = TIMELINE_Y + DOT / 2 - label.height / 2
      }

      // "12" label centered on noon dot
      if (hour === 12) {
        const label = await txt('12', 0, 0, 9, 'Bold', '#FFFFFF')
        label.x = cx + DOT / 2 - label.width / 2
        label.y = TIMELINE_Y + DOT / 2 - label.height / 2
      }
    }
  }

  // ── Departure / Arrival marker dots on the timeline ──
  // Small colored dots overlaid on the hourly dots at each departure and arrival point
  const MARKER_DOT = 10
  const defColors = ['#E53935', '#FF9800', '#9C27B0', '#4CAF50', '#2196F3', '#795548']
  for (let i = 0; i < data.legs.length; i++) {
    const leg = data.legs[i]
    const depMs = localToAbsoluteMs(leg.departureDate, leg.departureTime, displayUtcOffset)
    const arrMs = localToAbsoluteMs(leg.arrivalDate, leg.arrivalTime, displayUtcOffset)
    const xOffset = -MARKER_DOT / 2  // center on the guide line position
    const markerY = TIMELINE_Y + DOT + 5    // just below the hourly dot row

    // Departure marker dot
    const depDot = figma.createEllipse()
    depDot.resize(MARKER_DOT, MARKER_DOT)
    root.appendChild(depDot)
    depDot.x = xMs(depMs) + xOffset
    depDot.y = markerY
    depDot.fills = [sp('#BFBFBF')]

    // Arrival marker dot (gray, matching guide lines)
    const arrDot = figma.createEllipse()
    arrDot.resize(MARKER_DOT, MARKER_DOT)
    root.appendChild(arrDot)
    arrDot.x = xMs(arrMs) + xOffset
    arrDot.y = markerY
    arrDot.fills = [sp('#BFBFBF')]
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 2. TRANSIT LEGS + CITY STAY LINES
  // Colored lines = time spent in city (arrival → next departure)
  // ═══════════════════════════════════════════════════════════════════════

  // Pre-compute absolute times and colors for each leg
  interface LegTimes { depMs: number; arrMs: number; col: string }
  // Position all events at their stated local time on the timeline,
  // regardless of timezone. This makes guide lines align with hour dots.
  // The duration label shows actual elapsed time; the timeline shows local experience.
  const legTimes: LegTimes[] = data.legs.map((leg, i) => ({
    depMs: localToAbsoluteMs(leg.departureDate, leg.departureTime, displayUtcOffset),
    arrMs: localToAbsoluteMs(leg.arrivalDate, leg.arrivalTime, displayUtcOffset),
    col: leg.color || defColors[i % defColors.length]
  }))

  // Draw transit/commute lines: from leg[i].departure to leg[i].arrival (muted color)
  for (let i = 0; i < legTimes.length; i++) {
    const transitStart = legTimes[i].depMs
    const transitEnd = legTimes[i].arrMs
    if (transitEnd > transitStart) {
      const sx = xMs(transitStart)
      const ex = xMs(transitEnd)
      const r = figma.createRectangle()
      r.resize(Math.max(4, ex - sx), 4)
      root.appendChild(r)
      r.x = sx
      r.y = LEG_TOP + 4
      r.fills = [{ type: 'SOLID', color: hexToRgb(legTimes[i].col), opacity: 0.4 } as SolidPaint]
    }
  }

  // Draw city-stay colored lines: from leg[i].arrival to leg[i+1].departure (solid color)
  for (let i = 0; i < legTimes.length - 1; i++) {
    const stayStart = legTimes[i].arrMs
    const stayEnd = legTimes[i + 1].depMs
    if (stayEnd > stayStart) {
      const sx = xMs(stayStart)
      const ex = xMs(stayEnd)
      rect(sx, LEG_TOP + 4, Math.max(4, ex - sx), 4, legTimes[i].col)
    }
  }

  // Helper: vertical guide line (#BFBFBF gray)
  function vLine(x: number, yStart: number, height: number): void {
    const v = figma.createVector()
    v.vectorPaths = [{ windingRule: 'NONZERO', data: `M 0.5 0.5 L 0.5 ${height + 0.5}` }]
    v.resize(0.01, height)
    root.appendChild(v)
    v.x = x
    v.y = yStart
    v.strokes = [{ type: 'SOLID', color: hexToRgb('#BFBFBF') }]
    v.strokeWeight = 1
    v.strokeCap = 'ROUND' as StrokeCap
    v.fills = []
  }

  // Helper: bracket from departure to arrival — horizontal then rounded corner then vertical
  function bracket(depX: number, arrLabelX: number, yStart: number, height: number): void {
    const w = arrLabelX - depX
    if (w < 5) return
    const r = Math.min(10, w * 0.08) // corner radius (~10px)
    const pathData = `M 0.5 0.5 L ${w - r + 0.5} 0.5 C ${w + 0.5} 0.5 ${w + 0.5} ${r + 0.5} ${w + 0.5} ${r + 0.5} L ${w + 0.5} ${height + 0.5}`
    const v = figma.createVector()
    v.vectorPaths = [{ windingRule: 'NONZERO', data: pathData }]
    v.resize(Math.max(1, w), height)
    root.appendChild(v)
    v.x = depX
    v.y = yStart
    v.strokes = [{ type: 'SOLID', color: hexToRgb('#BFBFBF') }]
    v.strokeWeight = 1
    v.strokeCap = 'ROUND' as StrokeCap
    v.fills = []
  }

  const LINE_TOP = LEG_TOP - 8   // vertical lines start just above the info area
  const LINE_H = 152              // height of vertical guide lines
  const MIN_LABEL_GAP = 120       // minimum px between departure and arrival label columns

  const LABEL_OFFSET = 10 // space between guide line and labels
  const ARR_COL_WIDTH = 130 // approximate width needed for arrival label column

  // Draw transit info labels + vertical guide lines + brackets for each leg
  for (let i = 0; i < data.legs.length; i++) {
    const leg = data.legs[i]
    const col = legTimes[i].col
    const x1 = xMs(legTimes[i].depMs)   // departure position on timeline
    const x2 = xMs(legTimes[i].arrMs)   // arrival position on timeline
    const arrLabelX = Math.max(x2, x1 + MIN_LABEL_GAP) // arrival label position (with min gap)

    // Check if arrival labels would overlap with next leg's departure labels
    const nextDepX = i < data.legs.length - 1 ? xMs(legTimes[i + 1].depMs) : Infinity
    const drawArrivalLabels = (arrLabelX + ARR_COL_WIDTH) < nextDepX

    // Departure vertical guide line
    vLine(x1, LINE_TOP, LINE_H)

    // Bracket connecting departure to arrival (horizontal → corner → vertical)
    bracket(x1, arrLabelX, LINE_TOP, LINE_H - 20)

    // ── Departure column (labels offset right of guide line) ──
    const depLblX = x1 + LABEL_OFFSET
    let dy = LEG_TOP + 16
    await txt(leg.departureCity, depLblX, dy, 14, 'Bold', '#333333')
    dy += 20
    await txt(fmt12(leg.departureTime), depLblX, dy, 18, 'Bold', col)
    dy += 24
    await txt(fmtUtc(leg.departureUtc), depLblX, dy, 10, 'Regular', '#999999')
    dy += 18
    const depIcon = legIcon(leg.type)
    await txt(depIcon, depLblX, dy, 20, 'Regular', '#333333')
    dy += 28
    if (leg.flightNumber) {
      await txt(leg.flightNumber, depLblX, dy, 11, 'Bold', '#333333')
      dy += 16
    }
    await txt(`Duration ${fmtDur(leg.durationHours, leg.durationMinutes)}`, depLblX, dy, 11, 'Regular', '#666666')

    // ── Arrival column (labels offset right of bracket end) ──
    // Only draw if there's enough space before the next leg's departure column
    if (drawArrivalLabels) {
      const arrLblX = arrLabelX + LABEL_OFFSET
      let ay = LEG_TOP + 16
      await txt(leg.arrivalCity, arrLblX, ay, 14, 'Bold', col)
      ay += 20
      await txt(fmt12(leg.arrivalTime), arrLblX, ay, 18, 'Bold', '#333333')
      ay += 24
      await txt(fmtUtc(leg.arrivalUtc), arrLblX, ay, 10, 'Regular', '#999999')
      ay += 18
      const arrIcon = legIcon(leg.type)
      await txt(arrIcon, arrLblX, ay, 20, 'Regular', '#333333')
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 3. HOTELS — icon + name above timeline with dashed connector line
  // ═══════════════════════════════════════════════════════════════════════
  for (const hotel of data.hotels) {
    // Treat hotel times as display-timezone local times
    const ciMs = localToAbsoluteMs(hotel.checkInDate, hotel.checkInTime, displayUtcOffset)
    const coMs = localToAbsoluteMs(hotel.checkOutDate, hotel.checkOutTime, displayUtcOffset)
    const hx = xMs(ciMs)
    const hx2 = xMs(coMs)

    // Solid vertical connector from near hotel icon top down to just above timeline
    const connH = TIMELINE_Y - HOTEL_TOP - 14  // ~136px
    const connLine = figma.createVector()
    connLine.vectorPaths = [{ windingRule: 'NONZERO', data: `M 0.5 0.5 L 0.5 ${connH + 0.5}` }]
    connLine.resize(0.01, connH)
    root.appendChild(connLine)
    connLine.x = hx + 10
    connLine.y = HOTEL_TOP + 4
    connLine.strokes = [{ type: 'SOLID', color: hexToRgb('#BFBFBF') }]
    connLine.strokeWeight = 1
    connLine.strokeCap = 'ROUND' as StrokeCap
    connLine.fills = []

    // Horizontal dashed line from check-in to checkout, at bottom of vertical connector
    const hotelLineY = TIMELINE_Y - 10
    const hotelLineW = hx2 - (hx + 10)
    if (hotelLineW > 0) {
      const hLine = figma.createVector()
      hLine.vectorPaths = [{ windingRule: 'NONZERO', data: `M 0.5 0.5 L ${hotelLineW + 0.5} 0.5` }]
      hLine.resize(hotelLineW, 0.01)
      root.appendChild(hLine)
      hLine.x = hx + 10
      hLine.y = hotelLineY
      hLine.strokes = [{ type: 'SOLID', color: hexToRgb('#BFBFBF') }]
      hLine.strokeWeight = 1
      hLine.fills = []
      hLine.dashPattern = [2, 2]
    }

    // Endpoint dots on the hotel dashed line (check-in and checkout markers)
    const hotelDotSize = 10
    const hotelDotY = hotelLineY - 5
    const ciDot = figma.createEllipse()
    ciDot.resize(hotelDotSize, hotelDotSize)
    root.appendChild(ciDot)
    ciDot.x = (hx + 10) - hotelDotSize / 2
    ciDot.y = hotelDotY
    ciDot.fills = [sp('#BFBFBF')]
    const coDot = figma.createEllipse()
    coDot.resize(hotelDotSize, hotelDotSize)
    root.appendChild(coDot)
    coDot.x = hx2 - hotelDotSize / 2
    coDot.y = hotelDotY
    coDot.fills = [sp('#BFBFBF')]

    // Hotel icon + text aligned at same x, right of connector line
    const hotelTextX = hx + 18
    await txt('\u{1F3E8}', hotelTextX, HOTEL_TOP, 22, 'Regular', '#333333')
    const nameNode = await txt(hotel.name, hotelTextX, HOTEL_TOP + 30, 11, 'Regular', '#333333')
    nameNode.textAutoResize = 'WIDTH_AND_HEIGHT'

    // Check-in / check-out times
    await txt(`In ${fmt12(hotel.checkInTime)}`, hotelTextX, HOTEL_TOP + 46, 9, 'Regular', '#999999')
    await txt(`Out ${fmt12(hotel.checkOutTime)}`, hotelTextX, HOTEL_TOP + 58, 9, 'Regular', '#999999')
  }

  // ═══════════════════════════════════════════════════════════════════════
  // TIMELINE LEGEND — "How to read" section for the timeline
  // ═══════════════════════════════════════════════════════════════════════
  const tlLegY = LEG_TOP + 230  // Timeline legend Y position
  const LEG_TEXT_X = 202  // all legend text labels aligned here
  await txt('How to read', PAD_LEFT - 1, tlLegY, 16, 'Bold', '#333333')

  // Two small dots (dark + light) representing night and day hours
  const dotDark = figma.createEllipse()
  dotDark.resize(7, 7)
  dotDark.name = 'An hour am'
  const dotLight = figma.createEllipse()
  dotLight.resize(7, 7)
  dotLight.name = 'An hour am'
  root.appendChild(dotDark)
  root.appendChild(dotLight)
  dotDark.x = PAD_LEFT - 1
  dotDark.y = tlLegY + 40
  dotDark.fills = [spRgb(0.02)]
  dotLight.x = PAD_LEFT + 7
  dotLight.y = tlLegY + 40
  dotLight.fills = [spRgb(0.85)]
  const grp = figma.group([dotDark, dotLight], root)
  grp.name = 'Group 141'
  const legendText = await txt('Each circle represents 1 hour', LEG_TEXT_X, tlLegY + 35, 12, 'Regular', '#333333')
  const boldStart = 'Each circle represents '.length
  legendText.setRangeFontName(boldStart, legendText.characters.length, { family: 'Inter', style: 'Bold' })

  const dotNight = figma.createEllipse()
  dotNight.resize(18, 18)
  root.appendChild(dotNight)
  dotNight.x = PAD_LEFT - 2
  dotNight.y = tlLegY + 57
  dotNight.fills = [spRgb(0.12)]
  const nightLabel = await txt('Black = Night (9pm - 5am)', LEG_TEXT_X, tlLegY + 59, 12, 'Regular', '#333333')
  nightLabel.setRangeFontName('Black = '.length, 'Black = Night'.length, { family: 'Inter', style: 'Bold' })

  const dotDay = figma.createEllipse()
  dotDay.resize(18, 18)
  root.appendChild(dotDay)
  dotDay.x = PAD_LEFT - 2
  dotDay.y = tlLegY + 81
  dotDay.fills = [spRgb(0.75)]
  const dayLabel2 = await txt('Gray = Day (6am - 8pm)', LEG_TEXT_X, tlLegY + 83, 12, 'Regular', '#333333')
  dayLabel2.setRangeFontName('Gray = '.length, 'Gray = Day'.length, { family: 'Inter', style: 'Bold' })

  // Colored segments legend (solid = city stay)
  rect(PAD_LEFT, tlLegY + 112, 40, 4, '#E53935')
  const colorLabel = await txt('Colored segments = Staying in the city', LEG_TEXT_X, tlLegY + 106, 12, 'Regular', '#333333')
  colorLabel.setRangeFontName('Colored segments = '.length, colorLabel.characters.length, { family: 'Inter', style: 'Bold' })

  // Muted segments legend (transit/commute)
  const mutedRect = figma.createRectangle()
  mutedRect.resize(40, 4)
  root.appendChild(mutedRect)
  mutedRect.x = PAD_LEFT
  mutedRect.y = tlLegY + 133
  mutedRect.fills = [{ type: 'SOLID', color: hexToRgb('#E53935'), opacity: 0.4 } as SolidPaint]
  const mutedLabel = await txt('Muted color = In transit / commute', LEG_TEXT_X, tlLegY + 127, 12, 'Regular', '#333333')
  mutedLabel.setRangeFontName('Muted color = '.length, mutedLabel.characters.length, { family: 'Inter', style: 'Bold' })

  // ═══════════════════════════════════════════════════════════════════════
  // SECTION 2: CLOCK DAY
  // ═══════════════════════════════════════════════════════════════════════

  // Section title background
  rect(91, CLOCK_DAY_TITLE_Y - 56, 1274, 201, '#F5FBFE')

  // Section title and description
  await txt('Clock Day', PAD_LEFT - 1, CLOCK_DAY_TITLE_Y, 48, 'Bold', '#000000')
  await txt('A 24-hour donut chart representing one calendar day.', PAD_LEFT - 1, CLOCK_DAY_DESC_Y, 24, 'Regular', '#000000')

  // ═══════════════════════════════════════════════════════════════════════
  // 4. DAILY CLOCK DIAGRAMS
  // ═══════════════════════════════════════════════════════════════════════
  for (let day = 0; day < numDays; day++) {
    const dayMs = t0.getTime() + day * 86400000
    const localDate2 = new Date(dayMs + displayUtcOffset * 3600000)
    const dStr = dayLabel(localDate2.toISOString().slice(0, 10))
    const cx = PAD_LEFT + day * (CLOCK_D + CLOCK_GAP)
    const cy = CLOCK_TOP + 30

    // All positions relative to cy (donut top edge)
    // Date label — centered above clock (month Regular, day number Bold)
    const dateLabel = await txt(dStr, cx + CLOCK_D / 2 - 20, cy - 81, 14, 'Regular', '#333333')
    const spaceIdx = dStr.indexOf(' ')
    if (spaceIdx >= 0) {
      dateLabel.setRangeFontName(spaceIdx, dStr.length, { family: 'Inter', style: 'Bold' })
    }

    // "00" centered above clock
    await txt('00', cx + CLOCK_D / 2 - 8, cy - 61, 12, 'Bold', '#1F1F1F')

    // p/a labels at TOP (flanking center, above the donut)
    await txt('p', cx + CLOCK_D / 2 - 12, cy - 31, 10, 'Regular', '#999999')
    await txt('a', cx + CLOCK_D / 2 + 5, cy - 31, 10, 'Regular', '#999999')

    // p/a labels at BOTTOM (flanking center, below the donut)
    await txt('p', cx + CLOCK_D / 2 - 12, cy + CLOCK_D + 12, 10, 'Regular', '#999999')
    await txt('a', cx + CLOCK_D / 2 + 5, cy + CLOCK_D + 12, 10, 'Regular', '#999999')

    // "12" centered below clock
    await txt('12', cx + CLOCK_D / 2 - 7, cy + CLOCK_D + 42, 12, 'Bold', '#1F1F1F')

    // Determine city-stay hours (arrival of leg[i] → departure of leg[i+1])
    const stayHours: Map<number, string> = new Map()
    for (let li = 0; li < legTimes.length - 1; li++) {
      const stayStart = legTimes[li].arrMs
      const stayEnd = legTimes[li + 1].depMs
      const stayCol = legTimes[li].col
      for (let hour = 0; hour < 24; hour++) {
        const hs = dayMs + hour * 3600000
        if (hs < stayEnd && hs + 3600000 > stayStart) stayHours.set(hour, stayCol)
      }
    }

    // Determine transit/commute hours (departure of leg[i] → arrival of leg[i])
    const transitHours: Map<number, string> = new Map()
    for (let li = 0; li < legTimes.length; li++) {
      const transitStart = legTimes[li].depMs
      const transitEnd = legTimes[li].arrMs
      const transitCol = legTimes[li].col
      for (let hour = 0; hour < 24; hour++) {
        const hs = dayMs + hour * 3600000
        if (hs < transitEnd && hs + 3600000 > transitStart) transitHours.set(hour, transitCol)
      }
    }

    // 24 pie slices (donut)
    // Priority: city stay (solid color) > transit (muted color) > night/day
    for (let hour = 0; hour < 24; hour++) {
      const sa = (hour / 24) * 2 * Math.PI - Math.PI / 2
      const ea = ((hour + 1) / 24) * 2 * Math.PI - Math.PI / 2
      const slice = figma.createEllipse()
      slice.resize(CLOCK_D, CLOCK_D)
      root.appendChild(slice)
      slice.x = cx
      slice.y = cy
      slice.arcData = { startingAngle: sa, endingAngle: ea, innerRadius: 0.35 }

      if (stayHours.has(hour)) {
        slice.fills = [sp(stayHours.get(hour)!)]
      } else if (transitHours.has(hour)) {
        // Transit/commute: leg color at 40% opacity (muted to distinguish from city stay)
        slice.fills = [{ type: 'SOLID', color: hexToRgb(transitHours.get(hour)!), opacity: 0.4 } as SolidPaint]
      } else {
        const isNight = hour < 6 || hour >= 21  // 9pm–6am night, 6am–8pm day
        slice.fills = [spRgb(isNight ? 0.12 : 0.75)]
      }
    }

    // Hour number labels around the clock perimeter
    // 24-hour clock: 00 at top (already placed), 12 at bottom (already placed)
    // am hours 1-11 on the right side, pm hours 1-11 on the left side
    const clockCenterX = cx + CLOCK_D / 2
    const clockCenterY = cy + CLOCK_D / 2
    const labelRadius = CLOCK_D / 2 + 10  // just outside the donut
    for (let h = 1; h <= 23; h++) {
      if (h === 12) continue  // "12" already placed separately
      const displayNum = h > 12 ? h - 12 : h
      const angle = (h / 24) * 2 * Math.PI - Math.PI / 2
      const lx = clockCenterX + labelRadius * Math.cos(angle)
      const ly = clockCenterY + labelRadius * Math.sin(angle)
      const label = await txt(String(displayNum), lx - 4, ly - 4, 7, 'Regular', '#000000')
      label.textAutoResize = 'WIDTH_AND_HEIGHT'
    }

    // Vertical center line through the donut (midnight/noon divider)
    const centerLineX = cx + CLOCK_D / 2
    const centerLineTop = cy - 26           // starts above top p/a labels
    const centerLineBot = cy + CLOCK_D + 23 // ends just above "12" label
    const cLine = figma.createVector()
    cLine.vectorPaths = [{ windingRule: 'NONZERO', data: `M 0 0 L 0 ${centerLineBot - centerLineTop}` }]
    cLine.resize(0.01, centerLineBot - centerLineTop)
    root.appendChild(cLine)
    cLine.x = centerLineX
    cLine.y = centerLineTop
    cLine.strokes = [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }]
    cLine.strokeWeight = 2
    cLine.strokeCap = 'ROUND' as StrokeCap
    cLine.fills = []

    // ── Clock decoration: 4 zone icons + 2 sun arcs ──
    // Sun cycle: moon (top/midnight) → sunrise (right/6am) → full sun (bottom/noon) → sunset (left/6pm)
    const zoneIconColor: SolidPaint = spRgb(0.6)
    const arcStroke: SolidPaint = { type: 'SOLID', color: { r: 0.867, g: 0.867, b: 0.867 }, opacity: 0.867 } as SolidPaint

    // LEFT (6pm): Half-sunset icon — sun dipping below horizon
    const sunsetVec = figma.createVector()
    sunsetVec.vectorPaths = [{ windingRule: 'NONZERO', data: ICON_HALF_SUNSET_PATH }]
    sunsetVec.resize(ICON_HALF_SUNSET_W, ICON_HALF_SUNSET_H)
    root.appendChild(sunsetVec)
    sunsetVec.x = cx - 41 + (ZONE_ICON_BOX - ICON_HALF_SUNSET_W) / 2
    sunsetVec.y = clockCenterY - ICON_HALF_SUNSET_H / 2
    sunsetVec.fills = [zoneIconColor]
    sunsetVec.strokes = []

    // RIGHT (6am): Sunrise icon (wb_twilight — sun on horizon with rays)
    const sunriseVec = figma.createVector()
    sunriseVec.vectorPaths = [{ windingRule: 'NONZERO', data: ICON_SUNRISE_PATH }]
    sunriseVec.resize(ICON_SUNRISE_W, ICON_SUNRISE_H)
    root.appendChild(sunriseVec)
    sunriseVec.x = cx + CLOCK_D + 22 + (ZONE_ICON_BOX - ICON_SUNRISE_W) / 2
    sunriseVec.y = clockCenterY - ICON_SUNRISE_H / 2
    sunriseVec.fills = [zoneIconColor]
    sunriseVec.strokes = []

    // BOTTOM (12pm/noon): Full sun icon (clear_day — sun with all rays)
    const noonVec = figma.createVector()
    noonVec.vectorPaths = [{ windingRule: 'NONZERO', data: ICON_SUNSET_PATH }]
    noonVec.resize(ICON_SUNSET_W, ICON_SUNSET_H)
    root.appendChild(noonVec)
    noonVec.x = clockCenterX - ICON_SUNSET_W / 2
    noonVec.y = cy + CLOCK_D + 25
    noonVec.fills = [zoneIconColor]
    noonVec.strokes = []

    // TOP (midnight): Bedtime / crescent moon icon with bounding box
    const bedtimeBBox = figma.createRectangle()
    bedtimeBBox.name = 'Bounding box'
    bedtimeBBox.resize(ICON_BEDTIME_BOX, ICON_BEDTIME_BOX)
    bedtimeBBox.fills = []
    root.appendChild(bedtimeBBox)
    bedtimeBBox.x = clockCenterX - ICON_BEDTIME_BOX / 2
    bedtimeBBox.y = cy - 44

    const moonVec = figma.createVector()
    moonVec.name = 'bedtime'
    moonVec.vectorPaths = [{ windingRule: 'NONZERO', data: ICON_BEDTIME_PATH }]
    moonVec.resize(ICON_BEDTIME_W, ICON_BEDTIME_H)
    root.appendChild(moonVec)
    moonVec.x = clockCenterX - ICON_BEDTIME_BOX / 2 + (ICON_BEDTIME_BOX - ICON_BEDTIME_W) / 2
    moonVec.y = cy - 44 + (ICON_BEDTIME_BOX - ICON_BEDTIME_H) / 2
    moonVec.fills = [zoneIconColor]
    moonVec.strokes = []

    // LEFT ARC: split open arc hanging downward from left icon
    const leftArcX = cx - 41 + (ZONE_ICON_BOX - ICON_HALF_SUNSET_W) / 2 + ICON_HALF_SUNSET_W / 2
    const leftArc = figma.createVector()
    leftArc.vectorPaths = [{ windingRule: 'NONE', data: SUN_ARC_LEFT_PATH }]
    leftArc.resize(SUN_ARC_W, SUN_ARC_LEFT_H)
    root.appendChild(leftArc)
    leftArc.x = leftArcX
    leftArc.y = clockCenterY + 9
    leftArc.fills = []
    leftArc.strokes = [arcStroke]
    leftArc.strokeWeight = 1

    // RIGHT ARC: split open arc curving upward from right icon (flipped 180°)
    const rightArcX = leftArcX + SUN_ARC_W
    const rightArcY = clockCenterY - 11
    const rightArc = figma.createVector()
    rightArc.vectorPaths = [{ windingRule: 'NONE', data: SUN_ARC_RIGHT_PATH }]
    rightArc.resize(SUN_ARC_W, SUN_ARC_RIGHT_H)
    root.appendChild(rightArc)
    rightArc.fills = []
    rightArc.strokes = [arcStroke]
    rightArc.strokeWeight = 1
    // Flip 180° so the arc curves upward from the right icon
    rightArc.relativeTransform = [
      [-1, 0, rightArcX],
      [0, -1, rightArcY]
    ]
  }

  // ═══════════════════════════════════════════════════════════════════════
  // CLOCK DAY LEGEND — "How to read" section for the clock diagrams
  // ═══════════════════════════════════════════════════════════════════════
  const clLegY = CLOCK_TOP + 30 + CLOCK_D + 114  // Clock Day legend Y position
  await txt('How to read', PAD_LEFT - 1, clLegY, 16, 'Bold', '#333333')

  // Descriptive paragraph with mixed bold formatting
  const clockLegendText = `Each of the 24 pie slices is one hour:  Dark slices for nighttime (9 pm–5 am), light Gray for daytime (6 am–8 pm). Colored slices overlay the hours you're staying in a city, so you can see at a glance how much of each day is spent in transit versus on the ground.   Sun-cycle icons (moon → sunrise → sun → sunset) and connecting arcs around the perimeter reinforce the day/night orientation, while a vertical center line divides the AM and PM halves.`
  const clPara = figma.createText()
  clPara.fontName = { family: 'Inter', style: 'Regular' }
  clPara.characters = clockLegendText
  clPara.fontSize = 12
  clPara.fills = [sp('#000000')]
  clPara.textAutoResize = 'NONE'
  clPara.resize(351, 10)
  root.appendChild(clPara)
  clPara.x = PAD_LEFT - 1
  clPara.y = clLegY + 33

  // Apply bold ranges
  const boldRanges: Array<[string, string]> = [
    ['Dark slices', 'Dark slices'],
    ['light', 'light'],
    ['Gray', 'Gray'],
    ['Colored slices', 'Colored slices'],
    ['Sun-cycle', 'Sun-cycle'],
  ]
  for (const [search] of boldRanges) {
    const idx = clockLegendText.indexOf(search)
    if (idx >= 0) {
      clPara.setRangeFontName(idx, idx + search.length, { family: 'Inter', style: 'Bold' })
    }
  }

  // Resize frame to fit — fixed offset from clock legend position
  const totalH = clLegY + 307
  root.resize(totalW, totalH)

  return root
}

// ── Plugin entry ───────────────────────────────────────────────────────
figma.root.setRelaunchData({ [TOOL_ID]: DISPLAY_NAME })
figma.showUI(__html__, { width: 340, height: 600 })

figma.ui.onmessage = async (msg: Msg) => {
  if (msg.type === 'resize') {
    figma.ui.resize(340, Math.max(120, Math.min(900, Math.round(msg.height))))
    return
  }
  if (msg.type === 'generate') {
    try {
      figma.notify('Generating itinerary...', { timeout: 2000 })
      const frame = await buildItinerary(msg.data)
      frame.setRelaunchData({ [TOOL_ID]: DISPLAY_NAME })
      figma.currentPage.selection = [frame]
      figma.viewport.scrollAndZoomIntoView([frame])
      figma.notify('Itinerary created!')
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      figma.notify(message, { error: true })
      throw err
    }
  }
}
