// screens-b.jsx — Suivi de l'échantillon, Résultats
/* global APlus, FD, FB, FM, Ic, Dot, Chip, BloodMark, TabBar, SampleJourney, Screen, Card, topPad */

// ── 3 · SUIVI DE L'ÉCHANTILLON ───────────────────────────
function Suivi({ dark, platform = 'ios' }) {
  const t = APlus(dark);
  const times = ['03 juin · 08:12', '03 juin · 09:40', 'En cours · 10:15', 'Est. 5 juin', '5 juin · ~14:00'];
  return (
    <Screen dark={dark} platform={platform}>
      <div style={{ padding: `${topPad(platform) + 14}px 20px 12px` }}>
        <div style={{ font: `600 13px/1 ${FB}`, color: t.muted }}>Bilan sanguin complet</div>
        <div style={{ font: `800 26px/1.1 ${FD}`, color: t.ink, marginTop: 6, letterSpacing: -0.5 }}>Suivi en temps réel</div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '4px 20px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Card dark={dark} pad={15} style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
          <div style={{ width: 44, height: 44, borderRadius: 13, background: t.tealSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ic name="vial" size={24} c={t.teal} sw={1.7} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ font: `600 11.5px/1 ${FM}`, color: t.muted, letterSpacing: 0.3 }}>ÉCHANTILLON #A4821</div>
            <div style={{ font: `800 15px/1.1 ${FD}`, color: t.ink, marginTop: 5 }}>Laboratoire Bastille</div>
          </div>
          <Chip tone="teal" dark={dark}><span style={{ width: 7, height: 7, borderRadius: 99, background: t.teal, display: 'inline-block' }} />Actif</Chip>
        </Card>

        <Card dark={dark} pad={18} style={{ flex: 'none' }}>
          <SampleJourney active={2} dark={dark} withMeta times={times} />
        </Card>

        <Card dark={dark} pad={14} style={{ display: 'flex', alignItems: 'center', gap: 12, background: dark ? t.cardAlt : t.cardAlt }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: t.goldSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Ic name="bell" size={19} c={t.gold} sw={1.8} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ font: `700 13.5px/1.1 ${FB}`, color: t.ink }}>M'alerter dès que c'est prêt</div>
            <div style={{ font: `500 12px/1.2 ${FB}`, color: t.muted, marginTop: 2 }}>Notification + e-mail</div>
          </div>
          <div style={{ width: 46, height: 28, borderRadius: 99, background: t.teal, padding: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: 22, height: 22, borderRadius: 99, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }} />
          </div>
        </Card>
      </div>

      <TabBar active="suivi" dark={dark} platform={platform} />
    </Screen>
  );
}

// ── 4 · RÉSULTATS ────────────────────────────────────────
function Resultats({ dark, platform = 'ios' }) {
  const t = APlus(dark);
  const groups = [
    ['Hématologie', [
      ['Hémoglobine', '14,2', 'g/dL', 'ok'],
      ['Globules blancs', '6,8', 'G/L', 'ok'],
      ['Plaquettes', '241', 'G/L', 'ok'],
    ]],
    ['Biochimie', [
      ['Glycémie à jeun', '0,92', 'g/L', 'ok'],
      ['Cholestérol LDL', '1,42', 'g/L', 'warn'],
      ['Créatinine', '8,1', 'mg/L', 'ok'],
    ]],
  ];
  return (
    <Screen dark={dark} platform={platform}>
      <div style={{ padding: `${topPad(platform) + 14}px 20px 12px`, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ font: `600 13px/1 ${FB}`, color: t.muted }}>Bilan du 18 mars 2026</div>
          <div style={{ font: `800 26px/1.1 ${FD}`, color: t.ink, marginTop: 6, letterSpacing: -0.5 }}>Mes résultats</div>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: t.card, border: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: t.shadowSm }}>
          <Ic name="download" size={20} c={t.inkSoft} sw={1.8} />
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '4px 20px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* summary banner */}
        <div style={{ borderRadius: 20, padding: 16, background: dark ? t.cardAlt : '#fff', border: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', gap: 14, boxShadow: t.shadowSm }}>
          <div style={{ position: 'relative', width: 46, height: 46, flexShrink: 0 }}>
            <svg width="46" height="46" viewBox="0 0 46 46">
              <circle cx="23" cy="23" r="19" fill="none" stroke={t.line} strokeWidth="5" />
              <circle cx="23" cy="23" r="19" fill="none" stroke={t.ok} strokeWidth="5" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 19 * 0.93} ${2 * Math.PI * 19}`} transform="rotate(-90 23 23)" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `800 13px/1 ${FD}`, color: t.ok }}>13/14</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ font: `800 16px/1.15 ${FD}`, color: t.ink }}>Une valeur à surveiller</div>
            <div style={{ font: `500 12.5px/1.35 ${FB}`, color: t.muted, marginTop: 3 }}>13 paramètres dans la norme. Le cholestérol LDL est légèrement élevé.</div>
          </div>
        </div>

        {groups.map(([title, rows]) => (
          <div key={title}>
            <div style={{ font: `700 12px/1 ${FB}`, color: t.muted, letterSpacing: 0.4, textTransform: 'uppercase', margin: '0 2px 8px' }}>{title}</div>
            <Card dark={dark} pad={0}>
              {rows.map(([n, v, u, tone], i, a) => (
                <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: i < a.length - 1 ? `1px solid ${t.line}` : 'none' }}>
                  <Dot tone={tone} dark={dark} />
                  <div style={{ flex: 1 }}>
                    <div style={{ font: `600 14.5px/1.1 ${FB}`, color: t.ink }}>{n}</div>
                    <div style={{ font: `600 11.5px/1 ${FB}`, color: tone === 'warn' ? t.warn : t.muted, marginTop: 4 }}>{tone === 'warn' ? 'Au-dessus de la référence' : 'Dans la norme'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ font: `700 15px/1 ${FM}`, color: t.ink }}>{v}</span>
                    <span style={{ font: `600 11px/1 ${FM}`, color: t.faint, marginLeft: 4 }}>{u}</span>
                  </div>
                  <Ic name="chevron" size={16} c={t.faint} sw={2} />
                </div>
              ))}
            </Card>
          </div>
        ))}
      </div>

      <TabBar active="results" dark={dark} platform={platform} />
    </Screen>
  );
}

Object.assign(window, { Suivi, Resultats });
