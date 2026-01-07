export let CONFIG = {};
let examQuestionsPath = '';
let examDataCache = null;

/* ------------------------ Hilfsfunktionen ------------------------ */

function resolveLanguage(config) {
  // Reihenfolge: URL ?lang → localStorage → Default 'de'
  const params = new URLSearchParams(window.location.search);
  const fromQuery   = params.get('lang');
  const fromStorage = safeGetLocalStorage('skillcheck_lang');
  const lang = (fromQuery || fromStorage || 'de').toLowerCase();

  const supported = Array.isArray(config?.supportedLanguages)
    ? config.supportedLanguages
    : ['de', 'en', 'fr'];

  return supported.includes(lang) ? lang : 'de';
}

function resolveMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get('mode') || safeGetLocalStorage('skillcheck_mode') || 'training';
}

function applyTemplate(pathOrTemplate, vars) {
  if (typeof pathOrTemplate !== 'string') return pathOrTemplate;
  return pathOrTemplate
    .replace(/\{mode\}/g,     vars.mode)      // <-- NEU
    .replace(/\{lang\}/g, vars.lang)
    .replace(/\{syllabus\}/g, vars.syllabus);
}

function safeGetLocalStorage(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

/* ------------------------- Öffentliche API ----------------------- */

export async function loadConfig() {
  try {
    const response = await fetch('./configuration/Expleo_ESC_configuration.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP-Fehler beim Laden der Konfiguration: ${response.status}`);
    const cfg = await response.json();

    // 1) Kernwerte in CONFIG übernehmen
    CONFIG = {
      timeLimitMinutes: cfg.timeLimitMinutes,
      passingPercentage: cfg.passingPercentage,
      usedSyllabus: cfg.usedSyllabus
    };

    // 2) Sprache & Modus bestimmen
    const lang     = resolveLanguage(cfg);
    const syllabus = CONFIG.usedSyllabus || 'CT-AI';
    const mode     = resolveMode();

    // 3) Optional: externe Overrides bevorzugen (werden NICHT in index.html benötigt)
    const overrideCatalog = safeGetLocalStorage('skillcheck_usedQuestionCatalog');
    const overrideUI      = safeGetLocalStorage('skillcheck_usedUI');

    // 4) Pfade mit Template anwenden (oder Override nutzen)
    const catalogFromConfig = applyTemplate(cfg.usedQuestionCatalog, { mode, lang, syllabus });
    examQuestionsPath = overrideCatalog || catalogFromConfig;

    const uiFromConfig = applyTemplate(cfg.usedUI, { lang, syllabus });
    CONFIG.usedUI = overrideUI || uiFromConfig;

    // 5) Ausgewählte Parameter im CONFIG merken (optional, hilft Debug/Weitergabe)
    CONFIG.selectedLang = lang;
    CONFIG.selectedMode = mode;

  } catch (err) {
    console.error('❌ Fehler beim Laden/Verarbeiten der Konfiguration:', err);
    // Fallbacks, damit die App nicht komplett steht
    CONFIG = {
      timeLimitMinutes: CONFIG.timeLimitMinutes || 120,
      passingPercentage: CONFIG.passingPercentage || 65,
	  licencePeriod: CONFIG.licencePeriod || 30,
      usedSyllabus: CONFIG.usedSyllabus || 'CT-AI',
      selectedLang: CONFIG.selectedLang || 'de',
      selectedMode: CONFIG.selectedMode || 'training',
      usedUI: CONFIG.usedUI || './configuration/Expleo_ESC_configuration_UItext_de.json'
    };
    // Minimaler Fallback für Fragenpfad
    examQuestionsPath = examQuestionsPath || './exams/CT-AI-Pruefungsfragen_Probepruefung_de.json';
  }
}

export async function loadExamData() {
  if (examDataCache) return examDataCache;

  if (!examQuestionsPath) {
    throw new Error('Prüfungsfragen-Pfad ist leer. Wurde loadConfig() ausgeführt?');
  }

  const response = await fetch(examQuestionsPath, { cache: 'no-cache' });
  if (!response.ok) {
    throw new Error(`HTTP-Fehler beim Laden der Prüfungsfragen: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(`Unerwarteter Inhaltstyp: ${contentType}. Erwartet: application/json`);
  }

  examDataCache = await response.json();
   return examDataCache;
 }
