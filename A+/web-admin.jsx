// web-admin.jsx — Admin / laboratory portal pages
/* global React, WT, WFD, WFB, WFM, WIc, WCard, WChip, WBtn, WAvatar, RangeBar, LineChart, DonutRing, GroupBars, JourneyRail, StatTrend, PATIENTS, STATUS_LABEL, BILAN, AI_LDL, PageHead, SectionLabel, AIExplainCard */

// ── ADMIN · Vue d'ensemble ───────────────────────────────
function AdminOverview({ go }) {
  const kpis = [
    { icon: 'users', label: 'Patients actifs', value: '1 284', trend: <StatTrend dir="up" value="+38" tone={WT.ok} />, tone: 'purple' },
    { icon: 'vial', label: 'Échantillons en cours', value: '47', sub: 'Aujourd’hui', tone: 'info' },
    { icon: 'sparkle', label: 'Analyses IA générées', value: '312', trend: <StatTrend dir="up" value="+24 cette sem." tone={WT.ok} />, tone: 'purple' },
    { icon: 'clock', label: 'Délai moyen', value: '31 h', sub: 'Prélèvement → résultats', tone: 'ok' },
  ];
  const worklist = PATIENTS.slice(0, 5);
  return (
    <div>
      <PageHead eyebrow="Tableau de bord laboratoire" title="Vue d’ensemble"
        right={<div style={{ display: 'flex', gap: 10 }}><WBtn kind="ghost" icon="download">Exporter</WBtn><WBtn kind="primary" icon="plus">Nouvelle analyse</WBtn></div>} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18, marginBottom: 22 }}>
        {kpis.map((k) => (
          <WCard key={k.label} pad={20}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: WT[k.tone + 'Soft'] || WT.purpleSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><WIc name={k.icon} size={21} c={WT[k.tone]} sw={1.8} /></div>
              {k.trend}
            </div>
            <div style={{ font: `800 28px/1 ${WFD}`, color: WT.ink, marginTop: 16, letterSpacing: -0.5 }}>{k.value}</div>
            <div style={{ font: `600 12.5px/1 ${WFB}`, color: WT.muted, marginTop: 6 }}>{k.sub || k.label}</div>
          </WCard>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 20, marginBottom: 22 }}>
        {/* volume chart */}
        <WCard pad={24}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <div><div style={{ font: `800 16px/1 ${WFD}`, color: WT.ink }}>Volume d’analyses</div><div style={{ font: `600 12.5px/1 ${WFB}`, color: WT.muted, marginTop: 6 }}>7 derniers jours</div></div>
            <WChip tone="ok"><StatTrend dir="up" value="+12%" tone={WT.ok} /></WChip>
          </div>
          <LineChart points={[182, 210, 198, 245, 232, 268, 254]} labels={['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']} tone="purple" w={640} h={210} />
        </WCard>

        {/* status donut */}
        <WCard pad={24}>
          <div style={{ font: `800 16px/1 ${WFD}`, color: WT.ink, marginBottom: 18 }}>Répartition des échantillons</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            <DonutRing size={124} thickness={15}
              segments={[{ value: 12, color: WT.info }, { value: 18, color: WT.purple }, { value: 8, color: WT.warn }, { value: 9, color: WT.ok }]}
              center={<><div style={{ font: `800 22px/1 ${WFD}`, color: WT.ink }}>47</div><div style={{ font: `700 10px/1 ${WFB}`, color: WT.muted }}>ACTIFS</div></>} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              {[['Réception', 12, WT.info], ['Analyse', 18, WT.purple], ['Validation', 8, WT.warn], ['Prêts', 9, WT.ok]].map(([l, v, c]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 3, background: c }} />
                  <span style={{ font: `600 13px/1 ${WFB}`, color: WT.inkSoft, flex: 1 }}>{l}</span>
                  <span style={{ font: `700 13px/1 ${WFM}`, color: WT.ink }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </WCard>
      </div>

      {/* worklist */}
      <WCard pad={0}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px', borderBottom: `1px solid ${WT.line}` }}>
          <div style={{ font: `800 16px/1 ${WFD}`, color: WT.ink }}>File de travail · à traiter</div>
          <WBtn kind="quiet" size="sm" iconRight="arrowR" onClick={() => go('patients')}>Tous les patients</WBtn>
        </div>
        <PatientRows rows={worklist} go={go} />
      </WCard>
    </div>
  );
}

function PatientRows({ rows, go }) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1.4fr 1.4fr 40px', gap: 16, padding: '12px 22px', borderBottom: `1px solid ${WT.line}`, font: `700 11px/1 ${WFB}`, color: WT.faint, letterSpacing: 0.4, textTransform: 'uppercase' }}>
        <span>Patient</span><span>Dossier</span><span>Statut</span><span>Médecin</span><span></span>
      </div>
      {rows.map((p, i) => {
        const [lbl, tone] = STATUS_LABEL[p.status];
        return (
          <div key={p.id} onClick={() => go('profile', p.id)} className="row-h" style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1.4fr 1.4fr 40px', gap: 16, alignItems: 'center', padding: '14px 22px', borderBottom: i < rows.length - 1 ? `1px solid ${WT.line}` : 'none', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <WAvatar name={p.name} size={38} />
              <div>
                <div style={{ font: `700 14.5px/1.1 ${WFB}`, color: WT.ink }}>{p.name}</div>
                <div style={{ font: `600 12px/1 ${WFB}`, color: WT.muted, marginTop: 4 }}>{p.age} ans · {p.blood}</div>
              </div>
              {p.flagged > 0 && <WChip tone="high" style={{ fontSize: 10.5, padding: '3px 8px' }}>{`${p.flagged} anomalie${p.flagged > 1 ? 's' : ''}`}</WChip>}
            </div>
            <span style={{ font: `600 13px/1 ${WFM}`, color: WT.muted }}>#{p.id}</span>
            <span><WChip tone={tone}>{lbl}</WChip></span>
            <span style={{ font: `600 13px/1 ${WFB}`, color: WT.inkSoft }}>{p.doctor}</span>
            <WIc name="chevron" size={17} c={WT.faint} sw={2} />
          </div>
        );
      })}
    </div>
  );
}

// ── ADMIN · Patients (table + search) ────────────────────
function AdminPatients({ go }) {
  const [q, setQ] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const filters = [['all', 'Tous'], ['results', 'Résultats prêts'], ['analysis', 'En analyse'], ['flagged', 'Anomalies']];
  let rows = PATIENTS.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()) || p.id.toLowerCase().includes(q.toLowerCase()));
  if (filter === 'flagged') rows = rows.filter((p) => p.flagged > 0);
  else if (filter !== 'all') rows = rows.filter((p) => p.status === filter);
  return (
    <div>
      <PageHead eyebrow={`${PATIENTS.length} patients`} title="Patients"
        right={<WBtn kind="primary" icon="plus">Ajouter un patient</WBtn>} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
          <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}><WIc name="search" size={18} c={WT.faint} sw={1.9} /></div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un patient, un dossier…"
            style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: 12, border: `1px solid ${WT.line}`, background: WT.card, font: `500 14px ${WFB}`, color: WT.ink, outline: 'none', boxShadow: WT.shadowSm }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {filters.map(([id, lbl]) => (
            <button key={id} onClick={() => setFilter(id)} style={{ padding: '10px 15px', borderRadius: 10, border: `1px solid ${filter === id ? WT.purple : WT.line}`, background: filter === id ? WT.purpleSoft : WT.card, color: filter === id ? WT.purple : WT.muted, font: `700 13px/1 ${WFB}`, cursor: 'pointer' }}>{lbl}</button>
          ))}
        </div>
      </div>
      <WCard pad={0}>
        <PatientRows rows={rows} go={go} />
        {rows.length === 0 && <div style={{ padding: 40, textAlign: 'center', font: `600 14px ${WFB}`, color: WT.muted }}>Aucun patient trouvé.</div>}
      </WCard>
    </div>
  );
}

// ── ADMIN · Patient profile + AI generation ──────────────
function AdminProfile({ go, patientId }) {
  const p = PATIENTS.find((x) => x.id === patientId) || PATIENTS[0];
  const isCamille = p.id === 'A4821';
  const [aiState, setAiState] = React.useState(isCamille ? 'generated' : 'idle');
  const [tab, setTab] = React.useState('results');

  React.useEffect(() => {
    if (aiState === 'loading') {
      const t = setTimeout(() => setAiState('generated'), 2400);
      return () => clearTimeout(t);
    }
  }, [aiState]);

  const rows = BILAN.groups.flatMap((g) => g.rows);
  const [lbl, tone] = STATUS_LABEL[p.status];

  return (
    <div>
      <button onClick={() => go('patients')} className="back-h" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, font: `700 13px/1 ${WFB}`, color: WT.muted, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16, padding: 0 }}>
        <WIc name="chevron" size={16} sw={2.2} style={{ transform: 'rotate(180deg)' }} />Tous les patients
      </button>

      {/* patient header */}
      <WCard pad={24} style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <WAvatar name={p.name} size={64} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <h1 style={{ margin: 0, font: `800 26px/1 ${WFD}`, color: WT.ink, letterSpacing: -0.5 }}>{p.name}</h1>
              <WChip tone={tone}>{lbl}</WChip>
              {p.flagged > 0 && <WChip tone="high">{`${p.flagged} anomalie${p.flagged > 1 ? 's' : ''}`}</WChip>}
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 12, font: `600 13px/1 ${WFB}`, color: WT.muted, flexWrap: 'wrap' }}>
              <span>Dossier #{p.id}</span><span>{p.age} ans · {p.sex}</span><span>Groupe {p.blood}</span><span>{p.doctor}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><WIc name="mail" size={14} c={WT.faint} sw={1.8} />{p.email}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <WBtn kind="ghost" icon="phone" size="sm">Contacter</WBtn>
            <WBtn kind="ghost" icon="edit" size="sm">Éditer</WBtn>
          </div>
        </div>
      </WCard>

      {/* tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: `1px solid ${WT.line}`, marginBottom: 22 }}>
        {[['results', 'Analyses'], ['ai', 'Explication IA'], ['history', 'Historique'], ['docs', 'Documents']].map(([id, l]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: '12px 18px', background: 'none', border: 'none', borderBottom: `2px solid ${tab === id ? WT.purple : 'transparent'}`, color: tab === id ? WT.purple : WT.muted, font: `700 14px/1 ${WFB}`, cursor: 'pointer', marginBottom: -1 }}>{l}</button>
        ))}
      </div>

      {tab === 'results' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20, alignItems: 'start' }}>
          <div>
            <WCard pad={0} style={{ marginBottom: 20 }}>
              <div style={{ padding: '16px 22px', borderBottom: `1px solid ${WT.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ font: `800 15px/1 ${WFD}`, color: WT.ink }}>Bilan sanguin · {BILAN.date}</span>
                <span style={{ font: `700 13px/1 ${WFB}`, color: WT.ok }}>{BILAN.normal}/{BILAN.total} normaux</span>
              </div>
              {rows.map((r, i) => (
                <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '16px 1.4fr 1.5fr 110px', gap: 16, alignItems: 'center', padding: '14px 22px', borderBottom: i < rows.length - 1 ? `1px solid ${WT.line}` : 'none' }}>
                  <span style={{ width: 9, height: 9, borderRadius: 99, background: r.tone === 'warn' ? WT.warn : WT.ok }} />
                  <span style={{ font: `600 14px/1.1 ${WFB}`, color: WT.ink }}>{r.name}</span>
                  <RangeBar min={r.min} max={r.max} low={r.low} high={r.high} value={r.value} unit={r.unit} tone={r.tone} h={7} />
                  <span style={{ textAlign: 'right', font: `700 14px/1 ${WFM}`, color: WT.ink }}>{String(r.value).replace('.', ',')} <span style={{ color: WT.faint, fontSize: 10.5 }}>{r.unit}</span></span>
                </div>
              ))}
            </WCard>
          </div>

          {/* AI generation panel */}
          <div style={{ position: 'sticky', top: 24 }}>
            <AIGeneratePanel aiState={aiState} setAiState={setAiState} onView={() => setTab('ai')} />
            <WCard pad={20} style={{ marginTop: 20 }}>
              <SectionLabel>Suivi de l’échantillon</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[['Prélèvement', true], ['Réception', true], ['Analyse', p.status === 'analysis' || p.status === 'validation' || p.status === 'results'], ['Validation', p.status === 'validation' || p.status === 'results'], ['Résultats', p.status === 'results']].map(([l, done], i, a) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: i < a.length - 1 ? 14 : 0 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 99, background: done ? WT.purple : WT.card, border: `2px solid ${done ? WT.purple : WT.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{done && <WIc name="check" size={12} c="#fff" sw={2.6} />}</div>
                    <span style={{ font: `${done ? 700 : 600} 13.5px/1 ${WFB}`, color: done ? WT.ink : WT.faint }}>{l}</span>
                  </div>
                ))}
              </div>
            </WCard>
          </div>
        </div>
      )}

      {tab === 'ai' && (
        aiState === 'generated'
          ? <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <WCard pad={22}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 26 }}>
                    <div><div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}><span style={{ font: `800 40px/1 ${WFD}`, color: WT.ink }}>1,42</span><span style={{ font: `700 16px/1 ${WFM}`, color: WT.muted }}>g/L</span></div><div style={{ font: `600 13px/1 ${WFB}`, color: WT.muted, marginTop: 8 }}>Cholestérol LDL · au-dessus du seuil</div></div>
                    <WChip tone="warn" style={{ padding: '7px 12px' }}><WIc name="pulse" size={14} sw={2} />À surveiller</WChip>
                  </div>
                  <RangeBar min={0} max={2.2} low={0} high={1.3} value={1.42} unit="g/L" tone="warn" />
                </WCard>
                <WCard pad={22}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ font: `800 15px/1 ${WFD}`, color: WT.ink }}>Évolution · 12 mois</span><StatTrend dir="up" value="+0,11" /></div>
                  <LineChart points={[1.18, 1.24, 1.19, 1.31, 1.27, 1.42]} labels={['Juin', 'Juil', 'Sept', 'Nov', 'Jan', 'Mars']} refHigh={1.3} tone="warn" w={520} h={170} min={1.0} max={1.6} />
                </WCard>
              </div>
              <AIExplainCard ai={AI_LDL} />
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <WBtn kind="primary" icon="send">Publier vers l’espace patient</WBtn>
                <WBtn kind="ghost" icon="edit">Modifier avant publication</WBtn>
                <WBtn kind="ghost" icon="sparkle" onClick={() => setAiState('loading')}>Régénérer</WBtn>
              </div>
            </div>
          : <AIGeneratePanel aiState={aiState} setAiState={setAiState} big />
      )}

      {tab === 'history' && (
        <WCard pad={0}>
          {[['Bilan sanguin complet', '18 mars 2026', '13/14 normaux', 'warn'], ['Bilan lipidique', '4 janvier 2026', 'Tout normal', 'ok'], ['NFS + CRP', '12 octobre 2025', 'Tout normal', 'ok'], ['Bilan thyroïdien', '3 juillet 2025', 'Tout normal', 'ok']].map(([n, d, res, t], i, a) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 22px', borderBottom: i < a.length - 1 ? `1px solid ${WT.line}` : 'none' }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: WT.purpleSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><WIc name="flask" size={20} c={WT.purple} sw={1.7} /></div>
              <div style={{ flex: 1 }}><div style={{ font: `700 14.5px/1.1 ${WFB}`, color: WT.ink }}>{n}</div><div style={{ font: `600 12.5px/1 ${WFB}`, color: WT.muted, marginTop: 5 }}>{d}</div></div>
              <WChip tone={t}>{res}</WChip>
              <WBtn kind="quiet" size="sm" iconRight="arrowR">Ouvrir</WBtn>
            </div>
          ))}
        </WCard>
      )}

      {tab === 'docs' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
          {[['Compte-rendu 18/03', 'file'], ['Ordonnance', 'doc'], ['Consentement RGPD', 'shield']].map(([n, ic]) => (
            <WCard key={n} pad={20} hover style={{ cursor: 'pointer' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: WT.purpleSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><WIc name={ic} size={22} c={WT.purple} sw={1.7} /></div>
              <div style={{ font: `700 14.5px/1.2 ${WFB}`, color: WT.ink, marginTop: 14 }}>{n}</div>
              <div style={{ font: `600 12px/1 ${WFB}`, color: WT.muted, marginTop: 6 }}>PDF</div>
            </WCard>
          ))}
        </div>
      )}
    </div>
  );
}

// The AI generation call-to-action / loading / done states
function AIGeneratePanel({ aiState, setAiState, onView, big }) {
  if (aiState === 'loading') {
    return (
      <WCard pad={big ? 40 : 24} style={{ border: `1px solid ${WT.purpleLine}`, background: `linear-gradient(150deg, ${WT.purpleSoft2}, ${WT.card})`, textAlign: 'center' }}>
        <div className="ai-pulse" style={{ width: 60, height: 60, borderRadius: 18, background: `linear-gradient(135deg, ${WT.purpleDeep}, ${WT.purpleMid})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
          <WIc name="sparkle" size={30} c="#fff" sw={1.7} />
        </div>
        <div style={{ font: `800 17px/1.2 ${WFD}`, color: WT.ink }}>Génération de l’analyse…</div>
        <div style={{ font: `500 13.5px/1.5 ${WFB}`, color: WT.muted, marginTop: 8, maxWidth: 340, marginLeft: 'auto', marginRight: 'auto' }}>L’IA clinique interprète les 14 paramètres, croise l’historique et rédige une explication en langage clair.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20, maxWidth: 320, marginLeft: 'auto', marginRight: 'auto' }}>
          {[['Lecture des valeurs', true], ['Comparaison aux références', true], ['Analyse des tendances', false], ['Rédaction de l’explication', false]].map(([l, done], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, font: `600 13px/1 ${WFB}`, color: done ? WT.ink : WT.faint }}>
              {done ? <WIc name="check" size={16} c={WT.ok} sw={2.4} /> : <div className="ai-dot" style={{ width: 14, height: 14, borderRadius: 99, border: `2px solid ${WT.purpleLine}`, borderTopColor: WT.purple }} />}
              {l}
            </div>
          ))}
        </div>
      </WCard>
    );
  }
  if (aiState === 'generated' && !big) {
    return (
      <WCard pad={22} style={{ border: `1px solid ${WT.purpleLine}`, background: `linear-gradient(150deg, ${WT.purpleSoft2}, ${WT.card})` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: `linear-gradient(135deg, ${WT.purpleDeep}, ${WT.purpleMid})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><WIc name="sparkle" size={21} c="#fff" sw={1.8} /></div>
          <div><div style={{ font: `800 15px/1.1 ${WFD}`, color: WT.ink }}>Explication IA prête</div><div style={{ font: `600 11.5px/1 ${WFB}`, color: WT.ok, marginTop: 4 }}>● Publiée vers le patient</div></div>
        </div>
        <div style={{ font: `500 13px/1.5 ${WFB}`, color: WT.inkSoft, textWrap: 'pretty' }}>{AI_LDL.headline}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}><WBtn kind="primary" size="sm" icon="eye" onClick={onView} style={{ flex: 1 }}>Voir l’analyse</WBtn><WBtn kind="ghost" size="sm" icon="sparkle" onClick={() => setAiState('loading')}>Régénérer</WBtn></div>
      </WCard>
    );
  }
  // idle
  return (
    <WCard pad={big ? 40 : 24} style={{ border: `1px dashed ${WT.purpleMid}`, background: WT.purpleSoft2, textAlign: big ? 'center' : 'left' }}>
      <div style={{ width: 52, height: 52, borderRadius: 15, background: `linear-gradient(135deg, ${WT.purpleDeep}, ${WT.purpleMid})`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: big ? '0 auto 18px' : '0 0 16px' }}><WIc name="sparkle" size={27} c="#fff" sw={1.7} /></div>
      <div style={{ font: `800 ${big ? 20 : 16}px/1.2 ${WFD}`, color: WT.ink }}>Générer l’explication IA</div>
      <div style={{ font: `500 13.5px/1.55 ${WFB}`, color: WT.muted, marginTop: 8, textWrap: 'pretty', maxWidth: big ? 420 : 'none', marginLeft: big ? 'auto' : 0, marginRight: big ? 'auto' : 0 }}>
        Transformez ce bilan en une explication claire pour le patient : résumé en langage simple, facteurs, graphiques et recommandations.
      </div>
      <div style={{ marginTop: 20 }}>
        <WBtn kind="primary" icon="sparkle" onClick={() => setAiState('loading')} style={big ? {} : { width: '100%' }}>Analyser avec l’IA clinique</WBtn>
      </div>
      {big && <div style={{ font: `500 11.5px/1.5 ${WFB}`, color: WT.faint, marginTop: 14 }}>Le résultat est toujours relu et validé par un biologiste avant publication.</div>}
    </WCard>
  );
}

// ── ADMIN · Analyses (lab worklist) ──────────────────────
function AdminAnalyses({ go }) {
  const queue = PATIENTS.map((p, i) => ({ ...p, sample: `#S-${9040 + i}`, tests: [8, 14, 6, 11, 9, 14, 7, 12][i], eta: ['2h', '4h', 'Demain', '1h', '3h', '5h', 'Demain', '2h'][i] }));
  return (
    <div>
      <PageHead eyebrow="Paillasse" title="File d’analyses"
        right={<div style={{ display: 'flex', gap: 10 }}><WBtn kind="ghost" icon="filter">Filtrer</WBtn><WBtn kind="primary" icon="plus">Enregistrer un prélèvement</WBtn></div>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 22 }}>
        {[['Réception', 12, WT.info], ['En analyse', 18, WT.purple], ['Validation', 8, WT.warn], ['Prêts', 9, WT.ok]].map(([l, v, c]) => (
          <WCard key={l} pad={18}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ width: 9, height: 9, borderRadius: 3, background: c }} /><span style={{ font: `700 12.5px/1 ${WFB}`, color: WT.muted }}>{l}</span></div>
            <div style={{ font: `800 26px/1 ${WFD}`, color: WT.ink, marginTop: 12 }}>{v}</div>
          </WCard>
        ))}
      </div>
      <WCard pad={0}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1.3fr 40px', gap: 16, padding: '12px 22px', borderBottom: `1px solid ${WT.line}`, font: `700 11px/1 ${WFB}`, color: WT.faint, letterSpacing: 0.4, textTransform: 'uppercase' }}>
          <span>Patient</span><span>Échantillon</span><span>Paramètres</span><span>Délai</span><span>Statut</span><span></span>
        </div>
        {queue.map((p, i) => {
          const [lbl, tone] = STATUS_LABEL[p.status];
          return (
            <div key={p.id} onClick={() => go('profile', p.id)} className="row-h" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1.3fr 40px', gap: 16, alignItems: 'center', padding: '14px 22px', borderBottom: i < queue.length - 1 ? `1px solid ${WT.line}` : 'none', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}><WAvatar name={p.name} size={34} /><div><div style={{ font: `700 14px/1.1 ${WFB}`, color: WT.ink }}>{p.name}</div><div style={{ font: `600 11.5px/1 ${WFB}`, color: WT.muted, marginTop: 3 }}>#{p.id}</div></div></div>
              <span style={{ font: `600 13px/1 ${WFM}`, color: WT.muted }}>{p.sample}</span>
              <span style={{ font: `600 13.5px/1 ${WFB}`, color: WT.inkSoft }}>{p.tests} tests</span>
              <span style={{ font: `700 13px/1 ${WFB}`, color: p.eta === 'Demain' ? WT.muted : WT.purple }}>{p.eta}</span>
              <span><WChip tone={tone}>{lbl}</WChip></span>
              <WIc name="chevron" size={17} c={WT.faint} sw={2} />
            </div>
          );
        })}
      </WCard>
    </div>
  );
}

Object.assign(window, { AdminOverview, AdminPatients, AdminProfile, AdminAnalyses, AIGeneratePanel });
