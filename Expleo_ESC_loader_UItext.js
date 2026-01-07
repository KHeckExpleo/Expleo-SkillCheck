
// Expleo_MEG_ui-text_loader.js
// Lädt die UI-Texte über den vom zentralen Loader bereitgestellten Pfad (CONFIG.usedUI)
// und setzt sie in die HTML.

/* 1) Import: zentraler Loader + CONFIG */
import { CONFIG, loadConfig } from './Expleo_ESC_loader_configuration.js';

export let UICONFIG = {};

/* 2) Hilfsfunktionen */

function setTextById(id, text) {
  const el = document.getElementById(id);
  if (!el) {
    console.warn(`Element mit ID "${id}" nicht gefunden!`);
    return;
  }
  const t = (text ?? '').toString().trim();

  if (el.tagName === 'OPTION') {
    // Sichtbaren Text im Dropdown setzen – robust für <option>
    el.textContent = t;
    el.label = t; // einige UIs/Browser lesen label als Anzeige
  } else {
    el.textContent = t; // statt innerText -> robuster, kein CSS-Impact
  }
}


/**
 * Ersetzt {key} Platzhalter im Text (z. B. "Bestehensgrenze: {percentage}%").
 */
export function formatText(template, params = {}) {
  return String(template).replace(/\{(\w+)\}/g, (_, key) =>
    params[key] == null ? `{${key}}` : String(params[key])
  );
}

/* 3) Haupt-Loader für UI-Texte */
export async function loadUITexte() {
  // Sicherstellen, dass die Config (inkl. Template-Ersetzung) geladen ist
  await loadConfig();

  // CONFIG.usedUI muss jetzt ein konkreter Pfad sein (z. B. "..._fr.json")
  const uiPath = CONFIG.usedUI;
  if (!uiPath) {
    throw new Error('UI-Pfad leer – wurde loadConfig() korrekt ausgeführt?');
  }

  // UI-Texte laden
  const response = await fetch(uiPath, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`HTTP-Fehler beim Laden der UI-Texte: ${response.status} ${response.statusText}`);
  }
  const uiTexts = await response.json();
  UICONFIG = uiTexts;

  // percentage aus CONFIG (oder Fallback) holen
  const percentage = CONFIG.passingPercentage ?? 65;
  const passingScoreText = formatText(uiTexts.passingScore, { percentage });
  document.getElementById('passing-percentage').textContent = percentage + '%';

  // Titel und Header
  document.title = uiTexts.appTitle;
  setTextById('headerId', uiTexts.header);
  setTextById('sub-header', uiTexts.subHeader);

  // Labels
  setTextById('appMode', uiTexts.appMode);
  setTextById('appLicense', uiTexts.appLicense);
  setTextById('appLicenseUnit', uiTexts.appLicenseUnit);
  setTextById('learningObjective', uiTexts.learningObjective);
  setTextById('unanswered-questions-list', uiTexts.notAnsweredQuestions);
  setTextById('question-label', uiTexts.numberOfQuestions);
  //setTextById('time-limit-label', uiTexts.timeLimit);
  setTextById('time-unit', uiTexts.timeUnit);
  setTextById('timeRemaining', uiTexts.timeRemaining);
  setTextById('passing-score-label', passingScoreText);
  setTextById('currentScoreLabel', uiTexts.currentScoreLabel);
  setTextById('not-answered-questions', uiTexts.NotAnsweredQuestions);
  setTextById('yourChoice', uiTexts.yourChoice);
  setTextById('question-word', uiTexts.labels.questionWord);
  setTextById('of-word', uiTexts.labels.ofWord);

  // Buttons
  setTextById('prev-btn', uiTexts.buttons.previousQuestion);
  setTextById('next-btn', uiTexts.buttons.nextQuestion);
  setTextById('reset-btn', uiTexts.buttons.resetAnswers);
  setTextById('submit-exam-btn', uiTexts.buttons.submitExam);
  setTextById('repeat-exam-btn', uiTexts.buttons.repeatExam);
  setTextById('repeat-failed-btn', uiTexts.buttons.repeatFailedQuestions);

  console.log('UI-Texte erfolgreich geladen:', UICONFIG);
}

/* 4) Starten, sobald die Prüfungsseite geladen ist */
document.addEventListener('DOMContentLoaded', loadUITexte);
