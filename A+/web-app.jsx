// web-app.jsx — shell: role switch, sidebar, topbar, routing
const { WT, WFD, WFB, WFM, WIc, Logo, WBtn, WChip, WAvatar } = window;
const { PatientHome, PatientResults, PatientDetail, PatientRdv, PatientDocs } = window;
const { AdminOverview, AdminPatients, AdminProfile, AdminAnalyses } = window;

const PATIENT_NAV = [
  ['home', 'Tableau de bord', 'grid'],
  ['results', 'Mes résultats', 'flask'],
  ['rdv', 'Rendez-vous', 'calendar'],
  ['docs', 'Documents', 'doc'],
];
const ADMIN_NAV = [
  ['overview', 'Vue d’ensemble', 'grid'],
  ['patients', 'Patients', 'users'],
  ['analyses', 'File d’analyses', 'flask'],
];

function Sidebar({ role, page, go }) {
  const nav = role === 'patient' ? PATIENT_NAV : ADMIN_NAV;
  const pageGroup = { detail: 'results', profile: 'patients' }[page] || page;
  return (
    <aside style={{ width: 250, flexShrink: 0, background: WT.card, borderRight: `1px solid ${WT.line}`, display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>
      <div style={{ padding: '22px 22px 18px' }}>
        <Logo h={38} />
      </div>
      <div style={{ padding: '0 14px' }}>
        <div style={{ font: `700 11px/1 ${WFB}`, color: WT.faint, letterSpacing: 0.5, textTransform: 'uppercase', padding: '10px 10px 12px' }}>
          {role === 'patient' ? 'Espace patient' : 'Portail laboratoire'}
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {nav.map(([id, label, icon]) => {
            const on = pageGroup === id;
            return (
              <button key={id} onClick={() => go(id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 11, border: 'none', cursor: 'pointer', background: on ? WT.purpleSoft : 'transparent', color: on ? WT.purple : WT.inkSoft, font: `${on ? 700 : 600} 14px/1 ${WFB}`, textAlign: 'left', width: '100%' }}>
                <WIc name={icon} size={20} c={on ? WT.purple : WT.muted} sw={on ? 2 : 1.7} />
                {label}
              </button>
            );
          })}
        </nav>
      </div>

      <div style={{ marginTop: 'auto', padding: 14 }}>
        {role === 'admin' && (
          <div style={{ padding: 16, borderRadius: 14, background: `linear-gradient(150deg, ${WT.purpleDeep}, ${WT.purple})`, marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><WIc name="sparkle" size={18} c="#fff" sw={1.8} /><span style={{ font: `800 13px/1 ${WFD}`, color: '#fff' }}>IA clinique</span></div>
            <div style={{ font: `500 11.5px/1.45 ${WFB}`, color: 'rgba(255,255,255,0.8)' }}>312 explications générées ce mois. 24 crédits restants.</div>
          </div>
        )}
        <button onClick={() => go('settings')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 11, border: 'none', cursor: 'pointer', background: 'transparent', color: WT.muted, font: `600 14px/1 ${WFB}`, width: '100%', textAlign: 'left' }}>
          <WIc name="settings" size={20} c={WT.muted} sw={1.7} />Paramètres
        </button>
      </div>
    </aside>
  );
}

function TopBar({ role, setRole, resetPage }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 34px', borderBottom: `1px solid ${WT.line}`, background: 'rgba(247,245,248,0.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 20 }}>
      {/* search */}
      <div style={{ position: 'relative', width: 320 }}>
        <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }}><WIc name="search" size={17} c={WT.faint} sw={1.9} /></div>
        <input placeholder={role === 'patient' ? 'Rechercher une analyse…' : 'Rechercher patient, dossier, analyse…'}
          style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: 11, border: `1px solid ${WT.line}`, background: WT.card, font: `500 13.5px ${WFB}`, color: WT.ink, outline: 'none' }} />
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* role switch */}
        <div style={{ display: 'flex', gap: 3, padding: 4, borderRadius: 11, background: WT.lineSoft, border: `1px solid ${WT.line}` }}>
          {[['patient', 'Patient', 'user'], ['admin', 'Admin', 'shield']].map(([id, l, ic]) => {
            const on = role === id;
            return (
              <button key={id} onClick={() => { setRole(id); resetPage(id); }} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', background: on ? WT.card : 'transparent', color: on ? WT.purple : WT.muted, font: `700 13px/1 ${WFB}`, boxShadow: on ? WT.shadowSm : 'none' }}>
                <WIc name={ic} size={15} sw={2} />{l}
              </button>
            );
          })}
        </div>
        <div style={{ position: 'relative' }}>
          <WIc name="bell" size={22} c={WT.inkSoft} sw={1.7} />
          <span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: 99, background: WT.purple, border: `1.5px solid ${WT.bg}` }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <WAvatar name={role === 'patient' ? 'Camille Lefèvre' : 'Nora Adjani'} size={38} tone={role === 'patient' ? WT.purpleDeep : WT.purple} />
          <div>
            <div style={{ font: `700 13.5px/1.1 ${WFB}`, color: WT.ink }}>{role === 'patient' ? 'Camille Lefèvre' : 'Dr Nora Adjani'}</div>
            <div style={{ font: `600 11.5px/1 ${WFB}`, color: WT.muted, marginTop: 3 }}>{role === 'patient' ? 'Patiente · A+' : 'Biologiste'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Placeholder({ title }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', textAlign: 'center' }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: WT.purpleSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}><WIc name="settings" size={28} c={WT.purple} sw={1.6} /></div>
      <div style={{ font: `800 20px/1 ${WFD}`, color: WT.ink }}>{title}</div>
      <div style={{ font: `500 14px/1 ${WFB}`, color: WT.muted, marginTop: 8 }}>Écran de démonstration — non détaillé dans cette maquette.</div>
    </div>
  );
}

function App() {
  const [role, setRole] = React.useState('patient');
  const [page, setPage] = React.useState('home');
  const [patientId, setPatientId] = React.useState('A4821');

  const go = (p, id) => { if (id) setPatientId(id); setPage(p); window.scrollTo(0, 0); };
  const resetPage = (r) => setPage(r === 'patient' ? 'home' : 'overview');

  let content;
  if (role === 'patient') {
    content = { home: <PatientHome go={go} />, results: <PatientResults go={go} />, detail: <PatientDetail go={go} />, rdv: <PatientRdv />, docs: <PatientDocs /> }[page] || <Placeholder title="Paramètres" />;
  } else {
    content = { overview: <AdminOverview go={go} />, patients: <AdminPatients go={go} />, profile: <AdminProfile go={go} patientId={patientId} />, analyses: <AdminAnalyses go={go} /> }[page] || <Placeholder title="Paramètres" />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: WT.bg }}>
      <Sidebar role={role} page={page} go={go} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar role={role} setRole={setRole} resetPage={resetPage} />
        <main style={{ flex: 1, padding: '34px 40px 60px', maxWidth: 1320, width: '100%', margin: '0 auto' }} key={role + page + patientId}>
          <div className="fade-in">{content}</div>
        </main>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
