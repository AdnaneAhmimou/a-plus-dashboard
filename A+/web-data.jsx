// web-data.jsx — shared mock data for patient + admin apps
/* global WT */

const PATIENTS = [
  { id: 'A4821', name: 'Camille Lefèvre', age: 34, sex: 'F', blood: 'A+', phone: '06 42 18 55 09', email: 'camille.lefevre@email.fr', doctor: 'Dr N. Adjani', lastVisit: '18 mars 2026', status: 'results', flagged: 1 },
  { id: 'A4822', name: 'Marc Deloin', age: 51, sex: 'H', blood: 'O+', phone: '06 11 90 44 21', email: 'm.deloin@email.fr', doctor: 'Dr P. Roux', lastVisit: '2 juin 2026', status: 'analysis', flagged: 2 },
  { id: 'A4823', name: 'Yasmine Bouchra', age: 29, sex: 'F', blood: 'B+', phone: '07 55 22 10 88', email: 'y.bouchra@email.fr', doctor: 'Dr N. Adjani', lastVisit: '3 juin 2026', status: 'reception', flagged: 0 },
  { id: 'A4824', name: 'Philippe Martel', age: 63, sex: 'H', blood: 'A-', phone: '06 78 34 12 90', email: 'p.martel@email.fr', doctor: 'Dr L. Simon', lastVisit: '1 juin 2026', status: 'results', flagged: 3 },
  { id: 'A4825', name: 'Sofia Almeida', age: 41, sex: 'F', blood: 'AB+', phone: '07 12 66 78 03', email: 's.almeida@email.fr', doctor: 'Dr P. Roux', lastVisit: '3 juin 2026', status: 'validation', flagged: 0 },
  { id: 'A4826', name: 'Thomas Girard', age: 47, sex: 'H', blood: 'O-', phone: '06 90 55 11 27', email: 't.girard@email.fr', doctor: 'Dr N. Adjani', lastVisit: '30 mai 2026', status: 'results', flagged: 1 },
  { id: 'A4827', name: 'Aïcha Benali', age: 38, sex: 'F', blood: 'A+', phone: '07 44 09 88 12', email: 'a.benali@email.fr', doctor: 'Dr L. Simon', lastVisit: '2 juin 2026', status: 'analysis', flagged: 0 },
  { id: 'A4828', name: 'Julien Faure', age: 55, sex: 'H', blood: 'B-', phone: '06 33 71 45 60', email: 'j.faure@email.fr', doctor: 'Dr P. Roux', lastVisit: '29 mai 2026', status: 'results', flagged: 2 },
];

const STATUS_LABEL = {
  reception: ['Réception', 'info'],
  analysis: ['Analyse en cours', 'purple'],
  validation: ['Validation', 'warn'],
  results: ['Résultats prêts', 'ok'],
};

// Camille's bilan (the demo patient)
const BILAN = {
  patient: 'A4821',
  date: '18 mars 2026',
  ref: '#A4821-0318',
  normal: 13, total: 14,
  groups: [
    { name: 'Hématologie', rows: [
      { id: 'hb', name: 'Hémoglobine', value: 14.2, unit: 'g/dL', low: 12, high: 16, min: 8, max: 20, tone: 'ok' },
      { id: 'gb', name: 'Globules blancs', value: 6.8, unit: 'G/L', low: 4, high: 10, min: 2, max: 14, tone: 'ok' },
      { id: 'plt', name: 'Plaquettes', value: 241, unit: 'G/L', low: 150, high: 400, min: 80, max: 500, tone: 'ok' },
    ]},
    { name: 'Biochimie', rows: [
      { id: 'glu', name: 'Glycémie à jeun', value: 0.92, unit: 'g/L', low: 0.7, high: 1.1, min: 0.4, max: 1.8, tone: 'ok' },
      { id: 'ldl', name: 'Cholestérol LDL', value: 1.42, unit: 'g/L', low: 0, high: 1.3, min: 0, max: 2.2, tone: 'warn', trend: [1.18, 1.24, 1.19, 1.31, 1.27, 1.42], trendLabels: ['Juin', 'Juil', 'Sept', 'Nov', 'Jan', 'Mars'] },
      { id: 'hdl', name: 'Cholestérol HDL', value: 0.58, unit: 'g/L', low: 0.4, high: 1.0, min: 0.2, max: 1.4, tone: 'ok' },
      { id: 'tg', name: 'Triglycérides', value: 1.05, unit: 'g/L', low: 0, high: 1.5, min: 0, max: 3, tone: 'ok' },
      { id: 'crea', name: 'Créatinine', value: 8.1, unit: 'mg/L', low: 6, high: 11, min: 3, max: 16, tone: 'ok' },
    ]},
  ],
};

// AI-generated explanation for the LDL result (shared patient/admin)
const AI_LDL = {
  status: 'generated', // 'idle' | 'loading' | 'generated'
  model: 'A+ Clinical AI',
  generatedAt: '18 mars 2026, 14:22',
  headline: 'Votre cholestérol LDL est légèrement au-dessus de la normale',
  plain: "Le LDL est parfois appelé « mauvais cholestérol ». À 1,42 g/L, votre valeur dépasse un peu le seuil recommandé de 1,30 g/L. Ce n'est pas alarmant, mais la tendance monte depuis un an — c'est le bon moment pour agir simplement.",
  factors: [
    { label: 'Alimentation riche en graisses saturées', weight: 'Élevé', tone: 'high' },
    { label: 'Activité physique réduite', weight: 'Modéré', tone: 'warn' },
    { label: 'Facteur héréditaire', weight: 'Faible', tone: 'ok' },
  ],
  actions: [
    'Privilégier les graisses insaturées (huile d’olive, poissons gras)',
    'Viser 30 min d’activité physique, 5 fois par semaine',
    'Nouveau contrôle du bilan lipidique dans 3 mois',
  ],
  compare: [
    { label: 'Vous', value: 1.42, tone: 'warn' },
    { label: 'Seuil', value: 1.30, ref: 1.30, tone: 'ok' },
    { label: 'Moy. âge', value: 1.15, tone: 'ok' },
  ],
};

Object.assign(window, { PATIENTS, STATUS_LABEL, BILAN, AI_LDL });
