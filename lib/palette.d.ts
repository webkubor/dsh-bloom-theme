/**
 * 莫兰迪配色的色板与标签 —— 纯数据 + 一个色彩工具函数，不 import 任何东西。
 *
 * **双轨制不能退回单轨**（见 CONTRIBUTING「改配色时注意」）：
 *   accentL / accentD  可读轨 —— 文字、按钮填充、边框，必须过 WCAG AA
 *   morandi            气质轨 —— 只用于 rgba(morandi, 0.05~0.2) 的大面积氛围渐变、
 *                      冷光细线、边框阶梯（暗色档）
 * 拿可读轨铺大面积、或拿气质轨做文字色，都会失去莫兰迪质感。
 */
export declare const PALETTE_GROUPS: {
    family: string;
    variants: string[];
}[];
export declare const FEATURED_VARIANTS: string[];
export declare function isNewVariant(variant: string, version: string): boolean;
/**
 * Bloom 色板 —— 双轨制（这是从 typora-Bloom-theme 继承来的关键设计，别退回单轨）。
 *
 *   accentL/accentD  「可读轨」：文字、按钮填充、边框。原版注释写得很清楚：
 *                     `Morandi Mist (Blue) - Deepened for better contrast`
 *                     ——它是被刻意加深过的版本，为的是过 WCAG，不是给人看气质的。
 *   morandi          「气质轨」：原版的 --accent-rgb。真正的莫兰迪色（低饱和、发灰），
 *                     只用于大面积氛围渐变，rgba(morandi, 0.05~0.08) 这种极低透明度。
 *
 * 原版 14 处 gradient 全部用气质轨，从不用可读轨铺面。
 * 一旦把 accent 拿去刷大面积，petal 就会从藕粉变成荧光洋红 —— 莫兰迪感就没了。
 *
 * 亮色 accent 的 L 值已按 WCAG AA(4.5:1) 反推校准（底色为各变体的 bgL）。
 * accent × bg 实测对比度（10 变体 × 明暗，全部 ≥ 4.5:1）——
 * 这一对同时也是主按钮的 fill × dimmed（见 tokens.ts 的 button-primary-dimmed）：
 *
 *   变体       亮色     暗色        变体       亮色     暗色
 *   mist     5.28:1   5.96:1      stone    5.48:1   7.77:1
 *   cinnabar 4.87:1   5.63:1      lapis    5.63:1   7.31:1
 *   petal    4.55:1   6.07:1      amber    4.54:1   7.65:1
 *   ripple   4.61:1   8.51:1      aurora   5.10:1   7.74:1
 *   sage     4.53:1   7.42:1      lavender 5.24:1   6.81:1
 *
 * 最紧的是 sage 亮色 4.53:1 —— 改任何变体的 accentL/bgL 前先重算，
 * 别只看「颜色好不好看」。（此前这段注释停在 petal 3.55 / ripple 3.02，
 * 那是校准**前**的值，且自相矛盾地标着「达标」。）
 */
export declare const PALETTE: {
    mist: {
        accentL: string;
        accentD: string;
        morandi: string;
        bgL: string;
        bgD: string;
        txL: string;
        txD: string;
        sfL: string;
        sfD: string;
        sf2L: string;
        sf2D: string;
        motionL: string[];
        motionD: string[];
    };
    cinnabar: {
        accentL: string;
        accentD: string;
        morandi: string;
        bgL: string;
        bgD: string;
        txL: string;
        txD: string;
        sfL: string;
        sfD: string;
        sf2L: string;
        sf2D: string;
        motionL: string[];
        motionD: string[];
    };
    petal: {
        accentL: string;
        accentD: string;
        morandi: string;
        bgL: string;
        bgD: string;
        txL: string;
        txD: string;
        sfL: string;
        sfD: string;
        sf2L: string;
        sf2D: string;
        motionL: string[];
        motionD: string[];
    };
    ripple: {
        accentL: string;
        accentD: string;
        morandi: string;
        bgL: string;
        bgD: string;
        txL: string;
        txD: string;
        sfL: string;
        sfD: string;
        sf2L: string;
        sf2D: string;
        motionL: string[];
        motionD: string[];
    };
    sage: {
        accentL: string;
        accentD: string;
        morandi: string;
        bgL: string;
        bgD: string;
        txL: string;
        txD: string;
        sfL: string;
        sfD: string;
        sf2L: string;
        sf2D: string;
        motionL: string[];
        motionD: string[];
    };
    stone: {
        accentL: string;
        accentD: string;
        morandi: string;
        bgL: string;
        bgD: string;
        txL: string;
        txD: string;
        sfL: string;
        sfD: string;
        sf2L: string;
        sf2D: string;
        motionL: string[];
        motionD: string[];
    };
    lapis: {
        accentL: string;
        accentD: string;
        morandi: string;
        bgL: string;
        bgD: string;
        txL: string;
        txD: string;
        sfL: string;
        sfD: string;
        sf2L: string;
        sf2D: string;
        motionL: string[];
        motionD: string[];
    };
    amber: {
        accentL: string;
        accentD: string;
        morandi: string;
        bgL: string;
        bgD: string;
        txL: string;
        txD: string;
        sfL: string;
        sfD: string;
        sf2L: string;
        sf2D: string;
        motionL: string[];
        motionD: string[];
    };
    aurora: {
        accentL: string;
        accentD: string;
        morandi: string;
        bgL: string;
        bgD: string;
        txL: string;
        txD: string;
        sfL: string;
        sfD: string;
        sf2L: string;
        sf2D: string;
        motionL: string[];
        motionD: string[];
    };
    lavender: {
        accentL: string;
        accentD: string;
        morandi: string;
        bgL: string;
        bgD: string;
        txL: string;
        txD: string;
        sfL: string;
        sfD: string;
        sf2L: string;
        sf2D: string;
        motionL: string[];
        motionD: string[];
    };
    mint: {
        accentL: string;
        accentD: string;
        morandi: string;
        bgL: string;
        bgD: string;
        txL: string;
        txD: string;
        sfL: string;
        sfD: string;
        sf2L: string;
        sf2D: string;
        motionL: string[];
        motionD: string[];
    };
    tangerine: {
        accentL: string;
        accentD: string;
        morandi: string;
        bgL: string;
        bgD: string;
        txL: string;
        txD: string;
        sfL: string;
        sfD: string;
        sf2L: string;
        sf2D: string;
        motionL: string[];
        motionD: string[];
    };
    silverrose: {
        accentL: string;
        accentD: string;
        morandi: string;
        bgL: string;
        bgD: string;
        txL: string;
        txD: string;
        sfL: string;
        sfD: string;
        sf2L: string;
        sf2D: string;
        motionL: string[];
        motionD: string[];
    };
    dawn: {
        accentL: string;
        accentD: string;
        morandi: string;
        bgL: string;
        bgD: string;
        txL: string;
        txD: string;
        sfL: string;
        sfD: string;
        sf2L: string;
        sf2D: string;
        motionL: string[];
        motionD: string[];
    };
    osmanthus: {
        accentL: string;
        accentD: string;
        morandi: string;
        bgL: string;
        bgD: string;
        txL: string;
        txD: string;
        sfL: string;
        sfD: string;
        sf2L: string;
        sf2D: string;
        motionL: string[];
        motionD: string[];
    };
};
export declare const VARIANTS: string[];
export declare const OTHER_VARIANTS: string[];
export declare const VARIANT_LABELS: {
    mist: {
        zh: string;
        en: string;
        poem: string;
        poemEn: string;
    };
    cinnabar: {
        zh: string;
        en: string;
        poem: string;
        poemEn: string;
    };
    petal: {
        zh: string;
        en: string;
        poem: string;
        poemEn: string;
    };
    ripple: {
        zh: string;
        en: string;
        poem: string;
        poemEn: string;
    };
    sage: {
        zh: string;
        en: string;
        poem: string;
        poemEn: string;
    };
    stone: {
        zh: string;
        en: string;
        poem: string;
        poemEn: string;
    };
    lapis: {
        zh: string;
        en: string;
        poem: string;
        poemEn: string;
    };
    amber: {
        zh: string;
        en: string;
        poem: string;
        poemEn: string;
    };
    aurora: {
        zh: string;
        en: string;
        poem: string;
        poemEn: string;
    };
    lavender: {
        zh: string;
        en: string;
        poem: string;
        poemEn: string;
    };
    mint: {
        zh: string;
        en: string;
        poem: string;
        poemEn: string;
    };
    tangerine: {
        zh: string;
        en: string;
        poem: string;
        poemEn: string;
    };
    silverrose: {
        zh: string;
        en: string;
        poem: string;
        poemEn: string;
    };
    dawn: {
        zh: string;
        en: string;
        poem: string;
        poemEn: string;
    };
    osmanthus: {
        zh: string;
        en: string;
        poem: string;
        poemEn: string;
    };
};
/** oklch 混透明度的简写（在 oklch 空间里混合，色相/彩度不漂移） */
export declare const mix: (c: any, p: any) => string;
