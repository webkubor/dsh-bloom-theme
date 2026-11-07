/**
 * Ambience dimension: background light and particles, chosen separately per colour scheme.
 *
 * Dark schemes use starlight presets; light schemes use themed glass presets.
 * Both choices are persisted and written to <body> at once; CSS selects the one
 * matching the host's current scheme, so this module never observes theme changes.
 * See [LES-12] in docs/lessons.md.
 */
import { STORAGE_KEY } from './meta.js';
export const AMBIENCE_PRESETS = {
    dark: ['corner', 'diagonal', 'galaxy', 'off'],
    light: ['stream', 'wash', 'clear', 'off'],
};
const DEFAULTS = { dark: 'corner', light: 'stream' };
const SCHEMES = ['dark', 'light'];
export const AMBIENCE_ATTRS = {
    dark: 'data-bloom-ambience-dark',
    light: 'data-bloom-ambience-light',
};
const storageKey = (scheme) => `${STORAGE_KEY}-ambience-${scheme}`;
function isPreset(scheme, value) {
    return value !== null && AMBIENCE_PRESETS[scheme].includes(value);
}
export function readAmbience(scheme) {
    let saved = null;
    try {
        saved = localStorage.getItem(storageKey(scheme));
    }
    catch { /* private mode */ }
    return (isPreset(scheme, saved) ? saved : DEFAULTS[scheme]);
}
function apply(scheme, preset) {
    document.body?.setAttribute(AMBIENCE_ATTRS[scheme], preset);
}
export function writeAmbience(scheme, preset) {
    if (!isPreset(scheme, preset))
        return false;
    try {
        localStorage.setItem(storageKey(scheme), preset);
    }
    catch { /* private mode */ }
    apply(scheme, preset);
    return true;
}
export function initAmbience() {
    for (const scheme of SCHEMES)
        apply(scheme, readAmbience(scheme));
}
export function clearAmbience() {
    for (const scheme of SCHEMES)
        document.body?.removeAttribute(AMBIENCE_ATTRS[scheme]);
}
