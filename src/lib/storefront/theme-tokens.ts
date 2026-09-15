const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

export type ManifestThemeColorTokens = {
  primary: string;
  accent: string;
  background: string;
  text: string;
};

export type ManifestThemeTypography = {
  body: "inter" | "system-ui";
  display: "young-serif" | "system-ui";
};

export type ManifestThemeTokens = {
  colors: ManifestThemeColorTokens;
  typography: ManifestThemeTypography;
};

function readHexColor(value: unknown) {
  if (typeof value !== "string" || !HEX_COLOR_PATTERN.test(value.trim())) {
    return null;
  }

  return value.trim().toUpperCase();
}

function readTypography(value: unknown): ManifestThemeTypography | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const body = record.body;
  const display = record.display;

  if (body !== "inter" && body !== "system-ui") {
    return null;
  }

  if (display !== "young-serif" && display !== "system-ui") {
    return null;
  }

  return { body, display };
}

export function resolveManifestThemeTokens(
  theme: Record<string, unknown>,
): ManifestThemeTokens | null {
  if (typeof theme !== "object" || theme === null) {
    return null;
  }

  const colorsValue = theme.colors;
  if (typeof colorsValue !== "object" || colorsValue === null) {
    return null;
  }

  const colorsRecord = colorsValue as Record<string, unknown>;
  const primary = readHexColor(colorsRecord.primary);
  const accent = readHexColor(colorsRecord.accent);
  const background = readHexColor(colorsRecord.background);
  const text = readHexColor(colorsRecord.text);

  if (!primary || !accent || !background || !text) {
    return null;
  }

  const typography =
    readTypography(theme.typography) ??
    ({
      body: "inter",
      display: "young-serif",
    } satisfies ManifestThemeTypography);

  return {
    colors: { primary, accent, background, text },
    typography,
  };
}

const BODY_FONT_STACKS: Record<ManifestThemeTypography["body"], string> = {
  inter: 'var(--font-inter), system-ui, -apple-system, "Segoe UI", sans-serif',
  "system-ui": 'system-ui, -apple-system, "Segoe UI", sans-serif',
};

const DISPLAY_FONT_STACKS: Record<ManifestThemeTypography["display"], string> = {
  "young-serif": 'var(--font-young-serif), Georgia, "Times New Roman", serif',
  "system-ui": 'system-ui, -apple-system, "Segoe UI", sans-serif',
};

export function buildManifestThemeCssVariables(
  tokens: ManifestThemeTokens,
): Record<string, string> {
  const { colors, typography } = tokens;

  return {
    "--color-bg": colors.background,
    "--color-surface": colors.background,
    "--color-fg": colors.text,
    "--color-accent": colors.accent,
    "--color-espresso": colors.primary,
    "--color-mocha": colors.primary,
    "--font-sans": BODY_FONT_STACKS[typography.body],
    "--font-serif": DISPLAY_FONT_STACKS[typography.display],
  };
}
