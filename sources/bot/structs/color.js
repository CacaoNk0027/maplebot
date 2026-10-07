"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseColor = parseColor;
exports.toHex = toHex;
exports.toHsl = toHsl;
exports.hslToRgb = hslToRgb;
exports.toDecimal = toDecimal;
exports.isDark = isDark;
// El prefijo es opcional en rgb para admitir "255, 0, 0" a secas, pero
// obligatorio en hsl: sin él, "0 100 50" sería ambiguo entre los dos formatos.
const HEX_PATTERN = /^#?([\da-f]{3}|[\da-f]{6})$/i;
const RGB_PATTERN = /^(?:rgba?)?\s*\(?\s*(\d{1,3})\s*[\s,]\s*(\d{1,3})\s*[\s,]\s*(\d{1,3})\s*\)?$/i;
const HSL_PATTERN = /^hsla?\s*\(?\s*(\d{1,3})(?:deg)?\s*[\s,]\s*(\d{1,3})\s*%?\s*[\s,]\s*(\d{1,3})\s*%?\s*\)?$/i;
/**
 * Interpreta un color en hexadecimal, rgb o hsl y lo normaliza a RGB.
 * Devuelve null si el formato no se reconoce o algún valor se sale de rango.
 */
function parseColor(input) {
    const value = input.trim();
    if (!value)
        return null;
    const hex = value.match(HEX_PATTERN);
    if (hex) {
        const digits = hex[1].length === 3
            ? hex[1].split('').map(digit => digit + digit).join('')
            : hex[1];
        return {
            r: parseInt(digits.slice(0, 2), 16),
            g: parseInt(digits.slice(2, 4), 16),
            b: parseInt(digits.slice(4, 6), 16)
        };
    }
    const hsl = value.match(HSL_PATTERN);
    if (hsl) {
        const h = Number(hsl[1]);
        const s = Number(hsl[2]);
        const l = Number(hsl[3]);
        if (h > 360 || s > 100 || l > 100)
            return null;
        return hslToRgb({ h, s, l });
    }
    const rgb = value.match(RGB_PATTERN);
    if (rgb) {
        const channels = [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
        if (channels.some(channel => channel > 255))
            return null;
        return { r: channels[0], g: channels[1], b: channels[2] };
    }
    return null;
}
function toHex(color) {
    const canal = (value) => value.toString(16).padStart(2, '0');
    return `#${canal(color.r)}${canal(color.g)}${canal(color.b)}`.toUpperCase();
}
function toHsl(color) {
    const r = color.r / 255;
    const g = color.g / 255;
    const b = color.b / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    const l = (max + min) / 2;
    if (delta === 0)
        return { h: 0, s: 0, l: Math.round(l * 100) };
    const s = delta / (1 - Math.abs(2 * l - 1));
    let h;
    if (max === r)
        h = ((g - b) / delta) % 6;
    else if (max === g)
        h = (b - r) / delta + 2;
    else
        h = (r - g) / delta + 4;
    h = Math.round(h * 60);
    if (h < 0)
        h += 360;
    return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
}
function hslToRgb(color) {
    const s = color.s / 100;
    const l = color.l / 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((color.h / 60) % 2) - 1));
    const m = l - c / 2;
    const [r, g, b] = color.h < 60 ? [c, x, 0]
        : color.h < 120 ? [x, c, 0]
            : color.h < 180 ? [0, c, x]
                : color.h < 240 ? [0, x, c]
                    : color.h < 300 ? [x, 0, c]
                        : [c, 0, x];
    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255)
    };
}
function toDecimal(color) {
    return (color.r << 16) + (color.g << 8) + color.b;
}
/** Color de texto legible sobre el color dado, según su luminancia relativa. */
function isDark(color) {
    const luminance = (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255;
    return luminance < 0.5;
}
