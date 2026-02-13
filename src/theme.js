export const theme = {
  colors: {
    background: "#0f1a2b",   // solid app background
    header: "#0b1422",
    footer: "#0b1422",
    scrollTopButton: "#2b4f7d",
    scrollTopButtonHover: "#3a6499",
    postBackground: "#ffffff",
    authorPageBackground: "#fafafa",
    textPrimary: "#111111",
    textSecondary: "#666666",
    textLight: "#ffffff",    // text on dark backgrounds
    border: "#e5e5e5",
    accent: "#cc0000"
  },

  spacing: {
    pagePadding: "16px",
    postPadding: "16px",
    gap: "16px"
  },

  typography: {
    authorSize: "14px",
    dateSize: "12px",
    bodySize: "16px",
    tagSize: "13px",
    metricSize: "13px",
    workTitleSize: "12px",
    translationSize: "12px"
  },

  layout: {
    headerHeight: "56px",
    footerHeight: "56px",
    postRadius: "0px" // sharp edges
  }
};

export function applyThemeVariables() {
  const root = document.documentElement;

  root.style.setProperty("--color-background", theme.colors.background);
  root.style.setProperty("--color-header", theme.colors.header);
  root.style.setProperty("--color-footer", theme.colors.footer);
  root.style.setProperty("--color-scroll-top-button", theme.colors.scrollTopButton);
  root.style.setProperty("--color-scroll-top-button-hover", theme.colors.scrollTopButtonHover);
  root.style.setProperty("--color-post-background", theme.colors.postBackground);
  root.style.setProperty("--color-author-page-background", theme.colors.authorPageBackground);
  root.style.setProperty("--color-text-primary", theme.colors.textPrimary);
  root.style.setProperty("--color-text-secondary", theme.colors.textSecondary);
  root.style.setProperty("--color-text-light", theme.colors.textLight);
  root.style.setProperty("--color-border", theme.colors.border);
  root.style.setProperty("--color-accent", theme.colors.accent);

  root.style.setProperty("--space-page-padding", theme.spacing.pagePadding);
  root.style.setProperty("--space-post-padding", theme.spacing.postPadding);
  root.style.setProperty("--space-gap", theme.spacing.gap);

  root.style.setProperty("--text-author-size", theme.typography.authorSize);
  root.style.setProperty("--text-date-size", theme.typography.dateSize);
  root.style.setProperty("--text-body-size", theme.typography.bodySize);
  root.style.setProperty("--text-tag-size", theme.typography.tagSize);
  root.style.setProperty("--text-metric-size", theme.typography.metricSize);
  root.style.setProperty("--text-work-title-size", theme.typography.workTitleSize);
  root.style.setProperty("--text-translation-size", theme.typography.translationSize);

  root.style.setProperty("--layout-header-height", theme.layout.headerHeight);
  root.style.setProperty("--layout-footer-height", theme.layout.footerHeight);
  root.style.setProperty("--layout-post-radius", theme.layout.postRadius);
}
