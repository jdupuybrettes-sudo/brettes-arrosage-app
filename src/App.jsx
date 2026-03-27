import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import {
  Plus,
  Trash2,
  Copy,
  Droplets,
  Sprout,
  Gauge,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Library,
  Printer,
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
  Info,
  Wrench,
} from "lucide-react";

const BRETTES_LOGO = "https://brettes-paysagiste.fr/wp-content/uploads/2025/06/Logo-Brettes-Paysage-2024-vectorise-scaled.png";
const COMPANY_ADDRESS = "Brettes Paysage · 1 Passe De Berganton 33700 Merignac";
const COMPANY_CONTACT = "contact@brettes-paysagiste.fr · 05 56 68 91 13";
const WEEK_DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const IRRIGATION_MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
const METER_GROUPS = ["C1", "C2", "C3", "C4"];

const zoneProfiles = {
  massif: { label: "Massif", suggestedMode: "goutte", suggestedDuration: 0.75, suggestedDays: ["Lun", "Mer", "Ven"] },
  pelouse: { label: "Pelouse", suggestedMode: "tuyere", suggestedDuration: 0.35, suggestedDays: ["Lun", "Jeu", "Sam"] },
  haie: { label: "Haie", suggestedMode: "goutte", suggestedDuration: 0.45, suggestedDays: ["Lun", "Mer", "Ven"], suggestedGoutteInputMode: "ml", suggestedLinesCount: 1 },
  arbustes: { label: "Arbustes", suggestedMode: "goutte", suggestedDuration: 0.6, suggestedDays: ["Lun", "Mer", "Ven"] },
  mixte: { label: "Zone mixte", suggestedMode: "goutte", suggestedDuration: 0.5, suggestedDays: ["Lun", "Mer", "Ven"] },
};

const helpNotes = [
  { title: "Exposant n", text: "Coefficient servant à recalculer une perte de charge ou une pression disponible lorsque le débit change. Plus n est élevé, plus la perte augmente vite avec le débit." },
  { title: "Marge de sécurité", text: "Marge ajoutée au débit calculé pour éviter un dimensionnement trop juste. 0,25 correspond à 25 % de marge sur le débit demandé." },
  { title: "Coefficient de simultanéité global", text: "Coefficient appliqué au débit calculé pour obtenir le débit de dimensionnement. À 1,00, le débit est conservé tel quel. Au-dessus de 1,00, il est majoré." },
  { title: "P source", text: "Pression disponible au départ du réseau avant les pertes du bloc compteur, du primaire, de l’électrovanne et du secondaire." },
  { title: "ΔP bloc", text: "Perte de pression provoquée par l’ensemble compteur, disconnecteur, filtre et accessoires amont." },
  { title: "ΔP primaire", text: "Perte de pression dans la conduite principale entre le point de raccordement et l’électrovanne du secteur." },
  { title: "ΔP EV", text: "Perte de charge provoquée par l’électrovanne et ses raccords immédiats." },
  { title: "ΔP secondaire", text: "Perte de charge dans les conduites aval de l’électrovanne jusqu’aux émetteurs. L’outil retient la branche la plus défavorable." },
  { title: "P finale", text: "Pression réellement disponible au niveau des goutteurs, tuyères ou arroseurs après déduction de toutes les pertes et du dénivelé." },
];

const defaultLibraries = {
  alertThresholds: { goutte: 2.0, tuyere: 2.5, pgp: 2.5 },
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

function auto5(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n.toFixed(5) : "0.00000";
}

function flowPerM2(item) {
  const unit = toNumber(item?.unitLh);
  const lineSpacing = toNumber(item?.lineSpacingM);
  const emitterSpacing = toNumber(item?.emitterSpacingM);
  if (unit <= 0 || lineSpacing <= 0 || emitterSpacing <= 0) return 0;
  return unit / 1000 / (lineSpacing * emitterSpacing);
}

function flowPerMl(item) {
  const unit = toNumber(item?.unitLh);
  const emitterSpacing = toNumber(item?.emitterSpacingM);
  if (unit <= 0 || emitterSpacing <= 0) return 0;
  return unit / 1000 / emitterSpacing;
}

function getGoutteRef(libraries, key) {
  return libraries.goutte.find((item) => item.key === key) || libraries.goutte[0];
}

function getEmitterOptions(mode, libraries) {
  if (mode === "goutte") return libraries.goutte;
  if (mode === "pgp") return libraries.pgp;
  return libraries.tuyere;
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

function defaultSecondary() {
  return { 50: 0, 40: 0, 32: 0, 25: 0 };
}

function defaultPrimary() {
  return { 75: 0, 63: 0, 50: 0, 40: 0, 32: 0, 25: 0 };
}

function getSelectedWateringDays(sector) {
  return Array.isArray(sector?.wateringDaysSelected) ? sector.wateringDaysSelected.filter(Boolean) : [];
}

function getWateringDaysCount(sector) {
  const days = getSelectedWateringDays(sector);
  return days.length > 0 ? days.length : toNumber(sector?.wateringDaysPerWeek, 0);
}

function getWateringDaysLabel(sector) {
  const days = getSelectedWateringDays(sector);
  return days.length > 0 ? days.join(" / ") : sector?.wateringDaysLabel || "";
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
    if (sector.goutteInputMode === "ml") {
      return round(toNumber(sector.lengthMl) * Math.max(toNumber(sector.linesCount), 1) * flowPerMl(ref), 3);
    }
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
  const daysCount = getWateringDaysCount(sector);
  const volumePerDay = round(totalFlowBase * duration, 3);
  const volumePerWeek = round(volumePerDay * daysCount, 3);
  const volumePerMonth = round(volumePerWeek * toNumber(chantier.averageWeeksPerMonth, 4.33), 3);
  const volumePerYear = round(volumePerWeek * toNumber(chantier.irrigationWeeksPerYear, 30), 3);
  const timePerWeek = round(duration * daysCount, 2);
  const timePerMonth = round(timePerWeek * toNumber(chantier.averageWeeksPerMonth, 4.33), 2);
  const timePerSeason = round(timePerWeek * toNumber(chantier.irrigationWeeksPerYear, 30), 2);
  const primaryLengthTotal = [75, 63, 50, 40, 32, 25].reduce((sum, d) => sum + toNumber(sector.primary[d]), 0);
  const issues = [];
  if (totalFlowBase <= 0) issues.push("Débit secteur nul ou incomplet");
  if (sector.mode !== "goutte" && toNumber(sector.qty1) + toNumber(sector.qty2) + toNumber(sector.qty3) <= 0) issues.push("Aucune buse renseignée");
  if (sector.mode === "goutte" && sector.goutteInputMode === "surface" && toNumber(sector.surface) <= 0) issues.push("Surface goutte-à-goutte non renseignée");
  if (sector.mode === "goutte" && sector.goutteInputMode === "ml" && toNumber(sector.lengthMl) <= 0) issues.push("Longueur goutte-à-goutte non renseignée");
  if (pressureAtEmitters < minRequired && designFlow > 0) issues.push(`Pression finale insuffisante (< ${minRequired} bar)`);
  if (sourcePressure <= 0) issues.push("Pression source incohérente");
  if (sector.evPosition === "milieu" && (toNumber(sector.ratioA) < 0 || toNumber(sector.ratioA) > 100)) issues.push("Répartition côté A hors plage 0 à 100 %");
  if (qA > 0 && Object.values(sector.secondaryA).every((v) => toNumber(v) === 0)) issues.push("Secondaire côté A non renseigné");
  if (sector.evPosition === "milieu" && qB > 0 && Object.values(sector.secondaryB).every((v) => toNumber(v) === 0)) issues.push("Secondaire côté B non renseigné");
  if (primaryLengthTotal <= 0) issues.push("ML de primaire non renseigné");
  if (!sector.observations.trim()) issues.push("Observation secteur non renseignée");
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
    timePerWeek,
    timePerMonth,
    timePerSeason,
    primaryLengthTotal,
    retainedEv,
    issues,
    alert: issues.length > 0,
  };
}

function makeNewSector(index = 1) {
  return {
    id: `${Date.now()}-${index}-${Math.random()}`,
    name: `Secteur ${index}`,
    zone: "Massif",
    profile: "massif",
    meterGroup: "C1",
    mode: "goutte",
    goutteInputMode: "surface",
    surface: 100,
    lengthMl: 0,
    linesCount: 1,
    durationHours: 0.5,
    wateringDaysPerWeek: 3,
    wateringDaysLabel: "Lun / Mer / Ven",
    wateringDaysSelected: ["Lun", "Mer", "Ven"],
    observations: "Observation secteur à compléter.",
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
    primary: defaultPrimary(),
    secondaryA: defaultSecondary(),
    secondaryB: defaultSecondary(),
  };
}

function duplicateSectorData(sector) {
  return { ...JSON.parse(JSON.stringify(sector)), id: `${Date.now()}-${Math.random()}`, name: `${sector.name} copie` };
}

function createLibraryItem(type) {
  const unique = `${type}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  if (type === "goutte") return { key: unique, label: "Nouveau goutteur", unitLh: 0, lineSpacingM: 0.33, emitterSpacingM: 0.35 };
  if (type === "evLoss") return { key: unique, label: "Nouvelle EV", dpRefBar: 0, qRef: 1, minPressureBar: 1 };
  if (type === "blockLoss") return { key: unique, label: "Nouveau DN", lossBarAtQmax: 0, qMax: 1 };
  return { key: unique, label: "Nouvelle buse", angle: "", flowM3h: 0, minPressureBar: 2.5 };
}

function NumberField({ value, onChange, min = 0, step = "any", readOnly = false, className = "" }) {
  return (
    <input
      type="number"
      min={min}
      step={step}
      value={value}
      readOnly={readOnly}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 ${readOnly ? "bg-slate-50 text-slate-500" : ""} ${className}`}
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

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

function materialDiametersFromSector(sector) {
  const all = [];
  [75, 63, 50, 40, 32, 25].forEach((d) => { if (toNumber(sector.primary[d]) > 0) all.push(`Ø${d} primaire`); });
  [50, 40, 32, 25].forEach((d) => { if (toNumber(sector.secondaryA[d]) > 0) all.push(`Ø${d} secondaire A`); });
  [50, 40, 32, 25].forEach((d) => { if (toNumber(sector.secondaryB[d]) > 0) all.push(`Ø${d} secondaire B`); });
  return all;
}

export default function BrettesArrosageAppPrototype() {
  const [tab, setTab] = useState("chantier");
  const [uiMode, setUiMode] = useState("simple");
  const [printMode, setPrintMode] = useState("client");
  const fileInputRef = useRef(null);

  const [libraries, setLibraries] = useState(defaultLibraries);
  const [chantier, setChantier] = useState({
    nom: "Projet client",
    client: "Client",
    reference: "NC-AR-001",
    versionDoc: "V1",
    siteAddress: "Adresse chantier",
    companyAddress: COMPANY_ADDRESS,
    companyContact: COMPANY_CONTACT,
    staticPressureBar: 3,
    dynamicPressureBar: "",
    dynamicFlowM3h: "",
    compteurDn: "DN50",
    reducerBar: "",
    defaultDurationHours: 0.5,
    irrigationWeeksPerYear: 30,
    averageWeeksPerMonth: 4.33,
    irrigationMonths: ["Avr", "Mai", "Juin", "Juil", "Août", "Sep"],
    lossExponentN: 2,
    hazenWilliamsC: 140,
    primaryAccessoryMargin: 0.15,
    evFittingsForfaitBar: 0.03,
    mceToBar: 0.0980665,
    safetyMarginDemand: 0.25,
    simultaneityCoefficient: 1,
    waterPricePerM3: 4,
    commentaire: "Pré-dimensionnement du réseau d’arrosage.",
    observationsClient: "Observations générales à remettre au client.",
    reservesChantier: "Réserves chantier / points à confirmer avant exécution.",
    assumptionsLimits: "Calcul établi à partir des données disponibles au stade étude. Validation finale à confirmer avant exécution.",
  });
  const [projectHistory, setProjectHistory] = useState([{ at: new Date().toLocaleString("fr-FR"), action: "Création du dossier" }]);
  const [sectors, setSectors] = useState([makeNewSector(1), makeNewSector(2)]);
  const [savedProjects, setSavedProjects] = useState(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(window.localStorage.getItem("brettes-arrosage-projects") || "[]"); } catch { return []; }
  });

  const results = useMemo(() => sectors.map((sector) => ({ ...sector, calc: computeSector(sector, chantier, libraries) })), [sectors, chantier, libraries]);

  const meterSummaries = useMemo(() => {
    const grouped = {};
    results.forEach((sector) => {
      const key = sector.meterGroup || "C1";
      if (!grouped[key]) grouped[key] = { sectors: [], maxFlow: 0 };
      grouped[key].sectors.push(sector);
      grouped[key].maxFlow = Math.max(grouped[key].maxFlow, sector.calc.designFlow);
    });
    return Object.entries(grouped).map(([key, value]) => ({
      key,
      sectors: value.sectors,
      maxFlow: value.maxFlow,
      recommendedMeter: recommendedMeter(value.maxFlow * (1 + toNumber(chantier.safetyMarginDemand, 0.25))),
      recommendedPrimary: recommendedPrimary(value.maxFlow * (1 + toNumber(chantier.safetyMarginDemand, 0.25))),
      recommendedEv: recommendedEv(value.maxFlow),
    }));
  }, [results, chantier]);

  const synthesis = useMemo(() => {
    const totalSurface = results.reduce((sum, s) => sum + toNumber(s.surface), 0);
    const maxFlowBase = results.reduce((max, s) => Math.max(max, s.calc.totalFlowBase), 0);
    const maxDesignFlow = results.reduce((max, s) => Math.max(max, s.calc.designFlow), 0);
    const advisedRequest = round(maxDesignFlow * (1 + toNumber(chantier.safetyMarginDemand, 0.25)), 2);
    const advisedMeter = recommendedMeter(advisedRequest);
    const advisedPrimary = recommendedPrimary(advisedRequest);
    const advisedEv = recommendedEv(maxDesignFlow);
    const totalVolumePerDay = round(results.reduce((sum, s) => sum + s.calc.volumePerDay, 0), 3);
    const totalVolumePerWeek = round(results.reduce((sum, s) => sum + s.calc.volumePerWeek, 0), 3);
    const totalVolumePerMonth = round(results.reduce((sum, s) => sum + s.calc.volumePerMonth, 0), 3);
    const totalVolumePerYear = round(results.reduce((sum, s) => sum + s.calc.volumePerYear, 0), 3);
    const totalTimePerWeek = round(results.reduce((sum, s) => sum + s.calc.timePerWeek, 0), 2);
    const totalTimePerMonth = round(results.reduce((sum, s) => sum + s.calc.timePerMonth, 0), 2);
    const totalTimePerSeason = round(results.reduce((sum, s) => sum + s.calc.timePerSeason, 0), 2);
    const totalGoutteSurface = results.filter((s) => s.mode === "goutte" && s.goutteInputMode === "surface").reduce((sum, s) => sum + toNumber(s.surface), 0);
    const totalGoutteMl = results.filter((s) => s.mode === "goutte" && s.goutteInputMode === "ml").reduce((sum, s) => sum + toNumber(s.lengthMl), 0);
    const totalAspersionSurface = results.filter((s) => s.mode !== "goutte").reduce((sum, s) => sum + toNumber(s.surface), 0);
    const weeklyWaterCost = round(totalVolumePerWeek * toNumber(chantier.waterPricePerM3, 0), 2);
    const monthlyWaterCost = round(totalVolumePerMonth * toNumber(chantier.waterPricePerM3, 0), 2);
    const yearlyWaterCost = round(totalVolumePerYear * toNumber(chantier.waterPricePerM3, 0), 2);
    const issues = results.flatMap((s) => s.calc.issues.map((issue) => `${s.name} · ${issue}`));
    if (chantier.compteurDn !== advisedMeter) issues.push(`Compteur retenu ${chantier.compteurDn} différent du compteur conseillé ${advisedMeter}`);
    if (!chantier.assumptionsLimits.trim()) issues.push("Hypothèses / limites de calcul non renseignées");
    return {
      totalSurface,
      maxFlowBase,
      maxDesignFlow,
      advisedRequest,
      advisedMeter,
      advisedPrimary,
      advisedEv,
      totalVolumePerDay,
      totalVolumePerWeek,
      totalVolumePerMonth,
      totalVolumePerYear,
      totalTimePerWeek,
      totalTimePerMonth,
      totalTimePerSeason,
      totalGoutteSurface,
      totalGoutteMl,
      totalAspersionSurface,
      weeklyWaterCost,
      monthlyWaterCost,
      yearlyWaterCost,
      issues,
    };
  }, [results, chantier]);

  const plainFrenchAlerts = useMemo(() => {
    const summaries = [];
    if (!chantier.assumptionsLimits.trim()) summaries.push("Le document ne peut pas être finalisé proprement tant que le bloc hypothèses / limites de calcul n’est pas renseigné.");
    const pressureSectors = results.filter((s) => s.calc.issues.some((i) => i.includes("Pression finale insuffisante"))).map((s) => s.name);
    if (pressureSectors.length > 0) summaries.push(`Les secteurs ${pressureSectors.join(", ")} présentent une pression finale insuffisante. Il faut revoir le débit instantané, le diamètre ou le découpage du réseau.`);
    const primarySectors = results.filter((s) => s.calc.issues.includes("ML de primaire non renseigné")).map((s) => s.name);
    if (primarySectors.length > 0) summaries.push(`Les secteurs ${primarySectors.join(", ")} ne comportent pas de longueur de primaire renseignée.`);
    const missingObs = results.filter((s) => s.calc.issues.includes("Observation secteur non renseignée")).map((s) => s.name);
    if (missingObs.length > 0) summaries.push(`Les secteurs ${missingObs.join(", ")} doivent recevoir une observation explicative avant édition.`);
    if (chantier.compteurDn !== synthesis.advisedMeter) summaries.push(`Le compteur actuellement retenu (${chantier.compteurDn}) ne correspond pas au compteur conseillé (${synthesis.advisedMeter}).`);
    return summaries.length > 0 ? summaries : ["Aucune alerte bloquante détectée. Le dossier est cohérent pour édition."];
  }, [results, chantier, synthesis]);

  const materialSummary = useMemo(() => {
    const emittersMap = new Map();
    const diametersMap = new Map();
    const evsMap = new Map();
    const dripMap = new Map();

    const addLength = (label, value) => {
      const n = toNumber(value);
      if (n <= 0) return;
      diametersMap.set(label, (diametersMap.get(label) || 0) + n);
    };

    const addEmitter = (label, qty) => {
      const n = toNumber(qty);
      if (!label || n <= 0) return;
      emittersMap.set(label, (emittersMap.get(label) || 0) + n);
    };

    results.forEach((sector) => {
      const evLabel = getEvByKey(libraries, sector.evType)?.label || sector.evType;
      evsMap.set(evLabel, (evsMap.get(evLabel) || 0) + 1);

      [75, 63, 50, 40, 32, 25].forEach((d) => addLength(`Ø${d} primaire`, sector.primary[d]));
      [50, 40, 32, 25].forEach((d) => addLength(`Ø${d} secondaire A`, sector.secondaryA[d]));
      if (sector.evPosition !== "bout") {
        [50, 40, 32, 25].forEach((d) => addLength(`Ø${d} secondaire B`, sector.secondaryB[d]));
      }

      if (sector.mode === "goutte") {
        const ref = getGoutteRef(libraries, sector.goutteRef);
        const key = ref?.label || sector.goutteRef;
        const emitterSpacing = toNumber(ref?.emitterSpacingM);
        const lineSpacing = toNumber(ref?.lineSpacingM);
        let mlTube = 0;
        let emitterQty = 0;
        let longueurArrosee = 0;
        let lignes = 0;

        if (sector.goutteInputMode === "ml") {
          longueurArrosee = toNumber(sector.lengthMl);
          lignes = Math.max(toNumber(sector.linesCount), 1);
          mlTube = longueurArrosee * lignes;
          emitterQty = emitterSpacing > 0 ? round(mlTube / emitterSpacing, 0) : 0;
        } else {
          mlTube = lineSpacing > 0 ? round(toNumber(sector.surface) / lineSpacing, 2) : 0;
          emitterQty = emitterSpacing > 0 ? round(mlTube / emitterSpacing, 0) : 0;
        }

        const current = dripMap.get(key) || { sectors: 0, mlTube: 0, emitters: 0, longueurArrosee: 0, lignes: 0 };
        current.sectors += 1;
        current.mlTube += mlTube;
        current.emitters += emitterQty;
        current.longueurArrosee += longueurArrosee;
        current.lignes += lignes;
        dripMap.set(key, current);
      } else {
        const options = Object.fromEntries(getEmitterOptions(sector.mode, libraries).map((item) => [item.key, item.label]));
        addEmitter(options[sector.ref1], sector.qty1);
        addEmitter(options[sector.ref2], sector.qty2);
        addEmitter(options[sector.ref3], sector.qty3);
      }
    });

    const emitters = Array.from(emittersMap.entries())
      .map(([label, qty]) => ({ label, qty: round(qty, 0) }))
      .sort((a, b) => b.qty - a.qty);

    const diameters = Array.from(diametersMap.entries())
      .map(([label, ml]) => ({ label, ml: round(ml, 1) }))
      .filter((item) => item.ml > 0)
      .sort((a, b) => b.ml - a.ml);

    const evs = Array.from(evsMap.entries())
      .map(([label, qty]) => ({ label, qty: round(qty, 0) }))
      .sort((a, b) => b.qty - a.qty);

    const drip = Array.from(dripMap.entries())
      .map(([label, values]) => ({
        label,
        sectors: values.sectors,
        mlTube: round(values.mlTube, 1),
        emitters: round(values.emitters, 0),
        longueurArrosee: round(values.longueurArrosee, 1),
        lignes: round(values.lignes, 0),
      }))
      .sort((a, b) => b.mlTube - a.mlTube);

    const totals = {
      totalPrimaryMl: round(results.reduce((sum, sector) => sum + [75, 63, 50, 40, 32, 25].reduce((s, d) => s + toNumber(sector.primary[d]), 0), 0), 1),
      totalSecondaryMl: round(results.reduce((sum, sector) => sum + [50, 40, 32, 25].reduce((s, d) => s + toNumber(sector.secondaryA[d]) + (sector.evPosition === "bout" ? 0 : toNumber(sector.secondaryB[d])), 0), 0), 1),
      totalDripMl: round(drip.reduce((sum, item) => sum + item.mlTube, 0), 1),
      totalEmitters: round(emitters.reduce((sum, item) => sum + item.qty, 0) + drip.reduce((sum, item) => sum + item.emitters, 0), 0),
    };

    return { emitters, diameters, evs, drip, totals };
  }, [results, libraries]);

  const canPrint = synthesis.issues.length === 0;

  const pushHistory = (action) => {
    setProjectHistory((current) => [{ at: new Date().toLocaleString("fr-FR"), action }, ...current].slice(0, 30));
  };

  const updateSector = (id, updater) => {
    setSectors((current) => current.map((sector) => (sector.id === id ? updater(sector) : sector)));
  };

  const toggleSectorWateringDay = (sectorId, day) => {
    updateSector(sectorId, (sector) => {
      const currentDays = getSelectedWateringDays(sector);
      const exists = currentDays.includes(day);
      const nextDays = exists ? currentDays.filter((d) => d !== day) : WEEK_DAYS.filter((d) => [...currentDays, day].includes(d));
      return { ...sector, wateringDaysSelected: nextDays, wateringDaysPerWeek: nextDays.length, wateringDaysLabel: nextDays.join(" / ") };
    });
  };

  const applyZoneProfile = (sectorId) => {
    updateSector(sectorId, (s) => {
      const profile = zoneProfiles[s.profile] || zoneProfiles.massif;
      return {
        ...s,
        mode: profile.suggestedMode,
        durationHours: profile.suggestedDuration,
        wateringDaysSelected: profile.suggestedDays || s.wateringDaysSelected,
        wateringDaysPerWeek: (profile.suggestedDays || s.wateringDaysSelected).length,
        wateringDaysLabel: (profile.suggestedDays || s.wateringDaysSelected).join(" / "),
        goutteInputMode: profile.suggestedGoutteInputMode || s.goutteInputMode,
        linesCount: profile.suggestedLinesCount || s.linesCount,
      };
    });
    pushHistory("Application d’un profil de zone");
  };

  const autoCorrectSector = (sector) => {
    updateSector(sector.id, (s) => {
      const next = { ...s, evType: recommendedEv(computeSectorFlow(s, libraries)) };
      if (next.evPosition === "bout") next.secondaryB = defaultSecondary();
      if (next.profile === "haie") {
        next.goutteInputMode = "ml";
        next.linesCount = Math.max(toNumber(next.linesCount), 1);
      }
      if (getSelectedWateringDays(next).length === 0) {
        next.wateringDaysSelected = ["Lun", "Mer", "Ven"];
        next.wateringDaysPerWeek = 3;
        next.wateringDaysLabel = "Lun / Mer / Ven";
      }
      if (!next.observations.trim()) next.observations = "Observation secteur à compléter.";
      return next;
    });
    pushHistory(`Auto-correction du ${sector.name}`);
  };

  const duplicateSector = (sector) => {
    setSectors((current) => [...current, duplicateSectorData(sector)]);
    pushHistory(`Duplication du ${sector.name}`);
  };

  const addTemplateSector = (profileKey) => {
    const sector = makeNewSector(sectors.length + 1);
    sector.profile = profileKey;
    sector.zone = zoneProfiles[profileKey]?.label || sector.zone;
    sector.name = zoneProfiles[profileKey]?.label || sector.name;
    if (profileKey === "haie") {
      sector.goutteInputMode = "ml";
      sector.linesCount = 1;
      sector.lengthMl = 30;
      sector.surface = 0;
    }
    setSectors((current) => [...current, sector]);
    pushHistory(`Ajout d’un modèle ${zoneProfiles[profileKey]?.label || profileKey}`);
  };

  const updateLibraryItem = (type, key, patch) => {
    setLibraries((current) => ({ ...current, [type]: current[type].map((item) => (item.key === key ? { ...item, ...patch } : item)) }));
  };

  const addLibraryItem = (type) => {
    setLibraries((current) => ({ ...current, [type]: [...current[type], createLibraryItem(type)] }));
    pushHistory(`Ajout dans la bibliothèque ${type}`);
  };

  const removeLibraryItem = (type, key) => {
    setLibraries((current) => ({ ...current, [type]: current[type].filter((item) => item.key !== key) }));
    pushHistory(`Suppression dans la bibliothèque ${type}`);
  };

  const toggleIrrigationMonth = (month) => {
    setChantier((current) => {
      const months = current.irrigationMonths || [];
      const exists = months.includes(month);
      return { ...current, irrigationMonths: exists ? months.filter((m) => m !== month) : [...months, month] };
    });
  };

  const buildProjectPayload = () => ({ version: 4, savedAt: new Date().toISOString(), chantier, sectors, libraries, projectHistory });

  const saveCurrentProject = () => {
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

  const renameSavedProject = (id) => {
    const project = savedProjects.find((item) => item.id === id);
    if (!project) return;
    const nextName = window.prompt("Nouveau nom du projet", project.name);
    if (!nextName || !nextName.trim()) return;
    const next = savedProjects.map((item) => (item.id === id ? { ...item, name: nextName.trim(), payload: { ...item.payload, chantier: { ...item.payload.chantier, nom: nextName.trim() } } } : item));
    setSavedProjects(next);
    window.localStorage.setItem("brettes-arrosage-projects", JSON.stringify(next));
    pushHistory(`Renommage du projet ${project.name} en ${nextName.trim()}`);
  };

  const deleteSavedProject = (id) => {
    const project = savedProjects.find((item) => item.id === id);
    if (!project) return;
    const confirmed = window.confirm(`Supprimer le projet enregistré \"${project.name}\" ?`);
    if (!confirmed) return;
    const next = savedProjects.filter((item) => item.id !== id);
    setSavedProjects(next);
    window.localStorage.setItem("brettes-arrosage-projects", JSON.stringify(next));
    pushHistory(`Suppression du projet enregistré ${project.name}`);
  };

  const exportProjectJson = () => {
    downloadBlob(JSON.stringify(buildProjectPayload(), null, 2), `${(chantier.nom || "projet-arrosage").replace(/[^a-zA-Z0-9-_]+/g, "_")}.json`, "application/json");
    pushHistory("Export JSON du projet");
  };

  const exportProjectExcel = () => {
    const wb = XLSX.utils.book_new();
    const sectorsSheet = XLSX.utils.json_to_sheet(results.map((sector) => ({
      Secteur: sector.name,
      Zone: sector.zone,
      Profil: zoneProfiles[sector.profile]?.label || sector.profile,
      Compteur: sector.meterGroup,
      Type: sector.mode,
      Saisie_goutte: sector.mode === "goutte" ? sector.goutteInputMode : "",
      Surface_m2: toNumber(sector.surface),
      Longueur_ml: toNumber(sector.lengthMl),
      Nb_lignes: toNumber(sector.linesCount),
      Debit_m3h: sector.calc.totalFlowBase,
      Debit_dimensionnement_m3h: sector.calc.designFlow,
      Temps_hj: toNumber(sector.durationHours),
      Jours_semaine: getWateringDaysCount(sector),
      Jours_arrosage: getWateringDaysLabel(sector),
      P_source_bar: round(sector.calc.sourcePressure, 2),
      DP_bloc_bar: round(sector.calc.blockLoss, 2),
      DP_primaire_bar: round(sector.calc.primaryLoss, 2),
      DP_EV_bar: round(sector.calc.evLoss, 2),
      DP_secondaire_bar: round(sector.calc.secondaryRetained, 2),
      P_finale_bar: round(sector.calc.pressureAtEmitters, 2),
      Volume_sem_m3: round(sector.calc.volumePerWeek, 3),
      Volume_mois_m3: round(sector.calc.volumePerMonth, 3),
      Volume_an_m3: round(sector.calc.volumePerYear, 3),
      Observation: sector.observations,
      Alertes: sector.calc.issues.join(" | "),
    })));
    const syntheseSheet = XLSX.utils.json_to_sheet([{ Projet: chantier.nom, Client: chantier.client, Reference: chantier.reference, Version: chantier.versionDoc, Surface_totale_m2: synthesis.totalSurface, Goutte_surface_m2: synthesis.totalGoutteSurface, Goutte_longueur_ml: synthesis.totalGoutteMl, Aspersion_surface_m2: synthesis.totalAspersionSurface, Debit_maxi_m3h: synthesis.maxFlowBase, Debit_dimensionnement_m3h: synthesis.maxDesignFlow, Debit_a_demander_m3h: synthesis.advisedRequest, DN_compteur_conseille: synthesis.advisedMeter, Primaire_conseille: synthesis.advisedPrimary, EV_conseillee: synthesis.advisedEv, Volume_total_jour_m3: synthesis.totalVolumePerDay, Volume_total_sem_m3: synthesis.totalVolumePerWeek, Volume_total_mois_m3: synthesis.totalVolumePerMonth, Volume_total_an_m3: synthesis.totalVolumePerYear, Cout_semaine: synthesis.weeklyWaterCost, Cout_mois: synthesis.monthlyWaterCost, Cout_an: synthesis.yearlyWaterCost }]);
    XLSX.utils.book_append_sheet(wb, syntheseSheet, "Synthese");
    XLSX.utils.book_append_sheet(wb, sectorsSheet, "Secteurs");
    XLSX.writeFile(wb, `${(chantier.nom || "projet-arrosage").replace(/[^a-zA-Z0-9-_]+/g, "_")}.xlsx`);
    pushHistory("Export Excel du projet");
  };

  const exportWord = () => {
    const rows = results.map((sector) => `<tr><td>${sector.name}</td><td>${sector.mode}</td><td>${round(sector.calc.totalFlowBase, 3)} m³/h</td><td>${round(sector.calc.pressureAtEmitters, 2)} bar</td></tr>`).join("");
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${chantier.nom}</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#0f172a}h1,h2{margin:0 0 12px 0}table{width:100%;border-collapse:collapse;margin-top:16px}td,th{border:1px solid #cbd5e1;padding:8px;text-align:left}th{background:#f8fafc}</style></head><body><h1>Brettes Paysage</h1><p>${chantier.companyAddress}<br>${chantier.companyContact}</p><h2>Note de calcul</h2><p><strong>Projet :</strong> ${chantier.nom}<br><strong>Client :</strong> ${chantier.client}<br><strong>Référence :</strong> ${chantier.reference}</p><p>${chantier.assumptionsLimits}</p><table><thead><tr><th>Secteur</th><th>Type</th><th>Débit</th><th>P finale</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
    downloadBlob(html, `${(chantier.nom || "projet-arrosage").replace(/[^a-zA-Z0-9-_]+/g, "_")}.doc`, "application/msword");
    pushHistory("Export Word du projet");
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

  const renderWeekDayButtons = (sector) => (
    <div className="grid grid-cols-4 gap-2 xl:grid-cols-7">
      {WEEK_DAYS.map((day) => {
        const active = getSelectedWateringDays(sector).includes(day);
        return (
          <button key={day} type="button" onClick={() => toggleSectorWateringDay(sector.id, day)} className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}>
            {day}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <style>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-page-break { page-break-before: always; }
          .print-avoid-break { page-break-inside: avoid; }
        }
      `}</style>

      <div className="mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-[28px] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-sm"><img src={BRETTES_LOGO} alt="Logo Brettes Paysage" className="h-full w-full object-contain" /></div>
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"><Sprout className="h-3.5 w-3.5" />Brettes Paysage · Mini appli arrosage</div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Pré-dimensionnement réseau</h1>
                <p className="mt-2 max-w-3xl text-sm text-slate-600">Version métier Brettes avec calculs, pilotage, matériel conseillé, export Word et note de calcul client / interne.</p>
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
              <button onClick={exportWord} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"><FileText className="h-4 w-4" />Export Word</button>
              <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"><Upload className="h-4 w-4" />Import JSON</button>
              <input ref={fileInputRef} type="file" accept="application/json" onChange={importProjectJson} className="hidden" />
              <button onClick={() => window.print()} className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-white shadow-lg ${canPrint ? "bg-slate-900 hover:bg-slate-800" : "bg-amber-500 hover:bg-amber-500"}`}><Printer className="h-4 w-4" />{canPrint ? "Exporter PDF / imprimer" : "Impression avec alertes"}</button>
            </div>
          </div>

          {savedProjects.length > 0 && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 no-print">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900"><FolderOpen className="h-4 w-4" />Projets enregistrés</div>
              <div className="mb-4 text-xs text-slate-500">Sauvegarde locale sur ce navigateur et ce poste.</div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {savedProjects.map((project) => (
                  <div key={project.id} className="rounded-2xl border border-slate-200 bg-white p-3">
                    <div className="text-sm font-semibold text-slate-900">{project.name}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button onClick={() => loadProject(project.id)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">Ouvrir</button>
                      <button onClick={() => renameSavedProject(project.id)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50">Renommer</button>
                      <button onClick={() => deleteSavedProject(project.id)} className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-100">Supprimer</button>
                    </div>
                  </div>
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
          {navButton("materiel", "7 · Matériel", <Wrench className="h-4 w-4" />)}
        </div>

        {tab === "chantier" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
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
                  <div><label className="mb-2 block text-sm font-medium text-slate-700">Marge sécurité demande</label><NumberField value={chantier.safetyMarginDemand} onChange={(v) => setChantier({ ...chantier, safetyMarginDemand: v })} step="0.01" /></div>
                  <div><label className="mb-2 block text-sm font-medium text-slate-700">Coefficient simultanéité global</label><NumberField value={chantier.simultaneityCoefficient} onChange={(v) => setChantier({ ...chantier, simultaneityCoefficient: v })} step="0.1" /></div>
                  <div><label className="mb-2 block text-sm font-medium text-slate-700">Temps défaut (h/j)</label><NumberField value={chantier.defaultDurationHours} onChange={(v) => setChantier({ ...chantier, defaultDurationHours: v })} step="0.1" /></div>
                  <div><label className="mb-2 block text-sm font-medium text-slate-700">Prix de l’eau (€/m³)</label><NumberField value={chantier.waterPricePerM3} onChange={(v) => setChantier({ ...chantier, waterPricePerM3: v })} step="0.01" /></div>
                  {uiMode === "expert" && (
                    <>
                      <div><label className="mb-2 block text-sm font-medium text-slate-700">Pression dynamique connue (bar)</label><NumberField value={chantier.dynamicPressureBar} onChange={(v) => setChantier({ ...chantier, dynamicPressureBar: v })} step="0.1" /></div>
                      <div><label className="mb-2 block text-sm font-medium text-slate-700">Débit associé pression dynamique (m³/h)</label><NumberField value={chantier.dynamicFlowM3h} onChange={(v) => setChantier({ ...chantier, dynamicFlowM3h: v })} step="0.1" /></div>
                      <div><label className="mb-2 block text-sm font-medium text-slate-700">Réducteur aval (bar)</label><NumberField value={chantier.reducerBar} onChange={(v) => setChantier({ ...chantier, reducerBar: v })} step="0.1" /></div>
                      <div><label className="mb-2 block text-sm font-medium text-slate-700">Exposant n</label><NumberField value={chantier.lossExponentN} onChange={(v) => setChantier({ ...chantier, lossExponentN: v })} step="0.1" /></div>
                      <div><label className="mb-2 block text-sm font-medium text-slate-700">Hazen-Williams C</label><NumberField value={chantier.hazenWilliamsC} onChange={(v) => setChantier({ ...chantier, hazenWilliamsC: v })} step="1" /></div>
                      <div><label className="mb-2 block text-sm font-medium text-slate-700">Marge accessoires primaire</label><NumberField value={chantier.primaryAccessoryMargin} onChange={(v) => setChantier({ ...chantier, primaryAccessoryMargin: v })} step="0.01" /></div>
                      <div><label className="mb-2 block text-sm font-medium text-slate-700">Forfait groupe EV (bar)</label><NumberField value={chantier.evFittingsForfaitBar} onChange={(v) => setChantier({ ...chantier, evFittingsForfaitBar: v })} step="0.01" /></div>
                    </>
                  )}
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">Hypothèses / limites de calcul <span className="text-amber-700">*</span></label>
                    <textarea value={chantier.assumptionsLimits} onChange={(e) => setChantier({ ...chantier, assumptionsLimits: e.target.value })} rows={3} className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${chantier.assumptionsLimits.trim() ? "border-slate-300 focus:border-slate-500" : "border-amber-300 bg-amber-50 focus:border-amber-500"}`} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[28px] bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-2 text-xl font-semibold text-slate-900"><Info className="h-5 w-5" />Notes explicatives</div>
                <div className="space-y-3 text-sm text-slate-600">{helpNotes.map((note) => <div key={note.title} className="rounded-2xl border border-slate-200 p-4"><div className="font-semibold text-slate-900">{note.title}</div><div className="mt-1 leading-6">{note.text}</div></div>)}</div>
              </div>
              <div className="rounded-[28px] bg-white p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-2 text-xl font-semibold text-slate-900"><History className="h-5 w-5" />Historique du dossier</div>
                <div className="space-y-3 text-sm text-slate-600">{projectHistory.map((item, index) => <div key={index} className="rounded-2xl border border-slate-200 p-4"><div className="font-medium text-slate-900">{item.action}</div><div className="mt-1 text-xs text-slate-500">{item.at}</div></div>)}</div>
              </div>
            </div>
          </motion.div>
        )}

        {tab === "secteurs" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="rounded-[28px] bg-white p-6 shadow-sm no-print">
              <h2 className="text-xl font-semibold text-slate-900">Modèles de secteurs</h2>
              <div className="mt-4 flex flex-wrap gap-2">{Object.keys(zoneProfiles).map((key) => <button key={key} onClick={() => addTemplateSector(key)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Ajouter modèle {zoneProfiles[key].label}</button>)}</div>
            </div>

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
                    <div className="flex flex-wrap items-center gap-3 no-print">
                      <Badge ok={!calc.alert}>{calc.alert ? `${calc.issues.length} alerte(s)` : "Secteur OK"}</Badge>
                      <button onClick={() => autoCorrectSector(sector)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"><CheckCircle2 className="h-4 w-4" />Auto-corriger</button>
                      <button onClick={() => duplicateSector(sector)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"><Copy className="h-4 w-4" />Dupliquer</button>
                      <button onClick={() => { setSectors((current) => current.filter((s) => s.id !== sector.id)); pushHistory(`Suppression du ${sector.name}`); }} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"><Trash2 className="h-4 w-4" />Supprimer</button>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                    <div><label className="mb-2 block text-sm font-medium text-slate-700">Zone</label><input value={sector.zone} onChange={(e) => updateSector(sector.id, (s) => ({ ...s, zone: e.target.value }))} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" /></div>
                    <div><label className="mb-2 block text-sm font-medium text-slate-700">Profil de zone</label><SelectField value={sector.profile} onChange={(v) => updateSector(sector.id, (s) => ({ ...s, profile: v }))} options={Object.entries(zoneProfiles).map(([key, item]) => ({ value: key, label: item.label }))} /></div>
                    <div><label className="mb-2 block text-sm font-medium text-slate-700">Compteur / groupe</label><SelectField value={sector.meterGroup} onChange={(v) => updateSector(sector.id, (s) => ({ ...s, meterGroup: v }))} options={METER_GROUPS.map((item) => ({ value: item, label: item }))} /></div>
                    <div><label className="mb-2 block text-sm font-medium text-slate-700">Type réseau</label><SelectField value={sector.mode} onChange={(v) => updateSector(sector.id, (s) => ({ ...s, mode: v }))} options={[{ value: "goutte", label: "Goutte-à-goutte" }, { value: "tuyere", label: "Aspersion tuyère" }, { value: "pgp", label: "Aspersion PGP" }]} /></div>
                    <div><label className="mb-2 block text-sm font-medium text-slate-700">Dénivelé secteur (m)</label><NumberField value={sector.deltaZ} onChange={(v) => updateSector(sector.id, (s) => ({ ...s, deltaZ: v }))} min="-100" step="0.5" /></div>
                    <div className="no-print flex items-end"><button onClick={() => applyZoneProfile(sector.id)} className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Appliquer le profil</button></div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <div><label className="mb-2 block text-sm font-medium text-slate-700">Électrovanne</label><SelectField value={sector.evType} onChange={(v) => updateSector(sector.id, (s) => ({ ...s, evType: v }))} options={libraries.evLoss.map((item) => ({ value: item.key, label: item.label }))} /></div>
                    <div><label className="mb-2 block text-sm font-medium text-slate-700">Position EV</label><SelectField value={sector.evPosition} onChange={(v) => updateSector(sector.id, (s) => ({ ...s, evPosition: v, secondaryB: v === "bout" ? defaultSecondary() : s.secondaryB }))} options={[{ value: "milieu", label: "Au milieu" }, { value: "bout", label: "En bout" }]} /></div>
                    <div><label className="mb-2 block text-sm font-medium text-slate-700">Répart. A (%)</label><NumberField value={sector.ratioA} onChange={(v) => updateSector(sector.id, (s) => ({ ...s, ratioA: v }))} /></div>
                    <div><label className="mb-2 block text-sm font-medium text-slate-700">Temps (h/j)</label><NumberField value={sector.durationHours} onChange={(v) => updateSector(sector.id, (s) => ({ ...s, durationHours: v }))} step="0.01" /></div>
                    <div><label className="mb-2 block text-sm font-medium text-slate-700">Jours / semaine</label><div className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700">{getWateringDaysCount(sector)}</div></div>
                  </div>

                  <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                    <h3 className="text-sm font-semibold text-slate-900">Émetteurs</h3>
                    {sector.mode === "goutte" ? (
                      <div className="mt-4 space-y-4">
                        <div className="grid gap-4 md:grid-cols-5">
                          <div><label className="mb-2 block text-sm font-medium text-slate-700">Mode saisie goutte</label><SelectField value={sector.goutteInputMode} onChange={(v) => updateSector(sector.id, (s) => ({ ...s, goutteInputMode: v }))} options={[{ value: "surface", label: "Par surface (m²)" }, { value: "ml", label: "Par longueur (ml)" }]} /></div>
                          <div><label className="mb-2 block text-sm font-medium text-slate-700">Référence goutteur</label><SelectField value={sector.goutteRef} onChange={(v) => updateSector(sector.id, (s) => ({ ...s, goutteRef: v }))} options={libraries.goutte.map((item) => ({ value: item.key, label: item.label }))} /></div>
                          {sector.goutteInputMode === "surface" ? <div><label className="mb-2 block text-sm font-medium text-slate-700">Surface arrosée (m²)</label><NumberField value={sector.surface} onChange={(v) => updateSector(sector.id, (s) => ({ ...s, surface: v }))} /></div> : <div><label className="mb-2 block text-sm font-medium text-slate-700">Longueur arrosée (ml)</label><NumberField value={sector.lengthMl} onChange={(v) => updateSector(sector.id, (s) => ({ ...s, lengthMl: v }))} /></div>}
                          {sector.goutteInputMode === "ml" ? <div><label className="mb-2 block text-sm font-medium text-slate-700">Nombre de lignes</label><NumberField value={sector.linesCount} onChange={(v) => updateSector(sector.id, (s) => ({ ...s, linesCount: v }))} step="1" /></div> : <div><label className="mb-2 block text-sm font-medium text-slate-700">Débit/m² auto</label><div className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">{auto5(flowPerM2(getGoutteRef(libraries, sector.goutteRef)))} m³/h/m²</div></div>}
                          <div><label className="mb-2 block text-sm font-medium text-slate-700">Débit/ml auto</label><div className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">{auto5(flowPerMl(getGoutteRef(libraries, sector.goutteRef)))} m³/h/ml</div></div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700"><div className="text-xs uppercase tracking-wide text-slate-500">Débit total auto du secteur</div><div className="mt-2 text-3xl font-semibold text-slate-900">{round(calc.totalFlowBase, 3)}</div><div className="mt-1 text-xs text-slate-500">m³/h calculé automatiquement</div></div>
                          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700"><div className="text-xs uppercase tracking-wide text-slate-500">Mode conseillé</div><div className="mt-2 text-2xl font-semibold text-slate-900">{profile.suggestedMode === "goutte" ? "Goutte" : profile.suggestedMode === "pgp" ? "PGP" : "Tuyère"}</div><div className="mt-1 text-xs text-slate-500">Profil {profile.label}</div></div>
                          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700"><div className="text-xs uppercase tracking-wide text-slate-500">Électrovanne conseillée</div><div className="mt-2 text-2xl font-semibold text-slate-900">{recommendedEv(calc.designFlow)}</div><div className="mt-1 text-xs text-slate-500">Sur débit de dimensionnement</div></div>
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
                    <div className={`rounded-2xl border p-5 ${sector.evPosition === "bout" ? "border-slate-100 bg-slate-50" : "border-slate-200"}`}>
                      <h3 className="text-sm font-semibold text-slate-900">Secondaire côté B</h3>
                      {sector.evPosition === "bout" ? <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-500">Côté B bloqué automatiquement lorsque l’électrovanne est en bout.</div> : <div className="mt-4 grid grid-cols-2 gap-3">{[50, 40, 32, 25].map((d) => <div key={d}><label className="mb-2 block text-sm text-slate-700">L Ø{d} (m)</label><NumberField value={sector.secondaryB[d]} onChange={(v) => updateSector(sector.id, (s) => ({ ...s, secondaryB: { ...s.secondaryB, [d]: v } }))} /></div>)}</div>}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-7">
                    <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Débit base</div><div className="mt-1 text-xl font-semibold text-slate-900">{round(calc.totalFlowBase, 3)} m³/h</div></div>
                    <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Débit dimensionnement</div><div className="mt-1 text-xl font-semibold text-slate-900">{round(calc.designFlow, 3)} m³/h</div></div>
                    <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">P source</div><div className="mt-1 text-xl font-semibold text-slate-900">{round(calc.sourcePressure, 2)} bar</div></div>
                    <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">ΔP bloc</div><div className="mt-1 text-xl font-semibold text-slate-900">{round(calc.blockLoss, 2)} bar</div></div>
                    <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">ΔP primaire</div><div className="mt-1 text-xl font-semibold text-slate-900">{round(calc.primaryLoss, 2)} bar</div></div>
                    <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">ΔP secondaire</div><div className="mt-1 text-xl font-semibold text-slate-900">{round(calc.secondaryRetained, 2)} bar</div></div>
                    <div className={`rounded-2xl p-4 ${calc.alert ? "bg-amber-50" : "bg-emerald-50"}`}><div className={`text-xs ${calc.alert ? "text-amber-700" : "text-emerald-700"}`}>P finale</div><div className={`mt-1 text-xl font-semibold ${calc.alert ? "text-amber-900" : "text-emerald-900"}`}>{round(calc.pressureAtEmitters, 2)} bar</div></div>
                  </div>

                  <div className="mt-6">
                    <label className="mb-2 block text-sm font-medium text-slate-700">Observations du secteur</label>
                    <textarea value={sector.observations} onChange={(e) => updateSector(sector.id, (s) => ({ ...s, observations: e.target.value }))} rows={2} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" />
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
            <button onClick={() => { setSectors((current) => [...current, makeNewSector(current.length + 1)]); pushHistory("Ajout d’un secteur"); }} className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-lg hover:bg-slate-800 no-print"><Plus className="h-4 w-4" />Ajouter un secteur</button>
          </motion.div>
        )}

        {tab === "synthese" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[28px] bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-start gap-4"><div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white"><img src={BRETTES_LOGO} alt="Logo Brettes Paysage" className="h-full w-full object-contain" /></div><div><div className="text-xs uppercase tracking-[0.2em] text-slate-400">Brettes Paysage</div><h2 className="mt-1 text-2xl font-semibold text-slate-900">Note de calcul</h2><p className="mt-1 text-sm text-slate-600">{chantier.nom} · {chantier.client}</p></div></div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right"><div className="text-xs text-slate-500">Compteur conseillé</div><div className="text-xl font-semibold text-slate-900">{synthesis.advisedMeter}</div></div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Surface totale</div><div className="mt-1 text-2xl font-semibold text-slate-900">{round(synthesis.totalSurface, 0)} m²</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Goutte m²</div><div className="mt-1 text-2xl font-semibold text-slate-900">{round(synthesis.totalGoutteSurface, 0)} m²</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Goutte ml</div><div className="mt-1 text-2xl font-semibold text-slate-900">{round(synthesis.totalGoutteMl, 0)} ml</div></div>
                <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Aspersion</div><div className="mt-1 text-2xl font-semibold text-slate-900">{round(synthesis.totalAspersionSurface, 0)} m²</div></div>
              </div>
              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200"><table className="min-w-full divide-y divide-slate-200 text-sm"><thead className="bg-slate-50"><tr><th className="px-4 py-3 text-left font-medium text-slate-600">Secteur</th><th className="px-4 py-3 text-left font-medium text-slate-600">Compteur</th><th className="px-4 py-3 text-left font-medium text-slate-600">Base</th><th className="px-4 py-3 text-left font-medium text-slate-600">Débit</th><th className="px-4 py-3 text-left font-medium text-slate-600">P finale</th></tr></thead><tbody className="divide-y divide-slate-100 bg-white">{results.map((sector) => <tr key={sector.id}><td className="px-4 py-3 font-medium text-slate-900">{sector.name}</td><td className="px-4 py-3 text-slate-600">{sector.meterGroup}</td><td className="px-4 py-3 text-slate-600">{sector.mode === "goutte" ? (sector.goutteInputMode === "ml" ? `${round(toNumber(sector.lengthMl), 0)} ml × ${round(toNumber(sector.linesCount), 0)} ligne(s)` : `${round(toNumber(sector.surface), 0)} m²`) : `${round(toNumber(sector.surface), 0)} m²`}</td><td className="px-4 py-3 text-slate-600">{round(sector.calc.totalFlowBase, 3)} m³/h</td><td className={`px-4 py-3 font-medium ${sector.calc.alert ? "text-amber-700" : "text-emerald-700"}`}>{round(sector.calc.pressureAtEmitters, 2)} bar</td></tr>)}</tbody></table></div>
            </div>
            <div className="space-y-6">
              <div className="rounded-[28px] bg-white p-6 shadow-sm"><h3 className="text-xl font-semibold text-slate-900">Contrôle avant impression</h3><div className="mt-4"><Badge ok={canPrint}>{canPrint ? "Dossier prêt pour édition" : "Dossier à corriger avant édition"}</Badge></div><div className="mt-4 space-y-3 text-sm text-slate-600">{plainFrenchAlerts.map((text, index) => <div key={index} className={`rounded-2xl border p-4 ${canPrint ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-900"}`}>{text}</div>)}</div></div>
              <div className="rounded-[28px] bg-white p-6 shadow-sm"><h3 className="text-xl font-semibold text-slate-900">Temps et consommations</h3><div className="mt-4 grid gap-3 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Temps / semaine</div><div className="mt-1 text-lg font-semibold text-slate-900">{round(synthesis.totalTimePerWeek, 2)} h</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Temps / mois</div><div className="mt-1 text-lg font-semibold text-slate-900">{round(synthesis.totalTimePerMonth, 2)} h</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Temps / saison</div><div className="mt-1 text-lg font-semibold text-slate-900">{round(synthesis.totalTimePerSeason, 2)} h</div></div></div><div className="mt-4 grid gap-3 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Coût / semaine</div><div className="mt-1 text-lg font-semibold text-slate-900">{round(synthesis.weeklyWaterCost, 2)} €</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Coût / mois</div><div className="mt-1 text-lg font-semibold text-slate-900">{round(synthesis.monthlyWaterCost, 2)} €</div></div><div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Coût / an</div><div className="mt-1 text-lg font-semibold text-slate-900">{round(synthesis.yearlyWaterCost, 2)} €</div></div></div></div>
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
                              <div className="md:col-span-2 flex items-end"><button onClick={() => removeLibraryItem(type, item.key)} className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><Trash2 className="h-4 w-4" /></button></div>
                              <div className="md:col-span-6"><label className="mb-2 block text-[11px] font-medium uppercase tracking-wide text-slate-500">Débit/ml auto</label><div className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-right text-sm font-medium tabular-nums text-slate-700">{auto5(flowPerMl(item))}</div></div>
                              <div className="md:col-span-6"><label className="mb-2 block text-[11px] font-medium uppercase tracking-wide text-slate-500">Débit/m² auto</label><div className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-right text-sm font-medium tabular-nums text-slate-700">{auto5(flowPerM2(item))}</div></div>
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
              <div className="rounded-[28px] bg-white p-6 shadow-sm"><h2 className="text-xl font-semibold text-slate-900">Seuils d’alerte pression</h2><div className="mt-5 space-y-3">{[{ key: "goutte", label: "Goutte-à-goutte" }, { key: "tuyere", label: "Aspersion tuyère" }, { key: "pgp", label: "Aspersion PGP" }].map((item) => <div key={item.key} className="grid gap-3 md:grid-cols-[1.4fr_0.8fr]"><div className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800">{item.label}</div><NumberField value={libraries.alertThresholds[item.key]} onChange={(v) => setLibraries((current) => ({ ...current, alertThresholds: { ...current.alertThresholds, [item.key]: toNumber(v) } }))} step="0.1" /></div>)}</div></div>
              <div className="rounded-[28px] bg-white p-6 shadow-sm"><div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-xl font-semibold text-slate-900">Électrovannes</h2><button onClick={() => addLibraryItem("evLoss")} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"><Plus className="h-3.5 w-3.5" />Ajouter</button></div><div className="space-y-3">{libraries.evLoss.map((item) => <div key={item.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="grid gap-3 md:grid-cols-12"><div className="md:col-span-4"><label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Nom</label><input value={item.label} onChange={(e) => updateLibraryItem("evLoss", item.key, { label: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" /></div><div className="md:col-span-2"><label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Débit réf. (m³/h)</label><NumberField value={item.qRef} onChange={(v) => updateLibraryItem("evLoss", item.key, { qRef: toNumber(v) })} step="0.1" /></div><div className="md:col-span-2"><label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Perte réf. (bar)</label><NumberField value={item.dpRefBar} onChange={(v) => updateLibraryItem("evLoss", item.key, { dpRefBar: toNumber(v) })} step="0.01" /></div><div className="md:col-span-2"><label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Pression mini (bar)</label><NumberField value={item.minPressureBar} onChange={(v) => updateLibraryItem("evLoss", item.key, { minPressureBar: toNumber(v) })} step="0.1" /></div><div className="md:col-span-2 flex items-end"><button onClick={() => removeLibraryItem("evLoss", item.key)} className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><Trash2 className="h-4 w-4" /></button></div></div></div>)}</div></div>
              <div className="rounded-[28px] bg-white p-6 shadow-sm"><div className="mb-3 flex items-center justify-between gap-3"><h2 className="text-xl font-semibold text-slate-900">Bloc compteur</h2><button onClick={() => addLibraryItem("blockLoss")} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"><Plus className="h-3.5 w-3.5" />Ajouter</button></div><div className="space-y-3">{libraries.blockLoss.map((item) => <div key={item.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="grid gap-3 md:grid-cols-12"><div className="md:col-span-5"><label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Nom / diamètre compteur</label><input value={item.label} onChange={(e) => updateLibraryItem("blockLoss", item.key, { label: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" /></div><div className="md:col-span-3"><label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Débit max (m³/h)</label><NumberField value={item.qMax} onChange={(v) => updateLibraryItem("blockLoss", item.key, { qMax: toNumber(v) })} step="0.1" /></div><div className="md:col-span-2"><label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">Perte à Qmax (bar)</label><NumberField value={item.lossBarAtQmax} onChange={(v) => updateLibraryItem("blockLoss", item.key, { lossBarAtQmax: toNumber(v) })} step="0.01" /></div><div className="md:col-span-2 flex items-end"><button onClick={() => removeLibraryItem("blockLoss", item.key)} className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"><Trash2 className="h-4 w-4" /></button></div></div></div>)}</div></div>
            </div>
          </motion.div>
        )}

        {tab === "pilotage" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-[28px] bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">Paramètres de pilotage</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div><label className="mb-2 block text-sm font-medium text-slate-700">Semaines d’arrosage par an</label><NumberField value={chantier.irrigationWeeksPerYear} onChange={(v) => setChantier({ ...chantier, irrigationWeeksPerYear: v })} step="1" /></div>
                  <div><label className="mb-2 block text-sm font-medium text-slate-700">Coeff. semaines / mois</label><NumberField value={chantier.averageWeeksPerMonth} onChange={(v) => setChantier({ ...chantier, averageWeeksPerMonth: v })} step="0.01" /></div>
                  <div><label className="mb-2 block text-sm font-medium text-slate-700">Prix eau (€/m³)</label><NumberField value={chantier.waterPricePerM3} onChange={(v) => setChantier({ ...chantier, waterPricePerM3: v })} step="0.01" /></div>
                </div>
                <div className="mt-5"><label className="mb-2 block text-sm font-medium text-slate-700">Mois d’arrosage</label><div className="grid grid-cols-3 gap-2 md:grid-cols-4 xl:grid-cols-6">{IRRIGATION_MONTHS.map((month) => { const active = (chantier.irrigationMonths || []).includes(month); return <button key={month} type="button" onClick={() => toggleIrrigationMonth(month)} className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}>{month}</button>; })}</div><div className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700"><span className="font-medium text-slate-900">Période sélectionnée :</span> {(chantier.irrigationMonths || []).join(" · ")}</div></div>
                <div className="mt-5 grid gap-4 md:grid-cols-4">
                  <div className="rounded-2xl bg-slate-50 p-3"><div className="text-[11px] text-slate-500">Conso / jour</div><div className="mt-1 text-sm font-semibold leading-tight tabular-nums text-slate-900">{round(synthesis.totalVolumePerDay, 3)} m³</div></div>
                  <div className="rounded-2xl bg-slate-50 p-3"><div className="text-[11px] text-slate-500">Conso / semaine</div><div className="mt-1 text-sm font-semibold leading-tight tabular-nums text-slate-900">{round(synthesis.totalVolumePerWeek, 3)} m³</div></div>
                  <div className="rounded-2xl bg-slate-50 p-3"><div className="text-[11px] text-slate-500">Conso / mois</div><div className="mt-1 text-sm font-semibold leading-tight tabular-nums text-slate-900">{round(synthesis.totalVolumePerMonth, 3)} m³</div></div>
                  <div className="rounded-2xl bg-slate-50 p-3"><div className="text-[11px] text-slate-500">Conso / an</div><div className="mt-1 text-sm font-semibold leading-tight tabular-nums text-slate-900">{round(synthesis.totalVolumePerYear, 3)} m³</div></div>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-3"><div className="text-[11px] text-slate-500">Coût / semaine</div><div className="mt-1 text-xs font-semibold leading-tight tabular-nums text-slate-900">{round(synthesis.weeklyWaterCost, 2)} €</div></div>
                  <div className="rounded-2xl bg-slate-50 p-3"><div className="text-[11px] text-slate-500">Coût / mois</div><div className="mt-1 text-xs font-semibold leading-tight tabular-nums text-slate-900">{round(synthesis.monthlyWaterCost, 2)} €</div></div>
                  <div className="rounded-2xl bg-slate-50 p-3"><div className="text-[11px] text-slate-500">Coût / an</div><div className="mt-1 text-xs font-semibold leading-tight tabular-nums text-slate-900">{round(synthesis.yearlyWaterCost, 2)} €</div></div>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-3"><div className="text-[11px] text-slate-500">Temps / semaine</div><div className="mt-1 text-xs font-semibold leading-tight tabular-nums text-slate-900">{round(synthesis.totalTimePerWeek, 2)} h</div></div>
                  <div className="rounded-2xl bg-slate-50 p-3"><div className="text-[11px] text-slate-500">Temps / mois</div><div className="mt-1 text-xs font-semibold leading-tight tabular-nums text-slate-900">{round(synthesis.totalTimePerMonth, 2)} h</div></div>
                  <div className="rounded-2xl bg-slate-50 p-3"><div className="text-[11px] text-slate-500">Temps / saison</div><div className="mt-1 text-xs font-semibold leading-tight tabular-nums text-slate-900">{round(synthesis.totalTimePerSeason, 2)} h</div></div>
                </div>
              </div>
              <div className="rounded-[28px] bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">Programme d’arrosage par secteur</h2>
                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50"><tr><th className="px-4 py-3 text-left font-medium text-slate-600">Secteur</th><th className="px-4 py-3 text-left font-medium text-slate-600">Temps</th><th className="px-4 py-3 text-left font-medium text-slate-600">Jours/sem.</th><th className="px-4 py-3 text-left font-medium text-slate-600">Jours d’arrosage</th><th className="px-4 py-3 text-left font-medium text-slate-600">Semaine</th><th className="px-4 py-3 text-left font-medium text-slate-600">Mois</th><th className="px-4 py-3 text-left font-medium text-slate-600">Année</th></tr></thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {results.map((sector) => (
                        <tr key={sector.id}>
                          <td className="px-4 py-3 font-medium text-slate-900">{sector.name}</td>
                          <td className="px-4 py-3"><input type="number" step="0.01" value={sector.durationHours} onChange={(e) => updateSector(sector.id, (s) => ({ ...s, durationHours: e.target.value }))} className="w-28 rounded-xl border border-slate-300 px-2 py-2 text-right text-sm tabular-nums outline-none focus:border-slate-500" /></td>
                          <td className="px-4 py-3 text-slate-700 font-medium">{getWateringDaysCount(sector)}</td>
                          <td className="px-4 py-3 min-w-[280px]">{renderWeekDayButtons(sector)}<div className="mt-2 text-xs text-slate-500">{getWateringDaysLabel(sector) || "Aucun jour sélectionné"}</div></td>
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

        {tab === "materiel" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid gap-6 xl:grid-cols-4">
              <div className="rounded-[28px] bg-white p-6 shadow-sm">
                <div className="text-xs text-slate-500">Primaire total</div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">{round(materialSummary.totals.totalPrimaryMl, 1)} ml</div>
              </div>
              <div className="rounded-[28px] bg-white p-6 shadow-sm">
                <div className="text-xs text-slate-500">Secondaire total</div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">{round(materialSummary.totals.totalSecondaryMl, 1)} ml</div>
              </div>
              <div className="rounded-[28px] bg-white p-6 shadow-sm">
                <div className="text-xs text-slate-500">Goutte-à-goutte total</div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">{round(materialSummary.totals.totalDripMl, 1)} ml</div>
              </div>
              <div className="rounded-[28px] bg-white p-6 shadow-sm">
                <div className="text-xs text-slate-500">Émetteurs totaux</div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">{round(materialSummary.totals.totalEmitters, 0)}</div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-[28px] bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">Commande tuyaux</h2>
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-slate-600">Diamètre / usage</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-600">Total ml</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {materialSummary.diameters.map((item) => (
                        <tr key={item.label}>
                          <td className="px-4 py-3 font-medium text-slate-900">{item.label}</td>
                          <td className="px-4 py-3 text-slate-600">{round(item.ml, 1)} ml</td>
                        </tr>
                      ))}
                      {materialSummary.diameters.length === 0 && (
                        <tr>
                          <td className="px-4 py-3 text-slate-500" colSpan={2}>Aucune longueur de tuyau renseignée</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-[28px] bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">Commande électrovannes</h2>
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-slate-600">Électrovanne</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-600">Quantité</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {materialSummary.evs.map((item) => (
                        <tr key={item.label}>
                          <td className="px-4 py-3 font-medium text-slate-900">{item.label}</td>
                          <td className="px-4 py-3 text-slate-600">{round(item.qty, 0)}</td>
                        </tr>
                      ))}
                      {materialSummary.evs.length === 0 && (
                        <tr>
                          <td className="px-4 py-3 text-slate-500" colSpan={2}>Aucune électrovanne comptabilisée</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-[28px] bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">Commande arroseurs / tuyères</h2>
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-slate-600">Référence</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-600">Quantité</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {materialSummary.emitters.map((item) => (
                        <tr key={item.label}>
                          <td className="px-4 py-3 font-medium text-slate-900">{item.label}</td>
                          <td className="px-4 py-3 text-slate-600">{round(item.qty, 0)}</td>
                        </tr>
                      ))}
                      {materialSummary.emitters.length === 0 && (
                        <tr>
                          <td className="px-4 py-3 text-slate-500" colSpan={2}>Aucun arroseur ou tuyère comptabilisé</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-[28px] bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">Commande goutte-à-goutte</h2>
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-slate-600">Référence</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-600">Tuyau ml</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-600">Goutteurs</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {materialSummary.drip.map((item) => (
                        <tr key={item.label}>
                          <td className="px-4 py-3 font-medium text-slate-900">{item.label}</td>
                          <td className="px-4 py-3 text-slate-600">{round(item.mlTube, 1)} ml</td>
                          <td className="px-4 py-3 text-slate-600">{round(item.emitters, 0)}</td>
                        </tr>
                      ))}
                      {materialSummary.drip.length === 0 && (
                        <tr>
                          <td className="px-4 py-3 text-slate-500" colSpan={3}>Aucun goutte-à-goutte comptabilisé</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Synthèse de commande</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4 text-sm text-slate-700">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs text-slate-500">Primaire</div>
                  <div className="mt-1 font-semibold text-slate-900">{round(materialSummary.totals.totalPrimaryMl, 1)} ml</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs text-slate-500">Secondaire</div>
                  <div className="mt-1 font-semibold text-slate-900">{round(materialSummary.totals.totalSecondaryMl, 1)} ml</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs text-slate-500">Goutte-à-goutte</div>
                  <div className="mt-1 font-semibold text-slate-900">{round(materialSummary.totals.totalDripMl, 1)} ml</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs text-slate-500">Émetteurs</div>
                  <div className="mt-1 font-semibold text-slate-900">{round(materialSummary.totals.totalEmitters, 0)}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {tab === "impression" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl">
            <div className="mb-4 flex items-center justify-between no-print">
              <div><h2 className="text-2xl font-semibold text-slate-900">Impression</h2><p className="mt-1 text-sm text-slate-600">Choisissez une sortie client ou interne Brettes.</p></div>
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-sm"><button onClick={() => setPrintMode("client")} className={`rounded-xl px-3 py-2 text-sm font-medium ${printMode === "client" ? "bg-slate-900 text-white" : "text-slate-700"}`}>Sortie client</button><button onClick={() => setPrintMode("interne")} className={`rounded-xl px-3 py-2 text-sm font-medium ${printMode === "interne" ? "bg-slate-900 text-white" : "text-slate-700"}`}>Sortie interne</button></div>
                <button onClick={() => window.print()} className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-white shadow-lg ${canPrint ? "bg-slate-900 hover:bg-slate-800" : "bg-amber-500 hover:bg-amber-500"}`}><Printer className="h-4 w-4" />Imprimer</button>
              </div>
            </div>

            {!canPrint && <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 no-print">Corriger les alertes avant édition définitive. L’impression reste possible pour vérification interne.</div>}

            <div className="rounded-[32px] bg-white p-8 shadow-sm print:rounded-none print:shadow-none">
              <div className="print-avoid-break">
                <div className="flex min-h-[520px] flex-col items-center justify-center border-b border-slate-200 text-center">
                  <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 shadow-sm"><img src={BRETTES_LOGO} alt="Logo Brettes Paysage" className="h-full w-full object-contain" /></div>
                  <div className="mt-8 text-xs uppercase tracking-[0.35em] text-slate-400">Brettes Paysage</div>
                  <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">{printMode === "client" ? "Note de calcul" : "Note interne"}</h1>
                  <div className="mt-8 space-y-2 text-sm text-slate-600"><div>{chantier.companyAddress}</div><div>{chantier.companyContact}</div></div>
                  <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 px-8 py-6 text-left text-sm">
                    <div><span className="font-medium text-slate-900">Projet :</span> {chantier.nom}</div>
                    <div><span className="font-medium text-slate-900">Client :</span> {chantier.client}</div>
                    <div><span className="font-medium text-slate-900">Référence :</span> {chantier.reference}</div>
                    <div><span className="font-medium text-slate-900">Version :</span> {chantier.versionDoc}</div>
                    <div><span className="font-medium text-slate-900">Chantier :</span> {chantier.siteAddress}</div>
                    <div><span className="font-medium text-slate-900">Date :</span> {new Date().toLocaleDateString("fr-FR")}</div>
                  </div>
                </div>
              </div>

              <div className="print-page-break" />

              <div className="print-avoid-break">
                <h2 className="text-2xl font-semibold text-slate-900">Contrôle avant édition</h2>
                <div className="mt-4"><Badge ok={canPrint}>{canPrint ? "Dossier prêt pour édition" : "Dossier incomplet"}</Badge></div>
                <div className="mt-4 space-y-3 text-sm">{plainFrenchAlerts.map((text, index) => <div key={index} className={`rounded-2xl border p-4 ${canPrint ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-900"}`}>{text}</div>)}</div>
              </div>

              <div className="mt-8 print-avoid-break">
                <h2 className="text-2xl font-semibold text-slate-900">Synthèse</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-4">
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Surface totale</div><div className="mt-1 text-2xl font-semibold text-slate-900">{round(synthesis.totalSurface, 0)} m²</div></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Débit à demander</div><div className="mt-1 text-2xl font-semibold text-slate-900">{round(synthesis.advisedRequest, 2)} m³/h</div></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Compteur conseillé</div><div className="mt-1 text-2xl font-semibold text-slate-900">{synthesis.advisedMeter}</div></div>
                  <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs text-slate-500">Ø primaire conseillé</div><div className="mt-1 text-2xl font-semibold text-slate-900">{synthesis.advisedPrimary}</div></div>
                </div>
              </div>

              <div className="mt-8 print-avoid-break">
                <h2 className="text-2xl font-semibold text-slate-900">Détail des secteurs</h2>
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200"><table className="min-w-full divide-y divide-slate-200 text-sm"><thead className="bg-slate-50"><tr><th className="px-4 py-3 text-left font-medium text-slate-600">Secteur</th><th className="px-4 py-3 text-left font-medium text-slate-600">Compteur</th><th className="px-4 py-3 text-left font-medium text-slate-600">Base</th><th className="px-4 py-3 text-left font-medium text-slate-600">Débit</th><th className="px-4 py-3 text-left font-medium text-slate-600">Temps</th></tr></thead><tbody className="divide-y divide-slate-100 bg-white">{results.map((sector) => <tr key={sector.id}><td className="px-4 py-3 font-medium text-slate-900">{sector.name}</td><td className="px-4 py-3 text-slate-600">{sector.meterGroup}</td><td className="px-4 py-3 text-slate-600">{sector.mode === "goutte" ? (sector.goutteInputMode === "ml" ? `${round(toNumber(sector.lengthMl), 0)} ml × ${round(toNumber(sector.linesCount), 0)} ligne(s)` : `${round(toNumber(sector.surface), 0)} m²`) : `${round(toNumber(sector.surface), 0)} m²`}</td><td className="px-4 py-3 text-slate-600">{round(sector.calc.totalFlowBase, 3)} m³/h</td><td className="px-4 py-3 text-slate-600">{round(toNumber(sector.durationHours), 2)} h/j</td></tr>)}</tbody></table></div>
              </div>

              {printMode === "client" && (
                <>
                  <div className="mt-8 print-avoid-break">
                    <h2 className="text-2xl font-semibold text-slate-900">Synthèse client</h2>
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-700">
                      <p>Étude de pré-dimensionnement du réseau d’arrosage du chantier <span className="font-medium text-slate-900">{chantier.nom}</span>, pour une surface totale de <span className="font-medium text-slate-900">{round(synthesis.totalSurface, 0)} m²</span>.</p>
                      <p className="mt-3">Le débit maximal retenu est de <span className="font-medium text-slate-900">{round(synthesis.maxFlowBase, 3)} m³/h</span>. Le débit conseillé à demander est de <span className="font-medium text-slate-900">{round(synthesis.advisedRequest, 2)} m³/h</span>, avec un compteur <span className="font-medium text-slate-900">{synthesis.advisedMeter}</span> et un primaire conseillé en <span className="font-medium text-slate-900">{synthesis.advisedPrimary}</span>.</p>
                      <p className="mt-3">Les calculs tiennent compte des pertes de charge du bloc compteur, du primaire, de l’électrovanne et du secondaire. Les valeurs ci-dessous constituent une base de validation avant exécution.</p>
                    </div>
                  </div>

                  <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 print-avoid-break"><table className="min-w-full divide-y divide-slate-200 text-sm"><thead className="bg-slate-50"><tr><th className="px-4 py-3 text-left font-medium text-slate-600">Secteur</th><th className="px-4 py-3 text-left font-medium text-slate-600">P source</th><th className="px-4 py-3 text-left font-medium text-slate-600">ΔP bloc</th><th className="px-4 py-3 text-left font-medium text-slate-600">ΔP primaire</th><th className="px-4 py-3 text-left font-medium text-slate-600">ΔP EV</th><th className="px-4 py-3 text-left font-medium text-slate-600">ΔP secondaire</th><th className="px-4 py-3 text-left font-medium text-slate-600">P finale</th></tr></thead><tbody className="divide-y divide-slate-100 bg-white">{results.map((sector) => <tr key={sector.id}><td className="px-4 py-3 font-medium text-slate-900">{sector.name}</td><td className="px-4 py-3 text-slate-600">{round(sector.calc.sourcePressure, 2)} bar</td><td className="px-4 py-3 text-slate-600">{round(sector.calc.blockLoss, 2)} bar</td><td className="px-4 py-3 text-slate-600">{round(sector.calc.primaryLoss, 2)} bar</td><td className="px-4 py-3 text-slate-600">{round(sector.calc.evLoss, 2)} bar</td><td className="px-4 py-3 text-slate-600">{round(sector.calc.secondaryRetained, 2)} bar</td><td className={`px-4 py-3 font-medium ${sector.calc.alert ? "text-amber-700" : "text-emerald-700"}`}>{round(sector.calc.pressureAtEmitters, 2)} bar</td></tr>)}</tbody></table></div>

                  <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 print-avoid-break">
                    <div className="mb-4 flex items-center justify-between gap-4"><h3 className="text-lg font-semibold text-slate-900">Pilotage d’arrosage</h3><div className="grid grid-cols-3 gap-3 text-right text-sm"><div className="rounded-xl bg-slate-50 px-3 py-2"><div className="text-xs text-slate-500">Semaine</div><div className="font-semibold text-slate-900">{round(synthesis.totalVolumePerWeek, 3)} m³</div></div><div className="rounded-xl bg-slate-50 px-3 py-2"><div className="text-xs text-slate-500">Mois</div><div className="font-semibold text-slate-900">{round(synthesis.totalVolumePerMonth, 3)} m³</div></div><div className="rounded-xl bg-slate-50 px-3 py-2"><div className="text-xs text-slate-500">Année</div><div className="font-semibold text-slate-900">{round(synthesis.totalVolumePerYear, 3)} m³</div></div></div></div>
                    <div className="mb-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700"><span className="font-medium text-slate-900">Mois d’arrosage :</span> {(chantier.irrigationMonths || []).join(" · ")}</div>
                    <div className="overflow-hidden rounded-2xl border border-slate-200"><table className="min-w-full divide-y divide-slate-200 text-sm"><thead className="bg-slate-50"><tr><th className="px-4 py-3 text-left font-medium text-slate-600">Secteur</th><th className="px-4 py-3 text-left font-medium text-slate-600">Temps</th><th className="px-4 py-3 text-left font-medium text-slate-600">Jours/sem.</th><th className="px-4 py-3 text-left font-medium text-slate-600">Jours d’arrosage</th><th className="px-4 py-3 text-left font-medium text-slate-600">Semaine</th><th className="px-4 py-3 text-left font-medium text-slate-600">Mois</th><th className="px-4 py-3 text-left font-medium text-slate-600">Année</th></tr></thead><tbody className="divide-y divide-slate-100 bg-white">{results.map((sector) => <tr key={sector.id}><td className="px-4 py-3 font-medium text-slate-900">{sector.name}</td><td className="px-4 py-3 text-slate-600">{round(toNumber(sector.durationHours), 2)} h/j</td><td className="px-4 py-3 text-slate-600">{getWateringDaysCount(sector)}</td><td className="px-4 py-3 text-slate-600">{getWateringDaysLabel(sector)}</td><td className="px-4 py-3 text-slate-600">{round(sector.calc.volumePerWeek, 3)} m³</td><td className="px-4 py-3 text-slate-600">{round(sector.calc.volumePerMonth, 3)} m³</td><td className="px-4 py-3 text-slate-600">{round(sector.calc.volumePerYear, 3)} m³</td></tr>)}</tbody></table></div>
                  </div>

                  <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 print-avoid-break"><h3 className="text-lg font-semibold text-slate-900">Commentaire</h3><p className="mt-3 text-sm leading-6 text-slate-700">{chantier.commentaire}</p><p className="mt-3 text-sm leading-6 text-slate-700"><span className="font-medium text-slate-900">Hypothèses / limites :</span> {chantier.assumptionsLimits}</p></div>
                </>
              )}

              {printMode === "interne" && (
                <>
                  <div className="mt-8 print-page-break" />
                  <div className="print-avoid-break"><h2 className="text-2xl font-semibold text-slate-900">Note de calcul détaillée</h2><div className="mt-4 overflow-hidden rounded-2xl border border-slate-200"><table className="min-w-full divide-y divide-slate-200 text-sm"><thead className="bg-slate-50"><tr><th className="px-4 py-3 text-left font-medium text-slate-600">Secteur</th><th className="px-4 py-3 text-left font-medium text-slate-600">P source</th><th className="px-4 py-3 text-left font-medium text-slate-600">ΔP bloc</th><th className="px-4 py-3 text-left font-medium text-slate-600">ΔP primaire</th><th className="px-4 py-3 text-left font-medium text-slate-600">ΔP EV</th><th className="px-4 py-3 text-left font-medium text-slate-600">ΔP secondaire</th><th className="px-4 py-3 text-left font-medium text-slate-600">P finale</th></tr></thead><tbody className="divide-y divide-slate-100 bg-white">{results.map((sector) => <tr key={sector.id}><td className="px-4 py-3 font-medium text-slate-900">{sector.name}</td><td className="px-4 py-3 text-slate-600">{round(sector.calc.sourcePressure, 2)} bar</td><td className="px-4 py-3 text-slate-600">{round(sector.calc.blockLoss, 2)} bar</td><td className="px-4 py-3 text-slate-600">{round(sector.calc.primaryLoss, 2)} bar</td><td className="px-4 py-3 text-slate-600">{round(sector.calc.evLoss, 2)} bar</td><td className="px-4 py-3 text-slate-600">{round(sector.calc.secondaryRetained, 2)} bar</td><td className={`px-4 py-3 font-medium ${sector.calc.alert ? "text-amber-700" : "text-emerald-700"}`}>{round(sector.calc.pressureAtEmitters, 2)} bar</td></tr>)}</tbody></table></div></div>
                  <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 print-avoid-break"><div className="mb-4 flex items-center justify-between gap-4"><h3 className="text-lg font-semibold text-slate-900">Pilotage d’arrosage</h3><div className="grid grid-cols-3 gap-3 text-right text-sm"><div className="rounded-xl bg-slate-50 px-3 py-2"><div className="text-xs text-slate-500">Semaine</div><div className="font-semibold text-slate-900">{round(synthesis.totalVolumePerWeek, 3)} m³</div></div><div className="rounded-xl bg-slate-50 px-3 py-2"><div className="text-xs text-slate-500">Mois</div><div className="font-semibold text-slate-900">{round(synthesis.totalVolumePerMonth, 3)} m³</div></div><div className="rounded-xl bg-slate-50 px-3 py-2"><div className="text-xs text-slate-500">Année</div><div className="font-semibold text-slate-900">{round(synthesis.totalVolumePerYear, 3)} m³</div></div></div></div><div className="mb-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700"><span className="font-medium text-slate-900">Mois d’arrosage :</span> {(chantier.irrigationMonths || []).join(" · ")}</div><div className="overflow-hidden rounded-2xl border border-slate-200"><table className="min-w-full divide-y divide-slate-200 text-sm"><thead className="bg-slate-50"><tr><th className="px-4 py-3 text-left font-medium text-slate-600">Secteur</th><th className="px-4 py-3 text-left font-medium text-slate-600">Temps</th><th className="px-4 py-3 text-left font-medium text-slate-600">Jours/sem.</th><th className="px-4 py-3 text-left font-medium text-slate-600">Jours d’arrosage</th><th className="px-4 py-3 text-left font-medium text-slate-600">Semaine</th><th className="px-4 py-3 text-left font-medium text-slate-600">Mois</th><th className="px-4 py-3 text-left font-medium text-slate-600">Année</th></tr></thead><tbody className="divide-y divide-slate-100 bg-white">{results.map((sector) => <tr key={sector.id}><td className="px-4 py-3 font-medium text-slate-900">{sector.name}</td><td className="px-4 py-3 text-slate-600">{round(toNumber(sector.durationHours), 2)} h/j</td><td className="px-4 py-3 text-slate-600">{getWateringDaysCount(sector)}</td><td className="px-4 py-3 text-slate-600">{getWateringDaysLabel(sector)}</td><td className="px-4 py-3 text-slate-600">{round(sector.calc.volumePerWeek, 3)} m³</td><td className="px-4 py-3 text-slate-600">{round(sector.calc.volumePerMonth, 3)} m³</td><td className="px-4 py-3 text-slate-600">{round(sector.calc.volumePerYear, 3)} m³</td></tr>)}</tbody></table></div></div>
                  <div className="mt-8 grid gap-6 lg:grid-cols-2 print-avoid-break"><div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-semibold text-slate-900">Réserves chantier / interne</h3><p className="mt-3 text-sm leading-6 text-slate-700">{chantier.reservesChantier}</p></div><div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><h3 className="text-lg font-semibold text-slate-900">Historique récent</h3><div className="mt-3 space-y-2 text-sm text-slate-700">{projectHistory.slice(0, 8).map((item, index) => <div key={index}>• {item.at} · {item.action}</div>)}</div></div></div>
                  <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 print-avoid-break"><h3 className="text-lg font-semibold text-slate-900">Lexique rapide</h3><div className="mt-3 grid gap-3 md:grid-cols-2 text-sm text-slate-700">{helpNotes.map((note) => <div key={note.title}><span className="font-medium text-slate-900">{note.title} :</span> {note.text}</div>)}</div></div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
