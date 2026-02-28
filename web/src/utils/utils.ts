export function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { h: 0, s: 0, l: 0 };
  }

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        h = 0;
    }

    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function applyTheme(accentHex: string) {
  const normalizedHex = /^#?[a-f\d]{6}$/i.test(accentHex)
    ? accentHex.startsWith("#")
      ? accentHex
      : `#${accentHex}`
    : "#10b981";

  const { h, s, l } = hexToHSL(normalizedHex);
  const root = document.documentElement;

  const r = parseInt(normalizedHex.slice(1, 3), 16);
  const g = parseInt(normalizedHex.slice(3, 5), 16);
  const b = parseInt(normalizedHex.slice(5, 7), 16);
  root.style.setProperty("--accent-rgb", `${r}, ${g}, ${b}`);

  root.style.setProperty("--primary", `${h} ${s}% ${l}%`);
  root.style.setProperty("--accent", `${h} ${s}% ${l}%`);
  root.style.setProperty("--ring", `${h} ${s}% ${l}%`);

  const isLight = l > 50;
  const foregroundColor = isLight ? "0 0% 0%" : "0 0% 100%";
  root.style.setProperty("--primary-foreground", foregroundColor);
  root.style.setProperty("--accent-foreground", foregroundColor);
}
