// screens-c.jsx — Détail d'une analyse, Profil / Carnet de santé
/* global APlus, FD, FB, FM, Ic, Dot, Chip, BloodMark, TabBar, Gauge, Sparkline, Screen, Card, topPad */

// ── 5 · DÉTAIL D'UNE ANALYSE ─────────────────────────────
function Detail({ dark, platform = 'ios' }) {
  const t = APlus(dark);
  const pts = [1.18, 1.24, 1.19, 1.31, 1.27, 1.42];
  return (
    <Screen dark={dark} platform={platform}>
      {/* back header */}
      <div style={{ padding: `${topPad(platform) + 12}px 16px 10px`, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 38, height: 38, borderRadius: 12, background: t.card, border: `1px solid ${t.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: t.shadowSm }}>
          <Ic name="chevron" size={18} c={t.inkSoft} sw={2.2} style={{ transform: 'rotate(180deg)' }} />
        </div>
        <div style={{ flex: 1, textAlign: 'center', paddingRight: 38 }}>
          <div style={{ font: `700 12px/1 ${FB}`, color: t.muted }}>Biochimie</div>
          <div style={{ font: `800 17px/1.1 ${FD}`, color: t.ink, marginTop: 3 }}>Cholestérol LDL</div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '6px 20px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* value + gauge */}
        <Card dark={dark} pad={20}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 26 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ font: `800 40px/1 ${FD}`, color: t.ink, letterSpacing: -1 }}>1,42</span>
                <span style={{ font: `700 16px/1 ${FM}`, color: t.muted }}>g/L</span>
              </div>
              <div style={{ font: `600 12.5px/1 ${FB}`, color: t.muted, marginTop: 7 }}>Prélevé le 18 mars 2026</div>
            </div>
            <Chip tone="warn" dark={dark} style={{ padding: '7px 12px', fontSize: 12.5 }}><Ic name="spark" size={14} sw={2} />À surveiller</Chip>
          </div>
          <Gauge min={0} max={2.2} low={0} high={1.3} value={1.42} unit="g/L" tone="warn" dark={dark} />
        </Card>

        {/* trend */}
        <Card dark={dark} pad={16}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ font: `800 14.5px/1 ${FD}`, color: t.ink }}>Évolution · 12 mois</span>
            <Chip tone="warn" dark={dark} style={{ padding: '4px 9px', fontSize: 11 }}>↑ +0,11 g/L</Chip>
          </div>
          <Sparkline points={pts} dark={dark} tone="warn" h={68} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, font: `600 10.5px/1 ${FM}`, color: t.faint }}>
            <span>Juin 25</span><span>Sept</span><span>Déc</span><span>Mars 26</span>
          </div>
        </Card>

        {/* interpretation */}
        <Card dark={dark} pad={16} style={{ display: 'flex', gap: 13 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: t.tealSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Ic name="pulse" size={20} c={t.teal} sw={1.9} />
          </div>
          <div>
            <div style={{ font: `800 14px/1.1 ${FD}`, color: t.ink }}>Ce que ça signifie</div>
            <div style={{ font: `500 13px/1.5 ${FB}`, color: t.inkSoft, marginTop: 5, textWrap: 'pretty' }}>
              Votre LDL dépasse légèrement le seuil recommandé de 1,30 g/L. Une adaptation alimentaire suffit souvent à le faire baisser. Un contrôle dans 3 mois est conseillé.
            </div>
          </div>
        </Card>

        {/* doctor note */}
        <Card dark={dark} pad={14} style={{ display: 'flex', alignItems: 'center', gap: 12, background: dark ? t.cardAlt : t.cardAlt }}>
          <div style={{ width: 40, height: 40, borderRadius: 99, background: t.tealDeep, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 14px/1 ${FD}` }}>NA</div>
          <div style={{ flex: 1 }}>
            <div style={{ font: `700 13.5px/1.1 ${FB}`, color: t.ink }}>Dr Nora Adjani · message</div>
            <div style={{ font: `500 12.5px/1.35 ${FB}`, color: t.muted, marginTop: 3 }}>« On en parle au prochain RDV, rien d'alarmant. »</div>
          </div>
          <Ic name="chevron" size={16} c={t.faint} sw={2} />
        </Card>
      </div>

      {/* CTA */}
      <div style={{ padding: '12px 20px', paddingBottom: platform === 'ios' ? 32 : 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, background: t.card, color: t.teal, border: `1.5px solid ${t.teal}`, borderRadius: 15, padding: '14px', font: `800 15px/1 ${FD}` }}>
          <Ic name="arrowR" size={18} sw={2} />Partager avec mon médecin
        </div>
      </div>
    </Screen>
  );
}

// ── 6 · PROFIL / CARNET DE SANTÉ ─────────────────────────
function Profil({ dark, platform = 'ios' }) {
  const t = APlus(dark);
  const Row = ({ icon, label, detail, last }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 16px', borderBottom: last ? 'none' : `1px solid ${t.line}` }}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: t.tealSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Ic name={icon} size={18} c={t.teal} sw={1.8} />
      </div>
      <span style={{ flex: 1, font: `600 14.5px/1.1 ${FB}`, color: t.ink }}>{label}</span>
      {detail && <span style={{ font: `600 13px/1 ${FB}`, color: t.muted }}>{detail}</span>}
      <Ic name="chevron" size={16} c={t.faint} sw={2} />
    </div>
  );
  const Toggle = ({ on }) => (
    <div style={{ width: 46, height: 28, borderRadius: 99, background: on ? t.teal : t.line, padding: 3, display: 'flex', justifyContent: on ? 'flex-end' : 'flex-start' }}>
      <div style={{ width: 22, height: 22, borderRadius: 99, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.25)' }} />
    </div>
  );
  return (
    <Screen dark={dark} platform={platform}>
      <div style={{ padding: `${topPad(platform) + 14}px 20px 6px` }}>
        <div style={{ font: `800 26px/1.1 ${FD}`, color: t.ink, letterSpacing: -0.5 }}>Mon carnet</div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '8px 20px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* patient card */}
        <Card dark={dark} pad={18} style={{ background: t.tealDeep, border: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: 99, background: 'rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 20px/1 ${FD}`, color: '#fff' }}>CL</div>
            <div style={{ flex: 1 }}>
              <div style={{ font: `800 19px/1.1 ${FD}`, color: '#fff' }}>Camille Lefèvre</div>
              <div style={{ font: `600 12.5px/1 ${FM}`, color: 'rgba(255,255,255,0.6)', marginTop: 5, letterSpacing: 0.3 }}>34 ans · Dossier #A4821</div>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <span style={{ font: `800 22px/1 ${FD}`, color: '#fff' }}>A</span>
              <span style={{ position: 'absolute', top: 8, right: 9, font: `800 15px/1 ${FD}`, color: t.gold }}>+</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 12px' }}>
              <div style={{ font: `600 10.5px/1 ${FB}`, color: 'rgba(255,255,255,0.55)' }}>N° SÉCU</div>
              <div style={{ font: `700 13px/1 ${FM}`, color: '#fff', marginTop: 5 }}>2 91 04 ·· ··· ·· 42</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 12px' }}>
              <div style={{ font: `600 10.5px/1 ${FB}`, color: 'rgba(255,255,255,0.55)' }}>MÉDECIN</div>
              <div style={{ font: `700 13px/1.1 ${FB}`, color: '#fff', marginTop: 5 }}>Dr N. Adjani</div>
            </div>
          </div>
        </Card>

        {/* dossier */}
        <div>
          <div style={{ font: `700 12px/1 ${FB}`, color: t.muted, letterSpacing: 0.4, textTransform: 'uppercase', margin: '0 2px 8px' }}>Dossier médical</div>
          <Card dark={dark} pad={0}>
            <Row icon="user" label="Informations personnelles" />
            <Row icon="doc" label="Documents & ordonnances" detail="6" />
            <Row icon="flask" label="Historique des analyses" detail="14" last />
          </Card>
        </div>

        {/* preferences */}
        <div>
          <div style={{ font: `700 12px/1 ${FB}`, color: t.muted, letterSpacing: 0.4, textTransform: 'uppercase', margin: '0 2px 8px' }}>Préférences</div>
          <Card dark={dark} pad={0}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 16px', borderBottom: `1px solid ${t.line}` }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: dark ? t.goldSoft : t.bgAlt, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Ic name="moon" size={18} c={dark ? t.gold : t.inkSoft} sw={1.8} />
              </div>
              <span style={{ flex: 1, font: `600 14.5px/1.1 ${FB}`, color: t.ink }}>Mode sombre</span>
              <Toggle on={dark} />
            </div>
            <Row icon="bell" label="Notifications" detail="Activées" last />
          </Card>
        </div>
      </div>

      <TabBar active="profil" dark={dark} platform={platform} />
    </Screen>
  );
}

Object.assign(window, { Detail, Profil });
