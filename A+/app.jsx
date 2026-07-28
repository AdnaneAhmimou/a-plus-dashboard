// app.jsx — assembles the Laboratoire A+ screens onto the design canvas
const { DesignCanvas, DCSection, DCArtboard } = window;
const { IOSDevice, AndroidDevice } = window;
const { Accueil, RendezVous, Suivi, Resultats, Detail, Profil } = window;
const { SampleJourney, BloodMark, Chip, Ic, APlus, FD, FB, FM } = window;

function Frame({ children, bg = '#ece8e0' }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg }}>
      {children}
    </div>
  );
}

// iOS artboard sizing: device 402×874 + breathing room for the shadow
const IW = 402 + 76, IH = 874 + 70;
const AW = 412 + 76, AH = 892 + 70;

function IOS({ children, bg }) {
  return <Frame bg={bg}><IOSDevice>{children}</IOSDevice></Frame>;
}
function DroidWrap({ children, dark, bg }) {
  return <Frame bg={bg}><AndroidDevice dark={dark}>{children}</AndroidDevice></Frame>;
}

// ── palette directions for the signature hero ────────────
const DIRS = [
  { id: 'd-a', name: 'A · Pétrole & Or', sub: 'Direction retenue', teal: '#0E6E63', tealDeep: '#0B3A38', gold: '#C9912F', tealSoft: '#DCEEEA', goldSoft: '#F3E6C7' },
  { id: 'd-b', name: 'B · Forêt & Corail', sub: 'Plus chaleureux', teal: '#1A6B4A', tealDeep: '#123D2C', gold: '#E0735B', tealSoft: '#DCEDE4', goldSoft: '#F8E2DB' },
  { id: 'd-c', name: 'C · Encre & Ambre', sub: 'Plus clinique', teal: '#1F4E79', tealDeep: '#13314D', gold: '#D99021', tealSoft: '#DEE8F1', goldSoft: '#F5E7CB' },
];

function DirectionHero({ d }) {
  const t = APlus(false);
  const colors = { teal: d.teal, tealDeep: d.tealDeep, gold: d.gold, tealSoft: d.tealSoft, goldSoft: d.goldSoft };
  return (
    <Frame bg="#ece8e0">
      <div style={{ width: 348, background: '#fff', borderRadius: 22, padding: 18, boxShadow: '0 1px 2px rgba(21,48,47,.06), 0 10px 30px rgba(21,48,47,.08)', border: '1px solid rgba(21,48,47,.06)', fontFamily: FB }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 34, height: 34, borderRadius: 12, background: d.tealDeep, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <span style={{ font: `800 15px/1 ${FD}`, color: '#fff' }}>A</span>
              <span style={{ position: 'absolute', top: 5, right: 6, font: `800 11px/1 ${FD}`, color: d.gold }}>+</span>
            </div>
            <div>
              <div style={{ font: `800 15px/1.1 ${FD}`, color: '#15302F' }}>Bilan sanguin complet</div>
              <div style={{ font: `600 11.5px/1 ${FM}`, color: '#728582', marginTop: 3, letterSpacing: 0.2 }}>Dossier&nbsp;#A4821</div>
            </div>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, font: `700 11.5px/1 ${FB}`, color: d.gold, background: d.goldSoft, padding: '6px 9px', borderRadius: 99 }}>5 juin</span>
        </div>
        <div style={{ height: 1, background: 'rgba(21,48,47,.1)', margin: '4px -4px 8px' }} />
        <SampleJourney active={2} dark={false} gap={52} colors={colors} />
        <div style={{ marginTop: 8, paddingTop: 12, borderTop: '1px solid rgba(21,48,47,.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ font: `600 13px/1 ${FB}`, color: '#728582' }}>3 étapes sur 5 terminées</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, font: `700 13px/1 ${FB}`, color: d.teal }}>Suivi <Ic name="arrowR" size={15} sw={2.1} c={d.teal} /></span>
        </div>
      </div>
    </Frame>
  );
}

function App() {
  return (
    <DesignCanvas>
      <DCSection id="flow-ios" title="Laboratoire A+ · Parcours patient" subtitle="6 écrans — du rendez-vous aux résultats · iOS">
        <DCArtboard id="ios-accueil" label="01 · Accueil" width={IW} height={IH}><IOS><Accueil platform="ios" /></IOS></DCArtboard>
        <DCArtboard id="ios-rdv" label="02 · Prendre rendez-vous" width={IW} height={IH}><IOS><RendezVous platform="ios" /></IOS></DCArtboard>
        <DCArtboard id="ios-suivi" label="03 · Suivi de l'échantillon" width={IW} height={IH}><IOS><Suivi platform="ios" /></IOS></DCArtboard>
        <DCArtboard id="ios-results" label="04 · Résultats" width={IW} height={IH}><IOS><Resultats platform="ios" /></IOS></DCArtboard>
        <DCArtboard id="ios-detail" label="05 · Détail d'une analyse" width={IW} height={IH}><IOS><Detail platform="ios" /></IOS></DCArtboard>
        <DCArtboard id="ios-profil" label="06 · Carnet de santé" width={IW} height={IH}><IOS><Profil platform="ios" /></IOS></DCArtboard>
      </DCSection>

      <DCSection id="dark" title="Mode sombre" subtitle="Les écrans clés en thème sombre">
        <DCArtboard id="dk-accueil" label="Accueil" width={IW} height={IH}><IOS bg="#0a1413"><Accueil dark platform="ios" /></IOS></DCArtboard>
        <DCArtboard id="dk-detail" label="Détail · Cholestérol" width={IW} height={IH}><IOS bg="#0a1413"><Detail dark platform="ios" /></IOS></DCArtboard>
        <DCArtboard id="dk-profil" label="Carnet de santé" width={IW} height={IH}><IOS bg="#0a1413"><Profil dark platform="ios" /></IOS></DCArtboard>
      </DCSection>

      <DCSection id="android" title="Material 3 · Android" subtitle="La même expérience, adaptée à Android">
        <DCArtboard id="and-accueil" label="Accueil" width={AW} height={AH}><DroidWrap><Accueil platform="android" /></DroidWrap></DCArtboard>
        <DCArtboard id="and-results" label="Résultats" width={AW} height={AH}><DroidWrap><Resultats platform="android" /></DroidWrap></DCArtboard>
        <DCArtboard id="and-suivi" label="Suivi" width={AW} height={AH}><DroidWrap><Suivi platform="android" /></DroidWrap></DCArtboard>
      </DCSection>

      <DCSection id="dirs" title="Directions visuelles" subtitle="Trois pistes de palette pour la carte signature — le parcours de l'échantillon">
        {DIRS.map((d) => (
          <DCArtboard key={d.id} id={d.id} label={d.name} width={400} height={430}><DirectionHero d={d} /></DCArtboard>
        ))}
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
