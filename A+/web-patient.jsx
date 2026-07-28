// web-patient.jsx — Patient portal pages (content only; shell is in web-app)
/* global WT, WFD, WFB, WFM, WIc, WCard, WChip, WBtn, WAvatar, RangeBar, LineChart, DonutRing, GroupBars, JourneyRail, BILAN, AI_LDL, StatTrend */

function PageHead({ eyebrow, title, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
      <div>
        {eyebrow && <div style={{ font: `700 12px/1 ${WFB}`, color: WT.purple, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>{eyebrow}</div>}
        <h1 style={{ margin: 0, font: `800 30px/1.05 ${WFD}`, color: WT.ink, letterSpacing: -0.6 }}>{title}</h1>
      </div>
      {right}
    </div>
  );
}

function SectionLabel({ children, style }) {
  return <div style={{ font: `700 12px/1 ${WFB}`, color: WT.muted, letterSpacing: 0.5, textTransform: 'uppercase', margin: '0 0 14px', ...style }}>{children}</div>;
}

// ── PATIENT · Tableau de bord ────────────────────────────
function PatientHome({ go }) {
  return (
    <div>
      <PageHead eyebrow="Espace patient" title="Bonjour, Camille"
        right={<WBtn kind="ghost" icon="download">Télécharger mon bilan</WBtn>} />

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, alignItems: 'start' }}>
        {/* journey hero */}
        <WCard pad={26}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
            <div>
              <div style={{ font: `700 13px/1 ${WFM}`, color: WT.muted, letterSpacing: 0.3 }}>DOSSIER #A4821</div>
              <div style={{ font: `800 20px/1.1 ${WFD}`, color: WT.ink, marginTop: 7 }}>Bilan sanguin complet</div>
            </div>
            <WChip tone="purple"><WIc name="clock" size={13} sw={2} />Résultats estimés · 5 juin</WChip>
          </div>
          <div style={{ padding: '8px 4px 4px' }}><JourneyRail active={2} /></div>
          <div style={{ marginTop: 22, paddingTop: 18, borderTop: `1px solid ${WT.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ font: `600 14px/1 ${WFB}`, color: WT.muted }}>3 étapes sur 5 terminées · échantillon en cours d’analyse</span>
            <WBtn kind="soft" size="sm" iconRight="arrowR" onClick={() => go('results')}>Voir le suivi</WBtn>
          </div>
        </WCard>

        {/* health score */}
        <WCard pad={26} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <SectionLabel style={{ alignSelf: 'flex-start' }}>Dernier bilan · 18 mars</SectionLabel>
          <DonutRing size={140} thickness={16}
            segments={[{ value: 13, color: WT.ok }, { value: 1, color: WT.warn }]}
            center={<><div style={{ font: `800 30px/1 ${WFD}`, color: WT.ink }}>13<span style={{ font: `700 16px/1 ${WFD}`, color: WT.faint }}>/14</span></div><div style={{ font: `700 11px/1 ${WFB}`, color: WT.ok, marginTop: 4 }}>DANS LA NORME</div></>} />
          <div style={{ font: `600 13.5px/1.5 ${WFB}`, color: WT.muted, marginTop: 16, textWrap: 'pretty' }}>13 valeurs normales, 1 à surveiller (cholestérol LDL).</div>
        </WCard>
      </div>

      {/* quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginTop: 20 }}>
        {[
          ['calendar', 'Prochain rendez-vous', '12 juin · 08:15', 'Laboratoire Bastille', 'purple'],
          ['flask', 'Analyses cette année', '3 bilans', '48 paramètres suivis', 'info'],
          ['sparkle', 'Explications IA', '2 disponibles', 'Cholestérol · Glycémie', 'purple'],
        ].map(([icon, label, big, sub, tone]) => (
          <WCard key={label} pad={20}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, color: WT[tone] }}>
              <WIc name={icon} size={19} sw={1.9} /><span style={{ font: `700 12.5px/1 ${WFB}`, color: WT.muted }}>{label}</span>
            </div>
            <div style={{ font: `800 22px/1.1 ${WFD}`, color: WT.ink, marginTop: 12 }}>{big}</div>
            <div style={{ font: `600 13px/1.2 ${WFB}`, color: WT.muted, marginTop: 5 }}>{sub}</div>
          </WCard>
        ))}
      </div>

      {/* recent results preview */}
      <div style={{ marginTop: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ margin: 0, font: `800 19px/1 ${WFD}`, color: WT.ink }}>Résultats récents</h2>
          <WBtn kind="quiet" size="sm" iconRight="arrowR" onClick={() => go('results')}>Tout voir</WBtn>
        </div>
        <WCard pad={0}>
          {BILAN.groups.flatMap((g) => g.rows).slice(0, 4).map((r, i, a) => (
            <div key={r.id} onClick={() => go('detail')} className="row-h" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 22px', borderBottom: i < a.length - 1 ? `1px solid ${WT.line}` : 'none', cursor: 'pointer' }}>
              <span style={{ width: 9, height: 9, borderRadius: 99, background: r.tone === 'warn' ? WT.warn : WT.ok, flexShrink: 0 }} />
              <span style={{ flex: 1, font: `600 15px/1 ${WFB}`, color: WT.ink }}>{r.name}</span>
              <span style={{ font: `600 12.5px/1 ${WFB}`, color: r.tone === 'warn' ? WT.warn : WT.ok }}>{r.tone === 'warn' ? 'À surveiller' : 'Normal'}</span>
              <span style={{ font: `700 15px/1 ${WFM}`, color: WT.ink, width: 90, textAlign: 'right' }}>{String(r.value).replace('.', ',')} <span style={{ color: WT.faint, fontSize: 11 }}>{r.unit}</span></span>
              <WIc name="chevron" size={17} c={WT.faint} sw={2} />
            </div>
          ))}
        </WCard>
      </div>
    </div>
  );
}

// ── PATIENT · Mes résultats ──────────────────────────────
function PatientResults({ go }) {
  return (
    <div>
      <PageHead eyebrow="Bilan du 18 mars 2026" title="Mes résultats"
        right={<div style={{ display: 'flex', gap: 10 }}><WBtn kind="ghost" icon="print">Imprimer</WBtn><WBtn kind="primary" icon="download">Télécharger le PDF</WBtn></div>} />

      {/* summary banner */}
      <WCard pad={24} style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24, background: `linear-gradient(100deg, ${WT.purpleSoft2}, ${WT.card} 60%)` }}>
        <DonutRing size={92} thickness={12} segments={[{ value: 13, color: WT.ok }, { value: 1, color: WT.warn }]}
          center={<div style={{ font: `800 19px/1 ${WFD}`, color: WT.ink }}>93%</div>} />
        <div style={{ flex: 1 }}>
          <div style={{ font: `800 20px/1.15 ${WFD}`, color: WT.ink }}>Un très bon bilan, une valeur à surveiller</div>
          <div style={{ font: `500 14px/1.5 ${WFB}`, color: WT.muted, marginTop: 6, textWrap: 'pretty', maxWidth: 620 }}>13 des 14 paramètres sont dans la norme. Votre cholestérol LDL est légèrement élevé — une explication détaillée générée par notre IA clinique est disponible.</div>
        </div>
        <WBtn kind="soft" icon="sparkle" onClick={() => go('detail')}>Voir l’explication IA</WBtn>
      </WCard>

      {BILAN.groups.map((g) => (
        <div key={g.name} style={{ marginBottom: 22 }}>
          <SectionLabel>{g.name}</SectionLabel>
          <WCard pad={0}>
            {g.rows.map((r, i, a) => (
              <div key={r.id} onClick={() => go('detail')} className="row-h" style={{ display: 'grid', gridTemplateColumns: '16px 1.4fr 1.6fr 130px 20px', alignItems: 'center', gap: 18, padding: '16px 22px', borderBottom: i < a.length - 1 ? `1px solid ${WT.line}` : 'none', cursor: 'pointer' }}>
                <span style={{ width: 9, height: 9, borderRadius: 99, background: r.tone === 'warn' ? WT.warn : WT.ok }} />
                <div>
                  <div style={{ font: `600 15px/1.1 ${WFB}`, color: WT.ink }}>{r.name}</div>
                  <div style={{ font: `600 11.5px/1 ${WFB}`, color: r.tone === 'warn' ? WT.warn : WT.muted, marginTop: 5 }}>{r.tone === 'warn' ? 'Au-dessus de la référence' : 'Dans la norme'}</div>
                </div>
                <div style={{ paddingRight: 8 }}><RangeBar min={r.min} max={r.max} low={r.low} high={r.high} value={r.value} unit={r.unit} tone={r.tone} h={8} /></div>
                <div style={{ textAlign: 'right' }}><span style={{ font: `700 16px/1 ${WFM}`, color: WT.ink }}>{String(r.value).replace('.', ',')}</span> <span style={{ font: `600 11px/1 ${WFM}`, color: WT.faint }}>{r.unit}</span></div>
                <WIc name="chevron" size={17} c={WT.faint} sw={2} />
              </div>
            ))}
          </WCard>
        </div>
      ))}
    </div>
  );
}

// ── PATIENT · Détail analyse (with AI explanation) ───────
function AIExplainCard({ ai, patientView }) {
  return (
    <WCard pad={0} style={{ overflow: 'hidden', border: `1px solid ${WT.purpleLine}` }}>
      <div style={{ padding: '18px 24px', background: `linear-gradient(100deg, ${WT.purpleDeep}, ${WT.purple})`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(255,255,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <WIc name="sparkle" size={22} c="#fff" sw={1.8} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ font: `800 15px/1.1 ${WFD}`, color: '#fff' }}>Explication générée par l’IA</div>
          <div style={{ font: `600 11.5px/1 ${WFB}`, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>{ai.model} · {ai.generatedAt}</div>
        </div>
        <span style={{ font: `700 11px/1 ${WFB}`, color: '#fff', background: 'rgba(255,255,255,0.16)', padding: '6px 11px', borderRadius: 99, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <WIc name="stethoscope" size={13} sw={2} />Validé biologiste
        </span>
      </div>
      <div style={{ padding: 24 }}>
        <div style={{ font: `800 19px/1.3 ${WFD}`, color: WT.ink, marginBottom: 10, textWrap: 'pretty' }}>{ai.headline}</div>
        <div style={{ font: `500 15px/1.65 ${WFB}`, color: WT.inkSoft, textWrap: 'pretty' }}>{ai.plain}</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 }}>
          {/* comparison bars */}
          <div>
            <SectionLabel>Où vous situez-vous&nbsp;?</SectionLabel>
            <div style={{ padding: '8px 6px 0' }}><GroupBars unit="g/L" data={ai.compare} h={170} /></div>
          </div>
          {/* factors */}
          <div>
            <SectionLabel>Facteurs contributifs probables</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ai.factors.map((f) => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: WT.bg, borderRadius: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 99, background: WT[f.tone], flexShrink: 0 }} />
                  <span style={{ flex: 1, font: `600 13.5px/1.3 ${WFB}`, color: WT.ink }}>{f.label}</span>
                  <WChip tone={f.tone} style={{ fontSize: 11, padding: '4px 9px' }}>{f.weight}</WChip>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* recommendations */}
        <div style={{ marginTop: 22, padding: 18, borderRadius: 14, background: WT.purpleSoft2, border: `1px solid ${WT.purpleLine}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <WIc name="shield" size={18} c={WT.purple} sw={1.9} />
            <span style={{ font: `800 14px/1 ${WFD}`, color: WT.purpleDeep }}>Recommandations</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {ai.actions.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 20, height: 20, borderRadius: 99, background: WT.purple, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}><WIc name="check" size={12} c="#fff" sw={2.6} /></div>
                <span style={{ font: `500 14px/1.45 ${WFB}`, color: WT.inkSoft }}>{a}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 16, font: `500 11.5px/1.5 ${WFB}`, color: WT.faint, textWrap: 'pretty' }}>
          Cette explication est générée automatiquement à titre informatif et validée par un biologiste. Elle ne remplace pas l’avis de votre médecin.
        </div>
      </div>
    </WCard>
  );
}

function PatientDetail({ go }) {
  const r = BILAN.groups[1].rows.find((x) => x.id === 'ldl');
  return (
    <div>
      <button onClick={() => go('results')} className="back-h" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, font: `700 13px/1 ${WFB}`, color: WT.muted, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, padding: 0 }}>
        <WIc name="chevron" size={16} sw={2.2} style={{ transform: 'rotate(180deg)' }} />Retour aux résultats
      </button>
      <PageHead eyebrow="Biochimie · Bilan lipidique" title="Cholestérol LDL"
        right={<WBtn kind="ghost" icon="send">Partager avec mon médecin</WBtn>} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <WCard pad={24}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 30 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ font: `800 44px/1 ${WFD}`, color: WT.ink, letterSpacing: -1 }}>1,42</span>
                <span style={{ font: `700 17px/1 ${WFM}`, color: WT.muted }}>g/L</span>
              </div>
              <div style={{ font: `600 13px/1 ${WFB}`, color: WT.muted, marginTop: 8 }}>Prélevé le 18 mars 2026</div>
            </div>
            <WChip tone="warn" style={{ padding: '8px 13px', fontSize: 13 }}><WIc name="pulse" size={15} sw={2} />À surveiller</WChip>
          </div>
          <RangeBar min={0} max={2.2} low={0} high={1.3} value={1.42} unit="g/L" tone="warn" />
        </WCard>

        <WCard pad={24}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ font: `800 15px/1 ${WFD}`, color: WT.ink }}>Évolution sur 12 mois</span>
            <StatTrend dir="up" value="+0,11 g/L" />
          </div>
          <LineChart points={r.trend} labels={r.trendLabels} refHigh={1.3} tone="warn" w={520} h={180} min={1.0} max={1.6} />
        </WCard>
      </div>

      <AIExplainCard ai={AI_LDL} patientView />
    </div>
  );
}

// ── PATIENT · Rendez-vous ────────────────────────────────
function PatientRdv() {
  const appts = [
    { date: '12 juin 2026', time: '08:15', lab: 'Laboratoire Bastille', type: 'Bilan sanguin complet', status: 'upcoming' },
    { date: '18 mars 2026', time: '08:00', lab: 'Laboratoire Bastille', type: 'Bilan lipidique + glycémie', status: 'done' },
    { date: '4 janvier 2026', time: '09:30', lab: 'Laboratoire République', type: 'Numération formule sanguine', status: 'done' },
  ];
  return (
    <div>
      <PageHead eyebrow="Espace patient" title="Mes rendez-vous"
        right={<WBtn kind="primary" icon="plus">Prendre rendez-vous</WBtn>} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {appts.map((a, i) => (
          <WCard key={i} pad={22} style={a.status === 'upcoming' ? { borderColor: WT.purpleLine, boxShadow: WT.shadow } : {}}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <WChip tone={a.status === 'upcoming' ? 'purple' : 'muted'}>{a.status === 'upcoming' ? 'À venir' : 'Effectué'}</WChip>
              {a.status === 'upcoming' && <WIc name="calendar" size={20} c={WT.purple} sw={1.8} />}
            </div>
            <div style={{ font: `800 22px/1.1 ${WFD}`, color: WT.ink }}>{a.date}</div>
            <div style={{ font: `700 15px/1 ${WFM}`, color: WT.purple, marginTop: 6 }}>{a.time}</div>
            <div style={{ height: 1, background: WT.line, margin: '16px 0' }} />
            <div style={{ font: `600 14.5px/1.3 ${WFB}`, color: WT.ink }}>{a.type}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, font: `500 13px/1 ${WFB}`, color: WT.muted, marginTop: 8 }}><WIc name="pulse" size={15} c={WT.faint} sw={1.8} />{a.lab}</div>
            {a.status === 'upcoming' && <div style={{ display: 'flex', gap: 10, marginTop: 18 }}><WBtn kind="soft" size="sm">Modifier</WBtn><WBtn kind="quiet" size="sm">Annuler</WBtn></div>}
          </WCard>
        ))}
      </div>
    </div>
  );
}

// ── PATIENT · Documents ──────────────────────────────────
function PatientDocs() {
  const docs = [
    ['Bilan sanguin complet', 'PDF · 18 mars 2026', 'file'],
    ['Ordonnance – Dr Adjani', 'PDF · 15 mars 2026', 'doc'],
    ['Bilan lipidique', 'PDF · 4 janvier 2026', 'file'],
    ['Carte de groupe sanguin', 'PDF · A+', 'shield'],
    ['Attestation de prélèvement', 'PDF · 18 mars 2026', 'doc'],
  ];
  return (
    <div>
      <PageHead eyebrow="Espace patient" title="Mes documents" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
        {docs.map(([n, meta, icon]) => (
          <WCard key={n} pad={20} hover style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: WT.purpleSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><WIc name={icon} size={22} c={WT.purple} sw={1.7} /></div>
              <WIc name="download" size={19} c={WT.faint} sw={1.9} />
            </div>
            <div style={{ font: `700 15px/1.2 ${WFB}`, color: WT.ink, marginTop: 16 }}>{n}</div>
            <div style={{ font: `600 12.5px/1 ${WFB}`, color: WT.muted, marginTop: 6 }}>{meta}</div>
          </WCard>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { PageHead, SectionLabel, AIExplainCard, PatientHome, PatientResults, PatientDetail, PatientRdv, PatientDocs });
