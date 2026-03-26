import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import {
  Plus,
  Trash2,
  Droplets,
  Sprout,
  Gauge,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Library,
  Printer,
  Settings2,
  Eye,
  Save,
  FolderOpen,
  Download,
  Upload,
  History,
  Building2,
  ShieldAlert,
  FileSpreadsheet,
  CalendarDays,
  Copy,
  FileWarning,
  Stamp,
} from "lucide-react";

const BRETTES_LOGO = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUGBgwIBw8ICA8eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAEtARgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtBAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhBxMiMoGRobEUQlKx0fAjYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDxyiiiv3E8wKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA/9k=";

const seasonProfiles = {
  printemps: { label: "Printemps", weeksPerYear: 10, daysPerWeek: 2, durationFactor: 0.85 },
  ete: { label: "Été", weeksPerYear: 14, daysPerWeek: 4, durationFactor: 1.15 },
  automne: { label: "Automne", weeksPerYear: 6, daysPerWeek: 2, durationFactor: 0.75 },
  personnalise: { label: "Personnalisé", weeksPerYear: 30, daysPerWeek: 3, durationFactor: 1 },
};

const irrigationMonthsOptions = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Août",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];

const zoneProfiles = {
  massif: { label: "Massif", suggestedMode: "goutte", suggestedDuration: 0.75 },
  pelouse: { label: "Pelouse", suggestedMode: "tuyere", suggestedDuration: 0.35 },
  haie: { label: "Haie", suggestedMode: "goutte", suggestedDuration: 0.6 },
  arbustes: { label: "Arbustes", suggestedMode: "goutte", suggestedDuration: 0.7 },
  mixte: { label: "Zone mixte", suggestedMode: "goutte", suggestedDuration: 0.5 },
};

const defaultLibraries = {
  alertThresholds: {
    goutte: 2.0,
    tuyere: 2.5,
    pgp: 2.5,
  },
  goutte: [
    { key: "g16", label: "Goutteur 1,6 L/h", unitLh: 1.6, lineSpacingM: 0.33, emitterSpacingM: 0.35 },
    { key: "g20", label: "Goutteur 2,0 L/h", unitLh: 2.0, lineSpacingM: 0.33, emitterSpacingM: 0.35 },
    { key: "g22", label: "Goutteur 2,2 L/h", unitLh: 2.2, lineSpacingM: 0.33, emitterSpacingM: 0.35 },
  ],
  tuyere: [
    { key: "t90", label: "Hunter Tuyère 12A 90°", angle: "90°", flowM3h: 0.143, minPressureBar: 2.5 },
    { key: "t180", label: "Hunter Tuyère 12A 180°", angle: "180°", flowM3h: 0.286, minPressureBar: 2.5 },
    { key: "t360", label: "Hunter Tuyère 12A 360°", angle: "360°", flowM3h: 0.572, minPressureBar: 2.5 },
  ],
  pgp: [
    { key: "pr90", label: "Hunter PGP rouge 90°", angle: "90°", flowM3h: 0.23, minPressureBar: 2.5 },
    { key: "pr180", label: "Hunter PGP rouge 180°", angle: "180°", flowM3h: 0.45, minPressureBar: 2.5 },
    { key: "pr360", label: "Hunter PGP rouge 360°", angle: "360°", flowM3h: 0.87, minPressureBar: 2.5 },
  ],
  evLoss: [
    { key: "100-DV", label: "100-DV", dpRefBar: 0.48, qRef: 9, minPressureBar: 1.0 },
    { key: "100-PGA", label: "100-PGA", dpRefBar: 0.48, qRef: 9, minPressureBar: 1.0 },
    { key: "150-PGA", label: "150-PGA", dpRefBar: 0.38, qRef: 12, minPressureBar: 1.0 },
    { key: "200-PGA", label: "200-PGA", dpRefBar: 0.12, qRef: 12, minPressureBar: 1.0 },
  ],
  blockLoss: [
    { key: "DN25", label: "DN25", lossBarAtQmax: 0.6, qMax: 3 },
    { key: "DN32", label: "DN32", lossBarAtQmax: 0.8, qMax: 6 },
    { key: "DN40", label: "DN40", lossBarAtQmax: 1.0, qMax: 10 },
    { key: "DN50", label: "DN50", lossBarAtQmax: 1.1, qMax: 18 },
    { key: "DN63", label: "DN63", lossBarAtQmax: 0.8, qMax: 30 },
  ],
  pipeDiameters: {
    75: { internalMm: 61.4 },
    63: { internalMm: 51.4 },
    50: { internalMm: 40.9 },
    40: { internalMm: 32.7 },
    32: { internalMm: 26.2 },
    25: { internalMm: 20.5 },
  },
};

function round(value, digits = 2) {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function flowPerM2(item) {
  const unit = toNumber(item?.unitLh);
  const lineSpacing = toNumber(item?.lineSpacingM);
  const emitterSpacing = toNumber(item?.emitterSpacingM);
  if (unit <= 0 || lineSpacing <= 0 || emitterSpacing <= 0) return 0;
  return unit / 1000 / (lineSpacing * emitterSpacing);
}

function getEmitterOptions(mode, libraries) {
  if (mode === "goutte") return libraries.goutte;
  if (mode === "pgp") return libraries.pgp;
  return libraries.tuyere;
}

function getGoutteRef(libraries, key) {
  return libraries.goutte.find((item) => item.key === key) || libraries.goutte[0];
}

function getEvByKey(libraries, key) {
  return libraries.evLoss.find((item) => item.key === key) || libraries.evLoss[0];
}

function getBlockByKey(libraries, key) {
  return libraries.blockLoss.find((item) => item.key === key) || libraries.blockLoss[0];
}

function recommendedMeter(flow) {
  if (flow > 18) return "DN63";
  if (flow > 10) return "DN50";
  if (flow > 6) return "DN40";
  if (flow > 3) return "DN32";
  return "DN25";
}

function recommendedPrimary(flow) {
  if (flow > 18) return "Ø75";
  if (flow > 10) return "Ø63";
  if (flow > 6) return "Ø50";
  if (flow > 3) return "Ø40";
  return "Ø32";
}

function recommendedEv(flow) {
  if (flow > 12) return "200-PGA";
  if (flow > 9) return "150-PGA";
  return "100-DV";
}

function computeSourcePressureBar(flowM3h, chantier) {
  const staticBar = toNumber(chantier.staticPressureBar);
  const dynamicBar = chantier.dynamicPressureBar === "" ? null : toNumber(chantier.dynamicPressureBar);
  const dynamicFlow = chantier.dynamicFlowM3h === "" ? null : toNumber(chantier.dynamicFlowM3h);
  const reducerBar = chantier.reducerBar === "" ? null : toNumber(chantier.reducerBar);
  const n = toNumber(chantier.lossExponentN, 2);
  let sourceBar = staticBar;
  if (dynamicBar !== null && dynamicFlow !== null && dynamicFlow > 0) {
    sourceBar = staticBar - (staticBar - dynamicBar) * Math.pow(Math.max(flowM3h, 0) / dynamicFlow, n);
  }
  if (reducerBar !== null && reducerBar > 0) {
    sourceBar = Math.min(sourceBar, reducerBar);
  }
  return sourceBar;
}

function computeBlockLossBar(flowM3h, meterKey, chantier, libraries) {
  const block = getBlockByKey(libraries, meterKey);
  if (!block || flowM3h <= 0 || block.qMax <= 0) return 0;
  return block.lossBarAtQmax * Math.pow(flowM3h / block.qMax, toNumber(chantier.lossExponentN, 2));
}

function computePipeLossBar(flowM3h, lengthsByDiameter, chantier, libraries, diameters) {
  if (flowM3h <= 0) return 0;
  const C = toNumber(chantier.hazenWilliamsC, 140);
  const qM3s = flowM3h / 3600;
  let mce = 0;
  for (const d of diameters) {
    const length = Math.max(toNumber(lengthsByDiameter[d]), 0);
    const internal = libraries.pipeDiameters[d]?.internalMm;
    if (!length || !internal) continue;
    const dMeters = internal / 1000;
    mce += (10.67 * length * Math.pow(qM3s, 1.852)) / (Math.pow(C, 1.852) * Math.pow(dMeters, 4.871));
  }
  return mce * toNumber(chantier.mceToBar, 0.0980665) * (1 + toNumber(chantier.primaryAccessoryMargin, 0.15));
}

function computeEvLossBar(flowM3h, evKey, chantier, libraries) {
  const ev = getEvByKey(libraries, evKey);
  if (!ev || flowM3h <= 0 || ev.qRef <= 0) return 0;
  return ev.dpRefBar * Math.pow(flowM3h / ev.qRef, 2) + toNumber(chantier.evFittingsForfaitBar, 0.03);
}

function computeSectorFlow(sector, libraries) {
  if (sector.mode === "goutte") {
    const ref = getGoutteRef(libraries, sector.goutteRef);
    return round(toNumber(sector.surface) * flowPerM2(ref), 3);
  }
  const options = getEmitterOptions(sector.mode, libraries);
  const byKey = Object.fromEntries(options.map((item) => [item.key, item]));
  return round(
    toNumber(sector.qty1) * toNumber(byKey[sector.ref1]?.flowM3h) +
      toNumber(sector.qty2) * toNumber(byKey[sector.ref2]?.flowM3h) +
      toNumber(sector.qty3) * toNumber(byKey[sector.ref3]?.flowM3h),
    3
  );
}

function computeSector(sector, chantier, libraries) {
  const totalFlowBase = computeSectorFlow(sector, libraries);
  const simultaneity = toNumber(chantier.simultaneityCoefficient, 1);
  const designFlow = round(totalFlowBase * simultaneity, 3);
  const sourcePressure = computeSourcePressureBar(designFlow, chantier);
  const blockLoss = computeBlockLossBar(designFlow, chantier.compteurDn, chantier, libraries);
  const primaryLoss = computePipeLossBar(designFlow, sector.primary, chantier, libraries, [75, 63, 50, 40, 32, 25]);
  const pressureBeforeEv = sourcePressure - blockLoss - primaryLoss - toNumber(sector.deltaZ) / 10.2;
  const retainedEv = sector.evType || recommendedEv(designFlow);
  const evLoss = computeEvLossBar(designFlow, retainedEv, chantier, libraries);
  const pressureAfterEv = pressureBeforeEv - evLoss;
  const ratioA = sector.evPosition === "bout" ? 1 : (sector.ratioA === "" ? 0.5 : toNumber(sector.ratioA) / 100);
  const qA = round(sector.evPosition === "bout" ? designFlow : designFlow * ratioA, 3);
  const qB = round(sector.evPosition === "bout" ? 0 : designFlow - qA, 3);
  const secondaryLossA = computePipeLossBar(qA, sector.secondaryA, chantier, libraries, [50, 40, 32, 25]);
  const secondaryLossB = sector.evPosition === "bout" ? 0 : computePipeLossBar(qB, sector.secondaryB, chantier, libraries, [50, 40, 32, 25]);
  const secondaryRetained = sector.evPosition === "bout" ? secondaryLossA : Math.max(secondaryLossA, secondaryLossB);
  const pressureAtEmitters = pressureAfterEv - secondaryRetained;
  const evMin = toNumber(getEvByKey(libraries, retainedEv)?.minPressureBar, 1);
  const networkMin = toNumber(libraries.alertThresholds?.[sector.mode], sector.mode === "goutte" ? 2 : 2.5);
  const minRequired = Math.max(evMin, networkMin);
  const duration = toNumber(sector.durationHours, toNumber(chantier.defaultDurationHours, 0.5));
  const volumePerDay = round(totalFlowBase * duration, 3);
  const volumePerWeek = round(volumePerDay * toNumber(sector.wateringDaysPerWeek, 0), 3);
  const volumePerMonth = round(volumePerWeek * toNumber(chantier.averageWeeksPerMonth, 4.33), 3);
  const volumePerYear = round(volumePerWeek * toNumber(chantier.irrigationWeeksPerYear, 30), 3);
  const primaryLengthTotal = [75, 63, 50, 40, 32, 25].reduce((sum, d) => sum + toNumber(sector.primary[d]), 0);
  const issues = [];
  if (totalFlowBase <= 0) issues.push("Débit secteur nul ou incomplet");
  if (sector.mode !== "goutte" && toNumber(sector.qty1) + toNumber(sector.qty2) + toNumber(sector.qty3) <= 0) issues.push("Aucune buse renseignée");
  if (sector.mode === "goutte" && toNumber(sector.surface) <= 0) issues.push("Surface goutte-à-goutte non renseignée");
  if (pressureAtEmitters < minRequired && designFlow > 0) issues.push(`Pression finale insuffisante (< ${minRequired} bar)`);
  if (sourcePressure <= 0) issues.push("Pression source incohérente");
  if (sector.evPosition === "milieu" && (toNumber(sector.ratioA) < 0 || toNumber(sector.ratioA) > 100)) issues.push("Répartition côté A hors plage 0 à 100 %");
  if (primaryLengthTotal <= 0) issues.push("ML de primaire non renseigné");
  if (qA > 0 && Object.values(sector.secondaryA).every((v) => toNumber(v) === 0)) issues.push("Secondaire côté A non renseigné");
  if (sector.evPosition === "milieu" && qB > 0 && Object.values(sector.secondaryB).every((v) => toNumber(v) === 0)) issues.push("Secondaire côté B non renseigné");
  return {
    totalFlowBase,
    designFlow,
    sourcePressure,
    blockLoss,
    primaryLoss,
    pressureBeforeEv,
    evLoss,
    pressureAfterEv,
    qA,
    qB,
    secondaryLossA,
    secondaryLossB,
    secondaryRetained,
    pressureAtEmitters,
    minRequired,
    volumePerDay,
    volumePerWeek,
    volumePerMonth,
    volumePerYear,
    primaryLengthTotal,
    retainedEv,
    issues,
    alert: issues.length > 0,
  };
}

function newSector(index = 1) {
  return {
    id: `${Date.now()}-${index}-${Math.random()}`,
    name: `Secteur ${index}`,
    zone: "Massif",
    profile: "massif",
    mode: "goutte",
    surface: 100,
    durationHours: 0.5,
    wateringDaysPerWeek: 3,
    wateringDaysLabel: "Lun / Mer / Ven",
    goutteRef: "g16",
    ref1: "t90",
    qty1: 0,
    ref2: "t180",
    qty2: 0,
    ref3: "t360",
    qty3: 0,
    deltaZ: 0,
    evType: "100-DV",
    evPosition: "milieu",
    ratioA: 50,
    primary: { 75: 0, 63: 0, 50: 0, 40: 0, 32: 0, 25: 0 },
    secondaryA: { 50: 0, 40: 0, 32: 0, 25: 0 },
    secondaryB: { 50: 0, 40: 0, 32: 0, 25: 0 },
  };
}

function duplicateSectorData(sector) {
  return {
    ...JSON.parse(JSON.stringify(sector)),
    id: `${Date.now()}-${Math.random()}`,
    name: `${sector.name} copie`,
  };
}

function buildAlertSummary(issues) {
  if (!issues.length) return "Aucune alerte détectée. Le dossier semble cohérent pour édition.";
  const primary = issues.filter((i) => /primaire/i.test(i)).length;
  const pressure = issues.filter((i) => /Pression finale insuffisante/i.test(i)).length;
  const secondary = issues.filter((i) => /Secondaire/i.test(i)).length;
  const missing = issues.filter((i) => /nul|non renseigné|Aucune buse/i.test(i)).length;
  const parts = [];
  if (pressure) parts.push(`${pressure} secteur(s) ont une pression finale insuffisante`);
  if (primary) parts.push(`${primary} secteur(s) ont un primaire non renseigné`);
  if (secondary) parts.push(`${secondary} secteur(s) ont un secondaire incomplet`);
  if (missing) parts.push(`${missing} point(s) de saisie restent incomplets`);
  return parts.length ? `${parts.join(". ")}. Une correction est recommandée avant édition du document.` : `${issues.length} alerte(s) sont présentes. Une vérification avant impression est recommandée.`;
}

function createLibraryItem(type) {
  const unique = `${type}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  if (type === "goutte") return { key: unique, label: "Nouveau goutteur", unitLh: 0, lineSpacingM: 0.33, emitterSpacingM: 0.35 };
  if (type === "evLoss") return { key: unique, label: "Nouvelle EV", dpRefBar: 0, qRef: 1, minPressureBar: 1 };
  if (type === "blockLoss") return { key: unique, label: "Nouveau DN", lossBarAtQmax: 0, qMax: 1 };
  return { key: unique, label: "Nouvelle buse", angle: "", flowM3h: 0, minPressureBar: 2.5 };
}

function NumberField({ value, onChange, min = 0, step = "any", readOnly = false }) {
  return (
    <input
      type="number"
      min={min}
      step={step}
      value={value}
      readOnly={readOnly}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 ${readOnly ? "bg-slate-50 text-slate-500" : ""}`}
    />
  );
}

function SelectField({ value, onChange, options }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500">
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}

function Badge({ ok, children }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${ok ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
      {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
      {children}
    </span>
  );
}

export default function BrettesArrosageAppPrototype() {
  const [selectedTemplate, setSelectedTemplate] = useState("massif");
  const [tab, setTab] = useState("chantier");
  const [uiMode, setUiMode] = useState("simple");
  const [printMode, setPrintMode] = useState("client");
  const [blockPrintWhenIssues, setBlockPrintWhenIssues] = useState(true);
  const fileInputRef = useRef(null);

  const [libraries, setLibraries] = useState(defaultLibraries);
  const [chantier, setChantier] = useState({
    nom: "Projet client",
    client: "Client",
    reference: "NC-AR-001",
    versionDoc: "V1",
    siteAddress: "Adresse chantier",
    companyAddress: "Brettes Paysage · Adresse société",
    companyContact: "contact@brettes-paysage.fr · 05 00 00 00 00",
    authorName: "Conducteur de travaux",
    reviewerName: "Responsable validation",
    signaturePlace: "Mérignac",
    studyLimits: "Calcul établi sur la base des données de pression disponibles et des hypothèses saisies dans l’étude. La validation finale reste à confirmer avant exécution et après vérification des contraintes terrain.",
    waterCostPerM3: 4,
    seasonProfile: "personnalise",
    irrigationMonths: ["Avr", "Mai", "Juin", "Juil", "Août", "Sep"],
    staticPressureBar: 3,
    dynamicPressureBar: "",
    dynamicFlowM3h: "",
    compteurDn: "DN50",
    reducerBar: "",
    defaultDurationHours: 0.5,
    irrigationWeeksPerYear: 30,
    averageWeeksPerMonth: 4.33,
    lossExponentN: 2,
    hazenWilliamsC: 140,
    primaryAccessoryMargin: 0.15,
    evFittingsForfaitBar: 0.03,
    mceToBar: 0.0980665,
    safetyMarginDemand: 0.15,
    simultaneityCoefficient: 1,
    commentaire: "Pré-dimensionnement du réseau d’arrosage.",
    observationsClient: "Observations générales à remettre au client.",
    reservesChantier: "Réserves chantier / points à confirmer avant exécution.",
  });
  const [projectHistory, setProjectHistory] = useState([
    { at: new Date().toLocaleString("fr-FR"), action: "Création du dossier" },
  ]);
  const [sectors, setSectors] = useState([newSector(1), newSector(2)]);
  const [savedProjects, setSavedProjects] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(window.localStorage.getItem("brettes-arrosage-projects") || "[]");
    } catch {
      return [];
    }
  });

  const results = useMemo(() => sectors.map((sector) => ({ ...sector, calc: computeSector(sector, chantier, libraries) })), [sectors, chantier, libraries]);

  const synthesis = useMemo(() => {
    const totalSurface = results.reduce((sum, s) => sum + toNumber(s.surface), 0);
    const maxFlowBase = results.reduce((max, s) => Math.max(max, s.calc.totalFlowBase), 0);
    const maxDesignFlow = results.reduce((max, s) => Math.max(max, s.calc.designFlow), 0);
    const advisedRequest = round(maxDesignFlow * (1 + toNumber(chantier.safetyMarginDemand, 0.15)), 2);
    const advisedMeter = recommendedMeter(advisedRequest);
    const advisedPrimary = recommendedPrimary(advisedRequest);
    const advisedEv = recommendedEv(maxDesignFlow);
    const totalVolumePerDay = round(results.reduce((sum, s) => sum + s.calc.volumePerDay, 0), 3);
    const totalVolumePerWeek = round(results.reduce((sum, s) => sum + s.calc.volumePerWeek, 0), 3);
    const totalVolumePerMonth = round(results.reduce((sum, s) => sum + s.calc.volumePerMonth, 0), 3);
    const totalVolumePerYear = round(results.reduce((sum, s) => sum + s.calc.volumePerYear, 0), 3);
    const estimatedWaterCostWeek = round(totalVolumePerWeek * toNumber(chantier.waterCostPerM3, 0), 2);
    const estimatedWaterCostMonth = round(totalVolumePerMonth * toNumber(chantier.waterCostPerM3, 0), 2);
    const estimatedWaterCostYear = round(totalVolumePerYear * toNumber(chantier.waterCostPerM3, 0), 2);
    const totalGoutteSurface = results.filter((s) => s.mode === "goutte").reduce((sum, s) => sum + toNumber(s.surface), 0);
    const totalAspersionSurface = results.filter((s) => s.mode !== "goutte").reduce((sum, s) => sum + toNumber(s.surface), 0);
    const issues = results.flatMap((s) => s.calc.issues.map((issue) => `${s.name} · ${issue}`));
    if (chantier.compteurDn !== advisedMeter) issues.push(`Compteur retenu ${chantier.compteurDn} différent du compteur conseillé ${advisedMeter}`);
    return { totalSurface, maxFlowBase, maxDesignFlow, advisedRequest, advisedMeter, advisedPrimary, advisedEv, totalVolumePerDay, totalVolumePerWeek, totalVolumePerMonth, totalVolumePerYear, estimatedWaterCostWeek, estimatedWaterCostMonth, estimatedWaterCostYear, totalGoutteSurface, totalAspersionSurface, issues, alertSummary: buildAlertSummary(issues) };
  }, [results, chantier]);

  const pushHistory = (action) => {
    setProjectHistory((current) => [{ at: new Date().toLocaleString("fr-FR"), action }, ...current].slice(0, 30));
  };

  const updateSector = (id, updater) => {
    setSectors((current) => current.map((sector) => (sector.id === id ? updater(sector) : sector)));
  };

  const updateLibraryItem = (type, key, patch) => {
    setLibraries((current) => ({ ...current, [type]: current[type].map((item) => (item.key === key ? { ...item, ...patch } : item)) }));
  };

  const addLibraryItem = (type) => {
    setLibraries((current) => ({ ...current, [type]: [...current[type], createLibraryItem(type)] }));
    pushHistory(`Ajout d’un élément dans la bibliothèque ${type}`);
  };

  const removeLibraryItem = (type, key) => {
    setLibraries((current) => ({ ...current, [type]: current[type].filter((item) => item.key !== key) }));
    pushHistory(`Suppression d’un élément dans la bibliothèque ${type}`);
  };

  const applyZoneProfile = (sectorId) => {
    updateSector(sectorId, (s) => {
      const profile = zoneProfiles[s.profile] || zoneProfiles.massif;
      return { ...s, mode: profile.suggestedMode, durationHours: profile.suggestedDuration };
    });
    pushHistory("Application d’un profil de zone");
  };

  const applySeasonProfile = (seasonKey) => {
    const season = seasonProfiles[seasonKey] || seasonProfiles.personnalise;
    setChantier((current) => ({ ...current, seasonProfile: seasonKey, irrigationWeeksPerYear: season.weeksPerYear }));
    setSectors((current) => current.map((sector) => ({ ...sector, wateringDaysPerWeek: season.daysPerWeek, durationHours: round(toNumber(sector.durationHours || chantier.defaultDurationHours, 0.5) * season.durationFactor, 2) })));
    pushHistory(`Application du profil saison ${season.label}`);
  };

  const duplicateSector = (sector) => {
    setSectors((current) => [...current, duplicateSectorData(sector)]);
    pushHistory(`Duplication du ${sector.name}`);
  };

  const toggleIrrigationMonth = (month) => {
    setChantier((current) => {
      const currentMonths = current.irrigationMonths || [];
      const exists = currentMonths.includes(month);
      return {
        ...current,
        irrigationMonths: exists ? currentMonths.filter((m) => m !== month) : [...currentMonths, month],
      };
    });
  };

  const addSectorFromTemplate = () => {
    const template = zoneProfiles[selectedTemplate] || zoneProfiles.massif;
    const sector = newSector(sectors.length + 1);
    sector.profile = selectedTemplate;
    sector.mode = template.suggestedMode;
    sector.durationHours = template.suggestedDuration;
    sector.name = `${template.label} ${sectors.length + 1}`;
    setSectors((current) => [...current, sector]);
    pushHistory(`Ajout d’un secteur type ${template.label}`);
  };

  const canPrint = !blockPrintWhenIssues || synthesis.issues.length === 0;

  const handlePrint = () => {
    if (!canPrint) return;
    window.print();
  };

  const buildProjectPayload = () => ({ version: 2, savedAt: new Date().toISOString(), chantier, sectors, libraries, projectHistory });

  const saveCurrentProject = () => {
    if (typeof window === "undefined") return;
    const payload = buildProjectPayload();
    const name = chantier.nom?.trim() || `Projet ${new Date().toLocaleDateString("fr-FR")}`;
    const next = [{ id: `${Date.now()}`, name, payload }, ...savedProjects.filter((item) => item.name !== name)].slice(0, 20);
    setSavedProjects(next);
    window.localStorage.setItem("brettes-arrosage-projects", JSON.stringify(next));
    pushHistory("Sauvegarde du projet");
  };

  const loadProject = (id) => {
    const project = savedProjects.find((item) => item.id === id);
    if (!project) return;
    setChantier(project.payload.chantier || chantier);
    setSectors(project.payload.sectors || sectors);
    setLibraries(project.payload.libraries || libraries);
    setProjectHistory(project.payload.projectHistory || projectHistory);
    pushHistory(`Chargement du projet ${project.name}`);
  };

  const exportProjectJson = () => {
    if (typeof window === "undefined") return;
    const blob = new Blob([JSON.stringify(buildProjectPayload(), null, 2)], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(chantier.nom || "projet-arrosage").replace(/[^a-zA-Z0-9-_]+/g, "_")}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
    pushHistory("Export JSON du projet");
  };

  const exportProjectExcel = () => {
    const wb = XLSX.utils.book_new();
    const sectorsSheet = XLSX.utils.json_to_sheet(results.map((sector) => ({
      Secteur: sector.name,
      Zone: sector.zone,
      Profil: zoneProfiles[sector.profile]?.label || sector.profile,
      Type: sector.mode,
      Surface_m2: toNumber(sector.surface),
      Debit_m3h: sector.calc.totalFlowBase,
      Debit_dimensionnement_m3h: sector.calc.designFlow,
      Temps_hj: toNumber(sector.durationHours),
      P_source_bar: round(sector.calc.sourcePressure, 2),
      DP_bloc_bar: round(sector.calc.blockLoss, 2),
      DP_primaire_bar: round(sector.calc.primaryLoss, 2),
      DP_EV_bar: round(sector.calc.evLoss, 2),
      DP_secondaire_bar: round(sector.calc.secondaryRetained, 2),
      P_finale_bar: round(sector.calc.pressureAtEmitters, 2),
      Alertes: sector.calc.issues.join(" | "),
    })));
    const syntheseSheet = XLSX.utils.json_to_sheet([
      {
        Projet: chantier.nom,
        Client: chantier.client,
        Reference: chantier.reference,
        Version: chantier.versionDoc,
        Surface_totale_m2: synthesis.totalSurface,
        Surface_goutte_m2: synthesis.totalGoutteSurface,
        Surface_aspersion_m2: synthesis.totalAspersionSurface,
        Debit_maxi_m3h: synthesis.maxFlowBase,
        Debit_dimensionnement_m3h: synthesis.maxDesignFlow,
        Debit_a_demander_m3h: synthesis.advisedRequest,
        DN_compteur_conseille: synthesis.advisedMeter,
        Primaire_conseille: synthesis.advisedPrimary,
        EV_conseillee: synthesis.advisedEv,
        Volume_total_jour_m3: synthesis.totalVolumePerDay,
      },
    ]);
    XLSX.utils.book_append_sheet(wb, syntheseSheet, "Synthese");
    XLSX.utils.book_append_sheet(wb, sectorsSheet, "Secteurs");
    XLSX.writeFile(wb, `${(chantier.nom || "projet-arrosage").replace(/[^a-zA-Z0-9-_]+/g, "_")}.xlsx`);
    pushHistory("Export Excel du projet");
  };

  const importProjectJson = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data?.chantier) setChantier(data.chantier);
      if (data?.sectors) setSectors(data.sectors);
      if (data?.libraries) setLibraries(data.libraries);
      if (data?.projectHistory) setProjectHistory(data.projectHistory);
      pushHistory("Import JSON du projet");
    } catch (error) {
      console.error(error);
    } finally {
      event.target.value = "";
    }
  };

  const navButton = (key, label, icon) => {
    const active = tab === key;
    return (
      <button onClick={() => setTab(key)} className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition ${active ? "bg-slate-900 text-white shadow-lg" : "bg-white text-slate-700 shadow-sm hover:bg-slate-50"}`}>
        {icon}
        {label}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-full { max-width: 100% !important; padding: 0 !important; }
        }
      `}</style>

      <div className="mx-auto max-w-7xl print-full">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-[28px] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <img src={BRETTES_LOGO} alt="Logo Brettes Paysage" className="h-full w-full object-contain" />
              </div>
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <Sprout className="h-3.5 w-3.5" />
                  Brettes Paysage · Mini appli arrosage
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Pré-dimensionnement réseau</h1>
                <p className="mt-2 max-w-3xl text-sm text-slate-600">Mode conducteur / expert, bibliothèque modifiable, contrôles visuels, sauvegarde, export Excel et sortie client / interne.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 no-print">
              <div className="inline-flex items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
                <button onClick={() => setUiMode("simple")} className={`rounded-xl px-3 py-2 text-sm font-medium ${uiMode === "simple" ? "bg-slate-900 text-white" : "text-slate-700"}`}>Mode conducteur</button>
                <button onClick={() => setUiMode("expert")} className={`rounded-xl px-3 py-2 text-sm font-medium ${uiMode === "expert" ? "bg-slate-900 text-white" : "text-slate-700"}`}>Mode expert</button>
              </div>
              <button onClick={saveCurrentProject} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"><Save className="h-4 w-4" />Sauvegarder</button>
              <button onClick={exportProjectJson} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"><Download className="h-4 w-4" />Export JSON</button>
              <button onClick={exportProjectExcel} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"><FileSpreadsheet className="h-4 w-4" />Export Excel</button>
              <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"><Upload className="h-4 w-4" />Import JSON</button>
              <input ref={fileInputRef} type="file" accept="application/json" onChange={importProjectJson} className="hidden" />
              <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-slate-800"><Printer className="h-4 w-4" />Exporter PDF / imprimer</button>
            </div>
          </div>

          {savedProjects.length > 0 && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 no-print">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900"><FolderOpen className="h-4 w-4" />Projets enregistrés</div>
              <div className="flex flex-wrap gap-2">
                {savedProjects.map((project) => (
                  <button key={project.id} onClick={() => loadProject(project.id)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">{project.name}</button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-6">
            <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Mode</div><div className="mt-1 text-2xl font-semibold text-slate-900">{uiMode === "simple" ? "Conducteur" : "Expert"}</div></div>
            <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Surface totale</div><div className="mt-1 text-2xl font-semibold text-slate-900">{round(synthesis.totalSurface, 0)} m²</div></div>
            <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Débit maxi</div><div className="mt-1 text-2xl font-semibold text-slate-900">{round(synthesis.maxFlowBase, 3)} m³/h</div></div>
            <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Débit dimensionnement</div><div className="mt-1 text-2xl font-semibold text-slate-900">{round(synthesis.maxDesignFlow, 3)} m³/h</div></div>
            <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Débit à demander</div><div className="mt-1 text-2xl font-semibold text-slate-900">{round(synthesis.advisedRequest, 2)} m³/h</div></div>
            <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Alertes</div><div className="mt-1 text-2xl font-semibold text-slate-900">{synthesis.issues.length}</div></div>
          </div>
        </motion.div>

        <div className="mb-6 flex flex-wrap gap-3 no-print">
          {navButton("chantier", "1 · Chantier", <FileText className="h-4 w-4" />)}
          {navButton("secteurs", "2 · Secteurs", <Droplets className="h-4 w-4" />)}
          {navButton("synthese", "3 · Synthèse", <Gauge className="h-4 w-4" />)}
          {navButton("bibliotheque", "4 · Bibliothèque", <Library className="h-4 w-4" />)}
          {navButton("impression", "5 · Impression", <Eye className="h-4 w-4" />)}
          {navButton("pilotage", "6 · Pilotage", <CalendarDays className="h-4 w-4" />)}
        </div>

        {tab === "chantier" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="rounded-[28px] bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-xl font-semibold text-slate-900"><Building2 className="h-5 w-5" />Informations dossier</div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div><label className="mb-2 block text-sm font-medium text-slate-700">Nom du projet</label><input value={chantier.nom} onChange={(e) => setChantier({ ...chantier, nom: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" /></div>
                  <div><label className="mb-2 block text-sm font-medium text-slate-700">Client</label><input value={chantier.client} onChange={(e) => setChantier({ ...chantier, client: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" /></div>
                  <div><label className="mb-2 block text-sm font-medium text-slate-700">Référence dossier</label><input value={chantier.reference} onChange={(e) => setChantier({ ...chantier, reference: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" /></div>
                  <div><label className="mb-2 block text-sm font-medium text-slate-700">Version document</label><input value={chantier.versionDoc} onChange={(e) => setChantier({ ...chantier, versionDoc: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" /></div>
                  <div className="md:col-span-2"><label className="mb-2 block text-sm font-medium text-slate-700">Adresse chantier</label><input value={chantier.siteAddress} onChange={(e) => setChantier({ ...chantier, siteAddress: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" /></div>
                  <div><label className="mb-2 block text-sm font-medium text-slate-700">Adresse / entête société</label><input value={chantier.companyAddress} onChange={(e) => setChantier({ ...chantier, companyAddress: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" /></div>
                  <div><label className="mb-2 block text-sm font-medium text-slate-700">Coordonnées société</label><input value={chantier.companyContact} onChange={(e) => setChantier({ ...chantier, companyContact: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" /></div>
                </div>
              </div>

              <div className="rounded-[28px] bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-xl font-semibold text-slate-900"><Gauge className="h-5 w-5" />Hypothèses de calcul</div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div><label className="mb-2 block text-sm font-medium text-slate-700">Pression statique régie (bar)</label><NumberField value={chantier.staticPressureBar} onChange={(v) => setChantier({ ...chantier, staticPressureBar: v })} step="0.1" /></div>
                  <div><label className="mb-2 block text-sm font-medium text-slate-700">DN compteur retenu</label><SelectField value={chantier.compteurDn} onChange={(v) => setChantier({ ...chantier, compteurDn: v })} options={libraries.blockLoss.map((item) => ({ value: item.key, label: item.label }))} /></div>
                  <div><label className="mb-2 block text-sm font-medium text-slate-700">Coefficient de simultanéité</label><NumberField value={chantier.simultaneityCoefficient} onChange={(v) => setChantier({ ...chantier, simultaneityCoefficient: v })} step="0.1" /></div>
                  <div><label className="mb-2 block text-sm font-medium text-slate-700">Temps défaut (h/j)</label><NumberField value={chantier.defaultDurationHours} onChange={(v) => setChantier({ ...chantier, defaultDurationHours: v })} step="0.1" /></div>
                  {uiMode === "expert" && (
                    <>
                      <div><label className="mb-2 block text-sm font-medium text-slate-700">Pression dynamique connue (bar)</label><NumberField value={chantier.dynamicPressureBar} onChange={(v) => setChantier({ ...chantier, dynamicPressureBar: v })} step="0.1" /></div>
                      <div><label className="mb-2 block text-sm font-medium text-slate-700">Débit associé pression dynamique (m³/h)</label><NumberField value={chantier.dynamicFlowM3h} onChange={(v) => setChantier({ ...chantier, dynamicFlowM3h: v })} step="0.1" /></div>
                      <div><label className="mb-2 block text-sm font-medium text-slate-700">Réducteur aval (bar)</label><NumberField value={chantier.reducerBar} onChange={(v) => setChantier({ ...chantier, reducerBar: v })} step="0.1" /></div>
                      <div><label className="mb-2 block text-sm font-medium text-slate-700">Exposant n</label><NumberField value={chantier.lossExponentN} onChange={(v) => setChantier({ ...chantier, lossExponentN: v })} step="0.1" /></div>
                      <div><label className="mb-2 block text-sm font-medium text-slate-700">Hazen-Williams C</label><NumberField value={chantier.hazenWilliamsC} onChange={(v) => setChantier({ ...chantier, hazenWilliamsC: v })} step="1" /></div>
                      <div><label className="mb-2 block text-sm font-medium text-slate-700">Marge accessoires primaire</label><NumberField value={chantier.primaryAccessoryMargin} onChange={(v) => setChantier({ ...chantier, primaryAccessoryMargin: v })} step="0.01" /></div>
                      <div><label className="mb-2 block text-sm font-medium text-slate-700">Forfait groupe EV (bar)</label><NumberField value={chantier.evFittingsForfaitBar} onChange={(v) => setChantier({ ...chantier, evFittingsForfaitBar: v })} step="0.01" /></div>
                      <div><label className="mb-2 block text-sm font-medium text-slate-700">Marge sécurité demande</label><NumberField value={chantier.safetyMarginDemand} onChange={(v) => setChantier({ ...chantier, safetyMarginDemand: v })} step="0.01" /></div>
                    </>
                  )}
                </div>
              </div>

              <div className="rounded-[28px] bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-xl font-semibold text-slate-900"><ShieldAlert className="h-5 w-5" />Observations et réserves</div>
                <div className="mt-5 grid gap-4">
                  <div><label className="mb-2 block text-sm font-medium text-slate-700">Commentaire général</label><textarea value={chantier.commentaire} onChange={(e) => setChantier({ ...chantier, commentaire: e.target.value })} rows={3} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" /></div>
                  <div><label className="mb-2 block text-sm font-medium text-slate-700">Observations client</label><textarea value={chantier.observationsClient} onChange={(e) => setChantier({ ...chantier, observationsClient: e.target.value })} rows={3} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" /></div>
                  <div><label className="mb-2 block text-sm font-medium text-slate-700">Réserves chantier / interne</label><textarea value={chantier.reservesChantier} onChange={(e) => setChantier({ ...chantier, reservesChantier: e.target.value })} rows={3} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" /></div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[28px] bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">Préconisations auto</h2>
                <div className="mt-5 space-y-4 text-sm">
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-slate-500">Débit conseillé à demander</div><div className="mt-1 text-lg font-semibold text-slate-900">{round(synthesis.advisedRequest, 2)} m³/h</div></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-slate-500">DN compteur conseillé</div><div className="mt-1 text-lg font-semibold text-slate-900">{synthesis.advisedMeter}</div></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-slate-500">Ø primaire conseillé</div><div className="mt-1 text-lg font-semibold text-slate-900">{synthesis.advisedPrimary}</div></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-slate-500">Électrovanne conseillée</div><div className="mt-1 text-lg font-semibold text-slate-900">{synthesis.advisedEv}</div></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-slate-500">Seuils actifs</div><div className="mt-2 text-sm text-slate-700">Goutte : {libraries.alertThresholds.goutte} bar</div><div className="text-sm text-slate-700">Tuyère : {libraries.alertThresholds.tuyere} bar</div><div className="text-sm text-slate-700">PGP : {libraries.alertThresholds.pgp} bar</div></div>
                </div>
              </div>

              <div className="rounded-[28px] bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-xl font-semibold text-slate-900"><History className="h-5 w-5" />Historique du dossier</div>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  {projectHistory.map((item, index) => (
                    <div key={index} className="rounded-2xl border border-slate-200 p-4">
                      <div className="font-medium text-slate-900">{item.action}</div>
                      <div className="mt-1 text-xs text-slate-500">{item.at}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {tab === "secteurs" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {results.map((sector, index) => {
              const calc = sector.calc;
              const emitterOptions = getEmitterOptions(sector.mode, libraries);
              const profile = zoneProfiles[sector.profile] || zoneProfiles.massif;
              return (
                <div key={sector.id} className="rounded-[28px] bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Secteur {index + 1}</div>
                      <input value={sector.name} onChange={(e) => updateSector(sector.id, (s) => ({ ...s, name: e.target.value }))} className="mt-1 w-full rounded-xl border border-transparent px-0 py-0 text-2xl font-semibold text-slate-900 outline-none focus:border-slate-200" />
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge ok={!calc.alert}>{calc.alert ? `${calc.issues.length} alerte(s)` : "Secteur OK"}</Badge>
                      <button onClick={() => { setSectors((current) => current.filter((s) => s.id !== sector.id)); pushHistory(`Suppression du ${sector.name}`); }} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 no-print"><Trash2 className="h-4 w-4" />Supprimer</button>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Zone</label>
                      <input value={sector.zone} onChange={(e) => updateSector(sector.id, (s) => ({ ...s, zone: e.target.value }))} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">Profil de zone</label>
                      <SelectField value={sector.profile} onChange={(v) => updateSector(sector.id, (s) => ({ ...s, profile: v }))} options={Object.entries(zoneProfiles).map(([key, item]) => ({ value: key, label: item.label }))} />
                    </div>
                    <div className="flex items-end"><button onClick={() => applyZoneProfile(sector.id)} className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 no-print">Appliquer le profil</button></div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"><div className="text-xs uppercase tracking-wide text-slate-500">Mode conseillé</div><div className="mt-2 font-semibold text-slate-900">{profile.suggestedMode === "goutte" ? "Goutte" : profile.suggestedMode === "pgp" ? "PGP" : "Tuyère"}</div><div className="mt-1 text-xs text-slate-500">Temps conseillé {profile.suggestedDuration} h/j</div></div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"><div className="text-xs uppercase tracking-wide text-slate-500">Électrovanne conseillée</div><div className="mt-2 font-semibold text-slate-900">{recommendedEv(calc.designFlow)}</div><div className="mt-1 text-xs text-slate-500">Sur débit de dimensionnement</div></div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div><label className="mb-2 block text-sm font-medium text-slate-700">Type réseau</label><SelectField value={sector.mode} onChange={(v) => updateSector(sector.id, (s) => ({ ...s, mode: v }))} options={[{ value: "goutte", label: "Goutte-à-goutte" }, { value: "tuyere", label: "Aspersion tuyère" }, { value: "pgp", label: "Aspersion PGP" }]} /></div>
                    <div><label className="mb-2 block text-sm font-medium text-slate-700">Surface (m²)</label><NumberField value={sector.surface} onChange={(v) => updateSector(sector.id, (s) => ({ ...s, surface: v }))} /></div>
                    <div><label className="mb-2 block text-sm font-medium text-slate-700">Temps (h/j)</label><NumberField value={sector.durationHours} onChange={(v) => updateSector(sector.id, (s) => ({ ...s, durationHours: v }))} step="0.1" /></div>
                    <div><label className="mb-2 block text-sm font-medium text-slate-700">Dénivelé secteur (m)</label><NumberField value={sector.deltaZ} onChange={(v) => updateSector(sector.id, (s) => ({ ...s, deltaZ: v }))} min="-100" step="0.5" /></div>
                    <div><label className="mb-2 block text-sm font-medium text-slate-700">Électrovanne</label><SelectField value={sector.evType} onChange={(v) => updateSector(sector.id, (s) => ({ ...s, evType: v }))} options={libraries.evLoss.map((item) => ({ value: item.key, label: item.label }))} /></div>
                    <div><label className="mb-2 block text-sm font-medium text-slate-700">Position EV secondaire</label><SelectField value={sector.evPosition} onChange={(v) => updateSector(sector.id, (s) => ({ ...s, evPosition: v }))} options={[{ value: "milieu", label: "Au milieu" }, { value: "bout", label: "En bout" }]} /></div>
                    <div><label className="mb-2 block text-sm font-medium text-slate-700">Répart. A (%)</label><NumberField value={sector.ratioA} onChange={(v) => updateSector(sector.id, (s) => ({ ...s, ratioA: v }))} /></div>
                    <div><label className="mb-2 block text-sm font-medium text-slate-700">Coefficient simultanéité global</label><NumberField value={chantier.simultaneityCoefficient} onChange={(v) => setChantier({ ...chantier, simultaneityCoefficient: v })} step="0.1" readOnly={uiMode === "simple"} /></div>
                  </div>

                  <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                    <h3 className="text-sm font-semibold text-slate-900">Émetteurs</h3>
                    {sector.mode === "goutte" ? (
                      <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">Référence goutteur</label>
                          <SelectField value={sector.goutteRef} onChange={(v) => updateSector(sector.id, (s) => ({ ...s, goutteRef: v }))} options={libraries.goutte.map((item) => ({ value: item.key, label: `${item.label} · ${round(flowPerM2(item), 5)} m³/h/m²` }))} />
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700"><div className="text-xs uppercase tracking-wide text-slate-500">Débit/m² auto</div><div className="mt-2 text-2xl font-semibold text-slate-900">{round(flowPerM2(getGoutteRef(libraries, sector.goutteRef)), 5)}</div><div className="mt-1 text-xs text-slate-500">m³/h/m² selon débit unitaire et entraxes</div></div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
                          <div className="text-xs uppercase tracking-wide text-slate-500">Débit total auto du secteur</div>
                          <div className="mt-2 text-3xl font-semibold text-slate-900">{round(calc.totalFlowBase, 3)}</div>
                          <div className="mt-1 text-xs text-slate-500">m³/h calculé automatiquement à partir de la surface et du débit/m²</div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 grid gap-4 xl:grid-cols-3">
                        {[1, 2, 3].map((n) => (
                          <div key={n} className="rounded-2xl border border-slate-200 bg-white p-4">
                            <div className="text-sm font-medium text-slate-800">Référence {n}</div>
                            <div className="mt-3"><label className="mb-2 block text-sm text-slate-700">Type</label><SelectField value={sector[`ref${n}`]} onChange={(v) => updateSector(sector.id, (s) => ({ ...s, [`ref${n}`]: v }))} options={emitterOptions.map((item) => ({ value: item.key, label: `${item.label} · ${item.flowM3h} m³/h` }))} /></div>
                            <div className="mt-3"><label className="mb-2 block text-sm text-slate-700">Quantité</label><NumberField value={sector[`qty${n}`]} onChange={(v) => updateSector(sector.id, (s) => ({ ...s, [`qty${n}`]: v }))} /></div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 grid gap-6 xl:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 p-5"><h3 className="text-sm font-semibold text-slate-900">Primaire</h3><div className="mt-4 grid grid-cols-2 gap-3">{[75, 63, 50, 40, 32, 25].map((d) => <div key={d}><label className="mb-2 block text-sm text-slate-700">L Ø{d} (m)</label><NumberField value={sector.primary[d]} onChange={(v) => updateSector(sector.id, (s) => ({ ...s, primary: { ...s.primary, [d]: v } }))} /></div>)}</div></div>
                    <div className="rounded-2xl border border-slate-200 p-5"><h3 className="text-sm font-semibold text-slate-900">Secondaire côté A</h3><div className="mt-4 grid grid-cols-2 gap-3">{[50, 40, 32, 25].map((d) => <div key={d}><label className="mb-2 block text-sm text-slate-700">L Ø{d} (m)</label><NumberField value={sector.secondaryA[d]} onChange={(v) => updateSector(sector.id, (s) => ({ ...s, secondaryA: { ...s.secondaryA, [d]: v } }))} /></div>)}</div></div>
                    <div className="rounded-2xl border border-slate-200 p-5"><h3 className="text-sm font-semibold text-slate-900">Secondaire côté B</h3><div className="mt-4 grid grid-cols-2 gap-3">{[50, 40, 32, 25].map((d) => <div key={d}><label className="mb-2 block text-sm text-slate-700">L Ø{d} (m)</label><NumberField value={sector.secondaryB[d]} onChange={(v) => updateSector(sector.id, (s) => ({ ...s, secondaryB: { ...s.secondaryB, [d]: v } }))} /></div>)}</div></div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-7">
                    <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Débit base</div><div className="mt-1 text-xl font-semibold text-slate-900">{round(calc.totalFlowBase, 3)} m³/h</div></div>
                    <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Débit dimensionnement</div><div className="mt-1 text-xl font-semibold text-slate-900">{round(calc.designFlow, 3)} m³/h</div></div>
                    <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">P source dispo</div><div className="mt-1 text-xl font-semibold text-slate-900">{round(calc.sourcePressure, 2)} bar</div></div>
                    <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">ΔP bloc</div><div className="mt-1 text-xl font-semibold text-slate-900">{round(calc.blockLoss, 2)} bar</div></div>
                    <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">ΔP primaire</div><div className="mt-1 text-xl font-semibold text-slate-900">{round(calc.primaryLoss, 2)} bar</div></div>
                    <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">ΔP secondaire</div><div className="mt-1 text-xl font-semibold text-slate-900">{round(calc.secondaryRetained, 2)} bar</div></div>
                    <div className={`rounded-2xl p-4 ${calc.alert ? "bg-amber-50" : "bg-emerald-50"}`}><div className={`text-xs ${calc.alert ? "text-amber-700" : "text-emerald-700"}`}>P dispo aux émetteurs</div><div className={`mt-1 text-xl font-semibold ${calc.alert ? "text-amber-900" : "text-emerald-900"}`}>{round(calc.pressureAtEmitters, 2)} bar</div></div>
                  </div>

                  {calc.issues.length > 0 && (
                    <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <div className="mb-2 text-sm font-semibold text-amber-900">Contrôles automatiques</div>
                      <div className="space-y-2 text-sm text-amber-900">{calc.issues.map((issue, i) => <div key={i}>• {issue}</div>)}</div>
                    </div>
                  )}
                </div>
              );
            })}

            <button onClick={() => { setSectors((current) => [...current, newSector(current.length + 1)]); pushHistory("Ajout d’un secteur"); }} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-lg hover:bg-slate-800 no-print"><Plus className="h-4 w-4" />Ajouter un secteur</button>
          </motion.div>
        )}

        {tab === "synthese" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[28px] bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white"><img src={BRETTES_LOGO} alt="Logo Brettes Paysage" className="h-full w-full object-contain" /></div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Brettes Paysage</div>
                    <h2 className="mt-1 text-2xl font-semibold text-slate-900">Note de calcul</h2>
                    <p className="mt-1 text-sm text-slate-600">{chantier.nom} · {chantier.client}</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right"><div className="text-xs text-slate-500">Compteur conseillé</div><div className="text-xl font-semibold text-slate-900">{synthesis.advisedMeter}</div></div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Surface totale</div><div className="mt-1 text-2xl font-semibold text-slate-900">{round(synthesis.totalSurface, 0)} m²</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Goutte-à-goutte</div><div className="mt-1 text-2xl font-semibold text-slate-900">{round(synthesis.totalGoutteSurface, 0)} m²</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Aspersion</div><div className="mt-1 text-2xl font-semibold text-slate-900">{round(synthesis.totalAspersionSurface, 0)} m²</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Volume total</div><div className="mt-1 text-2xl font-semibold text-slate-900">{round(synthesis.totalVolumePerDay, 3)} m³/j</div></div>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50"><tr><th className="px-4 py-3 text-left font-medium text-slate-600">Secteur</th><th className="px-4 py-3 text-left font-medium text-slate-600">Type</th><th className="px-4 py-3 text-left font-medium text-slate-600">Surface</th><th className="px-4 py-3 text-left font-medium text-slate-600">Débit</th><th className="px-4 py-3 text-left font-medium text-slate-600">Temps</th><th className="px-4 py-3 text-left font-medium text-slate-600">P finale</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {results.map((sector) => (
                      <tr key={sector.id}>
                        <td className="px-4 py-3 font-medium text-slate-900">{sector.name}</td>
                        <td className="px-4 py-3 text-slate-600">{sector.mode === "goutte" ? "Goutte-à-goutte" : sector.mode === "pgp" ? "Aspersion PGP" : "Aspersion tuyère"}</td>
                        <td className="px-4 py-3 text-slate-600">{round(toNumber(sector.surface), 0)} m²</td>
                        <td className="px-4 py-3 text-slate-600">{round(sector.calc.totalFlowBase, 3)} m³/h</td>
                        <td className="px-4 py-3 text-slate-600">{round(toNumber(sector.durationHours), 2)} h/j</td>
                        <td className={`px-4 py-3 font-medium ${sector.calc.alert ? "text-amber-700" : "text-emerald-700"}`}>{round(sector.calc.pressureAtEmitters, 2)} bar</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[28px] bg-white p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-slate-900">Préconisations</h3>
                <div className="mt-5 space-y-4 text-sm">
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-slate-500">Débit à demander</div><div className="mt-1 text-lg font-semibold text-slate-900">{round(synthesis.advisedRequest, 2)} m³/h</div></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-slate-500">DN compteur conseillé</div><div className="mt-1 text-lg font-semibold text-slate-900">{synthesis.advisedMeter}</div></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-slate-500">Ø primaire conseillé</div><div className="mt-1 text-lg font-semibold text-slate-900">{synthesis.advisedPrimary}</div></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-slate-500">Électrovanne conseillée</div><div className="mt-1 text-lg font-semibold text-slate-900">{synthesis.advisedEv}</div></div>
                </div>
              </div>

              <div className="rounded-[28px] bg-white p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-slate-900">Contrôles globaux</h3>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  {synthesis.issues.length === 0 ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">Aucune alerte globale.</div> : synthesis.issues.map((issue, index) => <div key={index} className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900">{issue}</div>)}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {tab === "pilotage" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[28px] bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">Paramètres de pilotage</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Semaines d’arrosage par an</label>
                    <NumberField value={chantier.irrigationWeeksPerYear} onChange={(v) => setChantier({ ...chantier, irrigationWeeksPerYear: v })} step="1" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Coefficient semaines par mois</label>
                    <NumberField value={chantier.averageWeeksPerMonth} onChange={(v) => setChantier({ ...chantier, averageWeeksPerMonth: v })} step="0.01" />
                  </div>
                </div>
                <div className="mt-5">
                  <label className="mb-2 block text-sm font-medium text-slate-700">Mois d’arrosage</label>
                  <div className="grid grid-cols-3 gap-2 md:grid-cols-4 xl:grid-cols-6">
                    {irrigationMonthsOptions.map((month) => {
                      const active = (chantier.irrigationMonths || []).includes(month);
                      return (
                        <button
                          key={month}
                          type="button"
                          onClick={() => toggleIrrigationMonth(month)}
                          className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}
                        >
                          {month}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    <span className="font-medium text-slate-900">Période sélectionnée :</span>{" "}
                    {(chantier.irrigationMonths || []).length > 0 ? (chantier.irrigationMonths || []).join(" · ") : "Aucun mois sélectionné"}
                  </div>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-4">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs text-slate-500">Conso / jour</div>
                    <div className="mt-1 text-2xl font-semibold text-slate-900">{round(synthesis.totalVolumePerDay, 3)} m³</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs text-slate-500">Conso / semaine</div>
                    <div className="mt-1 text-2xl font-semibold text-slate-900">{round(synthesis.totalVolumePerWeek, 3)} m³</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs text-slate-500">Conso / mois</div>
                    <div className="mt-1 text-2xl font-semibold text-slate-900">{round(synthesis.totalVolumePerMonth, 3)} m³</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs text-slate-500">Conso / an</div>
                    <div className="mt-1 text-2xl font-semibold text-slate-900">{round(synthesis.totalVolumePerYear, 3)} m³</div>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">Programme d’arrosage par secteur</h2>
                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-slate-600">Secteur</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-600">Temps</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-600">Jours/sem.</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-600">Jours d’arrosage</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-600">Semaine</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-600">Mois</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-600">Année</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {results.map((sector) => (
                        <tr key={sector.id}>
                          <td className="px-4 py-3 font-medium text-slate-900">{sector.name}</td>
                          <td className="px-4 py-3"><NumberField value={sector.durationHours} onChange={(v) => updateSector(sector.id, (s) => ({ ...s, durationHours: v }))} step="0.1" /></td>
                          <td className="px-4 py-3"><NumberField value={sector.wateringDaysPerWeek} onChange={(v) => updateSector(sector.id, (s) => ({ ...s, wateringDaysPerWeek: v }))} step="1" /></td>
                          <td className="px-4 py-3"><input value={sector.wateringDaysLabel} onChange={(e) => updateSector(sector.id, (s) => ({ ...s, wateringDaysLabel: e.target.value }))} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" /></td>
                          <td className="px-4 py-3 text-slate-600">{round(sector.calc.volumePerWeek, 3)} m³</td>
                          <td className="px-4 py-3 text-slate-600">{round(sector.calc.volumePerMonth, 3)} m³</td>
                          <td className="px-4 py-3 text-slate-600">{round(sector.calc.volumePerYear, 3)} m³</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {tab === "bibliotheque" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[28px] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold text-slate-900">Bibliothèque émetteurs</h2><div className="text-sm text-slate-500">Ajout, modification et suppression</div></div>
              <div className="mt-5 space-y-5">
                {[["goutte", "Goutte-à-goutte"], ["tuyere", "Aspersion tuyère"], ["pgp", "Aspersion PGP"]].map(([type, title]) => (
                  <div key={type} className="rounded-2xl border border-slate-200 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3"><div className="text-sm font-semibold text-slate-900">{title}</div><button onClick={() => addLibraryItem(type)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"><Plus className="h-3.5 w-3.5" />Ajouter</button></div>
                    <div className="space-y-3">
                      {libraries[type].map((item) => (
                        <div key={item.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          {type === "goutte" ? (
                            <div className="grid gap-3 md:grid-cols-12">
                              <div className="md:col-span-4"><label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Nom</label><input value={item.label} onChange={(e) => updateLibraryItem(type, item.key, { label: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" /></div>
                              <div className="md:col-span-2"><label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Débit unitaire (L/h)</label><NumberField value={item.unitLh} onChange={(v) => updateLibraryItem(type, item.key, { unitLh: toNumber(v) })} step="0.1" /></div>
                              <div className="md:col-span-2"><label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Entraxe lignes (m)</label><NumberField value={item.lineSpacingM} onChange={(v) => updateLibraryItem(type, item.key, { lineSpacingM: toNumber(v) })} step="0.01" /></div>
                              <div className="md:col-span-2"><label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Entraxe goutteurs (m)</label><NumberField value={item.emitterSpacingM} onChange={(v) => updateLibraryItem(type, item.key, { emitterSpacingM: toNumber(v) })} step="0.01" /></div>
                              <div className="md:col-span-1 min-w-0">
                                <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Débit/m² auto</label>
                                <div className="w-full min-w-0 rounded-xl border border-slate-300 bg-slate-50 px-2 py-2 text-right text-xs font-medium tabular-nums text-slate-700">
                                  {round(flowPerM2(item), 5)}
                                </div>
                              </div>
                              <div className="md:col-span-1 flex items-end"><button onClick={() => removeLibraryItem(type, item.key)} className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><Trash2 className="h-4 w-4" /></button></div>
                            </div>
                          ) : (
                            <div className="grid gap-3 md:grid-cols-12">
                              <div className="md:col-span-5"><label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Nom</label><input value={item.label} onChange={(e) => updateLibraryItem(type, item.key, { label: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" /></div>
                              <div className="md:col-span-2"><label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Angle</label><input value={item.angle || ""} onChange={(e) => updateLibraryItem(type, item.key, { angle: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" placeholder="90° / 180° / 360°" /></div>
                              <div className="md:col-span-2"><label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Débit (m³/h)</label><NumberField value={item.flowM3h} onChange={(v) => updateLibraryItem(type, item.key, { flowM3h: toNumber(v) })} step="0.001" /></div>
                              <div className="md:col-span-2"><label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Pression mini (bar)</label><NumberField value={item.minPressureBar} onChange={(v) => updateLibraryItem(type, item.key, { minPressureBar: toNumber(v) })} step="0.1" /></div>
                              <div className="md:col-span-1 flex items-end"><button onClick={() => removeLibraryItem(type, item.key)} className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><Trash2 className="h-4 w-4" /></button></div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[28px] bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">Seuils d’alerte pression</h2>
                <div className="mt-5 space-y-3">
                  {[{ key: "goutte", label: "Goutte-à-goutte" }, { key: "tuyere", label: "Aspersion tuyère" }, { key: "pgp", label: "Aspersion PGP" }].map((item) => (
                    <div key={item.key} className="grid gap-3 md:grid-cols-[1.4fr_0.8fr]"><div className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800">{item.label}</div><NumberField value={libraries.alertThresholds[item.key]} onChange={(v) => setLibraries((current) => ({ ...current, alertThresholds: { ...current.alertThresholds, [item.key]: toNumber(v) } }))} step="0.1" /></div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-xl font-semibold text-slate-900">Électrovannes</h2><button onClick={() => addLibraryItem("evLoss")} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"><Plus className="h-3.5 w-3.5" />Ajouter</button></div>
                <div className="space-y-3">
                  {libraries.evLoss.map((item) => (
                    <div key={item.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="grid gap-3 md:grid-cols-12">
                        <div className="md:col-span-4"><label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Nom</label><input value={item.label} onChange={(e) => updateLibraryItem("evLoss", item.key, { label: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" /></div>
                        <div className="md:col-span-2"><label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Débit réf. (m³/h)</label><NumberField value={item.qRef} onChange={(v) => updateLibraryItem("evLoss", item.key, { qRef: toNumber(v) })} step="0.1" /></div>
                        <div className="md:col-span-2"><label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Perte réf. (bar)</label><NumberField value={item.dpRefBar} onChange={(v) => updateLibraryItem("evLoss", item.key, { dpRefBar: toNumber(v) })} step="0.01" /></div>
                        <div className="md:col-span-2"><label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Pression mini (bar)</label><NumberField value={item.minPressureBar} onChange={(v) => updateLibraryItem("evLoss", item.key, { minPressureBar: toNumber(v) })} step="0.1" /></div>
                        <div className="md:col-span-2 flex items-end"><button onClick={() => removeLibraryItem("evLoss", item.key)} className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><Trash2 className="h-4 w-4" /></button></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-xl font-semibold text-slate-900">Bloc compteur</h2><button onClick={() => addLibraryItem("blockLoss")} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"><Plus className="h-3.5 w-3.5" />Ajouter</button></div>
                <div className="space-y-3">
                  {libraries.blockLoss.map((item) => (
                    <div key={item.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="grid gap-3 md:grid-cols-12">
                        <div className="md:col-span-5"><label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Nom / diamètre compteur</label><input value={item.label} onChange={(e) => updateLibraryItem("blockLoss", item.key, { label: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" /></div>
                        <div className="md:col-span-3"><label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Débit max (m³/h)</label><NumberField value={item.qMax} onChange={(v) => updateLibraryItem("blockLoss", item.key, { qMax: toNumber(v) })} step="0.1" /></div>
                        <div className="md:col-span-2"><label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Perte à Qmax (bar)</label><NumberField value={item.lossBarAtQmax} onChange={(v) => updateLibraryItem("blockLoss", item.key, { lossBarAtQmax: toNumber(v) })} step="0.01" /></div>
                        <div className="md:col-span-2 flex items-end"><button onClick={() => removeLibraryItem("blockLoss", item.key)} className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><Trash2 className="h-4 w-4" /></button></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {tab === "impression" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl">
            <div className="mb-4 flex items-center justify-between no-print">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Impression</h2>
                <p className="mt-1 text-sm text-slate-600">Choisissez une sortie client ou une sortie interne Brettes.</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
                  <button onClick={() => setPrintMode("client")} className={`rounded-xl px-3 py-2 text-sm font-medium ${printMode === "client" ? "bg-slate-900 text-white" : "text-slate-700"}`}>Sortie client</button>
                  <button onClick={() => setPrintMode("interne")} className={`rounded-xl px-3 py-2 text-sm font-medium ${printMode === "interne" ? "bg-slate-900 text-white" : "text-slate-700"}`}>Sortie interne</button>
                </div>
                <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-slate-800"><Printer className="h-4 w-4" />Imprimer</button>
              </div>
            </div>

            <div className="rounded-[32px] bg-white p-8 shadow-sm print:rounded-none print:shadow-none">
              <div className="border-b border-slate-200 pb-6">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-sm"><img src={BRETTES_LOGO} alt="Logo Brettes Paysage" className="h-full w-full object-contain" /></div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Brettes Paysage</div>
                      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{printMode === "client" ? "Note de calcul" : "Note interne"}</h1>
                      <p className="mt-2 text-sm text-slate-600">{chantier.companyAddress}</p>
                      <p className="text-sm text-slate-600">{chantier.companyContact}</p>
                    </div>
                  </div>
                  <div className="min-w-[260px] rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between gap-4"><span className="text-slate-500">Projet</span><span className="font-medium text-slate-900">{chantier.nom}</span></div>
                      <div className="flex items-center justify-between gap-4"><span className="text-slate-500">Client</span><span className="font-medium text-slate-900">{chantier.client}</span></div>
                      <div className="flex items-center justify-between gap-4"><span className="text-slate-500">Référence</span><span className="font-medium text-slate-900">{chantier.reference}</span></div>
                      <div className="flex items-center justify-between gap-4"><span className="text-slate-500">Version</span><span className="font-medium text-slate-900">{chantier.versionDoc}</span></div>
                      <div className="flex items-center justify-between gap-4"><span className="text-slate-500">Date</span><span className="font-medium text-slate-900">{new Date().toLocaleDateString("fr-FR")}</span></div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-slate-600">Chantier : {chantier.siteAddress}</div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs uppercase tracking-wide text-slate-500">Surface totale</div><div className="mt-2 text-2xl font-semibold text-slate-900">{round(synthesis.totalSurface, 0)} m²</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs uppercase tracking-wide text-slate-500">Débit à demander</div><div className="mt-2 text-2xl font-semibold text-slate-900">{round(synthesis.advisedRequest, 2)} m³/h</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs uppercase tracking-wide text-slate-500">Compteur conseillé</div><div className="mt-2 text-2xl font-semibold text-slate-900">{synthesis.advisedMeter}</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs uppercase tracking-wide text-slate-500">Ø primaire conseillé</div><div className="mt-2 text-2xl font-semibold text-slate-900">{synthesis.advisedPrimary}</div></div>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Détail des secteurs</h3>
                  <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-50"><tr><th className="px-4 py-3 text-left font-medium text-slate-600">Secteur</th><th className="px-4 py-3 text-left font-medium text-slate-600">Type</th><th className="px-4 py-3 text-left font-medium text-slate-600">Surface</th><th className="px-4 py-3 text-left font-medium text-slate-600">Débit</th><th className="px-4 py-3 text-left font-medium text-slate-600">Temps</th></tr></thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {results.map((sector) => (
                          <tr key={sector.id}>
                            <td className="px-4 py-3 font-medium text-slate-900">{sector.name}</td>
                            <td className="px-4 py-3 text-slate-600">{sector.mode === "goutte" ? "Goutte-à-goutte" : sector.mode === "pgp" ? "Aspersion PGP" : "Aspersion tuyère"}</td>
                            <td className="px-4 py-3 text-slate-600">{round(toNumber(sector.surface), 0)} m²</td>
                            <td className="px-4 py-3 text-slate-600">{round(sector.calc.totalFlowBase, 3)} m³/h</td>
                            <td className="px-4 py-3 text-slate-600">{round(toNumber(sector.durationHours), 2)} h/j</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-lg font-semibold text-slate-900">Hypothèses générales</h3>
                    <div className="mt-4 space-y-2 text-sm text-slate-700">
                      <div className="flex items-center justify-between gap-4"><span>Pression statique disponible</span><span className="font-medium text-slate-900">{round(toNumber(chantier.staticPressureBar), 2)} bar</span></div>
                      <div className="flex items-center justify-between gap-4"><span>Coefficient simultanéité</span><span className="font-medium text-slate-900">{round(toNumber(chantier.simultaneityCoefficient), 2)}</span></div>
                      <div className="flex items-center justify-between gap-4"><span>Surface goutte-à-goutte</span><span className="font-medium text-slate-900">{round(synthesis.totalGoutteSurface, 0)} m²</span></div>
                      <div className="flex items-center justify-between gap-4"><span>Surface aspersion</span><span className="font-medium text-slate-900">{round(synthesis.totalAspersionSurface, 0)} m²</span></div>
                      <div className="flex items-center justify-between gap-4"><span>Volume journalier total</span><span className="font-medium text-slate-900">{round(synthesis.totalVolumePerDay, 3)} m³/j</span></div>
                      <div className="flex items-center justify-between gap-4"><span>Volume hebdomadaire</span><span className="font-medium text-slate-900">{round(synthesis.totalVolumePerWeek, 3)} m³/sem</span></div>
                      <div className="flex items-center justify-between gap-4"><span>Volume mensuel</span><span className="font-medium text-slate-900">{round(synthesis.totalVolumePerMonth, 3)} m³/mois</span></div>
                      <div className="flex items-center justify-between gap-4"><span>Volume annuel</span><span className="font-medium text-slate-900">{round(synthesis.totalVolumePerYear, 3)} m³/an</span></div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-lg font-semibold text-slate-900">Observations</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-700">{chantier.observationsClient}</p>
                  </div>
                </div>
              </div>

              {printMode === "client" && (
                <>
                  <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-lg font-semibold text-slate-900">Synthèse client</h3>
                    <div className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                      <p>
                        Étude de pré-dimensionnement du réseau d’arrosage du chantier <span className="font-medium text-slate-900">{chantier.nom}</span>, pour une surface totale de <span className="font-medium text-slate-900">{round(synthesis.totalSurface, 0)} m²</span>.
                      </p>
                      <p>
                        Le débit maximal retenu est de <span className="font-medium text-slate-900">{round(synthesis.maxFlowBase, 3)} m³/h</span>. Le débit conseillé à demander est de <span className="font-medium text-slate-900">{round(synthesis.advisedRequest, 2)} m³/h</span>, avec un compteur <span className="font-medium text-slate-900">{synthesis.advisedMeter}</span> et un primaire conseillé en <span className="font-medium text-slate-900">{synthesis.advisedPrimary}</span>.
                      </p>
                      <p>
                        Les calculs tiennent compte des pertes de charge du bloc compteur, du primaire, de l’électrovanne et du secondaire. Les valeurs ci-dessous constituent une base de validation avant exécution.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-50"><tr><th className="px-4 py-3 text-left font-medium text-slate-600">Secteur</th><th className="px-4 py-3 text-left font-medium text-slate-600">P source</th><th className="px-4 py-3 text-left font-medium text-slate-600">ΔP bloc</th><th className="px-4 py-3 text-left font-medium text-slate-600">ΔP primaire</th><th className="px-4 py-3 text-left font-medium text-slate-600">ΔP EV</th><th className="px-4 py-3 text-left font-medium text-slate-600">ΔP secondaire</th><th className="px-4 py-3 text-left font-medium text-slate-600">P finale</th></tr></thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {results.map((sector) => (
                          <tr key={sector.id}>
                            <td className="px-4 py-3 font-medium text-slate-900">{sector.name}</td>
                            <td className="px-4 py-3 text-slate-600">{round(sector.calc.sourcePressure, 2)} bar</td>
                            <td className="px-4 py-3 text-slate-600">{round(sector.calc.blockLoss, 2)} bar</td>
                            <td className="px-4 py-3 text-slate-600">{round(sector.calc.primaryLoss, 2)} bar</td>
                            <td className="px-4 py-3 text-slate-600">{round(sector.calc.evLoss, 2)} bar</td>
                            <td className="px-4 py-3 text-slate-600">{round(sector.calc.secondaryRetained, 2)} bar</td>
                            <td className={`px-4 py-3 font-medium ${sector.calc.alert ? "text-amber-700" : "text-emerald-700"}`}>{round(sector.calc.pressureAtEmitters, 2)} bar</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <h3 className="text-lg font-semibold text-slate-900">Pilotage d’arrosage</h3>
                      <div className="grid grid-cols-3 gap-3 text-right text-sm">
                        <div className="rounded-xl bg-slate-50 px-3 py-2"><div className="text-xs text-slate-500">Semaine</div><div className="font-semibold text-slate-900">{round(synthesis.totalVolumePerWeek, 3)} m³</div></div>
                        <div className="rounded-xl bg-slate-50 px-3 py-2"><div className="text-xs text-slate-500">Mois</div><div className="font-semibold text-slate-900">{round(synthesis.totalVolumePerMonth, 3)} m³</div></div>
                        <div className="rounded-xl bg-slate-50 px-3 py-2"><div className="text-xs text-slate-500">Année</div><div className="font-semibold text-slate-900">{round(synthesis.totalVolumePerYear, 3)} m³</div></div>
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-slate-200">
                      <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50"><tr><th className="px-4 py-3 text-left font-medium text-slate-600">Secteur</th><th className="px-4 py-3 text-left font-medium text-slate-600">Temps</th><th className="px-4 py-3 text-left font-medium text-slate-600">Jours/sem.</th><th className="px-4 py-3 text-left font-medium text-slate-600">Jours d’arrosage</th><th className="px-4 py-3 text-left font-medium text-slate-600">Semaine</th><th className="px-4 py-3 text-left font-medium text-slate-600">Mois</th><th className="px-4 py-3 text-left font-medium text-slate-600">Année</th></tr></thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {results.map((sector) => (
                            <tr key={sector.id}>
                              <td className="px-4 py-3 font-medium text-slate-900">{sector.name}</td>
                              <td className="px-4 py-3 text-slate-600">{round(toNumber(sector.durationHours), 2)} h/j</td>
                              <td className="px-4 py-3 text-slate-600">{round(toNumber(sector.wateringDaysPerWeek), 0)}</td>
                              <td className="px-4 py-3 text-slate-600">{sector.wateringDaysLabel}</td>
                              <td className="px-4 py-3 text-slate-600">{round(sector.calc.volumePerWeek, 3)} m³</td>
                              <td className="px-4 py-3 text-slate-600">{round(sector.calc.volumePerMonth, 3)} m³</td>
                              <td className="px-4 py-3 text-slate-600">{round(sector.calc.volumePerYear, 3)} m³</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-lg font-semibold text-slate-900">Commentaire</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-700">{chantier.commentaire}</p>
                  </div>
                </>
              )}

              {printMode === "interne" && (
                <>
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-slate-900">Note de calcul détaillée</h3>
                    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                      <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50"><tr><th className="px-4 py-3 text-left font-medium text-slate-600">Secteur</th><th className="px-4 py-3 text-left font-medium text-slate-600">P source</th><th className="px-4 py-3 text-left font-medium text-slate-600">ΔP bloc</th><th className="px-4 py-3 text-left font-medium text-slate-600">ΔP primaire</th><th className="px-4 py-3 text-left font-medium text-slate-600">ΔP EV</th><th className="px-4 py-3 text-left font-medium text-slate-600">ΔP secondaire</th><th className="px-4 py-3 text-left font-medium text-slate-600">P finale</th></tr></thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {results.map((sector) => (
                            <tr key={sector.id}>
                              <td className="px-4 py-3 font-medium text-slate-900">{sector.name}</td>
                              <td className="px-4 py-3 text-slate-600">{round(sector.calc.sourcePressure, 2)} bar</td>
                              <td className="px-4 py-3 text-slate-600">{round(sector.calc.blockLoss, 2)} bar</td>
                              <td className="px-4 py-3 text-slate-600">{round(sector.calc.primaryLoss, 2)} bar</td>
                              <td className="px-4 py-3 text-slate-600">{round(sector.calc.evLoss, 2)} bar</td>
                              <td className="px-4 py-3 text-slate-600">{round(sector.calc.secondaryRetained, 2)} bar</td>
                              <td className={`px-4 py-3 font-medium ${sector.calc.alert ? "text-amber-700" : "text-emerald-700"}`}>{round(sector.calc.pressureAtEmitters, 2)} bar</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <h3 className="text-lg font-semibold text-slate-900">Pilotage d’arrosage</h3>
                      <div className="grid grid-cols-3 gap-3 text-right text-sm">
                        <div className="rounded-xl bg-slate-50 px-3 py-2"><div className="text-xs text-slate-500">Semaine</div><div className="font-semibold text-slate-900">{round(synthesis.totalVolumePerWeek, 3)} m³</div></div>
                        <div className="rounded-xl bg-slate-50 px-3 py-2"><div className="text-xs text-slate-500">Mois</div><div className="font-semibold text-slate-900">{round(synthesis.totalVolumePerMonth, 3)} m³</div></div>
                        <div className="rounded-xl bg-slate-50 px-3 py-2"><div className="text-xs text-slate-500">Année</div><div className="font-semibold text-slate-900">{round(synthesis.totalVolumePerYear, 3)} m³</div></div>
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-slate-200">
                      <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead className="bg-slate-50"><tr><th className="px-4 py-3 text-left font-medium text-slate-600">Secteur</th><th className="px-4 py-3 text-left font-medium text-slate-600">Temps</th><th className="px-4 py-3 text-left font-medium text-slate-600">Jours/sem.</th><th className="px-4 py-3 text-left font-medium text-slate-600">Jours d’arrosage</th><th className="px-4 py-3 text-left font-medium text-slate-600">Semaine</th><th className="px-4 py-3 text-left font-medium text-slate-600">Mois</th><th className="px-4 py-3 text-left font-medium text-slate-600">Année</th></tr></thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {results.map((sector) => (
                            <tr key={sector.id}>
                              <td className="px-4 py-3 font-medium text-slate-900">{sector.name}</td>
                              <td className="px-4 py-3 text-slate-600">{round(toNumber(sector.durationHours), 2)} h/j</td>
                              <td className="px-4 py-3 text-slate-600">{round(toNumber(sector.wateringDaysPerWeek), 0)}</td>
                              <td className="px-4 py-3 text-slate-600">{sector.wateringDaysLabel}</td>
                              <td className="px-4 py-3 text-slate-600">{round(sector.calc.volumePerWeek, 3)} m³</td>
                              <td className="px-4 py-3 text-slate-600">{round(sector.calc.volumePerMonth, 3)} m³</td>
                              <td className="px-4 py-3 text-slate-600">{round(sector.calc.volumePerYear, 3)} m³</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-6 lg:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <h3 className="text-lg font-semibold text-slate-900">Réserves chantier / interne</h3>
                      <p className="mt-3 text-sm leading-6 text-slate-700">{chantier.reservesChantier}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <h3 className="text-lg font-semibold text-slate-900">Historique récent</h3>
                      <div className="mt-3 space-y-2 text-sm text-slate-700">{projectHistory.slice(0, 8).map((item, index) => <div key={index}>• {item.at} · {item.action}</div>)}</div>
                    </div>
                  </div>
                </>
              )}

              
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
