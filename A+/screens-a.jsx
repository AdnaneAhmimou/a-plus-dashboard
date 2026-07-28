// screens-a.jsx — Screen wrapper, Accueil (dashboard), Prise de rendez-vous
/* global APlus, FD, FB, FM, Ic, Dot, Chip, BloodMark, TabBar, SampleJourney */

function topPad(platform) { return platform === 'ios' ? 50 : 8; }

function Screen({ children, dark, platform = 'ios' }) {
  const t = APlus(dark);
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: t.bg, color: t.ink, fontFamily: FB, position: 'relative', overflow: 'hidden' }}>
      {children}
    </div>
  );
}

function Card({ children, dark, style, pad = 18 }) {
  const t = APlus(dark);
  return <div style={{ background: t.card, borderRadius: 22, padding: pad, boxShadow: t.shadowSm, border: `1px solid ${t.lineSoft}`, ...style }}>{children}</div>;
}

// ── 1 · ACCUEIL ──────────────────────────────────────────
function Accueil({ dark, platform = 'ios' }) {
  const t = APlus(dark);
  return (
    <Screen dark={dark} platform={platform}>
      {/* header */}
      <div style={{ padding: `${topPad(platform) + 14}px 20px 14px`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ font: `600 13px/1 ${FB}`, color: t.muted }}>Lundi 3 juin</div>
          <div style={{ font: `800 23px/1.1 ${FD}`, color: t.ink, marginTop: 5, letterSpacing: -0.4 }}>Bonjour, Camille</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <Ic name="bell" size={23} c={t.inkSoft} sw={1.7} />
            <span style={{ position: 'absolute', top: -1, right: -1, width: 8, height: 8, borderRadius: 99, background: t.gold, border: `1.5px solid ${t.bg}` }} />
          </div>
          <div style={{ width: 40, height: 40, borderRadius: 99, background: t.tealDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 15px/1 ${FD}`, color: '#fff' }}>CL</div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* hero — sample journey */}
        <Card dark={dark} pad={18} style={{ background: dark ? t.card : t.card }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <BloodMark size={34} dark={dark} />
              <div>
                <div style={{ font: `800 15px/1.1 ${FD}`, color: t.ink }}>Bilan sanguin complet</div>
                <div style={{ font: `600 11.5px/1 ${FM}`, color: t.muted, marginTop: 3, letterSpacing: 0.2 }}>Dossier&nbsp;#A4821</div>
              </div>
            </div>
            <Chip tone="gold" dark={dark}><Ic name="clock" size={13} sw={2} />Résultats · 5 juin</Chip>
          </div>
          <div style={{ height: 1, background: t.line, margin: '4px -4px 8px' }} />
          <SampleJourney active={2} dark={dark} gap={52} />
          <div style={{ marginTop: 8, paddingTop: 12, borderTop: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ font: `600 13px/1 ${FB}`, color: t.muted }}>3 étapes sur 5 terminées</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, font: `700 13px/1 ${FB}`, color: t.teal }}>Suivi détaillé <Ic name="arrowR" size={15} sw={2.1} /></span>
          </div>
        </Card>

        {/* quick cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Card dark={dark} pad={15}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: t.teal }}>
              <Ic name="calendar" size={18} sw={1.9} />
              <span style={{ font: `700 12px/1 ${FB}`, color: t.muted }}>Prochain RDV</span>
            </div>
            <div style={{ font: `800 18px/1.1 ${FD}`, color: t.ink, marginTop: 9 }}>12 juin</div>
            <div style={{ font: `600 12px/1.2 ${FB}`, color: t.muted, marginTop: 3 }}>08:15 · Lab Bastille</div>
          </Card>
          <Card dark={dark} pad={15}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: t.ok }}>
              <Ic name="shield" size={18} sw={1.9} />
              <span style={{ font: `700 12px/1 ${FB}`, color: t.muted }}>Dernier bilan</span>
            </div>
            <div style={{ font: `800 18px/1.1 ${FD}`, color: t.ink, marginTop: 9 }}>Tout normal</div>
            <div style={{ font: `600 12px/1.2 ${FB}`, color: t.muted, marginTop: 3 }}>18 mars · 14 valeurs</div>
          </Card>
        </div>

        {/* recent */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '2px 2px 9px' }}>
            <span style={{ font: `800 15px/1 ${FD}`, color: t.ink }}>Analyses récentes</span>
            <span style={{ font: `700 12.5px/1 ${FB}`, color: t.teal }}>Tout voir</span>
          </div>
          <Card dark={dark} pad={0}>
            {[
              ['Hémoglobine', '14,2 g/dL', 'ok', 'Normal'],
              ['Cholestérol LDL', '1,42 g/L', 'warn', 'À surveiller'],
              ['Glycémie à jeun', '0,92 g/L', 'ok', 'Normal'],
            ].map(([n, v, tone, lbl], i, a) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: i < a.length - 1 ? `1px solid ${t.line}` : 'none' }}>
                <Dot tone={tone} dark={dark} />
                <span style={{ flex: 1, font: `600 14.5px/1 ${FB}`, color: t.ink }}>{n}</span>
                <span style={{ font: `700 13.5px/1 ${FM}`, color: t.inkSoft }}>{v}</span>
                <span style={{ font: `600 11.5px/1 ${FB}`, color: tone === 'warn' ? t.warn : t.ok, width: 76, textAlign: 'right' }}>{lbl}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>

      <TabBar active="home" dark={dark} platform={platform} />
    </Screen>
  );
}

// ── 2 · PRISE DE RENDEZ-VOUS ─────────────────────────────
function RendezVous({ dark, platform = 'ios' }) {
  const t = APlus(dark);
  const days = [['LUN', '10'], ['MAR', '11'], ['MER', '12'], ['JEU', '13'], ['VEN', '14'], ['SAM', '15']];
  const slots = ['08:00', '08:15', '08:30', '09:00', '09:15', '09:45'];
  return (
    <Screen dark={dark} platform={platform}>
      <div style={{ padding: `${topPad(platform) + 14}px 20px 12px` }}>
        <div style={{ font: `600 13px/1 ${FB}`, color: t.muted }}>Étape 2 sur 3</div>
        <div style={{ font: `800 26px/1.1 ${FD}`, color: t.ink, marginTop: 6, letterSpacing: -0.5 }}>Choisir un créneau</div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '4px 20px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* selected analysis */}
        <Card dark={dark} pad={15} style={{ display: 'flex', alignItems: 'center', gap: 12, background: dark ? t.cardAlt : t.cardAlt }}>
          <BloodMark size={40} dark={dark} />
          <div style={{ flex: 1 }}>
            <div style={{ font: `800 15px/1.1 ${FD}`, color: t.ink }}>Bilan sanguin complet</div>
            <div style={{ font: `600 12.5px/1.2 ${FB}`, color: t.muted, marginTop: 3 }}>Prélèvement · à jeun · ~10 min</div>
          </div>
          <span style={{ font: `700 13px/1 ${FB}`, color: t.teal }}>Modifier</span>
        </Card>

        {/* location */}
        <div>
          <div style={{ font: `700 12px/1 ${FB}`, color: t.muted, letterSpacing: 0.4, textTransform: 'uppercase', margin: '0 2px 8px' }}>Point de prélèvement</div>
          <Card dark={dark} pad={0}>
            {[
              ['Laboratoire Bastille', '4 rue de la Roquette · 0,8 km', true],
              ['Laboratoire République', '12 bd Voltaire · 1,6 km', false],
            ].map(([n, addr, sel], i, a) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: i < a.length - 1 ? `1px solid ${t.line}` : 'none' }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: sel ? t.tealSoft : t.bgAlt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Ic name="pin" size={18} c={sel ? t.teal : t.faint} sw={1.8} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ font: `700 14.5px/1.1 ${FB}`, color: t.ink }}>{n}</div>
                  <div style={{ font: `500 12px/1.2 ${FB}`, color: t.muted, marginTop: 3 }}>{addr}</div>
                </div>
                <div style={{ width: 22, height: 22, borderRadius: 99, border: `2px solid ${sel ? t.teal : t.line}`, background: sel ? t.teal : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {sel && <Ic name="check" size={13} c="#fff" sw={2.6} />}
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* date picker */}
        <div>
          <div style={{ font: `700 12px/1 ${FB}`, color: t.muted, letterSpacing: 0.4, textTransform: 'uppercase', margin: '0 2px 8px' }}>Juin 2026</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8 }}>
            {days.map(([d, n], i) => {
              const on = i === 2;
              return (
                <div key={n} style={{ padding: '10px 0', borderRadius: 14, textAlign: 'center', background: on ? t.teal : t.card, border: `1px solid ${on ? t.teal : t.lineSoft}`, boxShadow: on ? 'none' : t.shadowSm }}>
                  <div style={{ font: `700 10px/1 ${FB}`, color: on ? 'rgba(255,255,255,0.7)' : t.faint, letterSpacing: 0.5 }}>{d}</div>
                  <div style={{ font: `800 17px/1 ${FD}`, color: on ? '#fff' : t.ink, marginTop: 6 }}>{n}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* time slots */}
        <div>
          <div style={{ font: `700 12px/1 ${FB}`, color: t.muted, letterSpacing: 0.4, textTransform: 'uppercase', margin: '0 2px 8px' }}>Créneaux · Mercredi 12</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {slots.map((s, i) => {
              const on = i === 1;
              return (
                <div key={s} style={{ padding: '11px 0', borderRadius: 12, textAlign: 'center', font: `700 14px/1 ${FM}`, letterSpacing: 0.3, background: on ? t.tealSoft : t.card, color: on ? t.teal : t.inkSoft, border: `1.5px solid ${on ? t.teal : t.lineSoft}` }}>{s}</div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '14px 20px', paddingBottom: platform === 'ios' ? 34 : 18, background: dark ? 'rgba(11,26,25,0.9)' : 'rgba(241,236,225,0.9)', backdropFilter: 'blur(12px)', borderTop: `1px solid ${t.line}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, background: t.teal, color: '#fff', borderRadius: 16, padding: '16px', font: `800 16px/1 ${FD}`, boxShadow: t.shadow }}>
          Confirmer · Mer. 12 juin, 08:15
        </div>
      </div>
    </Screen>
  );
}

Object.assign(window, { Screen, Card, topPad, Accueil, RendezVous });
