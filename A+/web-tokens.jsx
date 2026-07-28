// web-tokens.jsx — Laboratoire A+ web design system (purple / white)
// Exports to window: WT (theme), WFD/WFB/WFM (fonts), WIc (icons), Logo,
// WCard, WChip, WBtn, WAvatar, StatTrend, RangeBar, LineChart, DonutRing,
// GroupBars, JourneyRail.

const WT = {
  // brand purple (sampled from the A+ logo)
  purple: '#8A237F',
  purpleDeep: '#5C1657',
  purpleMid: '#A83D9E',
  purpleSoft: '#F5E9F4',
  purpleSoft2: '#FBF4FA',
  purpleLine: '#ECD8EA',
  // neutrals
  bg: '#F7F5F8',
  card: '#FFFFFF',
  ink: '#1E1822',
  inkSoft: '#463C4E',
  muted: '#7A7183',
  faint: '#A79FB0',
  line: '#ECE7EF',
  lineSoft: '#F3EFF5',
  // status
  ok: '#2E9A6B',
  okSoft: '#E1F3EB',
  warn: '#C98A1E',
  warnSoft: '#F8EED6',
  high: '#C63F52',
  highSoft: '#F8E1E4',
  info: '#3E6FB0',
  infoSoft: '#E4ECF6',
  shadow: '0 1px 2px rgba(30,24,34,.05), 0 12px 32px rgba(92,22,87,.07)',
  shadowSm: '0 1px 2px rgba(30,24,34,.05), 0 4px 14px rgba(92,22,87,.05)',
  shadowLg: '0 8px 24px rgba(30,24,34,.08), 0 30px 60px rgba(92,22,87,.12)',
};
const WFD = "'Archivo', system-ui, sans-serif";
const WFB = "'Hanken Grotesk', system-ui, sans-serif";
const WFM = "'JetBrains Mono', ui-monospace, monospace";

function WIc({ name, size = 20, c = 'currentColor', sw = 1.7, style }) {
  const P = {
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>,
    doc: <><path d="M6 3h7l5 5v13H6z" /><path d="M13 3v5h5M9 13h6M9 16.5h5" /></>,
    flask: <path d="M9 3h6M10 3v6L5 18.2A2 2 0 0 0 6.8 21h10.4A2 2 0 0 0 19 18.2L14 9V3M7.7 14h8.6" />,
    calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 9.5h17M8 3v4M16 3v4" /></>,
    user: <><circle cx="12" cy="8" r="3.6" /><path d="M5.5 20c.6-3.6 3.3-5.6 6.5-5.6s5.9 2 6.5 5.6" /></>,
    users: <><circle cx="9" cy="8" r="3.2" /><path d="M3 19.5c.5-3.1 2.9-4.9 6-4.9s5.5 1.8 6 4.9" /><path d="M16 5.2a3.2 3.2 0 0 1 0 6M18.5 14.9c2.3.5 3.8 2 4.2 4.4" /></>,
    bell: <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6M10 20a2 2 0 0 0 4 0" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></>,
    chevron: <path d="m9 5 7 7-7 7" />,
    chevronD: <path d="m5 9 7 7 7-7" />,
    check: <path d="m5 12.5 4.5 4.5L19 6.5" />,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5.2l3.4 2" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    download: <path d="M12 4v11m0 0 4-4m-4 4-4-4M5 20h14" />,
    upload: <path d="M12 20V9m0 0 4 4m-4-4-4 4M5 4h14" />,
    sparkle: <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.4L12 17l-1.9-5.6L4.5 10l5.6-1.4z M18.5 14l.8 2.3 2.2.7-2.2.7-.8 2.3-.8-2.3-2.2-.7 2.2-.7z" />,
    pulse: <path d="M3 12h4l2.5-6 4 13 2.5-7H21" />,
    shield: <path d="M12 3 5 6v5.5C5 16 8 19.5 12 21c4-1.5 7-5 7-9.5V6Z" />,
    arrowR: <path d="M5 12h14m0 0-6-6m6 6-6 6" />,
    arrowUp: <path d="M12 19V5m0 0-6 6m6-6 6 6" />,
    arrowDn: <path d="M12 5v14m0 0 6-6m-6 6-6-6" />,
    logout: <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 12h10m0 0-4-4m4 4-4 4" />,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8" /></>,
    vial: <path d="M8 3h8M14 3v13a3 3 0 0 1-6 0V3M8 9h6" />,
    stethoscope: <path d="M6 3v5a4 4 0 0 0 8 0V3M10 16v1a4 4 0 0 0 8 0v-1M18 16a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z" />,
    filter: <path d="M4 5h16l-6 7v6l-4 2v-8z" />,
    dots: <><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>,
    send: <path d="M21 4 3 11l7 2.5L13 21l3-9z" />,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7 8 6 8-6" /></>,
    phone: <path d="M5 4h4l1.5 5-2.5 1.5a12 12 0 0 0 5.5 5.5L15 18.5l5 1.5v4a1 1 0 0 1-1 1A17 17 0 0 1 4 5a1 1 0 0 1 1-1Z" />,
    print: <><path d="M7 8V3h10v5M7 18H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" /><rect x="7" y="15" width="10" height="6" rx="1" /></>,
    link: <path d="M9 15l6-6M10.5 6.5 12 5a4 4 0 0 1 6 6l-1.5 1.5M13.5 17.5 12 19a4 4 0 0 1-6-6l1.5-1.5" />,
    brain: <path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-1 5.8A3 3 0 0 0 8 18a3 3 0 0 0 4 1 3 3 0 0 0 4-1 3 3 0 0 0 3-5.2A3 3 0 0 0 18 7a3 3 0 0 0-3-3 3 3 0 0 0-3 1.2A3 3 0 0 0 9 4ZM12 5.2V19" />,
    trend: <path d="M3 17l5-5 3 3 7-8m0 0h-4m4 0v4" />,
    file: <><path d="M6 3h7l5 5v13H6z" /><path d="M13 3v5h5" /></>,
    edit: <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3ZM14 6l3 3" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {P[name]}
    </svg>
  );
}

// Brand logo (image + optional wordmark)
function Logo({ h = 34, mark = false, light = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <img src="uploads/cropped-LOGO-LAORATOIRE-APLUS-02-2.png" alt="Laboratoire A+" style={{ height: h, width: 'auto', display: 'block', filter: light ? 'brightness(0) invert(1)' : 'none' }} />
    </div>
  );
}

function WCard({ children, style, pad = 22, hover }) {
  return <div className={hover ? 'wcard-h' : ''} style={{ background: WT.card, borderRadius: 18, padding: pad, border: `1px solid ${WT.line}`, boxShadow: WT.shadowSm, ...style }}>{children}</div>;
}

function WChip({ children, tone = 'purple', solid, style }) {
  const fg = { ok: WT.ok, warn: WT.warn, high: WT.high, purple: WT.purple, info: WT.info, muted: WT.muted }[tone];
  const bg = { ok: WT.okSoft, warn: WT.warnSoft, high: WT.highSoft, purple: WT.purpleSoft, info: WT.infoSoft, muted: WT.lineSoft }[tone];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: `600 12px/1 ${WFB}`, color: solid ? '#fff' : fg, background: solid ? fg : bg, padding: '6px 11px', borderRadius: 99, whiteSpace: 'nowrap', ...style }}>{children}</span>
  );
}

function WBtn({ children, kind = 'primary', size = 'md', icon, onClick, style, iconRight }) {
  const pads = { sm: '8px 13px', md: '11px 18px', lg: '14px 22px' };
  const fs = { sm: 13, md: 14, lg: 15 };
  const styles = {
    primary: { background: WT.purple, color: '#fff', border: '1px solid transparent', boxShadow: '0 1px 2px rgba(92,22,87,.2)' },
    dark: { background: WT.purpleDeep, color: '#fff', border: '1px solid transparent' },
    ghost: { background: WT.card, color: WT.ink, border: `1px solid ${WT.line}`, boxShadow: WT.shadowSm },
    soft: { background: WT.purpleSoft, color: WT.purple, border: '1px solid transparent' },
    quiet: { background: 'transparent', color: WT.muted, border: '1px solid transparent' },
  }[kind];
  return (
    <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, font: `700 ${fs[size]}px/1 ${WFB}`, padding: pads[size], borderRadius: 12, cursor: 'pointer', ...styles, ...style }}>
      {icon && <WIc name={icon} size={fs[size] + 3} sw={2} />}
      {children}
      {iconRight && <WIc name={iconRight} size={fs[size] + 3} sw={2} />}
    </button>
  );
}

function WAvatar({ name, size = 40, tone }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const bg = tone || WT.purpleDeep;
  return <div style={{ width: size, height: size, borderRadius: 99, background: bg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 ${size * 0.36}px/1 ${WFD}`, flexShrink: 0 }}>{initials}</div>;
}

// small trend indicator
function StatTrend({ dir = 'up', value, tone }) {
  const col = tone || (dir === 'up' ? WT.high : WT.ok);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, font: `700 12px/1 ${WFB}`, color: col }}>
      <WIc name={dir === 'up' ? 'arrowUp' : 'arrowDn'} size={13} sw={2.4} />{value}
    </span>
  );
}

// ── Charts ────────────────────────────────────────────────
function RangeBar({ min, max, low, high, value, unit, tone = 'ok', h = 12 }) {
  const span = max - min;
  const pct = (v) => Math.max(0, Math.min(100, ((v - min) / span) * 100));
  const col = { ok: WT.ok, warn: WT.warn, high: WT.high }[tone];
  return (
    <div>
      <div style={{ position: 'relative', height: h, borderRadius: 99, background: WT.lineSoft, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: `${pct(low)}%`, width: `${pct(high) - pct(low)}%`, top: 0, bottom: 0, background: WT.okSoft }} />
      </div>
      <div style={{ position: 'relative', height: 0 }}>
        <div style={{ position: 'absolute', left: `${pct(value)}%`, top: -(h + 8), transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 3, height: h + 14, background: col, borderRadius: 2 }} />
          <div style={{ width: 14, height: 14, borderRadius: 99, background: col, border: `2.5px solid ${WT.card}`, marginTop: -4, boxShadow: WT.shadowSm }} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 18, font: `600 11px/1 ${WFM}`, color: WT.faint }}>
        <span>{min}</span><span style={{ color: WT.muted }}>Réf. {low}–{high} {unit}</span><span>{max}</span>
      </div>
    </div>
  );
}

function LineChart({ points, tone = 'purple', w = 560, h = 200, labels, refHigh, min: mn0, max: mx0 }) {
  const col = { ok: WT.ok, warn: WT.warn, high: WT.high, purple: WT.purple }[tone];
  const padL = 4, padR = 4, padT = 16, padB = 26;
  const mn = mn0 != null ? mn0 : Math.min(...points, ...(refHigh != null ? [refHigh] : []));
  const mx = mx0 != null ? mx0 : Math.max(...points, ...(refHigh != null ? [refHigh] : []));
  const range = mx - mn || 1;
  const X = (i) => padL + (i / (points.length - 1)) * (w - padL - padR);
  const Y = (v) => padT + (1 - (v - mn) / range) * (h - padT - padB);
  const line = points.map((p, i) => `${i ? 'L' : 'M'} ${X(i).toFixed(1)} ${Y(p).toFixed(1)}`).join(' ');
  const area = `${line} L ${X(points.length - 1)} ${h - padB} L ${X(0)} ${h - padB} Z`;
  const uid = `lc-${tone}-${Math.round(w)}`;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={col} stopOpacity="0.18" />
          <stop offset="1" stopColor={col} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((g) => (
        <line key={g} x1={padL} x2={w - padR} y1={padT + g * (h - padT - padB)} y2={padT + g * (h - padT - padB)} stroke={WT.line} strokeWidth="1" />
      ))}
      {refHigh != null && refHigh <= mx && refHigh >= mn && (
        <line x1={padL} x2={w - padR} y1={Y(refHigh)} y2={Y(refHigh)} stroke={WT.high} strokeWidth="1.4" strokeDasharray="5 5" opacity="0.7" />
      )}
      <path d={area} fill={`url(#${uid})`} />
      <path d={line} fill="none" stroke={col} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={X(i)} cy={Y(p)} r={i === points.length - 1 ? 5 : 3.5} fill={i === points.length - 1 ? col : WT.card} stroke={col} strokeWidth="2" />
      ))}
      {labels && labels.map((l, i) => (
        <text key={i} x={X(i)} y={h - 8} textAnchor="middle" fontFamily={WFM} fontSize="10.5" fontWeight="600" fill={WT.faint}>{l}</text>
      ))}
    </svg>
  );
}

function DonutRing({ segments, size = 132, thickness = 16, center }) {
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0);
  let acc = 0;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={WT.lineSoft} strokeWidth={thickness} />
        {segments.map((s, i) => {
          const len = (s.value / total) * C;
          const el = <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={thickness} strokeLinecap="round" strokeDasharray={`${len - 3} ${C - len + 3}`} strokeDashoffset={-acc} transform={`rotate(-90 ${size / 2} ${size / 2})`} />;
          acc += len;
          return el;
        })}
      </svg>
      {center && <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>{center}</div>}
    </div>
  );
}

function GroupBars({ data, h = 190, unit }) {
  // data: [{label, value, ref, tone}]
  const mx = Math.max(...data.map((d) => Math.max(d.value, d.ref || 0))) * 1.15;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, height: h, paddingBottom: 26, position: 'relative' }}>
      {data.map((d, i) => {
        const col = { ok: WT.ok, warn: WT.warn, high: WT.high, purple: WT.purple }[d.tone || 'purple'];
        const bh = (d.value / mx) * (h - 26);
        const rh = d.ref ? (d.ref / mx) * (h - 26) : 0;
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', position: 'relative' }}>
            {d.ref && <div style={{ position: 'absolute', bottom: 26 + rh, left: 0, right: 0, borderTop: `1.5px dashed ${WT.faint}`, opacity: 0.7 }} />}
            <span style={{ font: `700 12px/1 ${WFM}`, color: col, marginBottom: 6 }}>{d.value}</span>
            <div style={{ width: '62%', maxWidth: 46, height: bh, background: col, borderRadius: '7px 7px 0 0' }} />
            <span style={{ position: 'absolute', bottom: 0, font: `600 11px/1.1 ${WFB}`, color: WT.muted, textAlign: 'center' }}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// horizontal snaking-ish journey rail for web (compact horizontal)
function JourneyRail({ active = 2 }) {
  const phases = [['Prélèvement', 'drop'], ['Réception', 'vial'], ['Analyse', 'flask'], ['Validation', 'stethoscope'], ['Résultats', 'doc']];
  const drop = <path d="M12 3.2C9 7 6.5 10 6.5 13.4a5.5 5.5 0 0 0 11 0C17.5 10 15 7 12 3.2Z" />;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
      {phases.map(([label, icon], i) => {
        const done = i < active, on = i === active;
        return (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9, width: 92 }}>
              <div style={{ width: on ? 44 : 38, height: on ? 44 : 38, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? WT.purple : on ? WT.card : WT.card, border: `2px solid ${done ? WT.purple : on ? WT.purpleMid : WT.line}`, boxShadow: on ? '0 0 0 5px ' + WT.purpleSoft : 'none', flexShrink: 0 }}>
                {done ? <WIc name="check" size={19} c="#fff" sw={2.6} /> : icon === 'drop'
                  ? <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={on ? WT.purple : WT.faint} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{drop}</svg>
                  : <WIc name={icon} size={19} c={on ? WT.purple : WT.faint} sw={1.8} />}
              </div>
              <span style={{ font: `${on ? 800 : 600} 12.5px/1.1 ${WFB}`, color: done || on ? WT.ink : WT.faint, textAlign: 'center' }}>{label}</span>
              {on && <span style={{ font: `700 10px/1 ${WFB}`, color: WT.purple, background: WT.purpleSoft, padding: '4px 9px', borderRadius: 99, whiteSpace: 'nowrap' }}>EN COURS</span>}
            </div>
            {i < phases.length - 1 && (
              <div style={{ flex: 1, height: 3, borderRadius: 2, marginTop: on || i === active - 1 ? 20 : 20, background: i < active ? WT.purple : WT.line, alignSelf: 'flex-start', minWidth: 20 }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

Object.assign(window, { WT, WFD, WFB, WFM, WIc, Logo, WCard, WChip, WBtn, WAvatar, StatTrend, RangeBar, LineChart, DonutRing, GroupBars, JourneyRail });
