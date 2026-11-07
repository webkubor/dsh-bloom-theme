import { FEATURED_VARIANTS } from './palette.js';
import { STORAGE_KEY } from './meta.js';
import { readVariant } from './dom.js';
const KEY = `${STORAGE_KEY}-rotation-minutes`;
export const ROTATION_MINUTES = [0, 5, 15, 30, 60];
let timer;
let started = false;
let applyNext;
let selectedMinutes;
export function readRotationMinutes() {
    if (selectedMinutes !== undefined)
        return selectedMinutes;
    try {
        const value = Number(window.localStorage.getItem(KEY));
        selectedMinutes = ROTATION_MINUTES.includes(value) ? value : 0;
    }
    catch {
        selectedMinutes = 0;
    }
    return selectedMinutes;
}
function schedule() {
    if (timer)
        clearTimeout(timer);
    timer = undefined;
    const minutes = readRotationMinutes();
    if (!minutes || document.hidden || !applyNext)
        return;
    timer = setTimeout(() => {
        timer = undefined;
        const current = document.body.dataset.bloomVariant || readVariant();
        const choices = FEATURED_VARIANTS.filter((v) => v !== current);
        if (choices.length)
            applyNext?.(choices[Math.floor(Math.random() * choices.length)]);
        else
            schedule();
    }, minutes * 60000);
}
export function startRotation(apply) {
    applyNext = apply;
    if (!started) {
        document.addEventListener('visibilitychange', schedule);
        started = true;
        schedule();
    }
}
export function setRotationMinutes(minutes) {
    if (!ROTATION_MINUTES.includes(minutes))
        return;
    selectedMinutes = minutes;
    try {
        window.localStorage.setItem(KEY, String(minutes));
    }
    catch { /* settings are optional */ }
    schedule();
}
/** 停止自动换色：清定时器、解 visibilitychange（插件停用时由 teardown 调用）。 */
export function stopRotation() {
    if (timer)
        clearTimeout(timer);
    timer = undefined;
    if (started)
        document.removeEventListener('visibilitychange', schedule);
    started = false;
    applyNext = undefined;
    selectedMinutes = undefined;
}
/** Manual color changes start a fresh interval; background tabs never catch up missed ticks. */
export function resetRotationTimer() { if (started)
    schedule(); }
/** Allow tests and teardown to reset module state entirely. */
export function resetRotationState() {
    stopRotation();
    selectedMinutes = undefined;
}
