import React, { useMemo, useRef, useState } from "react";

const COMPANY = {
  name: "Brettes Paysage",
  address: "1, passe de Berganton · 33700 Mérignac",
  phone: "05 56 68 91 13",
  email: "contact@brettes-paysagiste.fr",
  website: "brettes-paysagiste.fr",
  logoUrl: "https://brettes-paysagiste.fr/wp-content/uploads/2025/06/Logo-Brettes-Paysage-2024-vectorise-scaled.png",
};

const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
const WEEK_DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTH_DAY_MAP = { Jan: 31, "Fév": 28, Mar: 31, Avr: 30, Mai: 31, Juin: 30, Juil: 31, "Août": 31, Sep: 30, Oct: 31, Nov: 30, "Déc": 31 };

const MODE_OPTIONS = [
  { value: "goutte", label: "Goutte-à-goutte" },
  { value: "tuyere", label: "Tuyère" },
  { value: "pgp", label: "PGP" },
];

const PROFILE_OPTIONS = [
  { value: "massif", label: "Massif" },
  { value: "haie", label: "Haie" },
  { value: "pelouse", label: "Pelouse" },
  { value: "arbustes", label: "Arbustes" },
  { value: "mixte", label: "Zone mixte" },
];

const EV_OPTIONS = [
  { value: "100-DV", label: "100-DV", lossBar: 0.15, minPressureBar: 1.0 },
  { value: "100-PGA", label: "100-PGA", lossBar: 0.2, minPressureBar: 1.0 },
  { value: "150-PGA", label: "150-PGA", lossBar: 0.25, minPressureBar: 1.0 },
];

const METER_Q3 = { DN20: 4, DN25: 6.3, DN32: 10, DN40: 16, DN50: 25, DN65: 40 };

const PIPE_SERIES = {
  hd6: {
    key: "hd6",
    label: "DRIPTENE HD6 · SDR 17,6 · PFA 6 bar",
    diameters: { 25: 21.8, 32: 28.0, 40: 35.4, 50: 44.2, 63: 55.8, 75: 66.4 },
  },
  hd10: {
    key: "hd10",
    label: "DRIPTENE HD10 · SDR 13,6 · PFA 10 bar",
    diameters: { 20: 16.0, 25: 21.0, 32: 27.2, 40: 34.0, 50: 42.6, 63: 53.6, 75: 63.8 },
  },
};

const GOUTTEURS_BASE = [
  { value: "g16", label: "Goutteur 1,6 L/h", unitLh: 1.6, lineSpacingM: 0.35, emitterSpacingM: 0.33, minPressureBar: 1.0, optimalPressureBar: 2.0 },
  { value: "g20", label: "Goutteur 2,0 L/h", unitLh: 2.0, lineSpacingM: 0.35, emitterSpacingM: 0.33, minPressureBar: 1.0, optimalPressureBar: 2.0 },
  { value: "g22", label: "Goutteur 2,2 L/h", unitLh: 2.2, lineSpacingM: 0.35, emitterSpacingM: 0.33, minPressureBar: 1.0, optimalPressureBar: 2.0 },
];

const TUYERES_BASE = [
  { value: "van4", label: "VAN 4", radiusM: 1.2, baseFlow360: 0.20, minPressureBar: 1.0, optimalPressureBar: 2.1 },
  { value: "van6", label: "VAN 6", radiusM: 1.8, baseFlow360: 0.27, minPressureBar: 1.0, optimalPressureBar: 2.1 },
  { value: "van8", label: "VAN 8", radiusM: 2.4, baseFlow360: 0.39, minPressureBar: 1.0, optimalPressureBar: 2.1 },
  { value: "van10", label: "VAN 10", radiusM: 3.1, baseFlow360: 0.59, minPressureBar: 1.0, optimalPressureBar: 2.1 },
  { value: "van12", label: "VAN 12", radiusM: 3.7, baseFlow360: 0.54, minPressureBar: 1.0, optimalPressureBar: 2.1 },
  { value: "van15", label: "VAN 15", radiusM: 4.6, baseFlow360: 0.84, minPressureBar: 1.0, optimalPressureBar: 2.1 },
  { value: "van18", label: "VAN 18", radiusM: 5.5, baseFlow360: 1.21, minPressureBar: 1.0, optimalPressureBar: 2.1 },
];

const PGP_BASE = [
  { value: "pgp1", label: "PGP Rouge n°1", radiusM: 8.5, baseFlow360: 0.13, minPressureBar: 1.7, optimalPressureBar: 2.5 },
  { value: "pgp2", label: "PGP Rouge n°2", radiusM: 8.8, baseFlow360: 0.17, minPressureBar: 1.7, optimalPressureBar: 2.5 },
  { value: "pgp3", label: "PGP Rouge n°3", radiusM: 9.1, baseFlow360: 0.22, minPressureBar: 1.7, optimalPressureBar: 2.5 },
  { value: "pgp4", label: "PGP Rouge n°4", radiusM: 9.8, baseFlow360: 0.30, minPressureBar: 1.7, optimalPressureBar: 2.5 },
  { value: "pgp5", label: "PGP Rouge n°5", radiusM: 10.4, baseFlow360: 0.39, minPressureBar: 1.7, optimalPressureBar: 2.5 },
  { value: "pgp6", label: "PGP Rouge n°6", radiusM: 10.7, baseFlow360: 0.51, minPressureBar: 1.7, optimalPressureBar: 2.5 },
  { value: "pgp7", label: "PGP Rouge n°7", radiusM: 11.0, baseFlow360: 0.65, minPressureBar: 1.7, optimalPressureBar: 2.5 },
  { value: "pgp8", label: "PGP Rouge n°8", radiusM: 11.6, baseFlow360: 0.79, minPressureBar: 1.7, optimalPressureBar: 2.5 },
];

function num(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function hasValue(value) {
  return value !== "" && value !== null && value !== undefined;
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round((num(value) + Number.EPSILON) * factor) / factor;
}

function formatBar(value) {
  return `${round(value, 2)} bar`;
}

function formatFlow(value) {
  return `${round(value, 2)} m³/h`;
}

function formatMeters(value) {
  return `${round(value, 1)} m`;
}

function hazenLossBar(lengthM, flowM3h, internalMm, c = 140) {
  const L = num(lengthM);
  const Q = num(flowM3h) / 3600;
  const D = num(internalMm) / 1000;
  if (L <= 0 || Q <= 0 || D <= 0) return 0;
  const headLossM = 10.67 * L * (Q ** 1.852) / ((num(c, 140) ** 1.852) * (D ** 4.8655));
  return headLossM / 10.197;
}

function createMeterPoint(index = 1) {
  return {
    id: `C${index}`,
    name: `Point de comptage ${index}`,
    supplyMode: "meter",
    blockKey: "DN40",
    staticPressureBar: "",
    availableFlowM3h: "",
    pumpType: "balloon",
    pumpFlowM3h: "",
    pumpPressureBar: "",
    pumpBalloonLiters: 100,
    pumpAccessoryLossBar: "",
    useReducerPressure: false,
    reducerSetPressureBar: "",
    clapetCount: 0,
    boucheArrosageCount: 0,
  };
}

function createSector(index = 1) {
  return {
    id: `S${index}`,
    name: `EV n° ${index}`,
    profileKey: "massif",
    meterPointId: "C1",
    mode: "goutte",
    emitterKey: "g16",
    angleCounts: { 90: 0, 180: 0, 360: 0 },
    evKey: "100-PGA",
    evPosition: "middle",
    splitA: 50,
    deltaZ: 0,
    areaM2: "",
    lengthMl: "",
    linesCount: 1,
    goutteInputMode: "m2",
    wateringDurationMin: "",
    wateringDaysSelected: [],
    primaryLengths: { 75: "", 63: "", 50: "", 40: "", 32: "", 25: "" },
    secondaryA: { 50: "", 40: "", 32: "", 25: "" },
    secondaryB: { 50: "", 40: "", 32: "", 25: "" },
  };
}

function Card({ title, subtitle, actions, children }) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="max-w-3xl">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1.5 text-sm leading-6 text-slate-500">{subtitle}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

function Field({ label, value, onChange, suffix = "", type = "number", tone = "default", compact = false }) {
  const toneClass = tone === "yellow" ? "border-amber-300 bg-amber-50" : tone === "gray" ? "border-slate-300 bg-slate-100" : "border-slate-300 bg-white";
  return (
    <label className="block">
      <div className={`mb-2 font-medium text-slate-700 ${compact ? "text-xs" : "text-sm"}`}>{label}</div>
      <div className="relative">
        <input
          type={type}
          step="any"
          value={value}
          onChange={(e) => onChange(type === "number" ? e.target.value : e.target.value)}
          className={`w-full rounded-2xl border outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 ${toneClass} ${compact ? "px-3 py-2 text-xs" : "px-3 py-3 text-sm"}`}
        />
        {suffix ? <span className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 ${compact ? "text-[10px]" : "text-xs"}`}>{suffix}</span> : null}
      </div>
    </label>
  );
}

function SelectField({ label, value, onChange, options, tone = "default", compact = false }) {
  const toneClass = tone === "yellow" ? "border-amber-300 bg-amber-50" : tone === "gray" ? "border-slate-300 bg-slate-100" : "border-slate-300 bg-white";
  return (
    <label className="block">
      <div className={`mb-2 font-medium text-slate-700 ${compact ? "text-[11px]" : "text-sm"}`}>{label}</div>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`w-full rounded-2xl border outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 ${toneClass} ${compact ? "px-3 py-2 text-[11px] leading-5" : "px-3 py-3 text-sm"}`}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

function Stat({ label, value, sub }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
      <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-2 text-xl font-semibold tracking-tight text-slate-900">{value}</div>
      {sub ? <div className="mt-1 text-xs leading-5 text-slate-500">{sub}</div> : null}
    </div>
  );
}

function TagButton({ active, onClick, children }) {
  return (
    <button onClick={onClick} className={`rounded-xl px-3 py-2 text-sm font-medium ${active ? "bg-slate-900 text-white" : "border border-slate-200 bg-white text-slate-700"}`}>
      {children}
    </button>
  );
}

export default function App() {
  const [tab, setTab] = useState("chantier");
  const [uiMode, setUiMode] = useState("conducteur");
  const [goutteurs, setGoutteurs] = useState(GOUTTEURS_BASE);
  const [tuyeres, setTuyeres] = useState(TUYERES_BASE);
  const [pgpRouges, setPgpRouges] = useState(PGP_BASE);
  const [meterPoints, setMeterPoints] = useState([createMeterPoint(1)]);
  const [chantier, setChantier] = useState({
    title: "Étude d’arrosage",
    client: "",
    site: "",
    operator: "Brettes Paysage",
    irrigationMonthsSelected: ["Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct"],
    pipeSeriesKey: "hd10",
    secondaryPipeSeriesKey: "hd10",
    hazenCPrimary: 140,
    hazenCSecondary: 140,
    primaryAccessoryMarginPct: 12,
    secondaryAccessoryMarginPct: 15,
    groupLossMeterCoeffBar: 0.3,
    groupLossDisconnectCoeffBar: 0.45,
    groupLossAccessoryCoeffBar: 0.1,
    meterUsableFlowMarginPct: 20,
  });
  const [sectors, setSectors] = useState([createSector(1)]);
  const activePageRef = useRef(null);
  const importFileRef = useRef(null);

  const inputTone = uiMode === "conducteur" ? "yellow" : "default";

  function updateChantier(key, value) {
    setChantier((prev) => ({ ...prev, [key]: value }));
  }

  const pageLabels = {
    chantier: "Chantier",
    secteurs: "Secteurs",
    synthese: "Synthèse",
    bibliotheque: "Bibliothèque",
    impression: "Impression client",
    pilotage: "Pilotage",
    materiel: "Matériel",
  };

  function buildProjectPayload() {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      chantier,
      meterPoints,
      sectors,
      goutteurs,
      tuyeres,
      pgpRouges,
      activeTab: tab,
      uiMode,
    };
  }

  function exportProjectJson() {
    const payload = buildProjectPayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(chantier.title || "projet_arrosage").replace(/[^a-z0-9-_]+/gi, "_")}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function openImportProject() {
    importFileRef.current?.click();
  }

  function handleImportProject(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const data = JSON.parse(String(loadEvent.target?.result || "{}"));
        if (data.chantier && typeof data.chantier === "object") setChantier(data.chantier);
        if (Array.isArray(data.meterPoints) && data.meterPoints.length) setMeterPoints(data.meterPoints);
        if (Array.isArray(data.sectors) && data.sectors.length) setSectors(data.sectors);
        if (Array.isArray(data.goutteurs) && data.goutteurs.length) setGoutteurs(data.goutteurs);
        if (Array.isArray(data.tuyeres) && data.tuyeres.length) setTuyeres(data.tuyeres);
        if (Array.isArray(data.pgpRouges) && data.pgpRouges.length) setPgpRouges(data.pgpRouges);
        if (data.activeTab && pageLabels[data.activeTab]) setTab(data.activeTab);
        if (data.uiMode === "conducteur" || data.uiMode === "expert") setUiMode(data.uiMode);
      } catch (error) {
        window.alert("Fichier projet invalide");
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  }

  function buildPrintableHtml(title, htmlContent) {
    const css = `
      body { font-family: Arial, sans-serif; color: #0f172a; margin: 24px; }
      table { border-collapse: collapse; width: 100%; font-size: 12px; }
      th, td { border: 1px solid #cbd5e1; padding: 8px; vertical-align: top; }
      th { background: #f8fafc; text-align: left; }
      h1, h2, h3 { color: #0f172a; }
      img { max-width: 220px; height: auto; }
    `;
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title><style>${css}</style></head><body>${htmlContent}</body></html>`;
  }

  function exportCurrentPageWord() {
    if (!activePageRef.current) return;
    const title = `${chantier.title || "Projet arrosage"} - ${pageLabels[tab] || "Page"}`;
    const html = buildPrintableHtml(title, activePageRef.current.innerHTML);
    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.replace(/[^a-z0-9-_]+/gi, "_")}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function exportCurrentPagePdf() {
    if (!activePageRef.current) return;
    const title = `${chantier.title || "Projet arrosage"} - ${pageLabels[tab] || "Page"}`;
    const printWindow = window.open("", "_blank", "width=1100,height=800");
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(buildPrintableHtml(title, activePageRef.current.innerHTML));
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  }

  function updateMeterPoint(pointId, patch) {
    setMeterPoints((prev) => prev.map((point) => point.id === pointId ? { ...point, ...patch } : point));
  }

  function addMeterPoint() {
    setMeterPoints((prev) => (prev.length >= 4 ? prev : [...prev, createMeterPoint(prev.length + 1)]));
  }

  function removeMeterPoint(pointId) {
    if (pointId === "C1") return;
    setMeterPoints((prev) => prev.filter((point) => point.id !== pointId));
    setSectors((prev) => prev.map((sector) => sector.meterPointId === pointId ? { ...sector, meterPointId: "C1" } : sector));
  }

  function updateGoutteur(valueKey, patch) {
    setGoutteurs((prev) => prev.map((item) => item.value === valueKey ? { ...item, ...patch } : item));
  }

  function updateAspersionItem(setter, valueKey, patch) {
    setter((prev) => prev.map((item) => item.value === valueKey ? { ...item, ...patch } : item));
  }

  function addTuyereModel() {
    setTuyeres((prev) => [...prev, { value: `van-custom-${prev.length + 1}`, label: `Tuyère modèle ${prev.length + 1}`, radiusM: 3, baseFlow360: 0.5, minPressureBar: 1, optimalPressureBar: 2.1 }]);
  }

  function addPgpModel() {
    setPgpRouges((prev) => [...prev, { value: `pgp-custom-${prev.length + 1}`, label: `PGP modèle ${prev.length + 1}`, radiusM: 10, baseFlow360: 0.5, minPressureBar: 1.7, optimalPressureBar: 2.5 }]);
  }

  function getMeterPointById(pointId) {
    return meterPoints.find((point) => point.id === pointId) || meterPoints[0];
  }

  function pointPressureKnown(point) {
    return point.supplyMode === "pump" ? hasValue(point.pumpPressureBar) : hasValue(point.staticPressureBar);
  }

  function pointSourcePressure(point) {
    return point.supplyMode === "pump" ? num(point.pumpPressureBar) : num(point.staticPressureBar);
  }

  function pointSourceFlow(point) {
    return point.supplyMode === "pump" ? num(point.pumpFlowM3h) : (hasValue(point.availableFlowM3h) ? num(point.availableFlowM3h) : (METER_Q3[point.blockKey] || 0));
  }

  function pointUsableFlow(point) {
    if (point.supplyMode === "pump") return pointSourceFlow(point);
    return pointSourceFlow(point) * Math.max(0, 1 - num(chantier.meterUsableFlowMarginPct) / 100);
  }

  function pointReducerActive(point) {
    return point.useReducerPressure && hasValue(point.reducerSetPressureBar);
  }

  function updateSector(index, patch) {
    setSectors((prev) => prev.map((sector, i) => i === index ? { ...sector, ...patch } : sector));
  }

  function updateSectorNested(index, key, diameter, value) {
    setSectors((prev) => prev.map((sector, i) => i === index ? { ...sector, [key]: { ...sector[key], [diameter]: value } } : sector));
  }

  function addSector() {
    setSectors((prev) => [...prev, createSector(prev.length + 1)]);
  }

  function removeSector(index) {
    setSectors((prev) => prev.length > 1 ? prev.filter((_, i) => i !== index) : prev);
  }

  function toggleMonth(month) {
    setChantier((prev) => ({
      ...prev,
      irrigationMonthsSelected: prev.irrigationMonthsSelected.includes(month)
        ? prev.irrigationMonthsSelected.filter((item) => item !== month)
        : [...prev.irrigationMonthsSelected, month],
    }));
  }

  function toggleSectorDay(index, day) {
    setSectors((prev) => prev.map((sector, i) => {
      if (i !== index) return sector;
      const next = sector.wateringDaysSelected.includes(day)
        ? sector.wateringDaysSelected.filter((item) => item !== day)
        : [...sector.wateringDaysSelected, day];
      return { ...sector, wateringDaysSelected: next };
    }));
  }

  function getEmitter(sector) {
    if (sector.mode === "goutte") return goutteurs.find((item) => item.value === sector.emitterKey) || goutteurs[0];
    if (sector.mode === "tuyere") return tuyeres.find((item) => item.value === sector.emitterKey) || tuyeres[0];
    return pgpRouges.find((item) => item.value === sector.emitterKey) || pgpRouges[0];
  }

  function dripFlowPerM2(emitter) {
    return (num(emitter.unitLh) / 1000) / (Math.max(num(emitter.lineSpacingM), 0.0001) * Math.max(num(emitter.emitterSpacingM), 0.0001));
  }

  function dripFlowPerMl(emitter) {
    return (num(emitter.unitLh) / 1000) / Math.max(num(emitter.emitterSpacingM), 0.0001);
  }

  function sprinklerEquivalentCount(sector) {
    const counts = sector.angleCounts || { 90: 0, 180: 0, 360: 0 };
    return (num(counts[90]) * 90 + num(counts[180]) * 180 + num(counts[360]) * 360) / 360;
  }

  function sectorBaseFlow(sector) {
    if (sector.mode === "goutte") {
      const emitter = getEmitter(sector);
      if (sector.goutteInputMode === "ml") return num(sector.lengthMl) * num(sector.linesCount || 1) * dripFlowPerMl(emitter);
      return num(sector.areaM2) * dripFlowPerM2(emitter);
    }
    return sprinklerEquivalentCount(sector) * num(getEmitter(sector).baseFlow360);
  }

  function networkLoss(lengths, flow, seriesKey, hazenC) {
    return Object.entries(lengths || {}).reduce((sum, [diameter, length]) => {
      const di = PIPE_SERIES[seriesKey]?.diameters?.[diameter];
      return sum + hazenLossBar(length, flow, di, hazenC);
    }, 0);
  }

  function estimateGroupLoss(flow, point) {
    if (point.supplyMode === "pump") return num(point.pumpAccessoryLossBar);
    const qRef = Math.max(pointSourceFlow(point), 0.1);
    const meterLoss = num(chantier.groupLossMeterCoeffBar) * ((num(flow) / qRef) ** 2);
    const disconnectLoss = num(chantier.groupLossDisconnectCoeffBar) * ((num(flow) / qRef) ** 1.6);
    const accessoryLoss = num(chantier.groupLossAccessoryCoeffBar) * ((num(flow) / qRef) ** 2);
    return meterLoss + disconnectLoss + accessoryLoss;
  }

  const sectorRows = useMemo(() => sectors.map((sector) => {
    const point = getMeterPointById(sector.meterPointId || "C1");
    const emitter = getEmitter(sector);
    const flow = sectorBaseFlow(sector);
    const primaryLoss = networkLoss(sector.primaryLengths, flow, chantier.pipeSeriesKey, chantier.hazenCPrimary) * (1 + num(chantier.primaryAccessoryMarginPct) / 100);
    const splitA = sector.evPosition === "middle" ? num(sector.splitA, 50) / 100 : 1;
    const splitB = sector.evPosition === "middle" ? 1 - splitA : 0;
    const secondaryA = networkLoss(sector.secondaryA, flow * splitA, chantier.secondaryPipeSeriesKey, chantier.hazenCSecondary) * (1 + num(chantier.secondaryAccessoryMarginPct) / 100);
    const secondaryB = networkLoss(sector.secondaryB, flow * splitB, chantier.secondaryPipeSeriesKey, chantier.hazenCSecondary) * (1 + num(chantier.secondaryAccessoryMarginPct) / 100);
    const secondaryLoss = Math.max(secondaryA, secondaryB);
    const evLoss = (EV_OPTIONS.find((item) => item.value === sector.evKey) || EV_OPTIONS[0]).lossBar;
    const pSource = pointSourcePressure(point);
    const pAfterGroup = pSource - estimateGroupLoss(flow, point);
    const pAfterReducer = pointReducerActive(point) ? Math.min(pAfterGroup, num(point.reducerSetPressureBar)) : pAfterGroup;
    const pFinal = pAfterReducer - primaryLoss - secondaryLoss - evLoss - (num(sector.deltaZ) / 10);
    return {
      ...sector,
      emitter,
      flow,
      meterPointName: point.name,
      sourcePressureKnown: pointPressureKnown(point),
      sourcePressure: pSource,
      sourceFlow: pointSourceFlow(point),
      usableFlow: pointUsableFlow(point),
      meterPointReducerActive: pointReducerActive(point),
      pressureAfterGroup: pAfterGroup,
      pressureAfterReducer: pAfterReducer,
      primaryLoss,
      secondaryLoss,
      evLoss,
      finalPressure: pFinal,
      minEmitterPressure: num(emitter.minPressureBar, 1),
      optimalPressure: num(emitter.optimalPressureBar, 2),
      ok: pFinal >= num(emitter.minPressureBar, 1),
      flowAlert: point.supplyMode === "meter" && pointUsableFlow(point) > 0 && flow > pointUsableFlow(point),
    };
  }), [sectors, meterPoints, chantier, goutteurs, tuyeres, pgpRouges]);

  const counterEstimate = useMemo(() => {
    const groups = meterPoints.map((point) => {
      const rows = sectorRows.filter((row) => row.meterPointId === point.id);
      if (!rows.length) return null;
      const peak = rows.reduce((best, row) => row.flow > best.flow ? row : best, rows[0]);
      return { group: point.id, name: point.name, point, flow: peak.flow, sectorName: peak.name };
    }).filter(Boolean);
    const worst = groups.length ? groups.reduce((best, row) => row.flow > best.flow ? row : best, groups[0]) : null;
    return { groups, worst };
  }, [meterPoints, sectorRows]);

  const worstPoint = counterEstimate.worst?.point || null;
  const displayPressureSource = worstPoint ? (pointPressureKnown(worstPoint) ? formatBar(pointSourcePressure(worstPoint)) : "À renseigner") : "À renseigner";
  const displaySourceFlow = worstPoint ? formatFlow(pointSourceFlow(worstPoint)) : "À renseigner";
  const displayUsableFlow = worstPoint ? formatFlow(pointUsableFlow(worstPoint)) : "À renseigner";
  const displayCounterEstimate = counterEstimate.worst ? formatFlow(counterEstimate.worst.flow) : "À calculer";
  const displayBlockLoss = counterEstimate.worst ? formatBar(estimateGroupLoss(counterEstimate.worst.flow, worstPoint)) : "À calculer";
  const displayReducerSetting = worstPoint && pointReducerActive(worstPoint) ? formatBar(worstPoint.reducerSetPressureBar) : "Sans réducteur";

  const activeDaysYear = useMemo(() => chantier.irrigationMonthsSelected.reduce((sum, month) => sum + (MONTH_DAY_MAP[month] || 0), 0), [chantier.irrigationMonthsSelected]);

  const sectorConsumptionRows = useMemo(() => sectorRows.map((row) => {
    const daysPerWeek = row.wateringDaysSelected.length;
    const volumePerPass = row.flow * (num(row.wateringDurationMin) / 60);
    const volumePerWeek = volumePerPass * daysPerWeek;
    const volumeAnnual = volumePerPass * (daysPerWeek / 7) * activeDaysYear;
    const volumeMonthly = chantier.irrigationMonthsSelected.length ? volumeAnnual / chantier.irrigationMonthsSelected.length : 0;
    return { ...row, daysPerWeek, volumePerPass, volumePerWeek, volumeAnnual, volumeMonthly };
  }), [sectorRows, activeDaysYear, chantier.irrigationMonthsSelected.length]);

  const meterSummaryRows = useMemo(() => meterPoints.map((point) => {
    const rows = sectorConsumptionRows.filter((row) => row.meterPointId === point.id);
    if (!rows.length) return null;
    const peak = rows.reduce((best, row) => row.flow > best.flow ? row : best, rows[0]);
    const farthest = rows.reduce((best, row) => {
      const bestLen = Object.values(best.primaryLengths || {}).reduce((sum, value) => sum + num(value), 0);
      const rowLen = Object.values(row.primaryLengths || {}).reduce((sum, value) => sum + num(value), 0);
      return rowLen > bestLen ? row : best;
    }, rows[0]);
    return {
      group: point.id,
      name: point.name,
      sourcePressureKnown: pointPressureKnown(point),
      sourcePressure: pointSourcePressure(point),
      sectorCount: rows.length,
      surfaceM2: rows.filter((row) => row.mode === "goutte").reduce((sum, row) => sum + num(row.areaM2), 0),
      maxSectorName: peak.name,
      maxFlow: peak.flow,
      farthestPrimaryMl: Object.values(farthest.primaryLengths || {}).reduce((sum, value) => sum + num(value), 0),
      farthestPrimaryLoss: farthest.primaryLoss,
      pressureAvailable: peak.finalPressure,
      volumeAnnual: rows.reduce((sum, row) => sum + row.volumeAnnual, 0),
    };
  }).filter(Boolean), [meterPoints, sectorConsumptionRows]);

  const totalVolumeWeek = useMemo(() => sectorConsumptionRows.reduce((sum, row) => sum + row.volumePerWeek, 0), [sectorConsumptionRows]);
  const totalVolumeAnnual = useMemo(() => sectorConsumptionRows.reduce((sum, row) => sum + row.volumeAnnual, 0), [sectorConsumptionRows]);

  const materialSummary = useMemo(() => {
    const primaryTotals = { 75: 0, 63: 0, 50: 0, 40: 0, 32: 0, 25: 0 };
    const secondaryTotals = { 50: 0, 40: 0, 32: 0, 25: 0 };
    const evCounts = {};
    const dripByRef = {};
    const tuyereCounts = {};
    const pgpCounts = {};

    sectorRows.forEach((row) => {
      Object.entries(row.primaryLengths || {}).forEach(([diameter, length]) => { primaryTotals[diameter] += num(length); });
      Object.entries(row.secondaryA || {}).forEach(([diameter, length]) => { secondaryTotals[diameter] += num(length); });
      Object.entries(row.secondaryB || {}).forEach(([diameter, length]) => { secondaryTotals[diameter] += num(length); });
      evCounts[row.evKey] = (evCounts[row.evKey] || 0) + 1;
      if (row.mode === "goutte") {
        const linear = row.goutteInputMode === "ml" ? num(row.lengthMl) * num(row.linesCount || 1) : num(row.areaM2) / Math.max(num(row.emitter.lineSpacingM), 0.0001);
        const area = row.goutteInputMode === "m2" ? num(row.areaM2) : linear * num(row.emitter.lineSpacingM);
        const key = row.emitter.label;
        dripByRef[key] = dripByRef[key] || { areaM2: 0, linearMl: 0 };
        dripByRef[key].areaM2 += area;
        dripByRef[key].linearMl += linear;
      } else {
        const qty = num(row.angleCounts?.[90]) + num(row.angleCounts?.[180]) + num(row.angleCounts?.[360]);
        if (row.mode === "tuyere") tuyereCounts[row.emitter.label] = (tuyereCounts[row.emitter.label] || 0) + qty;
        if (row.mode === "pgp") pgpCounts[row.emitter.label] = (pgpCounts[row.emitter.label] || 0) + qty;
      }
    });

    const meterAccessoryRows = meterPoints
      .map((point) => ({ id: point.id, name: point.name, clapetCount: num(point.clapetCount), boucheArrosageCount: num(point.boucheArrosageCount) }))
      .filter((row) => row.clapetCount > 0 || row.boucheArrosageCount > 0);

    return {
      primaryRows: Object.entries(primaryTotals),
      secondaryRows: Object.entries(secondaryTotals),
      evRows: Object.entries(evCounts),
      dripRows: Object.entries(dripByRef),
      tuyereRows: Object.entries(tuyereCounts),
      pgpRows: Object.entries(pgpCounts),
      dripAreaTotal: Object.values(dripByRef).reduce((sum, row) => sum + row.areaM2, 0),
      dripLinearTotal: Object.values(dripByRef).reduce((sum, row) => sum + row.linearMl, 0),
      meterAccessoryRows,
    };
  }, [sectorRows, meterPoints]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl p-4 md:p-6">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-900 px-5 py-4 text-white">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Brettes Paysage</div>
                <h1 className="mt-1 text-xl font-semibold">Pré-dimensionnement réseau</h1>
                <p className="mt-1 text-sm text-slate-300">Version de récupération stable</p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex justify-end gap-2">
                  <button onClick={() => setUiMode("conducteur")} className={`rounded-xl px-3 py-2 text-sm font-medium ${uiMode === "conducteur" ? "bg-white text-slate-900" : "bg-slate-800 text-slate-200"}`}>Mode conduc</button>
                  <button onClick={() => setUiMode("expert")} className={`rounded-xl px-3 py-2 text-sm font-medium ${uiMode === "expert" ? "bg-white text-slate-900" : "bg-slate-800 text-slate-200"}`}>Mode expert</button>
                </div>
                <div className="grid gap-2 sm:grid-cols-4">
                  <Stat label="Débit de pointe estimé" value={displayCounterEstimate} sub={counterEstimate.worst ? `${counterEstimate.worst.group} · ${counterEstimate.worst.name}` : "Aucun secteur"} />
                  <Stat label="P source du compteur critique" value={displayPressureSource} sub={counterEstimate.worst ? `${counterEstimate.worst.group} · ${counterEstimate.worst.name}` : "Aucun point critique"} />
                  <Stat label="Q exploitable" value={displayUsableFlow} sub={`Marge ${round(chantier.meterUsableFlowMarginPct, 0)} %`} />
                  <Stat label="ΔP groupe" value={displayBlockLoss} sub={`Réducteur ${displayReducerSetting}`} />
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-slate-200 bg-white px-4 py-3">
            <div className="flex flex-wrap gap-2">
              {[
                ["chantier", "1 · Chantier"],
                ["secteurs", "2 · Secteurs"],
                ["synthese", "3 · Synthèse"],
                ["bibliotheque", "4 · Bibliothèque"],
                ["impression", "5 · Impression"],
                ["pilotage", "6 · Pilotage"],
                ["materiel", "7 · Matériel"],
              ].map(([key, label]) => (
                <button key={key} onClick={() => setTab(key)} className={`rounded-xl px-3 py-2 text-sm font-medium ${tab === key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>{label}</button>
              ))}
            </div>
          </div>

          <div className="space-y-4 p-4 md:p-6">
            <input ref={importFileRef} type="file" accept="application/json,.json" onChange={handleImportProject} className="hidden" />
            <Card title="Gestion du projet" subtitle="Import, export et sorties Word / PDF sur la page active sans dupliquer les moteurs de calcul">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <button onClick={exportProjectJson} className="rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-medium text-white">Exporter projet</button>
                <button onClick={openImportProject} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900">Importer projet</button>
                <button onClick={exportCurrentPageWord} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900">Word page active</button>
                <button onClick={exportCurrentPagePdf} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-900">PDF page active</button>
              </div>
              <div className="mt-3 text-sm text-slate-600">Page active : <span className="font-medium text-slate-900">{pageLabels[tab]}</span></div>
            </Card>
            {tab === "chantier" && (
              <div ref={activePageRef} className="space-y-4">
                <Card title="Informations chantier">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Field tone={inputTone} label="Titre" value={chantier.title} onChange={(value) => updateChantier("title", value)} type="text" />
                    <Field tone={inputTone} label="Client" value={chantier.client} onChange={(value) => updateChantier("client", value)} type="text" />
                    <Field tone={inputTone} label="Site" value={chantier.site} onChange={(value) => updateChantier("site", value)} type="text" />
                    <Field tone={inputTone} label="Opérateur" value={chantier.operator} onChange={(value) => updateChantier("operator", value)} type="text" />
                  </div>
                </Card>

                <Card title="Points de comptage" subtitle="1 point par défaut, ajout possible jusqu’à 4" actions={<button onClick={addMeterPoint} disabled={meterPoints.length >= 4} className={`rounded-xl px-3 py-2 text-sm font-medium ${meterPoints.length >= 4 ? "bg-slate-300 text-slate-500" : "bg-slate-900 text-white"}`}>Ajouter un point</button>}>
                  <div className="space-y-4">
                    {meterPoints.map((point) => (
                      <div key={point.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{point.id}</div>
                            <div className="mt-1 text-lg font-semibold text-slate-900">{point.name}</div>
                          </div>
                          <button onClick={() => removeMeterPoint(point.id)} disabled={point.id === "C1"} className={`rounded-xl border px-3 py-2 text-sm ${point.id === "C1" ? "border-slate-200 bg-slate-100 text-slate-400" : "border-slate-200 bg-white text-slate-900"}`}>Supprimer</button>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                          <Field tone={inputTone} label="Nom du point" value={point.name} onChange={(value) => updateMeterPoint(point.id, { name: value })} type="text" />
                          <SelectField tone={inputTone} label="Type d’alimentation" value={point.supplyMode} onChange={(value) => updateMeterPoint(point.id, { supplyMode: value })} options={[{ value: "meter", label: "Compteur" }, { value: "pump", label: "Pompage" }]} />
                          {point.supplyMode === "pump" ? (
                            <>
                              <SelectField tone={inputTone} label="Type de pompe" value={point.pumpType} onChange={(value) => updateMeterPoint(point.id, { pumpType: value })} options={[{ value: "balloon", label: "Pompe avec ballon" }, { value: "variable", label: "Pompe avec variateur" }]} />
                              <Field tone={inputTone} label="Débit sortie pompe" value={point.pumpFlowM3h} onChange={(value) => updateMeterPoint(point.id, { pumpFlowM3h: value })} suffix="m³/h" />
                              <Field tone={inputTone} label="Pression sortie pompe" value={point.pumpPressureBar} onChange={(value) => updateMeterPoint(point.id, { pumpPressureBar: value })} suffix="bar" />
                              <SelectField tone={inputTone} label="Ballon" value={String(point.pumpBalloonLiters)} onChange={(value) => updateMeterPoint(point.id, { pumpBalloonLiters: Number(value) })} options={[40, 60, 80, 100, 150].map((v) => ({ value: String(v), label: `${v} L` }))} />
                            </>
                          ) : (
                            <>
                              <Field tone={inputTone} label="Pression statique" value={point.staticPressureBar} onChange={(value) => updateMeterPoint(point.id, { staticPressureBar: value })} suffix="bar" />
                              <Field tone={inputTone} label="Débit disponible" value={point.availableFlowM3h} onChange={(value) => updateMeterPoint(point.id, { availableFlowM3h: value })} suffix="m³/h" />
                              <SelectField tone={inputTone} label="Compteur" value={point.blockKey} onChange={(value) => updateMeterPoint(point.id, { blockKey: value })} options={Object.keys(METER_Q3).map((key) => ({ value: key, label: `${key} · Q3 ${METER_Q3[key]} m³/h` }))} />
                            </>
                          )}
                          <SelectField tone={inputTone} label="Réducteur" value={point.useReducerPressure ? "yes" : "no"} onChange={(value) => updateMeterPoint(point.id, { useReducerPressure: value === "yes" })} options={[{ value: "no", label: "Non" }, { value: "yes", label: "Oui" }]} />
                          {point.useReducerPressure ? <Field tone={inputTone} label="Consigne aval réducteur" value={point.reducerSetPressureBar} onChange={(value) => updateMeterPoint(point.id, { reducerSetPressureBar: value })} suffix="bar" /> : <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4 text-sm text-slate-600">Réducteur inactif</div>}
                          {point.supplyMode === "pump" ? <Field tone={inputTone} label="Pertes accessoires pompage" value={point.pumpAccessoryLossBar} onChange={(value) => updateMeterPoint(point.id, { pumpAccessoryLossBar: value })} suffix="bar" /> : <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4 text-sm text-slate-600">{point.blockKey} · Q3 {METER_Q3[point.blockKey]} m³/h</div>}
                          <Field tone={inputTone} label="Clapet-vanne" value={point.clapetCount} onChange={(value) => updateMeterPoint(point.id, { clapetCount: value })} />
                          <Field tone={inputTone} label="Bouches d’arrosage" value={point.boucheArrosageCount} onChange={(value) => updateMeterPoint(point.id, { boucheArrosageCount: value })} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {uiMode === "expert" ? (
                  <>
                    <Card title="Séries PE et paramètres de calcul canalisations" subtitle="Diamètres intérieurs réels + Hazen-Williams + majoration singularités">
                      <div className="grid gap-5 xl:grid-cols-2">
                        <div>
                          <div className="mb-3 grid gap-3 md:grid-cols-2">
                            <SelectField compact label="Série primaire" value={chantier.pipeSeriesKey} onChange={(value) => updateChantier("pipeSeriesKey", value)} options={Object.values(PIPE_SERIES).map((item) => ({ value: item.key, label: item.label }))} />
                            <SelectField compact label="Série secondaire" value={chantier.secondaryPipeSeriesKey} onChange={(value) => updateChantier("secondaryPipeSeriesKey", value)} options={Object.values(PIPE_SERIES).map((item) => ({ value: item.key, label: item.label }))} />
                          </div>
                          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                            <Field compact label="Coeff. Hazen primaire" value={chantier.hazenCPrimary} onChange={(value) => updateChantier("hazenCPrimary", value)} />
                            <Field compact label="Coeff. Hazen secondaire" value={chantier.hazenCSecondary} onChange={(value) => updateChantier("hazenCSecondary", value)} />
                            <Field compact label="Majoration accessoires primaire" value={chantier.primaryAccessoryMarginPct} onChange={(value) => updateChantier("primaryAccessoryMarginPct", value)} suffix="%" />
                            <Field compact label="Majoration accessoires secondaire" value={chantier.secondaryAccessoryMarginPct} onChange={(value) => updateChantier("secondaryAccessoryMarginPct", value)} suffix="%" />
                          </div>
                        </div>
                        <div className="grid gap-3 xl:grid-cols-2">
                          <div className="rounded-2xl bg-slate-50 p-4">
                            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">Diamètres intérieurs primaire</div>
                            <div className="space-y-1.5">{[75, 63, 50, 40, 32, 25].map((diameter) => <div key={`p-${diameter}`} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm"><span className="text-slate-600">Ø{diameter}</span><span className="font-medium text-slate-900">DI {PIPE_SERIES[chantier.pipeSeriesKey].diameters[diameter] ?? "-"} mm</span></div>)}</div>
                          </div>
                          <div className="rounded-2xl bg-slate-50 p-4">
                            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">Diamètres intérieurs secondaire</div>
                            <div className="space-y-1.5">{[50, 40, 32, 25].map((diameter) => <div key={`s-${diameter}`} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm"><span className="text-slate-600">Ø{diameter}</span><span className="font-medium text-slate-900">DI {PIPE_SERIES[chantier.secondaryPipeSeriesKey].diameters[diameter] ?? "-"} mm</span></div>)}</div>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card title="Paramètres groupe compteur + disconnecteur" subtitle="Réglages experts pour la perte de charge et le débit exploitable réseau">
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                        <Field compact label="Coeff. compteur" value={chantier.groupLossMeterCoeffBar} onChange={(value) => updateChantier("groupLossMeterCoeffBar", value)} suffix="bar" />
                        <Field compact label="Coeff. disconnecteur" value={chantier.groupLossDisconnectCoeffBar} onChange={(value) => updateChantier("groupLossDisconnectCoeffBar", value)} suffix="bar" />
                        <Field compact label="Coeff. accessoires" value={chantier.groupLossAccessoryCoeffBar} onChange={(value) => updateChantier("groupLossAccessoryCoeffBar", value)} suffix="bar" />
                        <Field compact label="Marge débit exploitable" value={chantier.meterUsableFlowMarginPct} onChange={(value) => updateChantier("meterUsableFlowMarginPct", value)} suffix="%" />
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Débit exploitable retenu = débit de référence compteur × (1 - marge)</div>
                      </div>
                    </Card>
                  </>
                ) : (
                  <Card title="Séries PE et paramètres de calcul canalisations" subtitle="Lecture seule en mode conducteur">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3"><div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Série primaire</div><div className="mt-1 text-[11px] leading-5 font-medium text-slate-900">{PIPE_SERIES[chantier.pipeSeriesKey].label}</div></div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3"><div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Série secondaire</div><div className="mt-1 text-[11px] leading-5 font-medium text-slate-900">{PIPE_SERIES[chantier.secondaryPipeSeriesKey].label}</div></div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3"><div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Q exploitable</div><div className="mt-1 text-sm font-semibold text-slate-900">{round(100 - chantier.meterUsableFlowMarginPct, 0)} %</div></div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3"><div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">Hazen primaire</div><div className="mt-1 text-sm font-semibold text-slate-900">{chantier.hazenCPrimary}</div></div>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {tab === "secteurs" && (
              <div ref={activePageRef} className="space-y-4">
                <Card title="Création des réseaux" subtitle="Construction des réseaux et affectation des points de comptage" actions={<button onClick={addSector} className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white">Ajouter un réseau</button>}>
                  <div className="space-y-4">
                    {sectorRows.map((sector, index) => (
                      <div key={sector.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Secteur {index + 1}</div>
                            <div className="mt-1 text-xl font-semibold">{sector.name}</div>
                          </div>
                          <button onClick={() => removeSector(index)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">Supprimer</button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                          <Field tone={inputTone} label="Nom secteur" value={sector.name} onChange={(value) => updateSector(index, { name: value })} type="text" />
                          <SelectField tone={inputTone} label="Profil" value={sector.profileKey} onChange={(value) => updateSector(index, { profileKey: value })} options={PROFILE_OPTIONS} />
                          <SelectField tone={inputTone} label="Point de comptage" value={sector.meterPointId} onChange={(value) => updateSector(index, { meterPointId: value })} options={meterPoints.map((point) => ({ value: point.id, label: `${point.id} · ${point.name}` }))} />
                          <SelectField tone={inputTone} label="Mode" value={sector.mode} onChange={(value) => updateSector(index, { mode: value, emitterKey: value === "goutte" ? goutteurs[0].value : value === "tuyere" ? tuyeres[0].value : pgpRouges[0].value })} options={MODE_OPTIONS} />
                          <SelectField tone={inputTone} label="Électrovanne" value={sector.evKey} onChange={(value) => updateSector(index, { evKey: value })} options={EV_OPTIONS.map((item) => ({ value: item.value, label: item.label }))} />
                        </div>

                        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-100 p-4">
                          <div className="text-xs uppercase tracking-[0.14em] text-slate-500">Résumé du point de comptage sélectionné</div>
                          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm">
                            <div><span className="text-slate-500">Compteur choisi</span><div className="mt-1 font-medium text-slate-900">{sector.meterPointId} · {sector.meterPointName}</div></div>
                            <div><span className="text-slate-500">Pression statique</span><div className="mt-1 font-medium text-slate-900">{sector.sourcePressureKnown ? formatBar(sector.sourcePressure) : "À renseigner"}</div></div>
                            <div><span className="text-slate-500">Débit référence</span><div className="mt-1 font-medium text-slate-900">{formatFlow(sector.sourceFlow)}</div></div>
                            <div><span className="text-slate-500">Débit exploitable</span><div className="mt-1 font-medium text-slate-900">{formatFlow(sector.usableFlow)}</div></div>
                          </div>
                          {sector.flowAlert ? <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">Alerte débit compteur : le débit du réseau {formatFlow(sector.flow)} dépasse le débit exploitable retenu {formatFlow(sector.usableFlow)}.</div> : null}
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                          <SelectField tone={inputTone} label="Position de l’électrovanne" value={sector.evPosition} onChange={(value) => updateSector(index, { evPosition: value })} options={[{ value: "middle", label: "Au milieu" }, { value: "end", label: "En bout" }]} />
                          <Field tone={inputTone} label="Répartition branche A" value={sector.splitA} onChange={(value) => updateSector(index, { splitA: value })} suffix="%" />
                          <Field tone={inputTone} label="Dénivelé" value={sector.deltaZ} onChange={(value) => updateSector(index, { deltaZ: value })} suffix="m" />
                          <Field tone={inputTone} label="Durée arrosage" value={sector.wateringDurationMin} onChange={(value) => updateSector(index, { wateringDurationMin: value })} suffix="min" />
                          <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4"><div className="text-sm text-slate-500">Résultat</div><div className="mt-2 text-lg font-semibold">{formatFlow(sector.flow)}</div><div className="mt-1 text-sm text-slate-500">{formatBar(sector.finalPressure)}</div></div>
                        </div>

                        {sector.mode === "goutte" ? (
                          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <SelectField tone={inputTone} label="Goutteur" value={sector.emitterKey} onChange={(value) => updateSector(index, { emitterKey: value })} options={goutteurs.map((item) => ({ value: item.value, label: item.label }))} />
                            <SelectField tone={inputTone} label="Base de saisie" value={sector.goutteInputMode} onChange={(value) => updateSector(index, { goutteInputMode: value })} options={[{ value: "m2", label: "Surface m²" }, { value: "ml", label: "Longueur ml" }]} />
                            {sector.goutteInputMode === "m2" ? <Field tone={inputTone} label="Surface" value={sector.areaM2} onChange={(value) => updateSector(index, { areaM2: value })} suffix="m²" /> : <><Field tone={inputTone} label="Longueur" value={sector.lengthMl} onChange={(value) => updateSector(index, { lengthMl: value })} suffix="ml" /><Field tone={inputTone} label="Nb lignes" value={sector.linesCount} onChange={(value) => updateSector(index, { linesCount: value })} /></>}
                            <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4"><div className="text-sm text-slate-500">Référence</div><div className="mt-2 font-semibold text-slate-900">{sector.emitter.label}</div><div className="mt-1 text-sm text-slate-500">Mini {formatBar(sector.minEmitterPressure)} · Opti {formatBar(sector.optimalPressure)}</div></div>
                          </div>
                        ) : (
                          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                            <SelectField tone={inputTone} label="Buse" value={sector.emitterKey} onChange={(value) => updateSector(index, { emitterKey: value })} options={(sector.mode === "tuyere" ? tuyeres : pgpRouges).map((item) => ({ value: item.value, label: item.label }))} />
                            <Field tone={inputTone} label="Nb arroseurs 90°" value={sector.angleCounts[90]} onChange={(value) => updateSector(index, { angleCounts: { ...sector.angleCounts, 90: value } })} />
                            <Field tone={inputTone} label="Nb arroseurs 180°" value={sector.angleCounts[180]} onChange={(value) => updateSector(index, { angleCounts: { ...sector.angleCounts, 180: value } })} />
                            <Field tone={inputTone} label="Nb arroseurs 360°" value={sector.angleCounts[360]} onChange={(value) => updateSector(index, { angleCounts: { ...sector.angleCounts, 360: value } })} />
                            <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4"><div className="text-sm text-slate-500">Buse active</div><div className="mt-2 font-semibold text-slate-900">{sector.emitter.label}</div><div className="mt-1 text-sm text-slate-500">Portée {formatMeters(sector.emitter.radiusM)}</div></div>
                          </div>
                        )}

                        <div className="mt-4 grid gap-4 xl:grid-cols-2">
                          <div className="rounded-2xl border border-slate-200 bg-white p-4">
                            <div className="mb-3 text-sm font-semibold text-slate-800">Réseau primaire</div>
                            <div className="grid gap-3 md:grid-cols-3">{[75, 63, 50, 40, 32, 25].map((diameter) => <Field key={`p-${sector.id}-${diameter}`} tone={inputTone} label={`Ø${diameter} · DI ${PIPE_SERIES[chantier.pipeSeriesKey].diameters[diameter] ?? "-"} mm`} value={sector.primaryLengths[diameter]} onChange={(value) => updateSectorNested(index, "primaryLengths", diameter, value)} suffix="m" />)}</div>
                          </div>
                          <div className="rounded-2xl border border-slate-200 bg-white p-4">
                            <div className="mb-3 text-sm font-semibold text-slate-800">Réseau secondaire A</div>
                            <div className="grid gap-3 md:grid-cols-2">{[50, 40, 32, 25].map((diameter) => <Field key={`sa-${sector.id}-${diameter}`} tone={inputTone} label={`Ø${diameter} · DI ${PIPE_SERIES[chantier.secondaryPipeSeriesKey].diameters[diameter] ?? "-"} mm`} value={sector.secondaryA[diameter]} onChange={(value) => updateSectorNested(index, "secondaryA", diameter, value)} suffix="m" />)}</div>
                            {sector.evPosition === "middle" ? <><div className="mb-3 mt-5 text-sm font-semibold text-slate-800">Réseau secondaire B</div><div className="grid gap-3 md:grid-cols-2">{[50, 40, 32, 25].map((diameter) => <Field key={`sb-${sector.id}-${diameter}`} tone={inputTone} label={`Ø${diameter} · DI ${PIPE_SERIES[chantier.secondaryPipeSeriesKey].diameters[diameter] ?? "-"} mm`} value={sector.secondaryB[diameter]} onChange={(value) => updateSectorNested(index, "secondaryB", diameter, value)} suffix="m" />)}</div></> : <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-500">EV en bout : pas de branche B</div>}
                          </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                          <span className="font-medium text-slate-900">Contrôle pression :</span> mini {formatBar(sector.minEmitterPressure)} · optimale {formatBar(sector.optimalPressure)} · disponible {formatBar(sector.finalPressure)}
                          <div className="mt-2">Point de comptage {sector.meterPointId} · {sector.meterPointName} · P source {sector.sourcePressureKnown ? formatBar(sector.sourcePressure) : "À renseigner"} · après groupe {formatBar(sector.pressureAfterGroup)} · après réducteur {formatBar(sector.pressureAfterReducer)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-end"><button onClick={addSector} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white">Ajouter un réseau</button></div>
                </Card>
              </div>
            )}

            {tab === "synthese" && (
              <div ref={activePageRef}>
              <Card title="Synthèse hydraulique" subtitle="Vue rapide du projet">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Stat label="Débit de pointe estimé" value={displayCounterEstimate} sub={counterEstimate.worst ? `${counterEstimate.worst.group} · ${counterEstimate.worst.name}` : "Aucun secteur"} />
                  <Stat label="Débit cumulé secteurs" value={formatFlow(sectorRows.reduce((sum, row) => sum + row.flow, 0))} />
                  <Stat label="P source du compteur critique" value={displayPressureSource} />
                  <Stat label="Secteurs" value={String(sectorRows.length)} />
                </div>
                <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600"><tr><th className="px-4 py-3 text-left">Secteur</th><th className="px-4 py-3 text-left">Point de comptage</th><th className="px-4 py-3 text-left">Mode</th><th className="px-4 py-3 text-left">Débit</th><th className="px-4 py-3 text-left">P finale</th><th className="px-4 py-3 text-left">Statut</th></tr></thead>
                    <tbody>
                      {sectorRows.map((row) => (
                        <tr key={row.id} className="border-t border-slate-100">
                          <td className="px-4 py-3 font-medium">{row.name}</td>
                          <td className="px-4 py-3">{row.meterPointId}</td>
                          <td className="px-4 py-3">{MODE_OPTIONS.find((item) => item.value === row.mode)?.label}</td>
                          <td className="px-4 py-3">{formatFlow(row.flow)}</td>
                          <td className="px-4 py-3">{formatBar(row.finalPressure)}</td>
                          <td className="px-4 py-3">{row.flowAlert ? "Alerte débit compteur" : row.ok ? "OK" : "Alerte pression"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
              </div>
            )}

            {tab === "bibliotheque" && (
              <div ref={activePageRef} className="space-y-4">
                <Card title="Bibliothèque goutte-à-goutte" subtitle="Interlignes, espacements, débits et pression minimale">
                  <div className="grid gap-4 xl:grid-cols-3">
                    {goutteurs.map((item) => (
                      <div key={item.value} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-3 font-semibold text-slate-900">{item.label}</div>
                        <div className="grid gap-3">
                          <Field label="Débit" value={item.unitLh} onChange={(value) => updateGoutteur(item.value, { unitLh: value })} suffix="L/h" />
                          <Field label="Interligne" value={item.lineSpacingM} onChange={(value) => updateGoutteur(item.value, { lineSpacingM: value })} suffix="m" />
                          <Field label="Espacement goutteurs" value={item.emitterSpacingM} onChange={(value) => updateGoutteur(item.value, { emitterSpacingM: value })} suffix="m" />
                        </div>
                        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
                          <div>Débit surfacique : <span className="font-semibold text-slate-900">{formatFlow(dripFlowPerM2(item))}</span> / m²</div>
                          <div className="mt-1">Débit linéaire : <span className="font-semibold text-slate-900">{formatFlow(dripFlowPerMl(item))}</span> / ml</div>
                          <div className="mt-1">Pression mini : <span className="font-semibold text-slate-900">{formatBar(item.minPressureBar)}</span></div>
                          <div className="mt-1">Pression optimale : <span className="font-semibold text-slate-900">{formatBar(item.optimalPressureBar)}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="Bibliothèque PE" subtitle="Diamètres intérieurs utilisables pour le primaire et le secondaire">
                  <div className="grid gap-4 xl:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-3 text-sm font-semibold text-slate-800">Primaire · {PIPE_SERIES[chantier.pipeSeriesKey].label}</div>
                      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        <table className="w-full text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-4 py-3 text-left font-medium">Ø tuyau</th><th className="px-4 py-3 text-left font-medium">DI</th></tr></thead><tbody>{[75, 63, 50, 40, 32, 25].map((diameter) => <tr key={`lib-p-${diameter}`} className="border-t border-slate-100"><td className="px-4 py-3 font-medium">Ø{diameter}</td><td className="px-4 py-3">{PIPE_SERIES[chantier.pipeSeriesKey].diameters[diameter] ?? "-"} mm</td></tr>)}</tbody></table>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-3 text-sm font-semibold text-slate-800">Secondaire · {PIPE_SERIES[chantier.secondaryPipeSeriesKey].label}</div>
                      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        <table className="w-full text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-4 py-3 text-left font-medium">Ø tuyau</th><th className="px-4 py-3 text-left font-medium">DI</th></tr></thead><tbody>{[50, 40, 32, 25].map((diameter) => <tr key={`lib-s-${diameter}`} className="border-t border-slate-100"><td className="px-4 py-3 font-medium">Ø{diameter}</td><td className="px-4 py-3">{PIPE_SERIES[chantier.secondaryPipeSeriesKey].diameters[diameter] ?? "-"} mm</td></tr>)}</tbody></table>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card title="Bibliothèque groupe compteur + disconnecteur" subtitle="Base de calcul expert appliquée au débit exploitable et à la perte de charge groupe">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    <Stat label="Coeff. compteur" value={formatBar(chantier.groupLossMeterCoeffBar)} />
                    <Stat label="Coeff. disconnecteur" value={formatBar(chantier.groupLossDisconnectCoeffBar)} />
                    <Stat label="Coeff. accessoires" value={formatBar(chantier.groupLossAccessoryCoeffBar)} />
                    <Stat label="Marge débit exploitable" value={`${round(chantier.meterUsableFlowMarginPct, 0)} %`} />
                    <Stat label="Formule retenue" value="Q exploitable" sub="Q référence × (1 - marge)" />
                  </div>
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">La perte du groupe compteur + disconnecteur est estimée à partir du débit de fonctionnement et des coefficients ci-dessus. Le débit exploitable réseau est volontairement minoré par une marge de sécurité afin d’éviter de dimensionner les réseaux au débit nominal maximum du compteur.</div>
                </Card>

                <Card title="Bibliothèque buses d’aspersion" subtitle="Tuyères et PGP modifiables avec ajout de modèles">
                  <div className="grid gap-6 xl:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-4 flex items-center justify-between gap-3"><div className="text-sm font-semibold text-slate-800">Tuyères</div><button onClick={addTuyereModel} className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white">Ajouter un modèle</button></div>
                      <div className="space-y-3">{tuyeres.map((item) => <div key={item.value} className="rounded-2xl border border-slate-200 bg-white p-4"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5"><Field label="Nom" value={item.label} onChange={(value) => updateAspersionItem(setTuyeres, item.value, { label: value })} type="text" /><Field label="Portée" value={item.radiusM} onChange={(value) => updateAspersionItem(setTuyeres, item.value, { radiusM: value })} suffix="m" /><Field label="Débit 360°" value={item.baseFlow360} onChange={(value) => updateAspersionItem(setTuyeres, item.value, { baseFlow360: value })} suffix="m³/h" /><Field label="P mini" value={item.minPressureBar} onChange={(value) => updateAspersionItem(setTuyeres, item.value, { minPressureBar: value })} suffix="bar" /><Field label="P opti" value={item.optimalPressureBar} onChange={(value) => updateAspersionItem(setTuyeres, item.value, { optimalPressureBar: value })} suffix="bar" /></div></div>)}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-4 flex items-center justify-between gap-3"><div className="text-sm font-semibold text-slate-800">PGP</div><button onClick={addPgpModel} className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white">Ajouter un modèle</button></div>
                      <div className="space-y-3">{pgpRouges.map((item) => <div key={item.value} className="rounded-2xl border border-slate-200 bg-white p-4"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5"><Field label="Nom" value={item.label} onChange={(value) => updateAspersionItem(setPgpRouges, item.value, { label: value })} type="text" /><Field label="Portée" value={item.radiusM} onChange={(value) => updateAspersionItem(setPgpRouges, item.value, { radiusM: value })} suffix="m" /><Field label="Débit 360°" value={item.baseFlow360} onChange={(value) => updateAspersionItem(setPgpRouges, item.value, { baseFlow360: value })} suffix="m³/h" /><Field label="P mini" value={item.minPressureBar} onChange={(value) => updateAspersionItem(setPgpRouges, item.value, { minPressureBar: value })} suffix="bar" /><Field label="P opti" value={item.optimalPressureBar} onChange={(value) => updateAspersionItem(setPgpRouges, item.value, { optimalPressureBar: value })} suffix="bar" /></div></div>)}</div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {tab === "impression" && (
              <div ref={activePageRef}>
              <Card title="Document client" subtitle="Version prête à imprimer">
                <div className="rounded-[24px] border border-slate-200 bg-slate-100 p-4 md:p-6">
                  <div className="mx-auto max-w-5xl space-y-8">
                    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                      <div className="flex items-start justify-between gap-6 border-b border-slate-200 pb-6">
                        <div className="max-w-[62%]">
                          <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Étude d’arrosage automatique</div>
                          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{chantier.title}</h2>
                          <div className="mt-4 space-y-1 text-sm text-slate-600">
                            <div><span className="font-semibold text-slate-900">Client :</span> {chantier.client || "À renseigner"}</div>
                            <div><span className="font-semibold text-slate-900">Site :</span> {chantier.site || "À renseigner"}</div>
                            <div><span className="font-semibold text-slate-900">Établi par :</span> {chantier.operator}</div>
                          </div>
                        </div>
                        <div className="w-[220px] shrink-0 text-right"><img src={COMPANY.logoUrl} alt="Logo Brettes Paysage" className="ml-auto max-h-24 w-auto object-contain" /></div>
                      </div>

                      <div className="mt-8 grid gap-4 md:grid-cols-4">
                        <Stat label="Point critique" value={counterEstimate.worst ? `${counterEstimate.worst.group} · ${counterEstimate.worst.name}` : "À définir"} sub={`Source ${displayPressureSource}`} />
                        <Stat label="Débit de pointe estimé" value={displayCounterEstimate} sub={counterEstimate.worst ? `${counterEstimate.worst.group} · ${counterEstimate.worst.sectorName}` : "Secteur critique"} />
                        <Stat label="Volume hebdo estimé" value={`${round(totalVolumeWeek, 1)} m³`} sub="Selon le pilotage" />
                        <Stat label="Volume annuel estimé" value={`${round(totalVolumeAnnual, 0)} m³`} sub={`${activeDaysYear} jours actifs/an`} />
                      </div>

                      <div className="mt-8 grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
                        <div>
                          <h3 className="text-lg font-semibold tracking-tight text-slate-900">1. Données d’entrée</h3>
                          <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200">
                            <table className="w-full text-sm">
                              <thead className="bg-slate-50 text-slate-600"><tr><th className="px-4 py-3 text-left font-medium">Élément</th><th className="px-4 py-3 text-left font-medium">Valeur</th></tr></thead>
                              <tbody>
                                <tr className="border-t border-slate-100"><td className="px-4 py-3 font-medium">Point de comptage critique</td><td className="px-4 py-3">{counterEstimate.worst ? `${counterEstimate.worst.group} · ${counterEstimate.worst.name}` : "À définir"}</td></tr>
                                <tr className="border-t border-slate-100"><td className="px-4 py-3 font-medium">Pression de départ</td><td className="px-4 py-3">{displayPressureSource}</td></tr>
                                <tr className="border-t border-slate-100"><td className="px-4 py-3 font-medium">Débit disponible</td><td className="px-4 py-3">{displaySourceFlow}</td></tr>
                                <tr className="border-t border-slate-100"><td className="px-4 py-3 font-medium">Marge débit exploitable réseau</td><td className="px-4 py-3">{round(chantier.meterUsableFlowMarginPct, 0)} %</td></tr>
                                <tr className="border-t border-slate-100"><td className="px-4 py-3 font-medium">Débit exploitable retenu</td><td className="px-4 py-3">{displayUsableFlow}</td></tr>
                                <tr className="border-t border-slate-100"><td className="px-4 py-3 font-medium">Perte groupe compteur + disconnecteur</td><td className="px-4 py-3">{displayBlockLoss}</td></tr>
                                <tr className="border-t border-slate-100"><td className="px-4 py-3 font-medium">Réducteur de pression</td><td className="px-4 py-3">{displayReducerSetting}</td></tr>
                                <tr className="border-t border-slate-100"><td className="px-4 py-3 font-medium">Canalisation primaire</td><td className="px-4 py-3">{PIPE_SERIES[chantier.pipeSeriesKey].label}</td></tr>
                                <tr className="border-t border-slate-100"><td className="px-4 py-3 font-medium">Canalisation secondaire</td><td className="px-4 py-3">{PIPE_SERIES[chantier.secondaryPipeSeriesKey].label}</td></tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold tracking-tight text-slate-900">2. Note de calcul du goutte-à-goutte au m²</h3>
                          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
                            <div>Hypothèse retenue : goutteurs intégrés avec espacement <span className="font-semibold text-slate-900">{round(goutteurs[0].emitterSpacingM, 2)} m</span> sur la ligne et interligne <span className="font-semibold text-slate-900">{round(goutteurs[0].lineSpacingM, 2)} m</span>.</div>
                            <div className="mt-2">Nombre de goutteurs par m² = <span className="font-semibold text-slate-900">{round(1 / (goutteurs[0].emitterSpacingM * goutteurs[0].lineSpacingM), 2)} goutteurs/m²</span>.</div>
                            <div className="mt-2">Débit appliqué = <span className="font-semibold text-slate-900">{round((1 / (goutteurs[0].emitterSpacingM * goutteurs[0].lineSpacingM)) * goutteurs[0].unitLh, 2)} L/h/m²</span>.</div>
                            <div className="mt-2">Intensité théorique d’arrosage = <span className="font-semibold text-slate-900">{round((1 / (goutteurs[0].emitterSpacingM * goutteurs[0].lineSpacingM)) * goutteurs[0].unitLh, 2)} mm/h</span>.</div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-10 border-t border-slate-200 pt-5 text-sm leading-6 text-slate-600">
                        <div className="font-semibold text-slate-900">{COMPANY.name}</div>
                        <div className="mt-1">{COMPANY.address}</div>
                        <div>Tél. {COMPANY.phone} · {COMPANY.email}</div>
                        <div>{COMPANY.website}</div>
                      </div>
                    </section>

                    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                      <div className="flex items-start justify-between gap-6 border-b border-slate-200 pb-5">
                        <div>
                          <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Synthèse hydraulique</div>
                          <h3 className="mt-2 text-xl font-semibold text-slate-900">Débits et consommations</h3>
                        </div>
                        <img src={COMPANY.logoUrl} alt="Logo Brettes Paysage" className="max-h-16 w-auto object-contain" />
                      </div>

                      <div className="mt-8">
                        <h3 className="text-lg font-semibold tracking-tight text-slate-900">4. Répartition des secteurs par point de comptage</h3>
                        <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-600"><tr><th className="px-4 py-3 text-left font-medium">Point de comptage</th><th className="px-4 py-3 text-left font-medium">Nb secteurs</th><th className="px-4 py-3 text-left font-medium">Secteurs rattachés</th></tr></thead>
                            <tbody>
                              {meterSummaryRows.map((row) => (
                                <tr key={`rp-${row.group}`} className="border-t border-slate-100">
                                  <td className="px-4 py-3 font-medium">{row.group} · {row.name}</td>
                                  <td className="px-4 py-3">{row.sectorCount}</td>
                                  <td className="px-4 py-3">{sectorRows.filter((sector) => sector.meterPointId === row.group).map((sector) => sector.name).join(" · ")}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">Ce tableau présente la répartition des réseaux par point de comptage. Il permet d’identifier rapidement quels secteurs sont rattachés à chaque alimentation avant lecture détaillée des débits, pertes de charge et consommations.</div>
                      </div>

                      <div className="mt-8">
                        <h3 className="text-lg font-semibold tracking-tight text-slate-900">5. Synthèse par point de comptage</h3>
                        <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-600"><tr><th className="px-4 py-3 text-left font-medium">Point de comptage</th><th className="px-4 py-3 text-left font-medium">Nb secteurs</th><th className="px-4 py-3 text-left font-medium">Surface goutte</th><th className="px-4 py-3 text-left font-medium">Secteur de pointe</th><th className="px-4 py-3 text-left font-medium">Q max</th><th className="px-4 py-3 text-left font-medium">L primaire</th><th className="px-4 py-3 text-left font-medium">ΔP primaire</th><th className="px-4 py-3 text-left font-medium">P disponible</th><th className="px-4 py-3 text-left font-medium">Vol. annuel</th></tr></thead>
                            <tbody>
                              {meterSummaryRows.map((row) => (
                                <tr key={`sp-${row.group}`} className="border-t border-slate-100">
                                  <td className="px-4 py-3 font-medium">{row.group} · {row.name}</td>
                                  <td className="px-4 py-3">{row.sectorCount}</td>
                                  <td className="px-4 py-3">{round(row.surfaceM2, 0)} m²</td>
                                  <td className="px-4 py-3">{row.maxSectorName}</td>
                                  <td className="px-4 py-3">{formatFlow(row.maxFlow)}</td>
                                  <td className="px-4 py-3">{round(row.farthestPrimaryMl, 0)} ml</td>
                                  <td className="px-4 py-3">{formatBar(row.farthestPrimaryLoss)}</td>
                                  <td className="px-4 py-3">{row.sourcePressureKnown ? `${formatBar(row.sourcePressure)} → ${formatBar(row.pressureAvailable)}` : formatBar(row.pressureAvailable)}</td>
                                  <td className="px-4 py-3">{round(row.volumeAnnual, 0)} m³/an</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">Les valeurs ci-dessus sont données par point de comptage afin de conserver une lecture hydraulique cohérente par alimentation. Le secteur de pointe correspond au réseau le plus chargé de chaque point de comptage. La pression disponible estimée doit rester compatible avec la pression minimale de fonctionnement des équipements retenus.</div>
                      </div>

                      <div className="mt-8">
                        <h3 className="text-lg font-semibold tracking-tight text-slate-900">6. Débits et consommations par secteur</h3>
                        <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-600"><tr><th className="px-4 py-3 text-left font-medium">Secteur</th><th className="px-4 py-3 text-left font-medium">Type</th><th className="px-4 py-3 text-left font-medium">Débit</th><th className="px-4 py-3 text-left font-medium">Durée / jours</th><th className="px-4 py-3 text-left font-medium">Vol./passage</th><th className="px-4 py-3 text-left font-medium">Vol./semaine</th><th className="px-4 py-3 text-left font-medium">Vol./mois actif</th><th className="px-4 py-3 text-left font-medium">Vol./an</th></tr></thead>
                            <tbody>
                              {meterSummaryRows.map((meter) => (
                                <React.Fragment key={`mc-${meter.group}`}>
                                  <tr className="border-t border-slate-200 bg-slate-100"><td colSpan={8} className="px-4 py-3 font-semibold text-slate-900">{meter.group} · {meter.name}</td></tr>
                                  {sectorConsumptionRows.filter((row) => row.meterPointId === meter.group).map((row) => (
                                    <tr key={`sc-${meter.group}-${row.id}`} className="border-t border-slate-100">
                                      <td className="px-4 py-3 font-medium">{row.name}</td>
                                      <td className="px-4 py-3">{MODE_OPTIONS.find((item) => item.value === row.mode)?.label}</td>
                                      <td className="px-4 py-3">{formatFlow(row.flow)}</td>
                                      <td className="px-4 py-3">{round(row.wateringDurationMin, 0)} min · {row.daysPerWeek} j/sem</td>
                                      <td className="px-4 py-3">{round(row.volumePerPass, 2)} m³</td>
                                      <td className="px-4 py-3">{round(row.volumePerWeek, 2)} m³</td>
                                      <td className="px-4 py-3">{round(row.volumeMonthly, 1)} m³</td>
                                      <td className="px-4 py-3">{round(row.volumeAnnual, 1)} m³</td>
                                    </tr>
                                  ))}
                                </React.Fragment>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">Les débits et consommations sont calculés à partir du débit théorique de chaque secteur, de la durée d’arrosage renseignée et du nombre de jours programmés. Les consommations mensuelles sont données à titre indicatif sur les mois actifs du pilotage. Les consommations annuelles restent à ajuster suivant les conditions climatiques, la nature du sol et l’état d’installation des végétaux.</div>
                      </div>
                    </section>

                    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
                      <div className="flex items-start justify-between gap-6 border-b border-slate-200 pb-5">
                        <div>
                          <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Note hydraulique</div>
                          <h3 className="mt-2 text-xl font-semibold text-slate-900">Pertes de charge et pression disponible</h3>
                        </div>
                        <img src={COMPANY.logoUrl} alt="Logo Brettes Paysage" className="max-h-16 w-auto object-contain" />
                      </div>

                      <div className="mt-8">
                        <h3 className="text-lg font-semibold tracking-tight text-slate-900">7. Note de pertes de charge primaire</h3>
                        <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-600"><tr><th className="px-4 py-3 text-left font-medium">Point de comptage</th><th className="px-4 py-3 text-left font-medium">Réseau éloigné</th><th className="px-4 py-3 text-left font-medium">L primaire</th><th className="px-4 py-3 text-left font-medium">Débit de pointe</th><th className="px-4 py-3 text-left font-medium">ΔP primaire</th><th className="px-4 py-3 text-left font-medium">P disponible estimée</th></tr></thead>
                            <tbody>
                              {meterSummaryRows.map((row) => (
                                <tr key={`loss-${row.group}`} className="border-t border-slate-100">
                                  <td className="px-4 py-3 font-medium">{row.group} · {row.name}</td>
                                  <td className="px-4 py-3">{row.maxSectorName}</td>
                                  <td className="px-4 py-3">{round(row.farthestPrimaryMl, 0)} ml</td>
                                  <td className="px-4 py-3">{formatFlow(row.maxFlow)}</td>
                                  <td className="px-4 py-3">{formatBar(row.farthestPrimaryLoss)}</td>
                                  <td className="px-4 py-3">{row.sourcePressureKnown ? `${formatBar(row.sourcePressure)} → ${formatBar(row.pressureAvailable)}` : formatBar(row.pressureAvailable)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">Les pertes de charge du réseau primaire sont calculées selon la formule de Hazen-Williams sur la base du diamètre intérieur réel des canalisations. La perte de charge du groupe compteur + disconnecteur est calculée à partir des coefficients expert compteur, disconnecteur et accessoires. Le débit exploitable réseau est volontairement limité par une marge de sécurité afin d’éviter de dimensionner les réseaux sur le débit nominal maximum du compteur.</div>
                        <div className="mt-2 text-sm font-semibold text-slate-900">Marge débit exploitable retenue : {round(chantier.meterUsableFlowMarginPct, 0)} %</div>
                      </div>

                      <div className="mt-8">
                        <h3 className="text-lg font-semibold tracking-tight text-slate-900">8. Synthèse hydraulique par secteur</h3>
                        <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-600"><tr><th className="px-4 py-3 text-left font-medium">Secteur</th><th className="px-4 py-3 text-left font-medium">Type</th><th className="px-4 py-3 text-left font-medium">Débit</th><th className="px-4 py-3 text-left font-medium">ΔP primaire</th><th className="px-4 py-3 text-left font-medium">ΔP secondaire</th><th className="px-4 py-3 text-left font-medium">ΔP EV</th><th className="px-4 py-3 text-left font-medium">P finale</th><th className="px-4 py-3 text-left font-medium">Observation</th></tr></thead>
                            <tbody>
                              {meterSummaryRows.map((meter) => (
                                <React.Fragment key={`hyd-${meter.group}`}>
                                  <tr className="border-t border-slate-200 bg-slate-100"><td colSpan={8} className="px-4 py-3 font-semibold text-slate-900">{meter.group} · {meter.name}</td></tr>
                                  {sectorRows.filter((row) => row.meterPointId === meter.group).map((row) => (
                                    <tr key={`row-${meter.group}-${row.id}`} className="border-t border-slate-100">
                                      <td className="px-4 py-3 font-medium">{row.name}</td>
                                      <td className="px-4 py-3">{MODE_OPTIONS.find((item) => item.value === row.mode)?.label}</td>
                                      <td className="px-4 py-3">{formatFlow(row.flow)}</td>
                                      <td className="px-4 py-3">{formatBar(row.primaryLoss)}</td>
                                      <td className="px-4 py-3">{formatBar(row.secondaryLoss)}</td>
                                      <td className="px-4 py-3">{formatBar(row.evLoss)}</td>
                                      <td className="px-4 py-3">{formatBar(row.finalPressure)}</td>
                                      <td className="px-4 py-3">{row.flowAlert ? "Débit réseau supérieur au débit exploitable" : row.ok ? "Fonctionnement compatible" : "Ajustement à prévoir"}</td>
                                    </tr>
                                  ))}
                                </React.Fragment>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">La pression finale estimée correspond à la pression disponible après déduction de la perte de charge du groupe compteur + disconnecteur, du réducteur éventuel, des pertes primaire et secondaire, de l’électrovanne et du dénivelé. Lorsque la pression finale devient inférieure à la pression minimale de service de la référence retenue, un ajustement du réseau, de l’équipement ou du point de comptage est à prévoir.</div>
                      </div>
                    </section>
                  </div>
                </div>
              </Card>
              </div>
            )}

            {tab === "pilotage" && (
              <div ref={activePageRef} className="space-y-4">
                <Card title="Pilotage chantier" subtitle="Mois d’arrosage activables">
                  <div className="grid gap-2 md:grid-cols-6 xl:grid-cols-12">
                    {MONTHS.map((month) => <TagButton key={month} active={chantier.irrigationMonthsSelected.includes(month)} onClick={() => toggleMonth(month)}>{month}</TagButton>)}
                  </div>
                </Card>
                <Card title="Jours d’arrosage par secteur">
                  <div className="space-y-3">
                    {sectorRows.map((row, index) => (
                      <div key={row.id} className="rounded-2xl bg-slate-50 p-4">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                          <div>
                            <div className="font-medium text-slate-900">{row.name}</div>
                            <div className="mt-1 text-sm text-slate-500">Conso / passage {round(row.flow * (num(row.wateringDurationMin) / 60), 2)} m³</div>
                          </div>
                          <div className="grid gap-3 md:grid-cols-[140px_1fr] xl:min-w-[540px]">
                            <Field tone={inputTone} label="Durée" value={row.wateringDurationMin} onChange={(value) => updateSector(index, { wateringDurationMin: value })} suffix="min" />
                            <div>
                              <div className="mb-2 text-sm font-medium text-slate-700">Jours</div>
                              <div className="flex flex-wrap gap-2">
                                {WEEK_DAYS.map((day) => <TagButton key={`${row.id}-${day}`} active={row.wateringDaysSelected.includes(day)} onClick={() => toggleSectorDay(index, day)}>{day}</TagButton>)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {tab === "materiel" && (
              <div ref={activePageRef} className="space-y-4">
                <Card title="Matériel" subtitle="Pré-quantitatif exploitable et préparé pour impression">
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                      <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Pré-quantitatif matériel</div>
                        <div className="mt-1 text-xl font-semibold text-slate-900">{chantier.title}</div>
                        <div className="mt-2 text-sm text-slate-600">Client : {chantier.client || "À renseigner"} · Site : {chantier.site || "À renseigner"}</div>
                      </div>
                      <img src={COMPANY.logoUrl} alt="Logo Brettes Paysage" className="max-h-16 w-auto object-contain" />
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                      <Stat label="Électrovannes" value={String(materialSummary.evRows.reduce((sum, [, qty]) => sum + qty, 0))} sub="Total secteurs" />
                      <Stat label="Surface goutte" value={`${round(materialSummary.dripAreaTotal, 0)} m²`} sub="Base plantation" />
                      <Stat label="Linéaire goutte" value={`${round(materialSummary.dripLinearTotal, 0)} ml`} sub="Base commande" />
                      <Stat label="Primaire total" value={`${round(materialSummary.primaryRows.reduce((sum, [, total]) => sum + total, 0), 0)} ml`} />
                      <Stat label="Secondaire total" value={`${round(materialSummary.secondaryRows.reduce((sum, [, total]) => sum + total, 0), 0)} ml`} />
                    </div>

                    <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-3 text-sm font-semibold text-slate-800">Synthèse goutte-à-goutte pour commande</div>
                      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        <table className="w-full text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-4 py-3 text-left font-medium">Référence</th><th className="px-4 py-3 text-left font-medium">Surface totale</th><th className="px-4 py-3 text-left font-medium">Linéaire total</th></tr></thead><tbody>{materialSummary.dripRows.length === 0 ? <tr><td className="px-4 py-4 text-slate-500" colSpan={3}>Aucun secteur goutte-à-goutte</td></tr> : materialSummary.dripRows.map(([label, totals]) => <tr key={`drip-${label}`} className="border-t border-slate-100"><td className="px-4 py-3 font-medium">{label}</td><td className="px-4 py-3">{round(totals.areaM2, 0)} m²</td><td className="px-4 py-3">{round(totals.linearMl, 0)} ml</td></tr>)}</tbody></table>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-6 xl:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-3 text-sm font-semibold text-slate-800">Linéaires primaire par diamètre</div>
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><table className="w-full text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-4 py-3 text-left font-medium">Ø tuyau</th><th className="px-4 py-3 text-left font-medium">Total</th></tr></thead><tbody>{materialSummary.primaryRows.map(([diameter, total]) => <tr key={`mp-${diameter}`} className="border-t border-slate-100"><td className="px-4 py-3 font-medium">Ø{diameter}</td><td className="px-4 py-3">{round(total, 0)} ml</td></tr>)}</tbody></table></div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-3 text-sm font-semibold text-slate-800">Linéaires secondaire par diamètre</div>
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><table className="w-full text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-4 py-3 text-left font-medium">Ø tuyau</th><th className="px-4 py-3 text-left font-medium">Total</th></tr></thead><tbody>{materialSummary.secondaryRows.map(([diameter, total]) => <tr key={`ms-${diameter}`} className="border-t border-slate-100"><td className="px-4 py-3 font-medium">Ø{diameter}</td><td className="px-4 py-3">{round(total, 0)} ml</td></tr>)}</tbody></table></div>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-6 xl:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-3 text-sm font-semibold text-slate-800">Tuyères</div>
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><table className="w-full text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-4 py-3 text-left font-medium">Référence</th><th className="px-4 py-3 text-left font-medium">Qté totale</th></tr></thead><tbody>{materialSummary.tuyereRows.length === 0 ? <tr><td className="px-4 py-4 text-slate-500" colSpan={2}>Aucune tuyère</td></tr> : materialSummary.tuyereRows.map(([label, qty]) => <tr key={`t-${label}`} className="border-t border-slate-100"><td className="px-4 py-3 font-medium">{label}</td><td className="px-4 py-3">{qty}</td></tr>)}</tbody></table></div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="mb-3 text-sm font-semibold text-slate-800">Arroseurs PGP</div>
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><table className="w-full text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-4 py-3 text-left font-medium">Référence</th><th className="px-4 py-3 text-left font-medium">Qté totale</th></tr></thead><tbody>{materialSummary.pgpRows.length === 0 ? <tr><td className="px-4 py-4 text-slate-500" colSpan={2}>Aucun arroseur PGP</td></tr> : materialSummary.pgpRows.map(([label, qty]) => <tr key={`pgp-${label}`} className="border-t border-slate-100"><td className="px-4 py-3 font-medium">{label}</td><td className="px-4 py-3">{qty}</td></tr>)}</tbody></table></div>
                      </div>
                    </div>

                    {materialSummary.meterAccessoryRows.length > 0 ? <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="mb-3 text-sm font-semibold text-slate-800">Accessoires par point de comptage</div><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white"><table className="w-full text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="px-4 py-3 text-left font-medium">Point de comptage</th><th className="px-4 py-3 text-left font-medium">Clapet-vanne</th><th className="px-4 py-3 text-left font-medium">Bouches d’arrosage</th></tr></thead><tbody>{materialSummary.meterAccessoryRows.map((row) => <tr key={row.id} className="border-t border-slate-100"><td className="px-4 py-3 font-medium">{row.id} · {row.name}</td><td className="px-4 py-3">{row.clapetCount}</td><td className="px-4 py-3">{row.boucheArrosageCount}</td></tr>)}</tbody></table></div></div> : null}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
