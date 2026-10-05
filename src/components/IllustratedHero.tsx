import { useEffect, useRef, useState } from "react"

interface IllustratedHeroProps {
  eyebrow?: string
  heading: string
  /** A word inside heading to set in italic — not recolored, since a fixed
   * accent color clashes against at least one of the five sky states
   * (coral-on-sunset is nearly illegible at golden hour, the default). */
  highlight?: string
  subtext?: string
  statLine?: string
}

function renderHeading(heading: string, highlight?: string) {
  if (!heading || !highlight) return heading
  const idx = heading.indexOf(highlight)
  if (idx === -1) return heading
  return (
    <>
      {heading.slice(0, idx)}
      <em>{highlight}</em>
      {heading.slice(idx + highlight.length)}
    </>
  )
}

/**
 * A flat-illustrated, hand-drawn-feeling hero scene — a Kerala backwater at
 * golden hour, with a draggable "time of day" slider that crossfades the
 * whole palette from dawn through to night. Built with the same technique
 * as a reference the team liked (layered SVG sky/sea bands, keyframe color
 * interpolation, a luminance-driven text-color flip with hysteresis) but
 * re-skinned entirely in Roamly's own palette and type, so it sits
 * naturally under the real navbar/search card instead of introducing a
 * second brand. Self-contained: all markup, styles and motion live here,
 * so dropping this file and reverting HeroBlock undoes the whole thing.
 */

// Keyframes at t = 0 dawn, .28 morning, .55 golden hour (default), .78 dusk, 1 night.
// Every hex below is a token already used elsewhere on the site (ocean / sunset / gold / sand).
const RAW = [
  {
    t: 0,
    sky: ["#FBF9F5", "#F5EFE3", "#EED49A", "#F4AC9E", "#EA8069"],
    sea: ["#B7C6E6", "#8BA1D1", "#5F78B3", "#435893"],
    shore: "#E9DDC7",
    far: "#8BA1D1",
    sun: "#E0B566",
    cloud: "#FBF9F5",
  },
  {
    t: 0.28,
    sky: ["#F5EFE3", "#EED49A", "#E0B566", "#B7C6E6", "#8BA1D1"],
    sea: ["#5F78B3", "#435893", "#324577", "#293860"],
    shore: "#D8C6A3",
    far: "#5F78B3",
    sun: "#CC9640",
    cloud: "#F5EFE3",
  },
  {
    t: 0.55,
    sky: ["#E0B566", "#CC9640", "#EA8069", "#E15B3E", "#D9392B"],
    sea: ["#CC9640", "#324577", "#293860", "#222E4D"],
    shore: "#D8C6A3",
    far: "#A9772A",
    sun: "#E15B3E",
    cloud: "#F5EFE3",
  },
  {
    t: 0.78,
    sky: ["#B92E22", "#7E2118", "#293860", "#222E4D", "#1B2540"],
    sea: ["#293860", "#222E4D", "#1B2540", "#0C1122"],
    shore: "#4A5850",
    far: "#222E4D",
    sun: "#A12A1E",
    cloud: "#8BA1D1",
  },
  {
    t: 1,
    sky: ["#0C1122", "#0A0E1C", "#090C18", "#080A15", "#070912"],
    sea: ["#0C1122", "#0A0E1C", "#080A15", "#06070f"],
    shore: "#1B2540",
    far: "#0C1122",
    sun: "#F5EFE3",
    cloud: "#1B2540",
  },
]
const hx = (h: string): [number, number, number] => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
]
const P = RAW.map((p) => ({
  t: p.t,
  sky: p.sky.map(hx),
  sea: p.sea.map(hx),
  shore: hx(p.shore),
  far: hx(p.far),
  sun: hx(p.sun),
  cloud: hx(p.cloud),
}))
const mixA = (a: [number, number, number], b: [number, number, number], f: number): [number, number, number] => [
  a[0] + (b[0] - a[0]) * f,
  a[1] + (b[1] - a[1]) * f,
  a[2] + (b[2] - a[2]) * f,
]
const css = (c: [number, number, number]) => `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const sstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}
const lum = (c: [number, number, number]) => {
  const f = (v: number) => {
    v /= 255
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2])
}
const label = (t: number) => (t < 0.14 ? "Dawn" : t < 0.42 ? "Morning" : t < 0.67 ? "Golden hour" : t < 0.87 ? "Dusk" : "Night")

export function IllustratedHero({ eyebrow, heading, highlight, subtext, statLine }: IllustratedHeroProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const sunRef = useRef<SVGGElement>(null)
  const sunCRef = useRef<SVGCircleElement>(null)
  const sunRingRef = useRef<SVGCircleElement>(null)
  const moonRef = useRef<SVGGElement>(null)
  const starsRef = useRef<SVGGElement>(null)
  const skyRectsRef = useRef<SVGRectElement[]>([])
  const seaPathsRef = useRef<SVGPathElement[]>([])
  const shoreRef = useRef<SVGPathElement>(null)
  const farRef = useRef<SVGPathElement>(null)
  const cloudsRef = useRef<SVGGElement[]>([])
  const birdsRef = useRef<SVGGElement>(null)
  const lampRef = useRef<SVGCircleElement>(null)
  const [t, setT] = useState(0.55)
  const [night, setNight] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setLoaded(true), 80)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    let i = 0
    for (let k = 0; k < P.length - 1; k++) if (t >= P[k].t) i = k
    const a = P[i]
    const b = P[Math.min(i + 1, P.length - 1)]
    const f = b.t === a.t ? 0 : clamp((t - a.t) / (b.t - a.t), 0, 1)
    const mc = (x: [number, number, number], y: [number, number, number]) => css(mixA(x, y, f))
    const skyC = a.sky.map((c, k) => mc(c, b.sky[k]))
    const seaC = a.sea.map((c, k) => mc(c, b.sea[k]))
    const shoreC = mc(a.shore, b.shore)
    const farC = mc(a.far, b.far)
    const sunC = mc(a.sun, b.sun)
    const cloudC = mc(a.cloud, b.cloud)

    skyRectsRef.current.forEach((r, k) => r?.setAttribute("fill", skyC[k]))
    seaPathsRef.current.forEach((p, k) => p?.setAttribute("fill", seaC[k]))
    shoreRef.current?.setAttribute("fill", shoreC)
    farRef.current?.setAttribute("fill", farC)
    cloudsRef.current.forEach((g) => g?.setAttribute("fill", cloudC))
    sunCRef.current?.setAttribute("fill", sunC)
    sunRingRef.current?.setAttribute("stroke", sunC)

    // Arc kept to the right two-thirds of the frame, clear of the
    // left-aligned headline, instead of rising from directly behind it.
    const sp = clamp(t / 0.85, 0, 1)
    const sx = 600 + 480 * sp
    const sy = 500 - Math.sin(sp * Math.PI) * 330
    sunRef.current?.setAttribute("transform", `translate(${sx.toFixed(1)},${sy.toFixed(1)})`)
    const sunOp = 1 - sstep(0.74, 0.84, t)
    sunRef.current?.setAttribute("opacity", sunOp.toFixed(3))

    const mp = clamp((t - 0.66) / 0.3, 0, 1)
    moonRef.current?.setAttribute("transform", `translate(780,${(470 - mp * 300).toFixed(1)})`)
    moonRef.current?.setAttribute("opacity", sstep(0.7, 0.86, t).toFixed(3))
    starsRef.current?.setAttribute("opacity", sstep(0.75, 0.95, t).toFixed(3))
    birdsRef.current?.setAttribute("opacity", (1 - sstep(0.8, 0.92, t)).toFixed(3))
    lampRef.current?.setAttribute("opacity", sstep(0.82, 0.95, t).toFixed(3))

    const L = lum(mixA(a.sky[0], b.sky[0], f))
    if (!night && L < 0.34) setNight(true)
    else if (night && L > 0.4) setNight(false)
  }, [t, night])

  useEffect(() => {
    function fit() {
      const svg = svgRef.current
      if (!svg) return
      const r = svg.parentElement?.getBoundingClientRect()
      if (!r) return
      svg.setAttribute("viewBox", r.width / r.height < 0.95 ? "340 0 600 800" : "0 0 1200 800")
    }
    fit()
    window.addEventListener("resize", fit)
    return () => window.removeEventListener("resize", fit)
  }, [])

  const wavePath = (top: number, amp: number) => {
    let d = `M -240 ${top}`
    for (let x = -240; x < 1440; x += 120) d += ` q 30 ${-amp} 60 0 q 30 ${amp} 60 0`
    return d + ` L 1440 800 L -240 800 Z`
  }
  const stars = useRef(
    Array.from({ length: 36 }, () => ({
      x: 15 + Math.random() * 1170,
      y: 12 + Math.random() * 380,
      r: 0.8 + Math.random() * 1.1,
      dur: 1.8 + Math.random() * 2.2,
      delay: Math.random() * 3,
    })),
  ).current

  return (
    <div data-hero-boundary className={`ihero -mt-[67px] ${night ? "ihero-night" : ""}`}>
      <style>{`
        .ihero{position:relative;height:90svh;min-height:620px;width:100%;overflow:hidden;background:#0C1122;--e:cubic-bezier(.19,.74,.27,1)}
        .ihero-scene{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
        .ihero-ui{position:relative;z-index:2;display:flex;flex-direction:column;height:100%;color:#fff;padding-inline:clamp(22px,5.5vw,66px);transition:color .55s}
        .ihero-night .ihero-ui{color:#F3ECDD}
        .ihero-kicker{position:absolute;top:104px;left:clamp(22px,5.5vw,66px);display:flex;align-items:center;gap:7px;font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;font-weight:700;opacity:.9}
        .ihero-copy{margin:auto 0;max-width:680px;transform:translateY(-3vh)}
        .ihero-copy h1{font-family:var(--font-display);font-weight:800;letter-spacing:-0.02em;font-size:clamp(2.6rem,6vw,5.2rem);line-height:1.03;text-shadow:0 1px 4px rgba(0,0,0,.3)}
        .ihero-copy h1 em{font-style:italic;font-weight:500}
        .ihero-lede{margin-top:20px;max-width:46ch;font-size:1.05rem;line-height:1.6;opacity:.92;text-shadow:0 1px 4px rgba(0,0,0,.3)}
        .ihero-stat{position:absolute;bottom:34px;left:clamp(22px,5.5vw,66px);font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;font-weight:700;opacity:.8}
        .ihero-load{opacity:0;transform:translateY(20px);transition:opacity 1s var(--e),transform 1s var(--e);transition-delay:var(--d,0s)}
        .ihero-loaded .ihero-load{opacity:1;transform:none}
        .ihero-card{position:absolute;bottom:clamp(20px,4vh,34px);right:clamp(18px,4vw,44px);width:min(340px,calc(100% - 32px));
          background:rgba(255,255,255,.95);backdrop-filter:blur(8px);border-radius:16px;padding:16px 18px 13px;color:#14161A;box-shadow:0 22px 44px -14px rgba(12,17,34,.4)}
        .ihero-card-top{display:flex;align-items:center;gap:8px;margin-bottom:6px}
        .ihero-card-label{font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:#5B616B}
        .ihero-card-val{margin-left:auto;font-weight:800;color:#D9392B;font-size:.98rem}
        .ihero-range{-webkit-appearance:none;appearance:none;width:100%;height:24px;background:transparent;cursor:grab}
        .ihero-range::-webkit-slider-runnable-track{height:2px;background:rgba(20,22,26,.2);border-radius:2px}
        .ihero-range::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#D9392B;border:2.5px solid #fff;margin-top:-7px;box-shadow:0 1px 5px rgba(12,17,34,.35)}
        .ihero-range::-moz-range-track{height:2px;background:rgba(20,22,26,.2);border-radius:2px}
        .ihero-range::-moz-range-thumb{width:12px;height:12px;border-radius:50%;background:#D9392B;border:2.5px solid #fff}
        .ihero-ticks{display:flex;justify-content:space-between;margin-top:2px;font-size:.64rem;letter-spacing:.1em;text-transform:uppercase;font-weight:700;color:#5B616B}
        .w1{animation:iw-l 24s linear infinite}.w2{animation:iw-r 34s linear infinite}
        .w3{animation:iw-l 46s linear infinite}.w4{animation:iw-r 54s linear infinite}
        @keyframes iw-l{to{transform:translateX(-120px)}} @keyframes iw-r{to{transform:translateX(120px)}}
        .icl1{animation:ic-l 27s ease-in-out infinite alternate} .icl2{animation:ic-r 35s ease-in-out infinite alternate} .icl3{animation:ic-l 21s ease-in-out infinite alternate}
        @keyframes ic-l{to{transform:translateX(36px)}} @keyframes ic-r{to{transform:translateX(-44px)}}
        .ibob{animation:ibob 7s ease-in-out infinite;transform-box:fill-box;transform-origin:center}
        @keyframes ibob{0%,100%{transform:translateY(0) rotate(.6deg)}50%{transform:translateY(-5px) rotate(-1.1deg)}}
        .ibirds{animation:ibirds 9s ease-in-out infinite alternate;transform-box:fill-box;transform-origin:center}
        @keyframes ibirds{to{transform:translate(-26px,9px)}}
        .itw{animation:itw 3s ease-in-out infinite}
        @keyframes itw{0%,100%{opacity:1}50%{opacity:.15}}
        @media (max-width:760px){
          .ihero{height:auto;min-height:0}
          .ihero-ui{min-height:92svh;padding-bottom:160px}
          .ihero-copy{transform:translateY(-4vh)}
          .ihero-stat{display:none}
          .ihero-card{left:16px;right:16px;width:auto;bottom:16px}
          /* The narrower mobile viewBox crop lands cloud #2 directly behind
             the headline text (it's positioned for the wide desktop crop);
             simplest fix is to drop the decorative clouds on narrow screens
             rather than recompute crop-aware positions for every element. */
          .icl1,.icl2,.icl3{display:none}
        }
        @media (prefers-reduced-motion: reduce){
          .w1,.w2,.w3,.w4,.icl1,.icl2,.icl3,.ibob,.ibirds,.itw{animation:none}
          .ihero-load{transition:none}
        }
      `}</style>

      <svg ref={svgRef} className="ihero-scene" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <defs>
          <mask id="ihMoonCut" maskUnits="userSpaceOnUse" x="-32" y="-32" width="64" height="64">
            <circle r="24" fill="#fff" />
            <circle cx="10" cy="-8" r="20" fill="#000" />
          </mask>
        </defs>
        <g>
          {[0, 1, 2, 3, 4].map((i) => (
            <rect
              key={i}
              ref={(el) => {
                if (el) skyRectsRef.current[i] = el
              }}
              x={-10}
              y={i * 100}
              width={1220}
              height={104}
            />
          ))}
        </g>
        <g ref={starsRef} opacity={0}>
          {stars.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#EAE4D2" className="itw" style={{ animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s` }} />
          ))}
        </g>
        <g ref={sunRef}>
          <circle ref={sunRingRef} r={41} fill="none" strokeWidth={1.5} opacity={0.4} />
          <circle ref={sunCRef} r={26} />
        </g>
        <g ref={moonRef} opacity={0}>
          <circle r={24} fill="#EFE9DA" mask="url(#ihMoonCut)" />
        </g>
        <g
          className="icl1"
          transform="translate(255,138)"
          ref={(el) => {
            if (el) cloudsRef.current[0] = el
          }}
        >
          <ellipse rx={62} ry={17} />
          <ellipse cx={-44} cy={7} rx={35} ry={13} />
          <ellipse cx={46} cy={9} rx={40} ry={12} />
        </g>
        <g
          className="icl2"
          transform="translate(770,232)"
          ref={(el) => {
            if (el) cloudsRef.current[1] = el
          }}
        >
          <ellipse rx={74} ry={19} />
          <ellipse cx={-52} cy={8} rx={40} ry={14} />
          <ellipse cx={54} cy={10} rx={46} ry={13} />
        </g>
        <g
          className="icl3"
          transform="translate(985,96)"
          ref={(el) => {
            if (el) cloudsRef.current[2] = el
          }}
        >
          <ellipse rx={46} ry={13} />
          <ellipse cx={34} cy={6} rx={28} ry={10} />
        </g>
        <path ref={farRef} d="M 1220 440 C 1140 452 1070 476 990 500 L 1220 500 Z" />
        <g>
          {[
            { top: 500, amp: 5, cls: "w1" },
            { top: 546, amp: 9, cls: "w2" },
            { top: 600, amp: 11, cls: "w3" },
            { top: 664, amp: 8, cls: "w4" },
          ].map((w, i) => (
            <path
              key={i}
              ref={(el) => {
                if (el) seaPathsRef.current[i] = el
              }}
              d={wavePath(w.top, w.amp)}
              className={w.cls}
            />
          ))}
        </g>
        {/* houseboat — Kerala backwaters silhouette */}
        <g transform="translate(700,548)">
          <g className="ibob">
            <path d="M-60 10 L64 10 L50 -2 L-46 -2 Z" fill="#0C1122" />
            <path d="M-46 -2 L46 -2 L38 -34 Q0 -46 -38 -34 Z" fill="#F5EFE3" opacity={0.92} />
            <path d="M-30 -34 L30 -34 L30 -50 L-30 -50 Z" fill="#8BA1D1" opacity={0.3} />
            <rect x={-18} y={-44} width={10} height={14} rx={1} fill="#293860" opacity={0.6} />
            <rect x={-2} y={-44} width={10} height={14} rx={1} fill="#293860" opacity={0.6} />
            <rect x={14} y={-44} width={10} height={14} rx={1} fill="#293860" opacity={0.6} />
            <path d="M-6 -50 L-6 -72" stroke="#1E2B26" strokeWidth={2} />
            <circle ref={lampRef} cx={-6} cy={-74} r={3} fill="#F2C879" opacity={0} />
          </g>
        </g>
        {/* palm trees, near shore right */}
        <g opacity={0.92}>
          <path d="M1040 620 L1040 560" stroke="#1B2540" strokeWidth={5} strokeLinecap="round" />
          <path d="M1040 568 Q1000 540 968 552 M1040 568 Q1012 530 1030 500 M1040 568 Q1066 532 1050 500 M1040 568 Q1080 548 1112 560" fill="none" stroke="#1B2540" strokeWidth={5} strokeLinecap="round" />
          <path d="M1105 640 L1101 575" stroke="#1B2540" strokeWidth={4} strokeLinecap="round" />
          <path d="M1101 582 Q1070 560 1046 568 M1101 582 Q1082 550 1096 526 M1101 582 Q1122 552 1112 528 M1101 582 Q1134 566 1156 576" fill="none" stroke="#1B2540" strokeWidth={4} strokeLinecap="round" />
        </g>
        <g ref={birdsRef} className="ibirds" fill="none" stroke="#1B2540" strokeWidth={2.4} strokeLinecap="round">
          <path d="M846 192 q7 -8 14 0 q7 -8 14 0" />
          <path d="M912 218 q6 -7 12 0 q6 -7 12 0" strokeWidth={2} />
          <path d="M818 240 q5 -6 10 0 q5 -6 10 0" strokeWidth={1.8} />
        </g>
        <path ref={shoreRef} d="M -20 800 L -20 655 C 150 610 300 668 470 692 C 660 720 880 688 1060 718 C 1120 728 1170 738 1220 752 L 1220 800 Z" />
      </svg>

      <div className={`ihero-ui ${loaded ? "ihero-loaded" : ""}`}>
        {eyebrow && (
          <p className="ihero-kicker ihero-load" style={{ ["--d" as string]: "0s" }}>
            {eyebrow}
          </p>
        )}
        <div className="ihero-copy">
          <h1 className="ihero-load" style={{ ["--d" as string]: ".08s" }}>
            {renderHeading(heading, highlight)}
          </h1>
          {subtext && (
            <p className="ihero-lede ihero-load" style={{ ["--d" as string]: ".18s" }}>
              {subtext}
            </p>
          )}
        </div>
        {statLine && (
          <p className="ihero-stat ihero-load" style={{ ["--d" as string]: ".3s" }}>
            {statLine}
          </p>
        )}
      </div>

      <div className="ihero-card ihero-load" style={{ ["--d" as string]: ".42s" }}>
        <div className="ihero-card-top">
          <span className="ihero-card-label">Time of day</span>
          <span className="ihero-card-val">{label(t)}</span>
        </div>
        <input
          type="range"
          className="ihero-range"
          min={0}
          max={1000}
          value={Math.round(t * 1000)}
          onChange={(e) => setT(Number(e.target.value) / 1000)}
          aria-label="Time of day in the scene"
          aria-valuetext={label(t)}
        />
        <div className="ihero-ticks">
          <span>Dawn</span>
          <span>Noon</span>
          <span>Dusk</span>
          <span>Night</span>
        </div>
      </div>
    </div>
  )
}
