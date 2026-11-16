import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'

// A port of the live-streaming slides' canvas rain (assets/js/lib/digital-rain.ts)
// at its locked settings: dense, speed 1.9, trail 10, opacity 0.70, no head glow,
// mixed gold/teal. A scene runs no script, so the columns are laid out once
// here and animated with CSS.

const W = 1920
const H = 1080
const BG = '#0E2228'

const PALETTES = {
  gold: { head: '#F9EEB2', trail: '#E3A92B' },
  teal: { head: '#BEF5EE', trail: '#0E9E91' },
}
const KATA = [...'サクスキンセゾラセゾスキンクサシマ']
const TIERS = [
  { s: 24, b: 1.0 },
  { s: 17, b: 0.78 },
  { s: 12, b: 0.55 },
]
const LOCKED = { gap: [12, 20] as const, speedMax: 1.9, trail: 10, opacity: 0.7 }

// Seeded so every reload draws the same field.
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const r2 = (n: number) => Math.round(n * 100) / 100

// As in the slides, each column glides down and its glyphs change as it falls:
// every step, each glyph moves down one place in the trail and a new one
// appears at the head. A scene runs no script, so each place in the trail is a
// short row of glyphs, and the rows slide sideways one glyph per step behind a
// window one glyph wide. Each row is the one above it, one glyph behind, so the
// glyphs trickle down the trail. CSS transforms only: no SMIL, masks or filters.
const CYCLE = 5

function buildScene(): string {
  const rand = rng(0x7c3a)
  const glyph = () => KATA[Math.floor(rand() * KATA.length)] ?? 'サ'

  const tiers = TIERS.map((tier, ti) => {
    const s = tier.s
    const t = Math.max(5, Math.round(LOCKED.trail * (s / 17)))
    const xs = Array.from({ length: CYCLE }, (_, k) => k * s).join(' ')
    return { ...tier, ti, t, xs, d: H + (t + 1) * s }
  })

  const cols: string[] = []
  let x = 8

  while (x < W) {
    const r = rand()
    const tr = r < 0.22 ? tiers[0]! : r < 0.55 ? tiers[1]! : tiers[2]!
    const s = tr.s
    const f = 0.4 + rand() * 0.6
    const pal = rand() < 0.5 ? PALETTES.gold : PALETTES.teal

    // px per second, from the canvas's px per 60fps frame.
    const speed = f * LOCKED.speedMax * (s / 17) * 60
    const dur = r2(tr.d / speed)
    const delay = r2(-rand() * dur)
    const step = r2((s / speed) * CYCLE)

    const seq = Array.from({ length: CYCLE }, glyph)
    // Row i shows seq[(k - i) mod CYCLE] at step k, so a glyph seen at place i
    // is seen at place i + 1 one step later.
    const row = (i: number) =>
      Array.from({ length: CYCLE }, (_, k) => seq[(((k - i) % CYCLE) + CYCLE) % CYCLE]).join('')

    let spans = ''
    for (let i = tr.t - 1; i >= 1; i--) {
      const a = r2((1 - i / tr.t) * 0.85 * tr.b * LOCKED.opacity)
      spans += `<tspan x="${tr.xs}" y="${-i * s}" fill-opacity="${a}">${row(i)}</tspan>`
    }
    const ha = r2(Math.min(1, (0.6 + 0.4 * LOCKED.opacity) * tr.b + 0.3))

    cols.push(
      `<g transform="translate(${Math.round(x)} 0)"><g class="f${tr.ti}" style="animation-duration:${dur}s;animation-delay:${delay}s" clip-path="url(#w${tr.ti})">` +
        `<g class="x${tr.ti}" style="animation-duration:${step}s;animation-delay:${r2(-rand() * step)}s">` +
        `<text font-size="${s}" fill="${pal.trail}">${spans}</text>` +
        `<text font-size="${s}" fill="${pal.head}" fill-opacity="${ha}" x="${tr.xs}" y="0">${row(0)}</text>` +
        `</g></g></g>`,
    )
    x += LOCKED.gap[0] + rand() * (LOCKED.gap[1] - LOCKED.gap[0])
  }

  // The window: one glyph wide, the trail's height plus the head.
  const defs = tiers
    .map(tr => `<clipPath id="w${tr.ti}"><rect x="-2" y="${-tr.t * tr.s}" width="${tr.s + 4}" height="${(tr.t + 0.4) * tr.s}"/></clipPath>`)
    .join('')
  const motion = tiers
    .map(
      tr =>
        `.f${tr.ti}{animation:F${tr.ti} linear infinite}` +
        `@keyframes F${tr.ti}{from{transform:translateY(0)}to{transform:translateY(${tr.d}px)}}` +
        `.x${tr.ti}{animation:X${tr.ti} steps(${CYCLE}) infinite}` +
        `@keyframes X${tr.ti}{to{transform:translateX(${-CYCLE * tr.s}px)}}`,
    )
    .join('')

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">` +
    `<style>` +
    `text{font-family:"Space Mono","Hiragino Sans","Noto Sans JP",monospace}` +
    motion +
    `@media (prefers-reduced-motion:reduce){g{animation-play-state:paused}}` +
    `</style>` +
    `<defs>${defs}</defs>` +
    `<rect width="${W}" height="${H}" fill="${BG}"/>` +
    cols.join('') +
    `</svg>`
  )
}

const SCENE = buildScene()

// Brand teal palette, made for dark only.
const { theme, problems } = makeColors({
  label: 'Cyborg Way digital rain',
  only: 'dark',
  roles: { accent: '#2FD9C6', danger: '#E5604F', success: '#5CC97A', warning: '#F4CE45', pro: '#A98BE0' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#0E2228',
        'surface-1': '#112A31',
        'surface-2': '#13313A',
        'surface-3': '#13313A',
        'text-primary': '#EAF1F0',
        'text-secondary': '#B3C5C2',
        'text-muted': '#93ACA9',
      },
    },
  },
})

const LOOK: ThemeSetArgs = {
  colors: theme,
  overrideColorScheme: 'dark',
  backdrop: { scene: 'digital-rain', glass: { blur: 2, tint: '#0E2228', opacity: 0.72 } },
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))
    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    const set = await $.theme.set(LOOK)
    if (!set.isDrawn) {
      $.ui.status(`digital-rain: ${set.reason}`)
    }
    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if ((e.surface !== 'desktop' && e.surface !== 'mobile') || e.props.scene !== 'digital-rain') {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)
    return <Svg source={SCENE} alt="Gold and teal katakana falling in columns of digital rain" isInteractive />
  })
}
