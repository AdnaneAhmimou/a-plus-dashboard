// tokens.jsx — Laboratoire A+ design system primitives
// Palette, icon set, and shared UI atoms used across all screens.
// Exports to window: APlus (palette helper), Ic (icons), Dot, Chip,
// Pill, TabBar, SampleJourney, Gauge, Sparkline, BloodMark.

// ── Palette ───────────────────────────────────────────────
const L = {
  bg: '#F1ECE1',          // warm paper
  bgAlt: '#E9E2D3',
  card: '#FFFFFF',
  cardAlt: '#FBF8F1',
  ink: '#15302F',         // deep petrol text
  inkSoft: '#3C5350',
  muted: '#728582',
  faint: '#9DACA8',
  line: 'rgba(21,48,47,0.10)',
  lineSoft: 'rgba(21,48,47,0.06)',
  teal: '#0E6E63',        // brand
  tealDeep: '#0B3A38',
  tealSoft: '#DCEEEA',
  gold: '#C9912F',        // A+ accent
  goldSoft: '#F3E6C7',
  ok: '#2E8B6F',
  okSoft: '#DBEEE6',
  warn: '#C9912F',
  warnSoft: '#F3E6C7',
  high: '#C2483D',
  highSoft: '#F6DED9',
  shadow: '0 1px 2px rgba(21,48,47,0.05), 0 10px 30px rgba(21,48,47,0.07)',
  shadowSm: '0 1px 2px rgba(21,48,47,0.06), 0 4px 12px rgba(21,48,47,0.05)',
};
const D = {
  bg: '#0B1A19',
  bgAlt: '#0E211F',
  card: '#13282A',
  cardAlt: '#0F2422',
  ink: '#EAF2EF',
  inkSoft: '#B7C9C5',
  muted: '#7E948F',
  faint: '#5C726E',
  line: 'rgba(255,255,255,0.09)',
  lineSoft: 'rgba(255,255,255,0.05)',
  teal: '#43BBA8',
  tealDeep: '#9FE3D6',
  tealSoft: 'rgba(67,187,168,0.16)',
  gold: '#E0B45C',
  goldSoft: 'rgba(224,180,92,0.16)',
  ok: '#5FC9A3',
  okSoft: 'rgba(95,201,163,0.16)',
  warn: '#E0B45C',
  warnSoft: 'rgba(224,180,92,0.16)',
  high: '#E88376',
  highSoft: 'rgba(232,131,118,0.16)',
  shadow: '0 1px 2px rgba(0,0,0,0.4), 0 18px 40px rgba(0,0,0,0.45)',
  shadowSm: '0 1px 2px rgba(0,0,0,0.4), 0 6px 16px rgba(0,0,0,0.35)',
};
const APlus = (dark) => (dark ? D : L);

const FD = "'Archivo', system-ui, sans-serif";       // display
const FB = "'Hanken Grotesk', system-ui, sans-serif"; // body
const FM = "'JetBrains Mono', ui-monospace, monospace"; // values

// ── Icons (stroke, currentColor) ─────────────────────────
function Ic({ name, size = 22, c = 'currentColor', sw = 1.7, style }) {
  const P = {
    home: <path d="M3 10.5 12 4l9 6.5M5.5 9.2V20h13V9.2" />,
    calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 9.5h17M8 3v4M16 3v4" /></>,
    flask: <path d="M9 3h6M10 3v6L5 18.2A2 2 0 0 0 6.8 21h10.4A2 2 0 0 0 19 18.2L14 9V3M7.7 14h8.6" />,
    doc: <><path d="M6 3h7l5 5v13H6z" /><path d="M13 3v5h5M9 13h6M9 16.5h6" /></>,
    user: <><circle cx="12" cy="8" r="3.6" /><path d="M5.5 20c.6-3.6 3.3-5.6 6.5-5.6s5.9 2 6.5 5.6" /></>,
    drop: <path d="M12 3.2C9 7 6.5 10 6.5 13.4a5.5 5.5 0 0 0 11 0C17.5 10 15 7 12 3.2Z" />,
    bell: <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 0 0 4 0" />,
    chevron: <path d="m9 5 7 7-7 7" />,
    check: <path d="m5 12.5 4.5 4.5L19 6.5" />,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5.2l3.4 2" /></>,
    pin: <><path d="M12 21c5-5.2 7-8.3 7-11a7 7 0 1 0-14 0c0 2.7 2 5.8 7 11Z" /><circle cx="12" cy="10" r="2.6" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    pulse: <path d="M3 12h4l2.5-6 4 13 2.5-7H21" />,
    spark: <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />,
    shield: <path d="M12 3 5 6v5.5C5 16 8 19.5 12 21c4-1.5 7-5 7-9.5V6Z" />,
    download: <path d="M12 4v11m0 0 4-4m-4 4-4-4M5 20h14" />,
    arrowR: <path d="M5 12h14m0 0-6-6m6 6-6 6" />,
    moon: <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" />,
    stethoscope: <path d="M6 3v5a4 4 0 0 0 8 0V3M10 16v1a4 4 0 0 0 8 0v-1M18 16a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z" />,
    vial: <path d="M8 3h8M14 3v13a3 3 0 0 1-6 0V3M8 9h6" />,
    map: <path d="m9 4 6 2 6-2v15l-6 2-6-2-6 2V6z M9 4v15M15 6v15" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {P[name]}
    </svg>
  );
}

// ── Small atoms ───────────────────────────────────────────
function Dot({ tone = 'ok', dark, size = 9 }) {
  const t = APlus(dark);
  const map = { ok: t.ok, warn: t.warn, high: t.high, teal: t.teal, muted: t.faint };
  return <span style={{ width: size, height: size, borderRadius: 99, background: map[tone], display: 'inline-block', flexShrink: 0 }} />;
}

function Chip({ children, tone = 'teal', dark, solid, style }) {
  const t = APlus(dark);
  const fg = { ok: t.ok, warn: t.warn, high: t.high, teal: t.teal, gold: t.gold }[tone];
  const bg = { ok: t.okSoft, warn: t.warnSoft, high: t.highSoft, teal: t.tealSoft, gold: t.goldSoft }[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      font: `600 12px/1 ${FB}`, letterSpacing: 0.1,
      color: solid ? '#fff' : fg, background: solid ? fg : bg,
      padding: '6px 10px', borderRadius: 99, whiteSpace: 'nowrap', ...style,
    }}>{children}</span>
  );
}

function BloodMark({ size = 38, dark, mono }) {
  const t = APlus(dark);
  return (
    <div style={{
      width: size, height: size, borderRadius: 12, flexShrink: 0,
      background: mono ? 'transparent' : t.tealDeep,
      border: mono ? `1.5px solid ${t.line}` : 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
    }}>
      <span style={{ font: `800 ${size * 0.42}px/1 ${FD}`, color: mono ? t.ink : '#fff', letterSpacing: -0.5 }}>A</span>
      <span style={{ position: 'absolute', top: size * 0.16, right: size * 0.16, font: `800 ${size * 0.32}px/1 ${FD}`, color: mono ? t.gold : t.gold }}>+</span>
    </div>
  );
}

// ── Bottom tab bar ────────────────────────────────────────
function TabBar({ active = 'home', dark, platform = 'ios' }) {
  const t = APlus(dark);
  const tabs = [
    ['home', 'Accueil', 'home'],
    ['rdv', 'Rendez-vous', 'calendar'],
    ['suivi', 'Suivi', 'flask'],
    ['results', 'Résultats', 'doc'],
    ['profil', 'Profil', 'user'],
  ];
  return (
    <nav style={{
      display: 'grid', gridTemplateColumns: 'repeat(5,1fr)',
      padding: platform === 'ios' ? '10px 8px 26px' : '10px 8px 12px',
      background: dark ? 'rgba(11,26,25,0.86)' : 'rgba(255,255,255,0.86)',
      backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
      borderTop: `1px solid ${t.line}`, flexShrink: 0,
    }}>
      {tabs.map(([id, label, icon]) => {
        const on = id === active;
        return (
          <div key={id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <Ic name={icon} size={23} c={on ? t.teal : t.faint} sw={on ? 2 : 1.6} />
            <span style={{ font: `${on ? 700 : 500} 10.5px/1 ${FB}`, color: on ? t.teal : t.faint, letterSpacing: 0.1 }}>{label}</span>
          </div>
        );
      })}
    </nav>
  );
}

// ── Signature: the snaking sample journey ────────────────
const PHASES = [
  ['Prélèvement', 'Échantillon prélevé', 'drop'],
  ['Réception', 'Reçu au laboratoire', 'vial'],
  ['Analyse', 'Analyse en cours', 'flask'],
  ['Validation', 'Validation biologiste', 'stethoscope'],
  ['Résultats', 'Résultats disponibles', 'doc'],
];

function SampleJourney({ active = 2, dark, withMeta, times, gap: gapProp, colors }) {
  const t0 = APlus(dark);
  const t = colors ? { ...t0, ...colors } : t0;
  const N = PHASES.length;
  const gap = gapProp || (withMeta ? 86 : 70);
  const top = 30;
  const H = top * 2 + gap * (N - 1);
  const xs = [30, 70, 30, 70, 50]; // snaking rail
  const X = (i) => xs[i];
  const Y = (i) => top + gap * i;

  let d = `M ${X(0)} ${Y(0)}`;
  for (let i = 1; i < N; i++) {
    const my = (Y(i - 1) + Y(i)) / 2;
    d += ` C ${X(i - 1)} ${my}, ${X(i)} ${my}, ${X(i)} ${Y(i)}`;
  }
  // progress path up to active node
  let dp = `M ${X(0)} ${Y(0)}`;
  for (let i = 1; i <= active; i++) {
    const my = (Y(i - 1) + Y(i)) / 2;
    dp += ` C ${X(i - 1)} ${my}, ${X(i)} ${my}, ${X(i)} ${Y(i)}`;
  }
  const railW = 100;

  return (
    <div style={{ display: 'flex', alignItems: 'stretch' }}>
      <svg width={railW} height={H} viewBox={`0 0 ${railW} ${H}`} style={{ flexShrink: 0, overflow: 'visible' }}>
        <path d={d} fill="none" stroke={t.line} strokeWidth={3} strokeDasharray="2 7" strokeLinecap="round" />
        <path d={dp} fill="none" stroke={t.teal} strokeWidth={3.5} strokeLinecap="round" />
        {PHASES.map((p, i) => {
          const done = i < active, on = i === active;
          const r = on ? 16 : 12;
          const fill = done ? t.teal : on ? t.card : t.card;
          const ring = done ? t.teal : on ? t.gold : t.line;
          return (
            <g key={i}>
              {on && <circle cx={X(i)} cy={Y(i)} r={24} fill="none" stroke={t.gold} strokeWidth={1.4} opacity={0.4} />}
              <circle cx={X(i)} cy={Y(i)} r={r} fill={fill} stroke={ring} strokeWidth={on ? 2.5 : 2} />
              {done
                ? <g transform={`translate(${X(i) - 7},${Y(i) - 7})`}><path d="m2 7.5 3.5 3.5L12 3.5" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" /></g>
                : <g transform={`translate(${X(i) - 8},${Y(i) - 8})`}><Ic name={p[2]} size={16} c={on ? t.gold : t.faint} sw={1.8} /></g>}
            </g>
          );
        })}
      </svg>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingTop: top - 14, paddingBottom: top - 14 }}>
        {PHASES.map((p, i) => {
          const done = i < active, on = i === active;
          return (
            <div key={i} style={{ height: gap, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ font: `${on ? 800 : 700} 15px/1.1 ${FD}`, color: done || on ? t.ink : t.faint }}>{p[0]}</span>
                {on && <Chip tone="gold" dark={dark} style={{ padding: '3px 8px', fontSize: 10.5 }}>EN COURS</Chip>}
              </div>
              <span style={{ font: `500 12.5px/1.2 ${FB}`, color: t.muted, marginTop: 4 }}>{p[1]}</span>
              {withMeta && times && times[i] && (
                <span style={{ font: `600 11px/1 ${FM}`, color: done ? t.teal : on ? t.gold : t.faint, marginTop: 6, letterSpacing: 0.2 }}>{times[i]}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Reference-range gauge ─────────────────────────────────
function Gauge({ min, max, low, high, value, unit, tone = 'ok', dark }) {
  const t = APlus(dark);
  const span = max - min;
  const pct = (v) => Math.max(0, Math.min(100, ((v - min) / span) * 100));
  const col = { ok: t.ok, warn: t.warn, high: t.high }[tone];
  return (
    <div>
      <div style={{ position: 'relative', height: 10, borderRadius: 99, background: t.bgAlt, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: `${pct(low)}%`, width: `${pct(high) - pct(low)}%`, top: 0, bottom: 0, background: t.okSoft }} />
        <div style={{ position: 'absolute', left: `${pct(low)}%`, top: 0, bottom: 0, width: 2, background: t.ok, opacity: 0.5 }} />
        <div style={{ position: 'absolute', left: `${pct(high)}%`, top: 0, bottom: 0, width: 2, background: t.ok, opacity: 0.5 }} />
      </div>
      <div style={{ position: 'relative', height: 0 }}>
        <div style={{ position: 'absolute', left: `${pct(value)}%`, top: -16, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 3, height: 22, background: col, borderRadius: 2 }} />
          <div style={{ width: 13, height: 13, borderRadius: 99, background: col, border: `2.5px solid ${t.card}`, marginTop: -3, boxShadow: t.shadowSm }} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, font: `600 11px/1 ${FM}`, color: t.faint }}>
        <span>{min}</span>
        <span style={{ color: t.muted }}>Réf. {low}–{high} {unit}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

// ── Trend sparkline ───────────────────────────────────────
function Sparkline({ points, dark, w = 300, h = 70, tone = 'ok' }) {
  const t = APlus(dark);
  const col = { ok: t.ok, warn: t.warn, high: t.high, teal: t.teal }[tone];
  const xs = points.map((_, i) => (i / (points.length - 1)) * w);
  const mn = Math.min(...points), mx = Math.max(...points);
  const pad = 12;
  const Y = (v) => h - pad - ((v - mn) / (mx - mn || 1)) * (h - pad * 2);
  const d = points.map((p, i) => `${i ? 'L' : 'M'} ${xs[i].toFixed(1)} ${Y(p).toFixed(1)}`).join(' ');
  const area = `${d} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block', width: '100%' }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${tone}-${dark ? 'd' : 'l'}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={col} stopOpacity="0.22" />
          <stop offset="1" stopColor={col} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${tone}-${dark ? 'd' : 'l'})`} />
      <path d={d} fill="none" stroke={col} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={xs[xs.length - 1]} cy={Y(points[points.length - 1])} r={4} fill={col} stroke={t.card} strokeWidth={2} />
    </svg>
  );
}

Object.assign(window, {
  APlus, FD, FB, FM, Ic, Dot, Chip, Pill: Chip, BloodMark, TabBar, SampleJourney, PHASES, Gauge, Sparkline,
});
